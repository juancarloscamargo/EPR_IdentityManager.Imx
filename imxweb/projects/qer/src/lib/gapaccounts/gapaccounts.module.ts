import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GapaccountsComponent } from './gapaccounts.component';
import { CdrModule, ClassloggerService, DataSourceToolbarModule, DataTableModule, HelpContextualModule, LdsReplaceModule } from 'qbm';
import { QerProjectConfig } from 'imx-api-qer';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjectConfig } from 'imx-api-qbm';
import { MyResponsibilitiesRegistryService } from '../my-responsibilities-view/my-responsibilities-registry.service';
import { GapaccountsSidesheetsComponent } from './gapaccounts-sidesheets/gapaccounts-sidesheets.component';




@NgModule({
  declarations: [
    GapaccountsComponent,
    GapaccountsSidesheetsComponent,
  ],
  imports: [
    CommonModule,
    CdrModule,
    EuiCoreModule,
    EuiMaterialModule,
    TranslateModule,
    LdsReplaceModule,
    ReactiveFormsModule,
    DataSourceToolbarModule,
    DataTableModule,
    HelpContextualModule,
  ],
  exports: [
    GapaccountsComponent
  ]
})
export class GapaccountsModule { 
  constructor(
    private readonly myResponsibilitiesRegistryService: MyResponsibilitiesRegistryService,
    logger: ClassloggerService,
    ) {
    logger.info(this, '▶️ Módulo de cuentas de correo cargado');
    this.setupMyResponsibilitiesView();
  }
  private setupMyResponsibilitiesView(): void{

    this.myResponsibilitiesRegistryService.registerFactory((preProps: string[], features: string[],  projectConfig: QerProjectConfig & ProjectConfig) => {
              return {
          instance: GapaccountsComponent,
          sortOrder: 14,
          name: 'gap',
          caption: 'Cuentas de crreo',
        }
      }
    );
  }

}
