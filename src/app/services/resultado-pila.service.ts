import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResultadoPilaService {

  constructor(private http: HttpClient) {}

  addResultadoPila(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultadoPila', formData);
  }

  getResultadoPila(idLote: any) {
    return this.http.get(environment.apiUrl + 'getResultadoPila/' + idLote);
  }
  
  getResultadoPilaByIdPila(idPila: any) {
    return this.http.get(environment.apiUrl + 'getResultadoPilaByIdPila/' + idPila);
  }

  getResultadoPilaIndicadores(idNominacion: any) {
    return this.http.get(environment.apiUrl + 'getResultadoPilaIndicadores/' + idNominacion);
  }

  editResultadoLote(formData: FormData) {
    return this.http.post(environment.apiUrl + 'editResultadoLote', formData);
  }

  addAdjuntosPila(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addAdjuntosPila', formData);
  }
  
  getAdjuntosPila(idPila: any) {
    return this.http.get(environment.apiUrl + 'getAdjuntosPila/' + idPila);
  }

  removeAdjuntosPila(idPila: any, idLote: any) {
    return this.http.get(environment.apiUrl + 'removeAdjuntosPila/' + idPila +'/'+ idLote)
  }


  getResultadoPilaIdLote(idLote: any) {
    return this.http.get(environment.apiUrl + 'getResultadoPilaIdLote/' + idLote);
  }

  eliminarResultLote(idPila: any){
    return this.http.delete(environment.apiUrl + 'eliminarResultLote/' + idPila);
  }

  addSolicitudVistaClientePila(idNominacion: any, idLote: any, idUsuario: any) {
    let data = {
      "idNominacion": idNominacion,
      "idLote": idLote,
      "idUsuario":idUsuario,
      "estado": "Pendiente",
      "proceso" : "Resultado toma de pila"
    };
    return this.http.post(environment.apiUrl + 'addSolicitudVistaClientePila', data);
  }

  getAutorizacionVistaClientePila(idLote: any){
    return this.http.get(environment.apiUrl + 'getAutorizacionVistaClientePila/' + idLote);
  }

  getAutorizacionVistaClienteAdminPila(){
    return this.http.get(environment.apiUrl + 'getAutorizacionVistaClienteAdminPila');
  }
}
