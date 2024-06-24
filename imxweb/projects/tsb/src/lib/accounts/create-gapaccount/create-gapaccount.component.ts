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
  public emailDuplicado: boolean;
  private readonly opcioneslic: string[] = ["Enterprise Starter","Frontline Starter", "Business Plus", "Business Standard", "Cloud Identity"];
  
  

  public dynamicTabs: TabItem[] = [];
  
  
  
  constructor(
    formBuilder: UntypedFormBuilder,
    @Inject(EUI_SIDESHEET_DATA) public  data: {datos:PortalCccNuevacuenta, soyAdminEPR:boolean, soyAdminPersonas:boolean, dominios:String[], licencias:GAPLicenciasEprinsa},
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
    
    this.emailDuplicado = false;

    const cols = ['PrimaryEmail','UID_Person'];
    if (this.data.soyAdminEPR )  cols.push('CCC_LicenciaWorkspace');
    //this.detailsFormGroup.addControl("Correo",new FormControl('',  [Validators.email, Validators.minLength(1)]));
  

    
    
    this.cdrList = this.cdrFactory.buildCdrFromColumnList(this.data.datos.GetEntity(),cols);
    
    //VAmos a desactivar los elementos de las licencias que no nos valen
    
    this.dynamicTabs = (
      await this.tabService.getFittingComponents<TabItem>('accountSidesheet', (ext) => ext.inputData.checkVisibility(this.parameters))
    ).sort((tab1: TabItem, tab2: TabItem) => tab1.sortOrder - tab2.sortOrder);

  //  this.setupIdentityManagerSync();
  }


  private async checkValues(columna: String) {
    this.emailDuplicado = false;
    

    switch(columna) {

    case 'PrimaryEmail':
      //Verifica si es correcta-- Hecho a nivel de formato de columna
      //Verifica si no está duplicada
      
  
      
      
  
      //Verifica si es del dominio correcto
      //Verifica si hay licencias
      
      
      break;
    }
  }

  
}

