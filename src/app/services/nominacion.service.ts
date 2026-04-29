import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NominacionService {

  constructor(private http: HttpClient) {}

 addNominacion(nmrNominacion:any, idUsuario: any, fechaAsignacion: any, fechaIngreso:any){
    let obj = {
      'nmrNominacion': nmrNominacion,
      'idUsuario': idUsuario,
      'fechaAsignacion': fechaAsignacion,
      'fechaIngreso': fechaIngreso
    };
    return this.http.post(environment.apiUrl + 'addNominacion', obj, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  getNominacionByNumero(numeroNominacion: any) {
    return this.http.get(environment.apiUrl + 'getNominacionByNumero/' + numeroNominacion);
  }


  getNominaciones(){
    return this.http.get(environment.apiUrl + 'getNominaciones');
  }

  getNominacionesByDate(inicio: any, fin:any){
    let params = new HttpParams();
    params = params.append('inicio', inicio);
    params = params.append('fin', fin);

    return this.http.get(environment.apiUrl + 'getNominacionesByDate', { params } );
  }

  getNominacionesCerradasByDate(inicio: any, fin:any){
    let params = new HttpParams();
    params = params.append('inicio', inicio);
    params = params.append('fin', fin);

    return this.http.get(environment.apiUrl + 'getNominacionesCerradasByDate', { params } );
  }

  addLote(cliente: any, orden: any, barco: any, armador: any, producto: any, tonelaje: any, destino: any, laycan:any, idNominacion: any, idUsuario:any){
    let obj = {
      'cliente': cliente,
      'orden': orden,
      'barco': barco,
      'armador': armador,
      'producto': producto,
      'tonelaje': tonelaje,
      'destino': destino,
      'laycan': laycan,
      'idNominacion': idNominacion,
      'idUsuario': idUsuario
    };
    return this.http.post(environment.apiUrl + 'addLote', obj, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  editLote(cliente: any, orden: any, barco: any, armador: any, producto: any, tonelaje: any, destino: any, laycan:any, idLote: any, idUsuario:any, idNominacion:any){
    const data = {
      'cliente': cliente,
      'orden': orden,
      'barco': barco,
      'armador': armador,
      'producto': producto,
      'tonelaje': tonelaje,
      'destino': destino,
      'laycan': laycan,
      'idLote': idLote,
      'idUsuario': idUsuario,
      'idNominacion': idNominacion
    };
    return this.http.put(environment.apiUrl + 'editLote', data);
  }

  getLotesByIdNominacion(idNominacion: any) {
    return this.http.get(environment.apiUrl + 'getLotesByIdNominacion/' + idNominacion);
  }

  getLotesByIdNominacionUno(idNominacion: any) {
    return this.http.get(environment.apiUrl + 'getLotesByIdNominacionUno/' + idNominacion);
  }

  getLotes(){
    return this.http.get(environment.apiUrl + 'getLotes');
  }

  editNominacion(nmrNominacion: any, fechaAsignacion: any, idNominacion: any, idUsuario:any){
    const data = {
      'idNominacion': idNominacion,
      'nmrNominacion': nmrNominacion,
      'idUsuario': idUsuario,
      'fechaAsignacion': fechaAsignacion,
    };
    return this.http.put(environment.apiUrl + 'editNominacion', data);
  }


  addAdjuntosNominacion(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addAdjuntosNominacion', formData);
  }
  
  getAdjuntosNominacion(idLote: number) {
    return this.http.get(environment.apiUrl + 'getAdjuntosNominacion/'+ idLote);
  }

  removeAdjuntosNominacion(idLote: number) {
    return this.http.get(environment.apiUrl + 'removeAdjuntosNominacion/' + idLote)
  }
  
  getNominacionesCerradas() {
    return this.http.get(environment.apiUrl + 'getNominacionesCerradas')
  }

  getNominacionesCerradasByIdLote(idLote: any) {
    return this.http.get(environment.apiUrl + 'getNominacionesCerradasByIdLote/' + idLote);
  }

  dejarAdjuntarInformeFinal(idLote: any) {
    return this.http.get(environment.apiUrl + 'dejarAdjuntarInformeFinal/' + idLote);
  }

  detalleLoteById(idLote: any) {
    return this.http.get(environment.apiUrl + 'detalleLoteById/' + idLote);
  }

  addSolicitudVistaClienteNomi(idNominacion: any, idLote: any, idUsuario: any) {
    let data = {
      "idNominacion": idNominacion,
      "idLote": idLote,
      "idUsuario":idUsuario,
      "estado": "Pendiente",
      "proceso" : "Informe Final"
    };
    return this.http.post(environment.apiUrl + 'addSolicitudVistaClienteNomi', data);
  }

  deleteSolicitudVistaClienteNomi(idLote: any) {
    return this.http.delete(environment.apiUrl + 'deleteSolicitudVistaClienteNomi/' + idLote);
  }

  getNominacionesCliente() {
    return this.http.get(environment.apiUrl + 'getNominacionesCliente')
  }
}