import { Component, Inject, OnDestroy } from '@angular/core';
import { FormArray, UntypedFormGroup } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';

import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { PortalPersonReports, QerProjectConfig } from 'imx-api-qer';
import { BaseCdr, ColumnDependentReference, ConfirmationService, SnackBarService, CdrFactoryService } from 'qbm';
import { AccountsService } from '../../accounts.service';
import { PortalTargetsystemGapuser } from 'imx-api-gap';
//import { DuplicateCheckParameter } from './duplicate-check-parameter.interface';
//import { DuplicatesSidesheetComponent } from './duplicates-sidesheet/duplicates-sidesheet.component';
import { CollectionLoadParameters, TypedEntity } from 'imx-qbm-dbts';


@Component({
  selector: 'imx-nueva-cuenta-correo',
  templateUrl: './nueva-cuenta-correo.component.html',
  styleUrls: ['./nueva-cuenta-correo.component.scss']
})
export class NuevaCuentaCorreoComponent implements OnDestroy {

  public identityForm = new UntypedFormGroup({});
  public cdrListPersonal: ColumnDependentReference[] = [];
  public cdrListOrganizational: ColumnDependentReference[] = [];
  public cdrListLocality: ColumnDependentReference[] = [];
  public cdrListusuario: ColumnDependentReference[] = [];
  public nameIsOff = 0;
  public accountIsOff = 0;
  public mailIsOff = 0;
  public externoIsOff = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      nuevacuenta: PortalTargetsystemGapuser
      
    },
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly confirm: ConfirmationService,
    private readonly cdrFactoryService: CdrFactoryService,
    private readonly accountService: AccountsService) {
    this.setup();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  public async submit(): Promise<void> {
    if (this.identityForm.valid) {


      let canSubmit = true;
      if (this.mailIsOff || this.nameIsOff) {
        canSubmit = await this.confirm.confirm({
          Title: '#LDS#Heading Create Identity With Same Properties',
          Message: this.mailIsOff && this.nameIsOff ?
            '#LDS#There is at least one identity with the same properties. Are you sure you want to create the identity?'
            : this.mailIsOff ?
              '#LDS#There is at least one identity with the same email address. Are you sure you want to create the identity?' :
              '#LDS#There is at least one identity with the same first and last name. Are you sure you want to create the identity?',
          identifier: 'create-new-identity-confirm-saving'
        });
      }

      if (!canSubmit) {
        return;
      }

      const overlayRef = this.busyService.show();
      try {
      //  await this.data.selectedIdentity.GetEntity().Commit(false);
        this.snackbar.open({ key: '#LDS#The identity has been successfully created.' });
        this.sidesheetRef.close(true);
      } finally {
        this.busyService.hide(overlayRef);
      }
    }
  }
/*
  public async showDuplicates(type: 'account' | 'mail'): Promise<void> {
    let duplicateParameter: DuplicateCheckParameter;

    switch (type) {
      case 'account':
        duplicateParameter = { centralAccount: this.data.selectedIdentity.GetEntity().GetColumn('CentralAccount').GetValue() };
        break;
      case 'mail':
        duplicateParameter = { defaultEmailAddress: this.data.selectedIdentity.GetEntity().GetColumn('DefaultEmailAddress').GetValue() };
        break;
    }

    await this.sidesheetService.open(DuplicatesSidesheetComponent, {
      title: await this.translate.get('#LDS#Heading View Identities With Same Properties').toPromise(),
      padding: '0px',
      width: 'max(600px, 60%)',
      icon: 'contactinfo',
      testId: 'duplicate-identities-sidesheet',
      data: {
        projectConfig: this.data.projectConfig,
        get: async (param: CollectionLoadParameters) => this.identityService.getDuplicates(param),
        getFilter: (filter: DuplicateCheckParameter) => this.identityService.buildFilterForduplicates(filter),
        duplicateParameter,
        entitySchema: this.identityService.personAllSchema,
      }
    }).afterClosed().toPromise();
  }
*/
  public update(cdr: ColumnDependentReference, list: ColumnDependentReference[]): void {
    console.log("Actualizando : " +cdr.column.ColumnName);
    const index = list.findIndex(elem => elem.column.ColumnName === cdr.column.ColumnName);
    if (index === -1) { return; }
    
    this.identityForm.removeControl(cdr.column.ColumnName);
    
    list.splice(index, 1, new BaseCdr(cdr.column));
  }

  public async checkValues(name: string): Promise<void> {
    return ;
  }

  private setup(): void {

    this.subscriptions.push(this.sidesheetRef.closeClicked().subscribe(async () => {
      if (this.identityForm.dirty) {
        const close = await this.confirm.confirmLeaveWithUnsavedChanges();
        if (close) {
          this.sidesheetRef.close(false);
        }
      } else {
        this.sidesheetRef.close(false);
      }
    }));

    const identificacionusuario = ['UID_Person'];
    const entidad = this.data.nuevacuenta.GetEntity();

    this.cdrListusuario = this.cdrFactoryService.buildCdrFromColumnList( this.data.nuevacuenta.GetEntity(),identificacionusuario);
    
    
    
    console.log("cargadas columnas");
    
  }

}
