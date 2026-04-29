import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NominacionService } from '../../services/nominacion.service';
import { ResultadoPilaService } from 'src/app/services/resultado-pila.service';
import { RegistrocamionService } from 'src/app/services/registrocamion.service';
import { CostadonaveService } from 'src/app/services/costadonave.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { DataTableDirective} from 'angular-datatables';
import { ChangeDetectorRef } from '@angular/core';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent {
  @ViewChild (DataTableDirective, {static : false}) dtElement!: DataTableDirective;
  destroy$: Subject<void> = new Subject<void>();
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptionsListarcamiones: DataTables.Settings = {};
  dtOptionslListarResultNomina: DataTables.Settings = {};
  dtOptionsLotesNaveResultadosListadosIndicadores: DataTables.Settings = {}; 
  dtOptionsDetalleLote: DataTables.Settings = {}; 
  idUsuario:any;
  nombre:any;
  apellido: any;
  cargo: any;
  ultimaNominacion: any;
  ultimaNominacionId: any;
  lotes: any[] = [];
  nominacionesBD: any[] = [];
  fechaInicio!: string;
  fechaFin!: string;
  idLoteSeleccionado: any = null;
  detalleLote: any[]=[];
  //modal pdfs
  pdfPath:any;
  informeResultadosPath!: string;
  informeHechosPath!: string;
  informeSellosPath!: string;
  informeMuestraPath!: string;
  informeHumedadPath!: string;
  informeFinalPath!: string;
  //indicadores pila
  lotesPilaIndicadores: any[]=[];
  //indicadores camiones 
  camiones: any[] = [];
  registrados: any;
  toneladas: any;
  tonregistrados: any;
  tonfaltantes: any;
  lote: any;
  idlote: any;
 //INDOCADORES RESULTADO COSTADO NAVE 
  totalWMT: number = 0;
  totalPorcentajeHumedad: number = 0;
  totalMTHumedad: number = 0;
  totalDMT: number = 0;
  lotesNaveListarResultadosIndicadores: any[] = [];
  //INDICADORES NOMINACIONES CERRADAS
  nominacionesCerradas: any[] = [];
  fechaASig: any;
  fechaIng: any;
  fechaTefa: any;
  lotesPilaIndicadoresHabilitar : boolean = false;
  camionesHabilitar : boolean = false;
  lotesNaveListarResultadosIndicadoresHabilitar : boolean = false;
  nominacionesCerradasHabilitar : boolean = false;
  limiteHumedad: any;

  constructor(private router: Router, private nominacion: NominacionService, private resultadopila: ResultadoPilaService, 
    private registrocamion: RegistrocamionService, private costadonave: CostadonaveService, private cdr: ChangeDetectorRef, private modal: NgbModal){
      this.nominacion.getNominacionesCliente().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        this.nominacionesBD = resp;
      }, error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al obtener las nominaciones.',        
        })
      }});

      this.lotesPilaIndicadoresHabilitar = false;
      this.camionesHabilitar = false;
      this.lotesNaveListarResultadosIndicadoresHabilitar = false;
      this.nominacionesCerradasHabilitar = false;
    }

  OnInit(){
    this.idUsuario = localStorage.getItem('ID Usuario');
    this.nombre = localStorage.getItem('nombre');
    this.apellido = localStorage.getItem('apellido');
    this.cargo = localStorage.getItem('cargo');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  salir(){
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }

  cleanAL(){
    this.lotesPilaIndicadoresHabilitar = false;
    this.camionesHabilitar = false;
    this.lotesNaveListarResultadosIndicadoresHabilitar = false;
    this.nominacionesCerradasHabilitar = false;
    this.ultimaNominacion = '';
    this.lotes = [];
    this.lotesPilaIndicadores = [];
    this.camiones = [];
    this.idLoteSeleccionado = '';
    this.lotesNaveListarResultadosIndicadores = [];
    this.nominacionesCerradas = [];
    this.detalleLote = [];
  }

  onInput() {
    if (this.ultimaNominacion) {
      this.nominacion.getLotesByIdNominacion(this.ultimaNominacion).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotes = resp;
          this.lotesPilaIndicadoresHabilitar = false;
          this.camionesHabilitar = false;
          this.lotesNaveListarResultadosIndicadoresHabilitar = false;
          this.nominacionesCerradasHabilitar = false;
          //Detecta cambios, sirve para que no de error en el datatbles.
          this.cdr.detectChanges();
          //Destruye el datatables y lo vuelve a inicializar.
          if (this.dtElement) {
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              dtInstance.destroy();
              // Luego, vuelve a inicializar DataTable
              this.dtTrigger.next(null);
            });
          }
        },
        error: (error: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al obtener los lotes.',
          });
        }
      });
    }
  }

  

  onCardClick(idLote: any): void {
    this.idLoteSeleccionado = idLote;
    this.lotesPilaIndicadoresHabilitar = false;
    this.camionesHabilitar = false;
    this.lotesNaveListarResultadosIndicadoresHabilitar = false;
    this.nominacionesCerradasHabilitar = false;
    this.resultadopila.getResultadoPilaIdLote(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {        
        this.lotesPilaIndicadores = resp;
        if(resp.length > 0){
          this.limiteHumedad = resp[0].limiteHumedad;
        }
        if(resp.length === 0){
          this.lotesPilaIndicadoresHabilitar = true;
        }
        if (this.lotesPilaIndicadores && this.lotesPilaIndicadores.length > 0) {
          this.lotesPilaIndicadores.sort((a, b) => {
            if (a.adjunto === 'SI' && b.adjunto === 'NO') {
              return -1;
            } else if (a.adjunto === 'NO' && b.adjunto === 'SI') {
              return 1;
            } else {
              return 0;
            }
          });
        } 
      },error: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener los lotes.',
        });
      }
    });
    //INDICADORES CAMION 
    this.registrocamion.getListarCamionesByIdLoteCliente(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          this.camiones = resp;
          if(this.camiones.length === 0){
            this.camionesHabilitar = true;
          }
          this.camiones.forEach((camion, idx) => {
            camion.acumulado = this.calculaAcumulado(idx);
          });
          // Establecer loteSeleccionado a true cuando se selecciona un lote
          if (resp && Array.isArray(resp) && resp.length > 0) {
              this.lote = resp[0].orden;
              this.registrados = resp.length;
              this.toneladas = resp[0].tonelaje;
              this.tonregistrados = resp.reduce((suma, itemActual) => {
                  return suma + Number(itemActual.neto || 0);
              }, 0);
          } else {
              // Actualizar propiedades a valores por defecto si no hay camiones
              this.lote = '';
              this.registrados = 0;
              this.toneladas = 0;
              this.tonregistrados = 0;
          }

          this.tonfaltantes = this.toneladas - this.tonregistrados;
      },
      error: (error: any) => {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al obtener los camiones.',        
          })
      }
    }); 
    //RESULTADOS COSTADO DE NAVE 
    this.costadonave.getResultadoNaveCliente(idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{      
      this.lotesNaveListarResultadosIndicadores = resp;
      if(resp.length === 0){
        this.lotesNaveListarResultadosIndicadoresHabilitar = true;
      }
      this.sumarFooterIdicadores();
      this.cdr.detectChanges();
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener los resultados nave',        
      })
    }});
    //NOMINACIONES CERRADAS
    this.nominacion.getNominacionesCerradasByIdLote(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
        this.nominacionesCerradas = resp;
        if(this.nominacionesCerradas.length === 0){
          this.nominacionesCerradasHabilitar = true;
        }
        if (resp && resp.length > 0) {
          // Acceder al primer elemento del array
          const nominacion = resp[0];
          this.fechaASig = nominacion.fechaAsignacion;
          this.fechaTefa = nominacion.fechaTerminoLote;
        }
      },
      error: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener las nominaciones cerradas',
        });
      }
    });
    //DETALLE LOTE
    this.nominacion.detalleLoteById(idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.detalleLote = [resp];
      
     }, error: (error: any) => {
       Swal.fire({
         icon : 'error',
         title: 'Error',
         text: 'Error al traer el detalle del lote',        
       })
     }});
  }

  calculaAcumulado(index: number) {
    let totalAcumulado = 0;
    for (let i = 0; i <= index; i++) {
        totalAcumulado += Number(this.camiones[i].neto);
    }
    return totalAcumulado;
  }

  sumarFooterIdicadores(){
    const mtSum = parseFloat(this.lotesNaveListarResultadosIndicadores.reduce((acc, l) => acc + Number(l.mt), 0).toFixed(3)); 
    const dmtSum = parseFloat(this.lotesNaveListarResultadosIndicadores.reduce((acc, l) => acc + Number(l.dmt), 0).toFixed(3));
    const wmtSum = parseFloat(this.lotesNaveListarResultadosIndicadores.reduce((acc, l) => acc + Number(l.wmt), 0).toFixed(3));
    const porcentajeHumedad = (mtSum / wmtSum) * 100;
    const porcentajeHumedadStr = porcentajeHumedad.toString();
    const dotIndex = porcentajeHumedadStr.indexOf('.');
    if (dotIndex !== -1 && porcentajeHumedadStr.length > dotIndex + 6) { 
        this.totalPorcentajeHumedad = parseFloat(porcentajeHumedadStr.substring(0, dotIndex + 6));
    } else {
        this.totalPorcentajeHumedad = porcentajeHumedad;
    }
    this.totalWMT = wmtSum;
    this.totalMTHumedad = mtSum;
    this.totalDMT = dmtSum;
  }

  verCamiones(modal:any){
    if (this.camiones && this.camiones.length > 0) {
      this.dtOptionsListarcamiones = {
        pagingType: 'full_numbers',
        pageLength: 10,
        lengthChange: false,
        searching: true,
        language: {
          url: '//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json',
        },
      };
    } else {
      this.camiones = [];
      this.dtOptionsListarcamiones = {
        pagingType: 'full_numbers',
        pageLength: 10,
        lengthChange: false,
        searching: true,
        language: {
          url: '//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json',
        },
      };
    }  
    this.modal.open(modal, { size: "lg", centered: true });
  }

  verResulPila(modal:any){
    if (this.lotesPilaIndicadores && this.lotesPilaIndicadores.length > 0) {
      this.dtOptionslListarResultNomina = {
        paging: false,
        searching: false,
        language: {
          emptyTable: '',
          info: '',
          infoEmpty: '',
          infoFiltered: '',
          zeroRecords: ''
        }
      };
    } else {
      this.lotesPilaIndicadores = [];
      this.dtOptionslListarResultNomina = {
        paging: false,
        searching: false,
        language: {
          emptyTable: '',
          info: '',
          infoEmpty: '',
          infoFiltered: '',
          zeroRecords: ''
        }
      };
    }
    this.modal.open(modal, { size: "lg", centered: true });
  }

  verResultadoNave(modal:any){
    if (this.lotesNaveListarResultadosIndicadores && this.lotesNaveListarResultadosIndicadores.length > 0) {
      this.dtOptionsLotesNaveResultadosListadosIndicadores = {
        paging: false,
        searching: false,
        language: {
          emptyTable: '',
          info: '',
          infoEmpty: '',
          infoFiltered: '',
          zeroRecords: ''
        }
      };
    } else {
      this.lotesNaveListarResultadosIndicadores = [];
      this.dtOptionsLotesNaveResultadosListadosIndicadores = {
        paging: false,
        searching: false,
        language: {
          emptyTable: '',
          info: '',
          infoEmpty: '',
          infoFiltered: '',
          zeroRecords: ''
        }
      };
    }
    this.modal.open(modal, { size: "lg", centered: true });
  }

  limpiarFechas() {
    this.lotesPilaIndicadoresHabilitar = false;
    this.camionesHabilitar = false;
    this.lotesNaveListarResultadosIndicadoresHabilitar = false;
    this.nominacionesCerradasHabilitar = false;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.idLoteSeleccionado = '';
    this.lotes = [];
    this.lotesPilaIndicadores = [];
    this.camiones = [];
    this.lotesNaveListarResultadosIndicadores = [];
    this.nominacionesCerradas = [];
    this.ultimaNominacion='';
  }

  buscarPorFechas() {
    if (this.fechaInicio && this.fechaFin) {
      this.nominacion.getNominacionesByDate(this.fechaInicio,this.fechaFin).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        this.lotes = resp;
      }, error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al obtener las nominaciones por fecha.',        
        })
      }});
    }
  }

  openDetalleLote(modal: any) {
      if (this.detalleLote && this.detalleLote.length > 0) {
        this.dtOptionsDetalleLote = {
          paging: false,
          searching: false,
          language: {
            emptyTable: '',
            info: '',
            infoEmpty: '',
            infoFiltered: '',
            zeroRecords: ''
          }
        };
      } else {
        this.detalleLote = [];
        this.dtOptionsDetalleLote = {
          paging: false,
          searching: false,
          language: {
            emptyTable: '',
            info: '',
            infoEmpty: '',
            infoFiltered: '',
            zeroRecords: ''
          }
        };
      }
      this.modal.open(modal, { size: "lg", centered: true });
  }


  openAdjuntos(modal: any, idLote: number) {
    this.nominacion.getAdjuntosNominacion(idLote).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
            if (resp && resp.length > 0) {
                this.informeFinalPath = resp;
            }
        },
        error: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener los archivos adjuntos',
            });
        }
    });
    this.modal.open(modal, { size: "sm", centered: true }); 
  }


  openAdjuntosNave(modal: any, idLote: number) {
    this.costadonave.getAdjuntosNave(idLote).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          if (resp && resp.length === 2) {
            this.informeResultadosPath = resp[0];
            this.informeSellosPath = resp[1];
          }
        }, 
        error: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener los archivos adjuntos',        
            })
        }
    });
    this.modal.open(modal, { size: "sm", centered: true }); 
  }

  openAdjuntosPila(modal: any, idPila: number) {
    this.resultadopila.getAdjuntosPila(idPila).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          if (resp && resp.length >= 2) {
            this.informeMuestraPath = resp[0];
            this.informeHumedadPath = resp[1];
            this.informeHechosPath = resp[2];
          }
        }, 
        error: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener los archivos adjuntos',        
            })
        }
    });
    this.modal.open(modal, { size: "sm", centered: true }); 
  }

  openPDF(modal: any, base64Data: string) {
    const pdfBlob = this.base64ToUint8Array(base64Data);
    this.pdfPath = pdfBlob;
    this.modal.open(modal, { size: "lg", centered: true });
  }

  base64ToUint8Array(base64: string) {
    const raw = atob(base64);
    const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) {
        uint8Array[i] = raw.charCodeAt(i);
    }
    return uint8Array;
  }
}
