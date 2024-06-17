/*
 * ONE IDENTITY LLC. PROPRIETARY INFORMATION
 *
 * This software is confidential.  One Identity, LLC. or one of its affiliates or
 * subsidiaries, has supplied this software to you under terms of a
 * license agreement, nondisclosure agreement or both.
 *
 * You may not copy, disclose, or use this software except in accordance with
 * those terms.
 *
 *
 * Copyright 2023 One Identity LLC.
 * ALL RIGHTS RESERVED.
 *
 * ONE IDENTITY LLC. MAKES NO REPRESENTATIONS OR
 * WARRANTIES ABOUT THE SUITABILITY OF THE SOFTWARE,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE, OR
 * NON-INFRINGEMENT.  ONE IDENTITY LLC. SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE
 * AS A RESULT OF USING, MODIFYING OR DISTRIBUTING
 * THIS SOFTWARE OR ITS DERIVATIVES.
 *
 */

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, UntypedFormControl } from '@angular/forms';
import {
  ColumnDependentReference,
  BaseCdr,
  ClassloggerService,
  SnackBarService,
  ElementalUiConfigService,
  TabItem,
  ExtService,
  CdrFactoryService
} from 'qbm';
import { DbObjectKey, IEntity } from 'imx-qbm-dbts';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { AccountSidesheetData, GAPAccountSidesheetData } from '../accounts.models';
import { IdentitiesService, ProjectConfigurationService, QerApiService } from 'qer';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AccountsService } from '../accounts.service';
import { EuiDownloadOptions } from '@elemental-ui/core';
import { AccountsReportsService } from '../accounts-reports.service';
import { AccountTypedEntity } from '../account-typed-entity';
import { PortalTargetsystemGapuser } from 'imx-api-gap';
import { PortalTargetsystemGapuserNuevacuenta,  } from 'imx-api-ccc';
import { VisorpassComponent } from './visorpass.component'


@Component({
  selector: 'imx-account-sidesheet',
  templateUrl: './gapaccount-sidesheet.component.html',
  styleUrls: ['./gapaccount-sidesheet.component.scss'],
})
export class GAPAccountSidesheetComponent implements OnInit {
  public readonly detailsFormGroup: UntypedFormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public linkedIdentitiesManager: DbObjectKey;
  public unsavedSyncChanges = false;
  public initialAccountManagerValue: string;
  public soyadmin: boolean;
  public cuentaligada: boolean;
  
  public reportDownload: EuiDownloadOptions;
  public neverConnectFormControl = new UntypedFormControl();
  public parameters: { objecttable: string; objectuid: string };
  


  public dynamicTabs: TabItem[] = [];

  constructor(
    formBuilder: UntypedFormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public  sidesheetData: GAPAccountSidesheetData,
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
    private readonly qerAPI : QerApiService,
    private cdrFactory: CdrFactoryService,
    private  dialog:MatDialog,
  ) {
    this.detailsFormGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });

    //this.parameters = {
     // objecttable: sidesheetData.unsDbObjectKey?.TableName,
     // objectuid: sidesheetData.unsDbObjectKey?.Keys.join(','),
    //};

    
  }

  public ngOnInit(): void {
    this.cuentaligada = false;
    console.log("Usuario asociado: " + this.sidesheetData.selectedGAPAccount.GetEntity().GetColumn("UID_Person").GetValue()) ;
    if (this.sidesheetData.selectedGAPAccount.GetEntity().GetColumn("UID_Person").GetValue().length > 0  ||  this.sidesheetData.selectedGAPAccount.GetEntity().GetColumn("IsSuspended").GetValue()==true)
      {this.cuentaligada=true;   
      }

    

    this.setup();
  }

  public cancel(): void {
    this.sidesheetRef.close();
  }

  public async reinicio():Promise<void> {
    
    let clave = "";

    const dialogRef = this.dialog.open(VisorpassComponent, {
      data: {
        Title: 'Confirme que desea cambiar la contraseña',
        Code: clave,
      },
      panelClass: 'imx-messageDialog',
      disableClose: true
    }, );

    dialogRef.afterClosed().subscribe(vuelta => {
      if (vuelta )  {
        this.reinicioconfirmado();
        
      }
    })
    // reload data
    
    
  }

  public async reinicioconfirmado()
  {

    const clave = await this.accountsService.ResetGAP(this.sidesheetData.GAPAccountId);    
        
        this.dialog.open(VisorpassComponent, {
          data: {
            Title: 'Cambiada',
            Code: clave,
          },
          panelClass: 'imx-messageDialog',
          disableClose: true
        }, );
        //Deshabilita el botón de cambio para que el operador no entre en un bucle de cambios que pueda molestar al api de Google
        this.cuentaligada=true;    
  }
  
  public async save(): Promise<void> {
    if (this.detailsFormGroup.valid) {
      this.logger.debug(this, `Saving identity change`);
      
     
      const overlayRef = this.busyService.show();
      try {
        await this.sidesheetData.selectedGAPAccount.GetEntity().Commit(true);
        
        this.detailsFormGroup.markAsPristine();
        this.snackbar.open({ key: '#LDS#The user account has been successfully saved.' });
        this.sidesheetRef.close(true);
      } finally {
        this.unsavedSyncChanges = false;
        this.busyService.hide(overlayRef);
      }
    }
  }

  

  get formArray(): UntypedFormArray {
    return this.detailsFormGroup.get('formArray') as UntypedFormArray;
  }


  
  private async setup(): Promise<void> {
 //   const cols = (await this.configService.getConfig()).OwnershipConfig.EditableFields[this.parameters.objecttable];
    

    this.soyadmin = await this.accountsService.esAdminEPR();

    const cols = ['IsSuspended','GivenName','FamilyName', 'Aliases','IsEnrolledIn2Sv','RecoveryEmail','RecoveryPhone','UID_Person','IncludeInGlobalAddressList', 'Password'];
    if (this.soyadmin) { cols.push('CCC_LicenciaWorkspace')};
      
    
    this.cdrList = this.cdrFactory.buildCdrFromColumnList(this.sidesheetData.selectedGAPAccount.GetEntity(), cols);
     console.log("mostrando cuenta del tipo: " + this.sidesheetData.selectedGAPAccount.GetEntity().TypeName)   ;
    /*
    this.dynamicTabs = (
      await this.tabService.getFittingComponents<TabItem>('accountSidesheet', (ext) => ext.inputData.checkVisibility(this.parameters))
    ).sort((tab1: TabItem, tab2: TabItem) => tab1.sortOrder - tab2.sortOrder);

    this.setupIdentityManagerSync();*/

  }

  

}
