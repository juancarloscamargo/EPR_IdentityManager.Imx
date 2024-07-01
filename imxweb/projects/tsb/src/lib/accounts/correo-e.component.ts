
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SideNavigationExtension,  HELP_CONTEXTUAL } from 'qbm';



import { ProjectConfig } from 'imx-api-qbm';
import { QerProjectConfig } from 'imx-api-qer';
import { DataExplorerGapaccountsComponent } from './gapaccounts/gapaccounts.component';
import { CorreoEModule } from './correo-e.module';


@Component({
  selector: 'imx-correo-e',
  templateUrl: './correo-e.component.html',
  styleUrls: ['./correo-e.component.scss']
})
export class CorreoEComponent implements OnInit {
  public isAdmin = false;
  public baseUrl = 'myresponsibilities';
  public componentName = 'my-responsibilities-view';
  public componentTitle = '#LDS#Heading My Responsibilities';
  public contextId = HELP_CONTEXTUAL.MyResponsibilities;
  public navItems: SideNavigationExtension[] = [];
  constructor(
    
    private cdref: ChangeDetectorRef,
    
  ) {}

  async ngOnInit(): Promise<void> {
    console.log("AL CORREO");
    await this.loadNavItems();
  }
  public async loadNavItems(): Promise<void> {
    
    
    
    
    this.navItems.push(
      {
        caption: 'Cuentas',
        name : 'cuentas', 
        instance: DataExplorerGapaccountsComponent,
      }
    )
    this.cdref.detectChanges();
  }
}
