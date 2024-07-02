
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SideNavigationExtension,  HELP_CONTEXTUAL,SystemInfoService } from 'qbm';



import { ProjectConfig } from 'imx-api-qbm';
import { QerProjectConfig } from 'imx-api-qer';
import { DataExplorerGapaccountsComponent } from './gapaccounts/gapaccounts.component';
import { CorreoRegistryService } from './correo-registry.service';
import { CorreoEModule } from './correo-e.module';
import { UserModelService,ProjectConfigurationService } from 'qer';


@Component({
  selector: 'imx-correo-e',
  templateUrl: './correo-e.component.html',
  styleUrls: ['./correo-e.component.scss']
})
export class CorreoEComponent implements OnInit {
  public isAdmin = true;
  public baseUrl = 'Cuentas';
  public componentName = 'correo-e';
  public componentTitle = 'Gestión del correo-e';
  public contextId = HELP_CONTEXTUAL.MyResponsibilities;
  public navItems: SideNavigationExtension[] = [];
  constructor(
    private readonly userModelService: UserModelService,
    private readonly systemInfoService: SystemInfoService,
    private readonly CorreoERegistry: CorreoRegistryService,
    private readonly projectConfig: ProjectConfigurationService,
    private cdref: ChangeDetectorRef,
    
  ) {
   
  }

  async ngOnInit(): Promise<void> {
    
    await this.loadNavItems();
    
  }
  public async loadNavItems(): Promise<void> {
    const systemInfo = await this.systemInfoService.get();
    const features = (await this.userModelService.getFeatures()).Features || [];
    const userConfig = await this.userModelService.getUserConfig();
    
    
    const config: QerProjectConfig & ProjectConfig = await this.projectConfig.getConfig();
    this.navItems = this.CorreoERegistry
      .getNavItems(systemInfo.PreProps, features, config)
      //.filter((elem) => elem.name === 'identities' || elem.name === 'devices'  || elem.name === 'GAPUser' || userConfig.Ownerships.find(own => own.TableName === elem.name)?.Count > 0);
      //ELIMINAMOS POR EL MOMENTO LA ENTRADA DE DISPOSITIVOS Y DEJAMOS SÓLO LA DE DPTOS. PARA TODO EL MUNDO.
      .filter((elem) => elem.name === 'Portal_UI_GAP');
    
      
    
    this.cdref.detectChanges();
  }
}
