import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdmninistracionService {

  constructor(private http: HttpClient) {}

  getCargos(){
    return this.http.get(environment.apiUrl + "getCargos");
  }

  getUsuarios(){
    return this.http.get(environment.apiUrl + "getUsuarios");
  }
  
  getUsuario(id: number){
    return this.http.get(environment.apiUrl + "getUsuario/" + id);
  }
  
  editUsuario(data: any) {
    return this.http.put(environment.apiUrl + 'editUsuario', JSON.stringify(data), {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  saveUsuario(data : any){
    return this.http.post(environment.apiUrl + 'saveUsuario', JSON.stringify(data), {
      headers: new HttpHeaders ({
        'Content-Type': 'application/json'
      })
      
    });
  }

  toggleUsuario(id: number, activar: boolean) {
    const accion = activar ? 'activarUsuario' : 'desactivarUsuario';
    return this.http.get(`${environment.apiUrl}${accion}/${id}`);
  }

  pedirAutorizacion(data: any) {
    return this.http.post(environment.apiUrl + 'pedirAutorizacion', JSON.stringify(data), {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  getAutorizacionesAdmin(){
    return this.http.get(environment.apiUrl + "getAutorizacionesAdmin");
  }

  getAutorizaciones(){
    return this.http.get(environment.apiUrl + "getAutorizaciones");
  }


  autorizarSolicitud(idNotificacion: any) {
    return this.http.post(environment.apiUrl + 'autorizarSolicitud', { idNotificacion });
  }
  
  eliminarSolicitud(idNotificacion: any) {
    return this.http.post(environment.apiUrl +'eliminarSolicitud', { idNotificacion });
  }

  gethistorialCambios(){
    return this.http.get(environment.apiUrl + "gethistorialCambios");
  }

  getVistaCliente(){
    return this.http.get(environment.apiUrl + "getVistaCliente");
  }


  autorizarVistaCliente(idVista: any) {
    return this.http.post(environment.apiUrl + 'autorizarVistaCliente', { idVista });
  }
  
  rechazarVistaClieste(idVista: any) {
    return this.http.post(environment.apiUrl +'rechazarVistaClieste', { idVista });
  }
}

