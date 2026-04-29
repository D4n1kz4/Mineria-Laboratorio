import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LaboratorioService {

  constructor(private http: HttpClient) { }

  addRegistroMuestra(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addRegistroMuestra', formData);
  }

  getRegistroByIdLote(idLote: any) {
    return this.http.get(environment.apiUrl + 'getRegistroByIdLote/' + idLote);
  }

  editRegistroByIdLote(data: any) {
   return this.http.put(environment.apiUrl + 'editRegistroByIdLote', data);
  }

  saveResultHumedad(data: any) {
    return this.http.post(environment.apiUrl + 'saveResultHumedad', data);
  }


  getResultHumedadIniciados(idLote: any){
    return this.http.get(environment.apiUrl + 'getResultHumedadIniciados/' + idLote);
  }

  addResultIMO(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultIMO', formData);
  }

  getResultIMOoByIdLote(idLote: any) {
    return this.http.get(environment.apiUrl + 'getResultIMOoByIdLote/' + idLote);
  }

  addResultAnatural(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultAnatural', formData);
  }

  getAnatural(idLote: any) {
    return this.http.get(environment.apiUrl + 'getAnatural/' + idLote);
  }

  addResultBPreliminar(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultBPreliminar', formData);
  }

  getBPreliminar(idLote: any) {
    return this.http.get(environment.apiUrl + 'getBPreliminar/' + idLote);
  }

  addResultCBeforeUno(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultCBeforeUno', formData);
  }

  getCBeforeUno(idLote: any) {
    return this.http.get(environment.apiUrl + 'getCBeforeUno/' + idLote);
  }

  addResultCBeforeDos(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultCBeforeDos', formData);
  }

  getCBeforeDos(idLote: any) {
    return this.http.get(environment.apiUrl + 'getCBeforeDos/' + idLote);
  }


  addResultDAboveUno(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultDAboveUno', formData);
  }

  getDAboveUno(idLote: any) {
    return this.http.get(environment.apiUrl + 'getDAboveUno/' + idLote);
  }


  addResultDAboveDos(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultDAboveDos', formData);
  }

  getDAboveDos(idLote: any) {
    return this.http.get(environment.apiUrl + 'getDAboveDos/' + idLote);
  }


  addResultFMPTML(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addResultFMPTML', formData);
  }

  getFMPTML(idLote: any) {
    return this.http.get(environment.apiUrl + 'getFMPTML/' + idLote);
  }

  getDatosFMPTML(idLote: any) {
    return this.http.get(environment.apiUrl + 'getDatosFMPTML/' + idLote);
  }
   
  getDatosHumedad(idLote: any) {
    return this.http.get(environment.apiUrl + 'getDatosHumedad/' + idLote);
  }


  addAutorizacion(formData: FormData) {
    return this.http.post(environment.apiUrl + 'addAutorizacion', formData);
  }
   
  getAutorizaciones(idLote: any) {
    return this.http.get(environment.apiUrl + 'getAutorizaciones/' + idLote);
  }
}