import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrocamionService {

  constructor(private http: HttpClient) {}

  addRegistroCamion(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addRegistroCamion', formData);
  }

  getListarCamionesByIdLote(idLote: any) {
    return this.http.get(environment.apiUrl + 'getListarCamionesByIdLote/' + idLote);
  }

  getListarCamionesByIdLoteCliente(idLote: any) {
    return this.http.get(environment.apiUrl + 'getListarCamionesByIdLoteCliente/' + idLote);
  }
  
  getListarCamionesByIdNominacion(idNominacion: any) {
    return this.http.get(environment.apiUrl + 'getListarCamionesByIdNominacion/' + idNominacion);
  }

  getCamionByIdRegistro(idRegitro:any){
    return this.http.get(environment.apiUrl + 'getCamionByIdRegistro/' + idRegitro);
  }

  editCamionByIdRegistro(formData: FormData){
    return this.http.post(environment.apiUrl + 'editCamionByIdRegistro', formData);
  }

  eliminarCamion(idRegistro: any){
    return this.http.delete(environment.apiUrl + 'eliminarCamion/' + idRegistro);
  }

  addSolicitudVistaClienteCamion(idNominacion: any, idLote: any, idUsuario: any) {
    let data = {
      "idNominacion": idNominacion,
      "idLote": idLote,
      "idUsuario":idUsuario,
      "estado": "Pendiente",
      "proceso" : "Registro de camión"
    };
    return this.http.post(environment.apiUrl + 'addSolicitudVistaClienteCamion', data);
  }

  getAutorizacionVistaClienteCamion(){
    return this.http.get(environment.apiUrl + "getAutorizacionVistaClienteCamion");
  }

  getAutorizacionVistaClienteAdminCamion(){
    return this.http.get(environment.apiUrl + "getAutorizacionVistaClienteAdmin");
  }


  
}



