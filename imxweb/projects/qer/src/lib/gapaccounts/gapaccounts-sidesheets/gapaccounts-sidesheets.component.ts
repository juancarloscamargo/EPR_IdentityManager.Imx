
import { Component, OnInit, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, UntypedFormControl } from '@angular/forms';
import {
  ColumnDependentReference,
  BaseCdr,
  ClassloggerService,
  SnackBarService,
  ElementalUiConfigService,
  TabItem,
  ExtService,
  CdrFactoryService,
} from 'qbm';
import { DbObjectKey } from 'imx-qbm-dbts';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { AccountSidesheetData } from '../gapaccounts.models';
import { IdentitiesService, ProjectConfigurationService } from 'qer';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AccountsService } from '../accounts.service';
import { EuiDownloadOptions } from '@elemental-ui/core';
import { AccountsReportsService } from '../accounts-reports.service';
import { AccountTypedEntity } from '../account-typed-entity';

@Component({
  selector: 'imx-gapaccounts-sidesheets',
  templateUrl: './gapaccounts-sidesheets.component.html',
  styleUrls: ['./gapaccounts-sidesheets.component.scss']
})
export class GapaccountsSidesheetsComponent implements OnInit {
  public readonly detailsFormGroup: UntypedFormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public linkedIdentitiesManager: DbObjectKey;
  public unsavedSyncChanges = false;
  public initialAccountManagerValue: string;
  public reportDownload: EuiDownloadOptions;
  public neverConnectFormControl = new UntypedFormControl();
  public parameters: { objecttable: string; objectuid: string };

  public dynamicTabs: TabItem[] = [];

  constructor(
    formBuilder: UntypedFormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public readonly sidesheetData: AccountSidesheetData,
    private readonly logger: ClassloggerService,
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly elementalUiConfigService: ElementalUiConfigService,
    private readonly configService: ProjectConfigurationService,
    private readonly identitiesService: IdentitiesService,
    private readonly accountsService: AccountsService,
    private readonly reports: AccountsReportsService,
    private readonly tabService: ExtService,
    private cdrFactory: CdrFactoryService
  ) { 
    this.detailsFormGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });

    this.parameters = {
      objecttable: sidesheetData.unsDbObjectKey?.TableName,
      objectuid: sidesheetData.unsDbObjectKey?.Keys.join(','),
    };

    this.reportDownload = {
      ...this.elementalUiConfigService.Config.downloadOptions,
      url: this.reports.accountsReport(30, this.selectedAccount.GetEntity().GetKeys()[0], this.sidesheetData.tableName),
    };
    
  }
  public ngOnInit(): void {
    this.setup();
  }

  public cancel(): void {
    this.sidesheetRef.close();
  }

  public async save(): Promise<void> {
    if (this.detailsFormGroup.valid) {
      this.logger.debug(this, `Saving identity change`);
      const overlayRef = this.busyService.show();
      try {
        await this.selectedAccount.GetEntity().Commit(true);
        this.detailsFormGroup.markAsPristine();
        this.snackbar.open({ key: '#LDS#The user account has been successfully saved.' });
        this.sidesheetRef.close(true);
      } finally {
        this.unsavedSyncChanges = false;
        this.busyService.hide(overlayRef);
      }
    }
  }

  get selectedAccount(): AccountTypedEntity {
    return this.sidesheetData.selectedAccount;
  }

  get formArray(): UntypedFormArray {
    return this.detailsFormGroup.get('formArray') as UntypedFormArray;
  }

  get identityManagerMatchesAccountManager(): boolean {
    let isMatch = false;

    const objectKeyManager = this.selectedAccount?.objectKeyManagerColumn?.GetValue();

    if (this.linkedIdentitiesManager && objectKeyManager?.length) {
      isMatch = objectKeyManager === this.linkedIdentitiesManager.ToXmlString();
    }
    return isMatch;
  }

  get accountManagerIsEditable(): boolean {
    return this.selectedAccount.objectKeyManagerColumn?.GetMetadata().CanEdit();
  }

  public async syncToIdentityManager(event: MatSlideToggleChange): Promise<void> {
    const objectKeyManagerColumn = this.selectedAccount.objectKeyManagerColumn;

    if (objectKeyManagerColumn != null && event.checked) {
      await objectKeyManagerColumn.PutValue(this.linkedIdentitiesManager.ToXmlString());
      this.detailsFormGroup.markAsDirty();
      this.unsavedSyncChanges = true;
    }
  }

  private async setup(): Promise<void> {
    const cols = (await this.configService.getConfig()).OwnershipConfig.EditableFields[this.parameters.objecttable];

    this.cdrList = this.cdrFactory.buildCdrFromColumnList(this.selectedAccount.GetEntity(), cols);

    this.dynamicTabs = (
      await this.tabService.getFittingComponents<TabItem>('accountSidesheet', (ext) => ext.inputData.checkVisibility(this.parameters))
    ).sort((tab1: TabItem, tab2: TabItem) => tab1.sortOrder - tab2.sortOrder);

    this.setupIdentityManagerSync();
  }

  private async setupIdentityManagerSync(): Promise<void> {
    this.initialAccountManagerValue = this.selectedAccount.objectKeyManagerColumn?.GetValue();
    const linkedIdentityId = this.selectedAccount.uidPersonColumn?.GetValue();
    if (linkedIdentityId) {
      this.linkedIdentitiesManager = await this.getLinkedIdentitiesManager(linkedIdentityId, this.sidesheetData.unsDbObjectKey.TableName);
    }
  }

  private async getLinkedIdentitiesManager(linkedIdentityId: string, tableName: string): Promise<DbObjectKey> {
    const identityData = await this.identitiesService.getPerson(linkedIdentityId);
    if (identityData?.UID_PersonHead.value) {
      const managerAccountData = await this.accountsService.getAccount(
        {
          TableName: tableName,
          Keys: [identityData.UID_PersonHead.value],
        },
        'UID_Person'
      );

      if (managerAccountData) {
        return new DbObjectKey(tableName, managerAccountData.GetEntity().GetKeys());
      }
    }

    return undefined;
  }

  
}
