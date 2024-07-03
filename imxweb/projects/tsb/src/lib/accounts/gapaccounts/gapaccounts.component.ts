import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import {
  BusyService,
  ClassloggerService,
  DataSourceToolbarFilter,
  DataSourceToolbarSettings,
  SettingsService,
  SideNavigationComponent,
  DataSourceToolbarViewConfig,
  DataSourceToolbarExportMethod,
  HELP_CONTEXTUAL,
  FilterTreeEntityWrapperService
} from 'qbm';
import { ViewConfigService } from 'qer';
import { CollectionLoadParameters, IClientProperty, DisplayColumns, DbObjectKey, EntitySchema, DataModel, FilterData, FilterType, CompareOperator, LogOp, SqlExpression, EntityCollection, IEntity, InteractiveEntityData, ValType } from 'imx-qbm-dbts';
import { ViewConfigData } from 'imx-api-qer';
import { PortalTargetsystemUnsSystem, PortalTargetsystemUnsAccount } from 'imx-api-tsb';
import { TsbPermissionsService} from '../../admin/tsb-permissions.service';
import { ContainerTreeDatabaseWrapper } from '../../container-list/container-tree-database-wrapper';
import { DataExplorerFiltersComponent } from '../../data-filters/data-explorer-filters.component';
import { DeHelperService } from '../../de-helper.service';
import { AccountSidesheetComponent } from '.././account-sidesheet/account-sidesheet.component';
import { AccountSidesheetData, GAPAccountSidesheetData, GetAccountsOptionalParameters, GAPLicenciasEprinsa } from '.././accounts.models'; 
import { AccountsService } from '../accounts.service';
import { TargetSystemReportComponent } from '.././target-system-report/target-system-report.component';
import { PortalTargetsystemGapuser, PortalTargetsystemGappasku } from 'imx-api-gap';
import { GAPAccountSidesheetComponent } from '../gapaccount-sidesheet/gapaccount-sidesheet.component';
import { CreateGAPAccountComponent } from '../create-gapaccount/create-gapaccount.component';
import { Column } from 'qer/lib/password/helpers.model';
import { GAPAccountTypedEntity } from '../account-typed-entity';
import { PortalCccNuevacuenta } from 'imx-api-portal';








@Component({
  //selector: 'imx-gapaccounts',
  selector: 'imx-data-explorer-accounts',
  templateUrl: './gapaccounts.component.html',
  styleUrls: ['./gapaccounts.component.scss']
})
export class DataExplorerGapaccountsComponent implements OnInit, OnDestroy, SideNavigationComponent {
  @Input() public applyIssuesFilter = false;
  @Input() public issuesFilterMode: string;
  @Input() public targetSystemData?: PortalTargetsystemUnsSystem[];
  @Input() public showFullscreen = true;
  

  @ViewChild('dataExplorerFilters', { static: false }) public dataExplorerFilters: DataExplorerFiltersComponent;

  /**
   * Settings needed by the DataSourceToolbarComponent
   */

  public dstSettings: DataSourceToolbarSettings;
  /**
   * Page size, start index, search and filtering options etc.
   */
  public navigationState: CollectionLoadParameters;
  public filterOptions: DataSourceToolbarFilter[] = [];
  public treeDbWrapper: ContainerTreeDatabaseWrapper;

  public readonly entitySchemaUnsAccount: EntitySchema;
  public readonly entitySchemaGAPAccount: EntitySchema;
  public readonly entitySchemaSKUGAP: EntitySchema;
  public readonly SchemaCuentaGAP: EntitySchema;
  public readonly DisplayColumns = DisplayColumns;
  public data: any;
  public busyService = new BusyService();
  public contextId = HELP_CONTEXTUAL.DataExplorerAccounts;
  public esAdminPersonas:boolean = false;
  public esAdminEPR:boolean = false;
  
  public algunerror:boolean = false;
  public dominios:String[];
  public GAPLicenciasActuales  : GAPLicenciasEprinsa;
  public opcioneslic: string[] =[];
  
  


  private displayedColumns: IClientProperty[] = [];
  private authorityDataDeleted$: Subscription;
  private tableName: string;

  
  
  private dataModel: DataModel;

  
  private viewConfigPath = 'targetsystem/uns/account';
  private viewConfig: DataSourceToolbarViewConfig;
  private filtrocuentas: FilterData[];
  
  
  

  constructor(
    public translateProvider: TranslateService,
    private readonly sideSheet: EuiSidesheetService,
    private readonly logger: ClassloggerService,
    private readonly accountsService: AccountsService,
    private readonly dataHelper: DeHelperService,
    private viewConfigService: ViewConfigService,
    readonly settingsService: SettingsService
  ) {
    


    this.navigationState = { PageSize: settingsService.DefaultPageSize, StartIndex: 0 };
    this.entitySchemaUnsAccount = accountsService.accountSchema;
    this.entitySchemaGAPAccount = accountsService.gapaccountSchema;
    this.entitySchemaSKUGAP = accountsService.gapskuSchema;
    this.SchemaCuentaGAP = {
      Columns: 
       {
        Ocupacion: this.entitySchemaGAPAccount.Columns.CCC_EspacioMb

       }
    
    }
    
    this.authorityDataDeleted$ = this.dataHelper.authorityDataDeleted.subscribe(() => this.navigate());
    //this.treeDbWrapper = new ContainerTreeDatabaseWrapper(this.busyService, dataHelper);
  }

  public async ngOnInit(): Promise<void> {
    /** if you like to add columns, please check {@link AccountsExtComponent | Account Extension Component} as well */
    /**     this.displayedColumns = [
      this.entitySchemaUnsAccount.Columns[DisplayColumns.DISPLAY_PROPERTYNAME],
      this.entitySchemaUnsAccount.Columns.UID_Person,
      this.entitySchemaUnsAccount.Columns.UID_UNSRoot,
      this.entitySchemaUnsAccount.Columns.AccountDisabled,
      this.entitySchemaUnsAccount.Columns.XMarkedForDeletion,
    ]; */

    //this.columna[] = this.accountsService.createRequesterProperty;

    
    this.GAPLicenciasActuales = new GAPLicenciasEprinsa;
    
    if ( await this.accountsService.esAdminEPR()) {
      this.esAdminEPR=true;
    }

    if ( await this.accountsService.esAdminPersonas()) {
      this.esAdminPersonas=true;
    }


  this.dataModel = await this.accountsService.getGAPDataModel();
  this.viewConfig = await this.viewConfigService.getInitialDSTExtension(this.dataModel, this.viewConfigPath);    
  this.displayedColumns = [
      this.entitySchemaGAPAccount.Columns.UID_Person,     
      this.entitySchemaGAPAccount.Columns.PrimaryEmail,
      
    
      {
        ColumnName:"CreationTime",
        Display: "Fecha de creación",
        Type: ValType.Date
      },
      {
        ColumnName:"CCC_UltimaConexion",
        Display: "Ultimo Login",
        Type: ValType.Date
      }
      ];

    
      // Si soy admin añade los datos de licencia y ocupación
    if (this.esAdminEPR)
      {
        
        this.displayedColumns.push({
          ColumnName:"CCC_LicenciaWorkspace",
          Display: "Licencia asignada",
          Type: ValType.String
        }, {
          ColumnName:"CCC_EspacioMb",
          Display: "Ocupación (Gb)",
          Type: ValType.Int
        }
        )
      } else  //Y si no soy admin, quita de la ordenación las columnas que no nos interesan
      {
        this.dataModel.Properties = this.dataModel.Properties.filter(propiedad => ['CreationTime','CCC_UltimaConexion',].includes(propiedad.Property.ColumnName));
      };

    

    const isBusy = this.busyService.beginBusy();
    
  try {
    //this.filterOptions = await this.accountsService.getFilterOptions();
    
    const myexpressions=[];

    //Crear un array de expresiones basadas en los dominios cargados en mydominios. Usar push y asignarlo al filtrocuentas.

    this.dominios = await this.accountsService.gapgetdomains(this.navigationState);
  
    if (this.esAdminEPR) {
      myexpressions.push(
        { LogOperator:LogOp.AND,
          Operator:'LIKE',
          PropertyId: 'PrimaryEmail',
          Value: "@"
        }
      );
//Añado el dominio eprinsa.org a los administradores. Sólo ellos podrán crear cuentas en este dominio.
      this.dominios.push("eprinsa.org");
      }
    else {
      this.dominios.forEach(dominio =>  {
     
        myexpressions.push(
          { LogOperator:LogOp.AND,
            Operator:'LIKE',
            PropertyId: 'PrimaryEmail',
            Value: "@" + dominio
          }
        )
      });


    }
    
    
    this.filtrocuentas = [{
      Type:FilterType.Expression,
      Expression: {
         LogOperator:LogOp.OR,
         Expressions: myexpressions
         
      }
    }
    ];


    
    
    if (this.esAdminEPR) await this.infolicencias();
    await this.navigate();
  
} finally {
 isBusy.endBusy();
}
    

  }

  public ngOnDestroy(): void {
    if (this.authorityDataDeleted$) {
      this.authorityDataDeleted$.unsubscribe();
    }
  }

  public async updateConfig(config: ViewConfigData): Promise<void> {
    await this.viewConfigService.putViewConfig(config);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  public async deleteConfigById(id: string): Promise<void> {
    await this.viewConfigService.deleteViewConfig(id);
    this.viewConfig = await this.viewConfigService.getDSTExtensionChanges(this.viewConfigPath);
    this.dstSettings.viewConfig = this.viewConfig;
  }

  /**
   * Occurs when the navigation state has changed - e.g. users clicks on the next page button.
   *
   */
  public async onNavigationStateChanged(newState?: CollectionLoadParameters): Promise<void> {
    if (newState) {
      this.navigationState = newState;
    }
    await this.navigate();
  }

  public async onAccountChanged(GAPAccount: PortalCccNuevacuenta): Promise<void> {
    this.logger.debug(this, `Selected UNS account changed`);
    this.logger.trace(this, `New UNS account selected`, GAPAccount);

    let data: GAPAccountSidesheetData;

    const unsDbObjectKey = DbObjectKey.FromXml(GAPAccount.XObjectKey.value);
    data = {
      GAPAccountId: GAPAccount.XObjectKey.value,
      selectedGAPAccount: await this.accountsService.getAccountInteractive(unsDbObjectKey,GAPAccount.UID_GAPUser.value)      

    };

    
    
    const isBusy = this.busyService.beginBusy();
    isBusy.endBusy();
    
    await this.viewAccount(data);
  }

  /**
   * Occurs when user triggers search.
   *
   * @param keywords Search keywords.
   */
  public async onSearch(keywords: string): Promise<void> {
    this.logger.debug(this, `Searching for: ${keywords}`);
    this.navigationState.StartIndex = 0;
    this.navigationState.search = keywords;
    await this.navigate();
  }

  public async filterByTree(filters: FilterData[]): Promise<void> {
    this.navigationState.filter = filters;
    return this.navigate();
  }

  public async openReportOptionsSidesheet(): Promise<void> {
    this.sideSheet.open(TargetSystemReportComponent, {
      title: await this.translateProvider.get('#LDS#Heading Download Target System Report').toPromise(),
      icon: 'download',
      padding: '0px',
      width: 'max(400px, 40%)',
      testId: 'accounts-report-sidesheet',
    });
  }

  
  
  
  
  private async navigate(): Promise<void> {
    const isBusy = this.busyService.beginBusy();
    const getParams: GetAccountsOptionalParameters = this.navigationState;
    
    
    try {
      
      
        
      
      this.navigationState.filter = this.filtrocuentas;
      
      
      //Carga las cuentas
      const data = await this.accountsService.getGAPAccounts(this.navigationState);
    
      
      
      
      
      
      

      const exportMethod: DataSourceToolbarExportMethod = this.accountsService.exportAccounts(this.navigationState);

      

      exportMethod.initialColumns = this.displayedColumns.map(col => col.ColumnName);
      this.dstSettings = {
        displayedColumns: this.displayedColumns,
        dataSource: data,
        entitySchema: this.entitySchemaGAPAccount,
        navigationState: this.navigationState,
        viewConfig: this.viewConfig,
      
      };
      this.tableName = data.tableName;
      this.logger.debug(this, `Head at ${data.Data.length + this.navigationState.StartIndex} of ${data.totalCount} item(s)`);
    }
    catch (e)
      {
        this.algunerror=true;
        console.log("ERRORAZO EN ALGUNA PARTE");
      }
    finally {
       isBusy.endBusy();
    }

    

  }

  private async viewAccount(datos: GAPAccountSidesheetData): Promise<void> {
    this.logger.debug(this, `Viewing account`);
    //this.logger.trace(this, `Account selected`, data.selectedGAPAccount);
    //ES NECESARIO HACER LAS CUENTAS INTERACTIVAS PARA PODER EDITARLAS.
    this.logger.debug(this,"Convirtiendo cuenta en cuenta interactiva para poder editarla");
    

//    const data_int= await this.accountsService.getGAPAccountInteractive(data.selectedGAPAccount.GetEntity().GetColumn("UID_GAPUser").GetValue())[0];

    //data.selectedGAPAccount = data_int;

    const sidesheetRef = this.sideSheet.open(GAPAccountSidesheetComponent, {
      title: 'Editor de cuentas de correo',
      subTitle: datos.selectedGAPAccount.GetEntity().GetDisplay(),
      padding: '0px',
      width: 'max(600px, 60%)',
      icon: 'account',
      testId: 'edit-user-gapaccount-sidesheet',
      data: {datos, licencias:this.opcioneslic}
    });
    sidesheetRef.afterClosed().subscribe((dataRefreshRequired) => {
      if (dataRefreshRequired) {
        this.navigate();
      }
    });
  }

  public async createNewIdentity(): Promise<void> {
    
    //Primero crea la cuenta.
    const gapbase = await this.accountsService.CrearNuevaCuenta();
    //Luego hazla interactiva
    //const gapbaseinter = await this.accountsService.getAccountInteractive(DbObjectKey.FromXml(gapbase.XObjectKey.value),'UID_GAPUser');


    
    
    await this.sideSheet
      .open(CreateGAPAccountComponent, {
        title: "Nueva cuenta de correo",
        padding: '0px',
        width: 'max(650px, 65%)',
        disableClose: true,
        icon: 'contactinfo',
        data: {datos:gapbase, soyAdminEPR: this.esAdminEPR , soyAdminPersonas: this.esAdminPersonas, dominios:this.dominios, licencias:this.opcioneslic}
        
      })
      .afterClosed()
      .toPromise();

    return this.navigate();
  }

  private async  infolicencias() {
    console.log ("Stock disponible: " + this.opcioneslic.length);
    await this.accountsService.actualizaSKU(this.GAPLicenciasActuales);
    if (this.GAPLicenciasActuales.StockBusinessPlus>0) this.opcioneslic.push("Business Plus");
    if (this.GAPLicenciasActuales.StockEnterpriseStarter>0) this.opcioneslic.push("Enterprise Starter");
    if (this.GAPLicenciasActuales.StockBusinessStandard>0) this.opcioneslic.push("Business Standard");
    if (this.GAPLicenciasActuales.StockFrontlineStarter>0) this.opcioneslic.push("Frontline Starter");
    if (this.GAPLicenciasActuales.StockCloudIdentity>0) this.opcioneslic.push("Cloud Identity");
    
    
  }

}
