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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Router, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { DataSourceToolbarModule, DataTableModule, CdrModule, LdsReplaceModule, DataTreeModule, ExtModule, DynamicTabsModule, BusyIndicatorModule, HelpContextualModule,RouteGuardService, ClassloggerService, HELP_CONTEXTUAL } from 'qbm';
import { DataExplorerGapaccountsComponent } from './gapaccounts.component';
import { DataExplorerGapgroupsComponent } from './gapgroups.component';
import { AccountSidesheetComponent } from '../../accounts/account-sidesheet/account-sidesheet.component';
import { DataFiltersModule } from '../../data-filters/data-filters.module';
import { NoDataModule } from '../../no-data/no-data.module';
import { GroupsModule } from '../../groups/groups.module';
import { AccountsExtComponent } from '.././account-ext/accounts-ext.component';
import { TargetSystemReportComponent } from '.././target-system-report/target-system-report.component';
import { ObjectHyperviewModule } from 'qer';

import { MyResponsibilitiesRegistryService } from 'qer';
import { esAdminEPR, isAdminGAP } from '../../admin/tsb-permissions-helper';
import { GAPAccountSidesheetComponent } from '../gapaccount-sidesheet/gapaccount-sidesheet.component';




@NgModule({
  declarations: [
    DataExplorerGapaccountsComponent
    
    
  ],
  imports: [
    DataFiltersModule,
    NoDataModule,
    CommonModule,
    FormsModule,
    GroupsModule,
    BusyIndicatorModule,
    ReactiveFormsModule,
    EuiCoreModule,
    EuiMaterialModule,
    CdrModule,
    RouterModule,
    MatExpansionModule,
    MatIconModule,
    MatSidenavModule,
    MatCardModule,
    MatButtonModule,
    ObjectHyperviewModule,
    TranslateModule,
    DataSourceToolbarModule,
    DataTableModule,
    LdsReplaceModule,
    DataTreeModule,
    ExtModule,
    DynamicTabsModule,
    HelpContextualModule
  ],
  exports: [
    DataExplorerGapaccountsComponent
  ],
})
export class GapGroupsModule {
  constructor(
    
    
    
    private readonly MyResponsabilitiesRegistryService: MyResponsibilitiesRegistryService,
    logger: ClassloggerService
  ) {
    logger.info(this, '▶️ Módulo de gestión de grupos de correo Workspace cargado');
   
    this.setupMyResponsibilitiesView();
   
  }

  private setupMyResponsibilitiesView(): void {
    this.MyResponsabilitiesRegistryService.registerFactory((preProps: string[], groups: string[]) => {
      if (!isAdminGAP(groups)) {
        return;
      }
      
      return {
        instance: DataExplorerGapgroupsComponent,
        sortOrder: 1,
        name: 'GruposCorreo',
        caption: 'Grupos de correo',
        icon: 'mailbox',
        contextId: HELP_CONTEXTUAL.MyResponsibilitiesIdentities
      };
    });
  }
}
