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

import { CollectionLoadParameters, DbObjectKey, FilterData } from 'imx-qbm-dbts';
import { AccountTypedEntity, GAPAccountTypedEntity } from './account-typed-entity';
import { PortalTargetsystemGapuser } from 'imx-api-gap';
import { PortalCccNuevacuenta  } from 'imx-api-portal';

export interface AccountSidesheetData {
  unsAccountId: string;
  unsDbObjectKey: DbObjectKey;
  selectedAccount: AccountTypedEntity;
  tableName: string;
  uidPerson: string;
}

export class  GAPLicenciasEprinsa {
  EnterpriseStarter: number;
  FrontLineStarter: number;
  BusinessStandard: number;
  BusinessPlus: number;
  Cloud: number;
}

export interface GAPAccountSidesheetData {
  //ObjectKey de la cuenta
  GAPAccountId: string;
  //selectedGAPAccount: PortalTargetsystemGapuserNuevacuenta;
  selectedGAPAccount: AccountTypedEntity;  
}

export interface createGAPAccountSidesheetData {
  GAPAccountId: string;
  UID_GAPAccount: string;
  //selectedGAPAccount: GAPAccountTypedEntity; Cambios para intentar tg
  selectedGAPAccount: PortalCccNuevacuenta;
  tableName: string;
  uidPerson: string;
}

export interface GetAccountsOptionalParameters extends CollectionLoadParameters {
  orphaned?: string;
  inactive?: string;
  managerdiscrepancy?: string;
  system?: string;
  container?: string;
}

export interface AcountsFilterTreeParameters {
  parentkey: string;
  container: string;
  system: string;
  filter: FilterData[];
}
