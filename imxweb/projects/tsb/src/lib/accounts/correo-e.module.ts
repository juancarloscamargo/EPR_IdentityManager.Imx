import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';


import { ClassloggerService, MenuService, RouteGuardService, SideNavigationViewModule } from 'qbm';
import { CorreoEComponent } from './correo-e.component';

const routes: Routes = [
  {
    path: 'correo_e',
    component: CorreoEComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
  {
    path: 'correo_e/:tab',
    component: CorreoEComponent,
    canActivate: [RouteGuardService],
    resolve: [RouteGuardService],
  },
];


@NgModule({
  declarations: [CorreoEComponent],
  imports: [CommonModule, EuiCoreModule, EuiMaterialModule, MatTooltipModule, TranslateModule, SideNavigationViewModule],
  exports: [CorreoEComponent]
  //providers: [MyResponsibilitiesRegistryService],
})
export class CorreoEModule { 
  constructor(readonly router: Router, private readonly menuService: MenuService, logger: ClassloggerService) {
    const config = router.config;
    routes.forEach((route) => {
      config.splice(config.length - 1, 0, route);
    });
    this.router.resetConfig(config);
    logger.info(this, '▶️ Gestión del correo electrónico cargada');
    this.setupMenu();
  }

  private setupMenu(): void {
    this.menuService.addMenuFactories((preProps: string[], features: string[]) => ({
      id: 'ROOT_Responsibilities',
      title: '#LDS#Responsibilities',
      sorting: '30',
      items: [
        {
          id: 'QER_My_Responsibilities',
          navigationCommands: { commands: ['correo_e'] },
          title: 'Gestión correo-e',
          sorting: '30-20',
        },
      ],
    }));
  }
}
