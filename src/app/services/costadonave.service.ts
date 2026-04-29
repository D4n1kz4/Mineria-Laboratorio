import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CostadonaveService {

  constructor(private http: HttpClient) { }

  addResultadoNave(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultadoNave', formData);
  }

  getResultadoNave(idLote: any) {
    return this.http.get(environment.apiUrl + 'getResultadoNave/' + idLote);
  }

  getResultadoNaveCliente(idLote: any) {
    return this.http.get(environment.apiUrl + 'getResultadoNaveCliente/' + idLote);
  }


  getResultadoNaveById(idCostadonave: any) {
    return this.http.get(environment.apiUrl + 'getResultadoNaveById/' + idCostadonave);
  }

 
  editResCostadoNave(lote: any, idCostadonave: any, fechaMuestreoEdit: any, sello: any, selloreemplazoEdit: any, wmtEdit: any, moistureEdit: any, mtEdit: any, dmtEdit: any, idUsuario:any ){
    const data = {
      "idLote": lote,
      "idCostadonave": idCostadonave,
      "fechaMuestreo": fechaMuestreoEdit,
      "sello": sello,
      "selloreemplazo": selloreemplazoEdit,
      "wmt": wmtEdit,
      "moisture": moistureEdit,
      "mt": mtEdit,
      "dmt": dmtEdit,
      "idUsuario": idUsuario,

    }
    return this.http.put(environment.apiUrl + 'editResCostadoNave', data);
  }


  addAdjuntosNave(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addAdjuntosNave', formData);
  }
  
  getAdjuntosNave(idLote: any) {
    return this.http.get(environment.apiUrl + 'getAdjuntosNave/' + idLote);
  }

  removeAdjuntosNave(idLote: any) {
    return this.http.get(environment.apiUrl + 'removeAdjuntosNave/' + idLote)
  }

  eliminarResultNave(idCostadonave: any){
    return this.http.delete(environment.apiUrl + 'eliminarResultNave/' + idCostadonave);
  }
  

  addSolicitudVistaClienteNave(idNominacion: any, idLote: any, idUsuario: any) {
    let data = {
      "idNominacion": idNominacion,
      "idLote": idLote,
      "idUsuario":idUsuario,
      "estado": "Pendiente",
      "proceso" : "Resultado costado de nave"
    };
    return this.http.post(environment.apiUrl + 'addSolicitudVistaClienteNave', data);
  }

  getAutorizacionVistaClienteNave(idLote: any){
    return this.http.get(environment.apiUrl + 'getAutorizacionVistaClienteNave/' + idLote);
  }

  getAutorizacionVistaClienteAdminNave(){
    return this.http.get(environment.apiUrl + 'getAutorizacionVistaClienteAdminNave');
  }
  
}
