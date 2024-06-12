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

import { Injectable } from '@angular/core';

import {
  CollectionLoadParameters,
  TypedEntityCollectionData,
  DataModelFilter,
  EntitySchema,
  FilterTreeData,
  DataModel,
  EntityCollectionData,
  MethodDescriptor,
  MethodDefinition,
  FilterType,
  DisplayBuilder,
  ReadWriteEntity,
  ValType,
  FkCandidateProvider,
  MetaTableRelationData,
  IClientProperty,
  LogOp,
  ApiClient,
  IEntityColumn,
  TypedEntity,
  ExtendedTypedEntityCollection
} from 'imx-qbm-dbts';
import { TsbApiService } from '../tsb-api-client.service';
import { TsbPermissionsService} from './../admin/tsb-permissions.service';
import { PortalTargetsystemUnsAccount, V2ApiClientMethodFactory } from 'imx-api-tsb';
import { PortalTargetsystemGapuser } from 'imx-api-gap';
import { QerApiService } from 'qer';

import { TargetSystemDynamicMethodService } from '../target-system/target-system-dynamic-method.service';
import { AccountTypedEntity, GAPAccountTypedEntity} from './account-typed-entity';
import { DbObjectKeyBase } from '../target-system/db-object-key-wrapper.interface';
import { AcountsFilterTreeParameters as AccountsFilterTreeParameters } from './accounts.models';
import { DataSourceToolbarExportMethod, BaseCdr, ImxTranslationProviderService } from 'qbm';
import { GAPApiService } from '../gap-api-client.service';
import { TranslateService } from '@ngx-translate/core';
import {CCCApiService } from '../ccc-api-client.service';
import { PortalTargetsystemGapuserNuevacuenta, PortalTargetsystemGapuserNuevacuentaInteractiveWrapper } from 'imx-api-ccc';





@Injectable({ providedIn: 'root' })
export class AccountsService {
  constructor(
    private readonly tsbClient: TsbApiService,
    private readonly qerClient : QerApiService,
    private readonly gapClient: GAPApiService,
    private readonly miapi : CCCApiService,
    private readonly permisosgap: TsbPermissionsService,
    private translate: TranslateService,
    private translateService: ImxTranslationProviderService,    
    private readonly dynamicMethod: TargetSystemDynamicMethodService
  ) {

    
   }

  
  public get accountSchema(): EntitySchema {
    return this.tsbClient.typedClient.PortalTargetsystemUnsAccount.GetSchema();
  }

  public get gapaccountSchema(): EntitySchema {
    return this.gapClient.typedClient.PortalTargetsystemGapuser.GetSchema();
  }

  public get gapskuSchema():EntitySchema {
    return this.miapi.typedClient.PortalTargetsystemGappaskuGapuserlicense.GetSchema();
  }
  /**
   * Gets a list of accounts.
   *
   * @param navigationState Page size, start index, search and filtering options etc,.
   *
   * @returns Wrapped list of Accounts.
   */
  public async getAccounts(navigationState: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalTargetsystemUnsAccount>> {
    return this.tsbClient.typedClient.PortalTargetsystemUnsAccount.Get(navigationState);
  }

  public async getGAPAccounts(navigationState: CollectionLoadParameters): Promise<TypedEntityCollectionData<PortalTargetsystemGapuserNuevacuenta>> {
    return this.miapi.typedClient.PortalTargetsystemGapuserNuevacuenta.Get(navigationState);
  }


  public exportAccounts(navigationState: CollectionLoadParameters): DataSourceToolbarExportMethod {
    const factory = new V2ApiClientMethodFactory();
    return {
      getMethod: (withProperties: string, PageSize?: number) => {
        let method: MethodDescriptor<EntityCollectionData>;
        if (PageSize) {
          method = factory.portal_targetsystem_uns_account_get({...navigationState, withProperties, PageSize, StartIndex: 0})
        } else {
          method = factory.portal_targetsystem_uns_account_get({...navigationState, withProperties})
        }
        return new MethodDefinition(method);
      }
    }
  }

  public async getAccount(dbObjectKey: DbObjectKeyBase, columnName?: string): Promise<AccountTypedEntity> {
    return this.dynamicMethod.get(AccountTypedEntity, { dbObjectKey, columnName });
  }

  public async getAccountInteractive(dbObjectKey: DbObjectKeyBase, columnName: string): Promise<AccountTypedEntity> {
    return (await this.dynamicMethod.getById(AccountTypedEntity, { dbObjectKey, columnName })) as AccountTypedEntity;
  }

  public async getGAPAccountInteractive(UID_GAPAccount: string): Promise<GAPAccountTypedEntity>{
      return (await this.miapi.client.portal_targetsystem_gapuser_nuevaCuenta_interactive_byid_get(UID_GAPAccount)) as GAPAccountTypedEntity;
  //  return (await this.miapi.client.portal_targetsystem_gapuser_nuevaCuenta_interactive_byid_get(UID_GAPAccount)) as GAPAccountTypedEntity;
  }


  public async getFilterOptions(): Promise<DataModelFilter[]> {
    return (await this.getDataModel()).Filters;
  }

  public async getDataModel(): Promise<DataModel>{
    return this.tsbClient.client.portal_targetsystem_uns_account_datamodel_get(undefined);
  }

  public async getGAPDataModel(): Promise<DataModel>{
    return this.gapClient.client.portal_targetsystem_gapuser_datamodel_get(undefined);
  }


  public async getFilterTree(parameter: AccountsFilterTreeParameters):Promise<FilterTreeData>{
    return this.tsbClient.client.portal_targetsystem_uns_account_filtertree_get(parameter);
  }

  public async getGAPFilterTree(parameter: AccountsFilterTreeParameters):Promise<FilterTreeData>{
    return this.tsbClient.client.portal_targetsystem_uns_account_filtertree_get(parameter);
  }

  
  public async gapgetdomains(navigationState: CollectionLoadParameters):Promise<String[]>{    
    //Ponemos un pagesize a 4096 para obtener todos los departamentos y que no los pagine, porque si lo hace no obtengo toda la lista de dominios.
    const departamentos = await this.qerClient.client.portal_resp_department_get({withProperties:'-CustomProperty01','PageSize': 4096});
    const dominios: String[] = [];
    departamentos.Entities.forEach(function (dominio){if (dominio.Columns.CustomProperty01.Value) dominios.push(dominio.Columns.CustomProperty01.Value)});
    //devolvemos los dominios eliminando los duplicados
    return dominios.filter((item,index,self) => self.indexOf(item)===index);
 }

 
 public async GAPSave(cuenta: PortalTargetsystemGapuserNuevacuenta):Promise<any>{
  this.miapi.typedClient.PortalTargetsystemGapuserNuevacuentaInteractive.Put(cuenta);
 }
 public async gapgetsku ():Promise<any>{
      return  await this.miapi.typedClient.PortalTargetsystemGappaskuGapuserlicense.Get();
        
}

  
 public async ResetGAP(GAPXObjectKey: string):Promise<string> {
  return await this.miapi.client.portal_ResetGAP_get({GAPXObjectKey:GAPXObjectKey});
 }

 public async esAdminPersonas():Promise<boolean>{
  return  await this.permisosgap.esAdminPersonas();
 }

 public async operadorSD():Promise<boolean>{
  return await this.permisosgap.esOperadorSD();
 }
 
 public async esAdminEPR():Promise<boolean>{
  return await this.permisosgap.esAdminEPR();
 }
 
 
  public async getgapuser():Promise<any> {
    

  
  const datos = await this.gapClient.client.portal_targetsystem_gapuser_get();
  
  console.log("Cargado");
  return null;
  //return null;
 }


 public createRecipientCdr(): BaseCdr {
  const columnProperties = {};

  const property = this.createRequesterProperty();
  columnProperties[property.ColumnName] = property;
  const entityColumn = new ReadWriteEntity(
    { Columns: columnProperties },
    {},
    this.createRequesterFkProvider(property.FkRelation),
    undefined,
    new DisplayBuilder(this.translateService)
  ).GetColumn(property.ColumnName);

  return new BaseCdr(entityColumn, 'Licencia asignada');
}



public createRequesterProperty(): IClientProperty {
  const fkRelation = {
    ChildColumnName: 'UID_GAPPaSku',
    ParentTableName: 'GAPUserInPaSku',
    ParentColumnName: 'UID_GAPUser',
    IsMemberRelation: false,
  };
  this.createRequesterFkProvider(fkRelation);
  return {
    ColumnName: 'UID_GAPPaSku',
    Type: ValType.String,
    Description: this.translate.instant('#LDS#Here you can select a recipient or requester whose requests you want to display.'),
    FkRelation: fkRelation,
    
    
  };
}

private createRequesterFkProvider(fkRelation: MetaTableRelationData): FkCandidateProvider {
  return new FkCandidateProvider([
    {
      columnName: fkRelation.ChildColumnName,
      fkTableName: fkRelation.ParentTableName,
      parameterNames: ['OrderBy', 'StartIndex', 'PageSize', 'filter', 'search'],
      load: async (_, parameters = {}) => this.miapi.client.portal_targetsystem_gappasku_GAPUserLicense_get(parameters),
      getDataModel: async () => ({}),
      getFilterTree: async () => ({ Elements: [] }),
    },
  ]);
}


public async getDuplicates(parameter: CollectionLoadParameters)
    : Promise<any> {

    if (parameter.filter?.length === 0) {
      return { Data: [], totalCount: 0 };
    }
    return this.gapClient.client.portal_targetsystem_gapuser_get();
  }

  public async ObtenerNuevasCuentas(navigationState:CollectionLoadParameters): Promise<any>{
    return (await this.miapi.typedClient.PortalTargetsystemGapuserNuevacuenta.Get(navigationState));
  }

  public async CrearNuevaCuenta(): Promise<PortalTargetsystemGapuserNuevacuenta> {
    return  (await this.miapi.typedClient.PortalTargetsystemGapuserNuevacuentaInteractive.Get()).Data[0];
    
  }
    
    //return (await this.qerClient.typedClient.PortalPersonReportsInteractive.Get()).Data[0];
  

}
