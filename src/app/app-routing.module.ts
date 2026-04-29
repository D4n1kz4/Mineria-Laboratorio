import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { NominacionesComponent } from './pages/nominaciones/nominaciones.component';
import { RecepciondepilaComponent } from './pages/recepciondepila/recepciondepila.component';
import { CostadonaveComponent } from './pages/costadonave/costadonave.component';
import { RegistrarcamionComponent } from './pages/registrarcamion/registrarcamion.component';
import { AdministracionComponent } from './pages/administracion/administracion.component';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { LaboratorioComponent } from './pages/laboratorio/laboratorio.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',   
  },
  { path: 'login', component: LoginComponent },
  { path: 'nominaciones', component: NominacionesComponent },
  { path: 'recepciondepila', component: RecepciondepilaComponent },
  { path: 'costadonave', component: CostadonaveComponent },
  { path: 'registrarcamion', component: RegistrarcamionComponent },
  { path: 'administrador', component: AdministracionComponent },
  { path: 'cliente', component: ClienteComponent },
  { path: 'laboratorio', component: LaboratorioComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
