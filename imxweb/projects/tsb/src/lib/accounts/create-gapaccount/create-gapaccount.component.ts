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

import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, UntypedFormControl, FormControl, Validators, ValidatorFn, ValidationErrors, AbstractControl, AsyncValidatorFn } from '@angular/forms';
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
import { DbObjectKey, IEntity, TypedEntity } from 'imx-qbm-dbts';
import { EuiLoadingService, EuiSidesheetRef, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { AccountSidesheetData, GAPAccountSidesheetData, GAPLicenciasEprinsa, createGAPAccountSidesheetData } from '../accounts.models';
import { IdentitiesService, ProjectConfigurationService } from 'qer';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AccountsService } from '../accounts.service';
import { EuiDownloadOptions } from '@elemental-ui/core';
import { AccountsReportsService } from '../accounts-reports.service';
import { AccountTypedEntity,GAPAccountTypedEntity } from '../account-typed-entity';
import { PortalTargetsystemGapuser } from 'imx-api-gap';
import { PortalCccNuevacuenta } from 'imx-api-portal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'imx-new-account-sidesheet',
  templateUrl: './create-gapaccount.component.html',
  styleUrls: ['./create-gapaccount.component.scss'],
})
export class CreateGAPAccountComponent implements OnInit {
  public readonly detailsFormGroup: UntypedFormGroup;
  public cdrList: ColumnDependentReference[] = [];
  public linkedIdentitiesManager: DbObjectKey;
  public unsavedSyncChanges = false;
  public initialAccountManagerValue: string;
  public reportDownload: EuiDownloadOptions;
  public neverConnectFormControl = new UntypedFormControl();
  public parameters: { objecttable: string; objectuid: string };
  public checkdominio:boolean;
  public checkerrores:boolean;
  public UID_LicenciaWorkspace: string="";
  public errormsg: string="";
  
  
  

  public dynamicTabs: TabItem[] = [];
  
  
  
  constructor(
    formBuilder: UntypedFormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public  data: {datos:PortalCccNuevacuenta, soyAdminEPR:boolean, soyAdminPersonas:boolean, dominios:string[], licencias:string[]},
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
    private cdrFactory: CdrFactoryService,
    private readonly cdref: ChangeDetectorRef

  ) {
    
    this.detailsFormGroup = new UntypedFormGroup({ formArray: formBuilder.array([]) });

    
    //this.parameters = {
     // objecttable: sidesheetData.unsDbObjectKey?.TableName,
     // objectuid: sidesheetData.unsDbObjectKey?.Keys.join(','),
    //};

    
  }

  
  public ngOnInit(): void {
    this.cdref.detectChanges();
    
    this.setup();
    
  }

  public cancel(): void {
    this.sidesheetRef.close();
  }

  public async save(): Promise<void> {
    this.checkerrores=false;

    if (this.detailsFormGroup.valid) {
      this.logger.debug(this, `Saving identity change`);
      const overlayRef = this.busyService.show();
      
      try {
        //Le cascamos el customer 
        this.data.datos.GetEntity().GetColumn("UID_GAPCustomer").PutValue("387aa29b-4242-46f2-adba-1f53154defd9");
        await this.data.datos.GetEntity().Commit(true);
        this.detailsFormGroup.markAsPristine();
        this.snackbar.open({ key: '#LDS#The user account has been successfully saved.' });
        this.sidesheetRef.close(true);
      } catch (error) {
        this.checkerrores=true;
        this.errormsg=error;
        console.log("Pos algo ha pasao: " + error);
        
      }
      
      finally {
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
    
    this.checkdominio=false;
    this.checkerrores=false;
    

    
    const cols = [ 'GivenName','FamilyName', 'PrimaryEmail','UID_Person'];
    //if (this.data.soyAdminEPR )  cols.push('CCC_LicenciaWorkspace');
    //this.detailsFormGroup.addControl("Correo",new FormControl('',  [Validators.email, Validators.minLength(1)]));
  

    
    
    this.cdrList = this.cdrFactory.buildCdrFromColumnList(this.data.datos.GetEntity(),cols);
    
    
    
    this.dynamicTabs = (
      await this.tabService.getFittingComponents<TabItem>('accountSidesheet', (ext) => ext.inputData.checkVisibility(this.parameters))
    ).sort((tab1: TabItem, tab2: TabItem) => tab1.sortOrder - tab2.sortOrder);

  //  this.setupIdentityManagerSync();
  }


  private async cambiolic(licencia) {
    switch (licencia) {
      case "Business Plus":
        this.UID_LicenciaWorkspace="54724760-2d4c-43d5-a869-920343927c74";
        break;
      case "Business Standard":
        this.UID_LicenciaWorkspace="47fe0324-80f0-48fa-a566-99df023f63eb";
        break;
      case "Enterprise Starter":
        this.UID_LicenciaWorkspace="743da811-6d42-429b-8257-4aa37d188e6f";
        break;
      case "Frontline Starter":
        this.UID_LicenciaWorkspace="860c0de7-ba82-410d-9edf-821dcc09fd84";
        break;
      case "Cloud Identity":
        this.UID_LicenciaWorkspace="a79dd7e5-6ead-4a0c-9307-87116c2ce50a";
        break;

    }
    
    console.log("Selección de licnia: " + licencia)

  }

  private async checkValues(cdr:BaseCdr) {
    const columna = cdr.column;
    this.checkdominio=false;
    this.checkerrores=false;
    
    switch(columna.ColumnName) {

    case 'PrimaryEmail':
      
      if (this.data.dominios.find((dominio) => dominio == columna.GetValue().split("@")[1])) 
        this.checkdominio=false;
        else this.checkdominio=true;
      
      //Verifica si es del dominio correcto
      
      
      
      break;
    }
  }

  
}

