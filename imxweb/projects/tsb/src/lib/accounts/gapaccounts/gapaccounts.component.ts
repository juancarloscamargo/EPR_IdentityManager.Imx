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
  HELP_CONTEXTUAL,
  FilterTreeEntityWrapperService
} from 'qbm';
import { ViewConfigService } from 'qer';
import { CollectionLoadParameters, IClientProperty, DisplayColumns, DbObjectKey, EntitySchema, DataModel, FilterData, FilterType, CompareOperator, LogOp, SqlExpression, EntityCollection, IEntity, InteractiveEntityData } from 'imx-qbm-dbts';
import { ViewConfigData } from 'imx-api-qer';
import { PortalTargetsystemUnsSystem, PortalTargetsystemUnsAccount } from 'imx-api-tsb';
import { ContainerTreeDatabaseWrapper } from '../../container-list/container-tree-database-wrapper';
import { DataExplorerFiltersComponent } from '../../data-filters/data-explorer-filters.component';
import { DeHelperService } from '../../de-helper.service';
import { AccountSidesheetComponent } from '.././account-sidesheet/account-sidesheet.component';
import { AccountSidesheetData, GAPAccountSidesheetData, GetAccountsOptionalParameters } from '.././accounts.models'; 
import { AccountsService } from '../accounts.service';
import { TargetSystemReportComponent } from '.././target-system-report/target-system-report.component';
import { PortalTargetsystemGapuser } from 'imx-api-gap';



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
  public readonly entitySchemaGAPAccount: EntitySchema;
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
  private filtrocuentas: FilterData[];
  

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
    this.entitySchemaGAPAccount = accountsService.gapaccountSchema;
    this.authorityDataDeleted$ = this.dataHelper.authorityDataDeleted.subscribe(() => this.navigate());
    this.treeDbWrapper = new ContainerTreeDatabaseWrapper(this.busyService, dataHelper);
  }

  public async ngOnInit(): Promise<void> {
    /** if you like to add columns, please check {@link AccountsExtComponent | Account Extension Component} as well */
    /**     this.displayedColumns = [
      this.entitySchemaUnsAccount.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaUnsAccount.Columns.UID_Person,
      this.entitySchemaUnsAccount.Columns.UID_UNSRoot,
      this.entitySchemaUnsAccount.Columns.AccountDisabled,
      this.entitySchemaUnsAccount.Columns.XMarkedForDeletion,
    ]; */

    this.displayedColumns = [
      this.entitySchemaGAPAccount.Columns.UID_Person,     
      this.entitySchemaGAPAccount.Columns.PrimaryEmail,
    ];


    const isBusy = this.busyService.beginBusy();

  try {
    this.filterOptions = await this.accountsService.getFilterOptions();
    this.dataModel = await this.accountsService.getGAPDataModel();
  this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);
} finally {
 isBusy.endBusy();
}
if (this.applyIssuesFilter && !this.issuesFilterMode) {
  const orphanedFilter = this.filterOptions.find((f) => {
    return f.Name === 'orphaned';
  });

  if (orphanedFilter) {
    orphanedFilter.InitialValue = '1';
  }
}

if (this.applyIssuesFilter && this.issuesFilterMode === 'manager') {
  const managerDiscrepencyFilter = this.filterOptions.find((f) => {
    return f.Name === 'managerdiscrepancy';
  });

  if (managerDiscrepencyFilter) {
    managerDiscrepencyFilter.InitialValue = '1';
  }
}
    
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

  public async onAccountChanged(GAPAccount: PortalTargetsystemGapuser): Promise<void> {
    this.logger.debug(this, `Selected UNS account changed`);
    this.logger.trace(this, `New UNS account selected`, GAPAccount);

    let data: GAPAccountSidesheetData;  
    const datosgap = GAPAccount.GetEntity().GetKeys()[0];
    
    //const uns2gap = this.accountsService.getGAPAccounts
    console.log("Pulsado sobre : ");
    const isBusy = this.busyService.beginBusy();
    try {
      //const unsDbObjectKey = DbObjectKey.FromXml(datosgap);

      data = {
        GAPAccountId:"lala",
        UID_GAPAccount:"lala",
        selectedGAPAccount: await this.accountsService.getGAPAccountInteractive(datosgap),
        uidPerson: GAPAccount.GetEntity().GetColumn("UID_Person").GetValue(),
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
      this.logger.trace('Navigation settings', this.navigationState);
      const tsUid = this.dataExplorerFilters.selectedTargetSystemUid;
      //const tsUid = "f40c77ba-3566-484b-8671-edc2288e15cc";
      const cUid = this.dataExplorerFilters.selectedContainerUid;
      getParams.system = tsUid ? tsUid : undefined;
      getParams.container = cUid ? cUid : undefined;
      const myexpressions=[];

      //Crear un array de expresiones basadas en los dominios cargados en mydominios. Usar push y asignarlo al filtrocuentas.

      const mydominios = await this.accountsService.gapgetdomains(this.navigationState);
      
      mydominios.forEach(dominio =>  {
       
        myexpressions.push(
          { LogOperator:0,
            Operator:'LIKE',
            PropertyId: 'PrimaryEmail',
            Value: "@" + dominio
          }
        )
      });

      this.filtrocuentas = [{
        Type:FilterType.Expression,
        Expression: {
           LogOperator:LogOp.OR,
           Expressions: myexpressions
           
        }
      },
      ];

      this.navigationState.withProperties = "XObjectKey,CCC_EspacioMb,LastLoginTime";
      this.navigationState.filter = this.filtrocuentas;
      
      const data = await this.accountsService.getGAPAccounts(this.navigationState);
      
      const exportMethod: DataSourceToolbarExportMethod = this.accountsService.exportAccounts(this.navigationState);
      exportMethod.initialColumns = this.displayedColumns.map(col => col.ColumnName);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaGAPAccount,
        navigationState: this.navigationState,
        filters: this.filterOptions,
        filterTree: {
          filterMethode: async (parentkey) => {
            return this.accountsService.getFilterTree({
              parentkey,
              container: getParams.container,
              system: getParams.system,
              filter: getParams.filter,
            });
          },
          multiSelect: false,
        },
        dataModel: this.dataModel,
        viewConfig: this.viewConfig,
        exportMethod,
      };
      this.tableName = data.tableName;
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    } finally {
       isBusy.endBusy();
    }
    
  }

  private async viewAccount(data: GAPAccountSidesheetData): Promise<void> {
    this.logger.debug(this, `Viewing account`);
    //this.logger.trace(this, `Account selected`, data.selectedGAPAccount);
    const sidesheetRef = this.sideSheet.open(AccountSidesheetComponent, {
      title: await this.translateProvider.get('#LDS#Heading Edit User Account').toPromise(),
      //subTitle: data.selectedGAPAccount.GetEntity().GetDisplay(),
      subTitle:"lala",
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
