import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import {
  BusyService,
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  SettingsService,
  SideNavigationComponent,
  DataSourceToolbarViewConfig,
  DataSourceToolbarExportMethod,
  HELP_CONTEXTUAL
} from 'qbm';
import { ViewConfigService } from 'qer';
import { CollectionLoadParameters, IClientProperty, DisplayColumns, DbObjectKey, EntitySchema, DataModel, FilterData } from 'imx-qbm-dbts';
import { ViewConfigData } from 'imx-api-qer';
import { PortalTargetsystemUnsSystem, PortalTargetsystemUnsAccount } from 'imx-api-tsb';
import { ContainerTreeDatabaseWrapper } from '../../container-list/container-tree-database-wrapper';
import { DataExplorerFiltersComponent } from '../../data-filters/data-explorer-filters.component';
import { DeHelperService } from '../../de-helper.service';
import { AccountSidesheetComponent } from '.././account-sidesheet/account-sidesheet.component';
import { AccountSidesheetData, GetAccountsOptionalParameters } from '.././accounts.models'; 
import { AccountsService } from '../accounts.service';
import { TargetSystemReportComponent } from '.././target-system-report/target-system-report.component';



@Component({
  selector: 'imx-gapaccounts',
  templateUrl: './gapaccounts.component.html',
  styleUrls: ['./gapaccounts.component.scss']
})
export class DataExplorerGapaccountsComponent implements OnInit, OnDestroy, SideNavigationComponent {
  @Input() public applyIssuesFilter = false;
  @Input() public issuesFilterMode: string;
  @Input() public targetSystemData?: PortalTargetsystemUnsSystem[];

  @ViewChild('dataExplorerFilters', { static: false }) public dataExplorerFilters: DataExplorerFiltersComponent;

  /**
   * Settings needed by the DataSourceToolbarComponent
   */

  public dstSettings: DataSourceToolbarSettings;
  /**
   * Page size, start index, search and filtering options etc.
   */
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public treeDbWrapper: ContainerTreeDatabaseWrapper;

  public readonly entitySchemaUnsAccount: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public data: any;
  public busyService = new BusyService();
  public contextId = HELP_CONTEXTUAL.DataExplorerAccounts;

  private displayedColumns: IClientProperty[] = [];
  private authorityDataDeleted$: Subscription;
  private tableName: string;
  private dataModel: DataModel;
  private viewConfigPath = 'targetsystem/uns/account';
  private viewConfig: DataSourceToolbarViewConfig;

  constructor(
    public translateProvider: TranslateService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly accountsService: AccountsService,
    private readonly dataHelper: DeHelperService,
    private viewConfigService: ViewConfigService,
    readonly settingsService: SettingsService
  ) {
    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaUnsAccount = accountsService.accountSchema;
    this.authorityDataDeleted$ = this.dataHelper.authorityDataDeleted.subscribe(() => this.navigate());
    this.treeDbWrapper = new ContainerTreeDatabaseWrapper(this.busyService, dataHelper);
  }

  public async ngOnInit(): Promise<void> {
    /** if you like to add columns, please check {@link AccountsExtComponent | Account Extension Component} as well */
    this.displayedColumns = [
      this.entitySchemaUnsAccount.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaUnsAccount.Columns.UID_Person,
      this.entitySchemaUnsAccount.Columns.UID_UNSRoot,
      this.entitySchemaUnsAccount.Columns.AccountDisabled,
      this.entitySchemaUnsAccount.Columns.XMarkedForDeletion,
    ];

    //const isBusy = this.busyService.beginBusy();

    
    await this.navigate();
  }

  public ngOnDestroy(): void {
    if (this.authorityDataDeleted$) {
      this.authorityDataDeleted$.unsubscribe();
    }
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  /**
   * Occurs when the navigation state has changed - e.g. users clicks on the next page button.
   *
   */
  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async onAccountChanged(unsAccount: PortalTargetsystemUnsAccount): Promise<void> {
    this.logger.debug(this, `Selected UNS account changed`);
    this.logger.trace(this, `New UNS account selected`, unsAccount);

    let data: AccountSidesheetData;

    const isBusy = this.busyService.beginBusy();
    try {
      const unsDbObjectKey = DbObjectKey.FromXml(unsAccount.XObjectKey.value);

      data = {
        unsAccountId: unsAccount.UID_UNSAccount.value,
        unsDbObjectKey,
        selectedAccount: await this.accountsService.getAccountInteractive(unsDbObjectKey, 'UID_UNSAccount'),
        uidPerson: unsAccount.UID_Person.value,
        tableName: this.tableName,
      };
    } finally {
      isBusy.endBusy();
    }

    await this.viewAccount(data);
  }

  /**
   * Occurs when user triggers search.
   *
   * @param keywords Search keywords.
   */
  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async filterByTree(filters: FilterData[]): Promise<void> {
    this.navigationState.filter = filters;
    return this.navigate();
  }

  public async openReportOptionsSidesheet(): Promise<void> {
    this.sideSheet.open(TargetSystemReportComponent, {
      title: await this.translateProvider.get('#LDS#Heading Download Target System Report').toPromise(),
      icon: 'download',
      padding: '0px',
      width: 'max(400px, 40%)',
      testId: 'accounts-report-sidesheet',
    });
  }

  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    const getParams: GetAccountsOptionalParameters = this.navigationState;
    
    try {
      this.logger.debug(this, `Retrieving accounts list`);
      this.logger.debug('Navigation settings', this.navigationState);
      //Obtiene lista de los dominios gestionados.

      const datosmios = await this.accountsService.gapgetdomains(this.navigationState);

      //Construye filtro para gapuser.
      
      this.accountsService.getgapuser();
      const data = await this.accountsService.getAccounts(getParams);
      

      this.tableName = data.tableName;
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
       isBusy.endBusy();
    }
  }

  private async viewAccount(data: AccountSidesheetData): Promise<void> {
    this.logger.debug(this, `Viewing account`);
    this.logger.trace(this, `Account selected`, data.selectedAccount);
    const sidesheetRef = this.sideSheet.open(AccountSidesheetComponent, {
      title: await this.translateProvider.get('#LDS#Heading Edit User Account').toPromise(),
      subTitle: data.selectedAccount.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(600px, 60%)',
      icon: 'account',
      testId: 'edit-user-account-sidesheet',
      data,
    });
    sidesheetRef.afterClosed().subscribe((dataRefreshRequired) => {
      if (dataRefreshRequired) {
        this.navigate();
      }
    });
  }
}
