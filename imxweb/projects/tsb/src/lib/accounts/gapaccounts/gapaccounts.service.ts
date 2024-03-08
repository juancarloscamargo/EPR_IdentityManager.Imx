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

import { Injectable, Type } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  CollectionLoadParameters,
  TypedEntityCollectionData,
  DataModelFilter,
  EntitySchema,
  FilterTreeData,
  DataModel,
  EntityCollectionData,
  MethodDescriptor,
  MethodDefinition
} from 'imx-qbm-dbts';
import { TsbApiService } from '../../tsb-api-client.service';


import { PortalTargetsystemUnsAccount, V2ApiClientMethodFactory } from 'imx-api-tsb';
import { QerApiService } from 'qer';

import { TargetSystemDynamicMethodService } from '../../target-system/target-system-dynamic-method.service';
import { AccountTypedEntity } from '.././account-typed-entity';
import { DbObjectKeyBase } from '../../target-system/db-object-key-wrapper.interface';
import { AcountsFilterTreeParameters as AccountsFilterTreeParameters } from '.././accounts.models';
import { TypedClient } from 'imx-api-gap';

import { DataSourceToolbarExportMethod } from 'qbm';
import { Column } from 'qer/lib/password/helpers.model';
import { GAPApiService } from '../../gap-api-client.service';

@Injectable({ providedIn: 'root' })
export class GapaccountsService {
  constructor(
    private readonly tsbClient: TsbApiService,
    private readonly qerClient : QerApiService,
    private readonly clientehttp: HttpClient,
    private readonly gapClient: GAPApiService,
    
    private readonly dynamicMethod: TargetSystemDynamicMethodService
  ) {

    
   }

  public get accountSchema(): EntitySchema {
    return this.tsbClient.typedClient.PortalTargetsystemUnsAccount.GetSchema();
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

  public async getFilterOptions(): Promise<DataModelFilter[]> {
    return (await this.getDataModel()).Filters;
  }

  public async getDataModel(): Promise<DataModel>{
    return this.tsbClient.client.portal_targetsystem_uns_account_datamodel_get(undefined);
  }


  public async getFilterTree(parameter: AccountsFilterTreeParameters):Promise<FilterTreeData>{
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

 public async getgapuser():Promise<any> {
  const datos = await this.gapClient.typedClient.PortalTargetsystemGapuser.Get();  
  console.log(datos);
  console.log("Cargado");
  return null;
  //return null;
 }
}
