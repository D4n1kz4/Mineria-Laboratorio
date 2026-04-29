import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './component/header/header.component';
import { LoginComponent } from './pages/login/login.component';
import { AdministracionComponent } from './pages/administracion/administracion.component';
import { CostadonaveComponent } from './pages/costadonave/costadonave.component';
import { NominacionesComponent } from './pages/nominaciones/nominaciones.component';
import { RecepciondepilaComponent } from './pages/recepciondepila/recepciondepila.component';
import { RegistrarcamionComponent } from './pages/registrarcamion/registrarcamion.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgChartsModule } from 'ng2-charts';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { LaboratorioComponent } from './pages/laboratorio/laboratorio.component';



@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        LoginComponent,
        AdministracionComponent,
        CostadonaveComponent,
        NominacionesComponent,
        RecepciondepilaComponent,
        RegistrarcamionComponent,
        ClienteComponent,
        LaboratorioComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatIconModule,
        ReactiveFormsModule,
        RouterModule,
        DataTablesModule,
        FormsModule,
        NgbModule,
        MatProgressBarModule,
        NgxExtendedPdfViewerModule,
        NgChartsModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
