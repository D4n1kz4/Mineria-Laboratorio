import {  AfterViewInit, Component, ViewChild, OnInit, OnDestroy} from '@angular/core';
import { DataTableDirective} from 'angular-datatables';
import { Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NominacionService } from '../../services/nominacion.service';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ResultadoPilaService } from 'src/app/services/resultado-pila.service';
import { AdmninistracionService } from 'src/app/services/admninistracion.service';


@Component({
    selector: 'app-recepciondepila',
    templateUrl: './recepciondepila.component.html',
    styleUrls: ['./recepciondepila.component.css'],
    standalone: false
})
export class RecepciondepilaComponent implements OnInit, AfterViewInit, OnDestroy{
  @ViewChild (DataTableDirective, {static : false}) dtElement!: DataTableDirective;
  @ViewChild('modalRef') modalRef!: NgbModalRef;
  dtOptionsLoteslotesPila: DataTables.Settings = {}; 
  dtOptionsLotesRecepcion: DataTables.Settings = {}; 
  dtOptionslListarResultNomina: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  destroy$: Subject<void> = new Subject<void>();
  frmResultMuestraPila!: FormGroup;
  frmResultadoPilaEdit!: FormGroup;
  frmAdjuntarPDF!: FormGroup;
  idUsuario:any;
  nombre:any;
  apellido: any;
  cargo: any;
  activeButton!: string;
  activeDiv: string = 'muestreopila';
  nominacionesBDPila: any[] = [];
  nominacionesBDMaterial: any[] = [];
  nominacionPila!: any;
  nominacionMaterial!: any;
  nominacionPilaListar!: any;
  nominacionPilaIndicadores!: any;
  orden!: any;
  habilitar: boolean = false;
  lotesPila: any[]=[];
  lotesMaterial: any[]=[];
  lotesPilaListar: any[]=[];
  lotesPilaIndicadores: any[]=[];
  nominacionId: any;
  idNominacionSeleccionado:any;
  idLote:any;
  idPila:any;
  idLoteMaterial:any;
  idNominacion: any;
  listarResultNomina: any[]=[];
  nominacionListarResultPila: any[]=[];
  pdfPath:any;
  nombresDeArchivos: string[] = [];
  archivoSeleccionado: File | null = null;
  archivoSeleccionadoDos: File | null = null;
  archivoSeleccionadoTres: File | null = null;
  archivoSeleccionadoFlag: boolean = false;
  archivoSeleccionadoDosFlag: boolean = false;
  archivoSeleccionadoTresFlag: boolean = false;
  estadoActual: string = '';
  existenAdjuntos: boolean = false;
  loteSeleccionado: boolean = false;
  informeMuestraPath!: string;
  informeHumedadPath!: string;
  informeHechosPath!: string;
  get hayResultadoAprobado(): boolean {
    return this.listarResultNomina.some(l => l.estadoMuestra === 'Aprobado');
  }
  estadosPorFila: { [idLote: number]: string } = {};
  estadosPorFilaAdjuntos: { [idLote: number]: string } = {};
  estadoVistacliente: { [idLote: number]: string } = {};

  
   constructor(private nominacion: NominacionService, private cdr: ChangeDetectorRef,
   private modal: NgbModal, private fnBuilder: FormBuilder, private resultadopila: ResultadoPilaService,
   private administracion: AdmninistracionService){
    this.recuperarEstadoSolicitudes();
   }

   ngAfterViewInit() {
    this.dtTrigger.next(null);
   }

   ngOnInit(){
    this.idUsuario = localStorage.getItem('ID Usuario');
    this.nombre = localStorage.getItem('nombre');
    this.apellido = localStorage.getItem('apellido');
    this.cargo = localStorage.getItem('cargo');
    //Activa boton por defecto
    this.activeButton = 'Reliazar Muestreo de pila';
     //Obtiene todas las nominaciones
     this.nominacion.getNominaciones().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.nominacionesBDPila = resp;
      this.nominacionesBDMaterial= resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener las nominaciones.',        
      })
    }});
    this.existenAdjuntos = false;

    this.frmResultMuestraPila = this.fnBuilder.group({
      tons: ['', Validators.required],
      muestradoPor: ['', Validators.required],
      fechaMuestreo: ['', Validators.required],
      lugarMuestreo: ['', Validators.required],
      humedadFlujo: ['', Validators.required],
      limiteHumedad: ['', Validators.required],
      humedad: ['',Validators.required],
    });

    this.frmAdjuntarPDF= this.fnBuilder.group({
      infmuestra: ['', Validators.required],
      infhumedad: ['', Validators.required],
      informeHechos: ['', Validators.required]
    });

    this.frmResultadoPilaEdit = this.fnBuilder.group({
      tonsEdit: ['', Validators.required],
      muestradoPorEdit: ['', Validators.required],
      fechaMuestreoEdit: ['', Validators.required],
      lugarMuestreoEdit: ['', Validators.required],
      humedadFlujoEdit: ['', Validators.required],
      limiteHumedadEdit: ['', Validators.required],
      humedadEdit: ['',Validators.required],
    });

    //Inicializa dataOption para los lotes
    if (this.lotesPila && this.lotesPila.length > 0) {
      this.dtOptionsLoteslotesPila = {
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
      this.lotesPila = [];
      this.dtOptionsLoteslotesPila = {
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

    //Inicializa dataOption recepcion de material
    if (this.lotesMaterial && this.lotesMaterial.length > 0) {
      this.dtOptionsLotesRecepcion = {
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
      this.lotesMaterial = [];
      this.dtOptionsLotesRecepcion = {
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
   }
  

   ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
   //METODO QUE INDICA QUE EL BOTON ESTA ACTIVADO
   setActiveButton(button: string, div: string): void {
    this.activeButton = button;
    this.activeDiv = div;
    this.loteSeleccionado = false;
    if (this.activeDiv === 'listarpila') {
      this.recuperarEstadoSolicitudes();
    }
  }
  //METODO QUE HACE VISIBLE QUE EL BOTON ACTIVADO
  isButtonActive(button: string, div: string): boolean {
    return this.activeButton === button && this.activeDiv === div;
    this.loteSeleccionado = false;
  }
  
  //LIMPIAR RESULTADO DE PILA
  cleanPila(){
    this.nominacionPila= '';
    this.lotesPila = [];
    this.listarResultNomina = [];
  }
  //LIMPIAR RECEPCIÓN DE MATERIAL
  cleanMaterial(){
    this.nominacionMaterial= '';
    this.lotesMaterial = [];
    this.idLoteMaterial= '';
    this.idNominacion= '';
  }

  cleanPilaListar(){
    this.nominacionPilaListar= '';
    this.nominacionListarResultPila = [];
    this.lotesPilaListar = [];
    this.estadoActual= '';
    this.loteSeleccionado = false;
  }

  cleanIndicadores(){
    this.nominacionPilaIndicadores= '';
    this.lotesPilaIndicadores = [];
    this.loteSeleccionado = false;
  }
  
  //TRAE LAS PILAR PARA INGRESO DE RESULTADO
  onInput() {
    const nominacionSeleccionada = this.nominacionesBDPila.find(n => n.numeroNominacion === this.nominacionPila);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotesPila = resp;
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

  //TRAE LAS PILAR PARA RECEPCIÓN DE MATERIAL
  onInputMaterial(){
    const nominacionSeleccionada = this.nominacionesBDMaterial.find(n => n.numeroNominacion === this.nominacionMaterial);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotesMaterial = resp;
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

  onInputPilaListar(){
    const nominacionSeleccionada = this.nominacionesBDPila.find(n => n.numeroNominacion === this.nominacionPilaListar);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotesPilaListar = resp;
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

  onInputIndicadores(){
    const nominacionSeleccionada = this.nominacionesBDPila.find(n => n.numeroNominacion === this.nominacionPilaIndicadores);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.resultadopila.getResultadoPilaIndicadores(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {        
              this.lotesPilaIndicadores = resp;
              this.loteSeleccionado = true;
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

  openAdjuntos(modal: any, id: number) {
    this.idPila = id;
    this.resultadopila.getAdjuntosPila(this.idPila).pipe(takeUntil(this.destroy$)).subscribe({
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
  
openModalResultadoPila(modal: any, id: number, tonelaje: number) {
  this.idLote = id;
  this.resultadopila.getResultadoPila(this.idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          this.listarResultNomina = resp;
          this.listarResultNomina.forEach((resultado) => {
            if (resultado.adjunto === 'SI') {
                this.existenAdjuntos = true;
            }else {
              this.existenAdjuntos = false;
            }
          });
          const tonelajeAprobado = this.listarResultNomina
              .filter(r => r.estadoMuestra === 'Aprobado')
              .reduce((total, r) => total + parseFloat(r.tons), 0);

          if (tonelajeAprobado < tonelaje) {
              this.modal.open(modal, { size: "lm", centered: true });
          }
      },
      error: (error: any) => {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al obtener los resultados de pila',
          });
      }
  });
}

  eliminarAdjuntos(modal: any, pila: any, lote: any){
    this.idPila = pila;
    this.idLote = lote;
    this.modal.open(modal, { size: "sm", centered: true })
  }
  closeModalRemoveAdjuntos(){
    this.idPila = '';
    this.modal.dismissAll();
  }

  removeAdjuntos() {
    this.resultadopila.removeAdjuntosPila(this.idPila, this.idLote).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
            this.nominacionListarResultPila = resp;

            // Encuentra el índice del último elemento aprobado
            let ultimoAprobadoIndex = -1;
            for (let i = this.nominacionListarResultPila.length - 1; i >= 0; i--) {
                if (this.nominacionListarResultPila[i].estadoMuestra === 'Aprobado') {
                    ultimoAprobadoIndex = i;
                    break;
                }
            }

            // Habilita el adjunto para el último elemento aprobado
            if (ultimoAprobadoIndex !== -1) {
                this.nominacionListarResultPila.forEach((item, index) => {
                    item.permitirAdjunto = index === ultimoAprobadoIndex;
                });
            }

            this.recuperarEstadosVistaCliente(this.idLote);
            this.modal.dismissAll();
        },
        error: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al eliminar los archivos.',
            });
        }
    });
  }



  adjuntar(modal: any, id: number, idLote: number){
    this.idPila= id;
    this.idLote= idLote;
    this.modal.open(modal, { size: "lm", centered: true })
  }

  adjuntarPDF(){
    const idPila = this.idPila;
    const idLote = this.idLote;
    const formData = new FormData();
    if (this.archivoSeleccionado) {
        formData.append('infmuestra', this.archivoSeleccionado);
    }
    if (this.archivoSeleccionadoDos) {
        formData.append('infhumedad', this.archivoSeleccionadoDos);
    }
    if (this.archivoSeleccionadoTres) {
      formData.append('informeHechos', this.archivoSeleccionadoTres);
  }
    formData.append('idPila', idPila);
    formData.append('idLote', idLote);
    formData.append('idUsuario', this.idUsuario);
    
    this.resultadopila.addAdjuntosPila(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.nominacionListarResultPila = resp;
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Los archivos se han agregado con éxito.', 
      });
      this.frmAdjuntarPDF.reset();
      this.archivoSeleccionado = null;
      this.archivoSeleccionadoDos = null;
      this.archivoSeleccionadoTres = null;
      this.archivoSeleccionadoFlag = false;
      this.archivoSeleccionadoDosFlag = false;
      this.archivoSeleccionadoTresFlag= false;
      this.recuperarEstadosVistaCliente(idLote);
      this.modal.dismissAll();
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar los archivos adjuntos.',        
      })
    }});
  }

  closemodalAdjuntar(){
    this.frmAdjuntarPDF.reset();
    this.archivoSeleccionado = null;
    this.archivoSeleccionadoDos = null;
    this.archivoSeleccionadoTres = null;
    this.archivoSeleccionadoFlag = false;
    this.archivoSeleccionadoDosFlag = false;
    this.archivoSeleccionadoTresFlag= false;
    this.modal.dismissAll();
  }

  onInformeSelected(event: any, campo: string): void {
    const file = event.target.files[0];
    if (file) {
        if (campo === 'infmuestra' || campo === 'infhumedad' || campo === 'informeHechos') {
            if (file.type.match('application/pdf')) {
                if (campo === 'infmuestra') {
                    this.archivoSeleccionado = file;
                    this.archivoSeleccionadoFlag = true;
                } else if (campo === 'infhumedad') {
                    this.archivoSeleccionadoDos = file;
                    this.archivoSeleccionadoDosFlag = true;
                } else if (campo === 'informeHechos') {
                    this.archivoSeleccionadoTres = file;
                    this.archivoSeleccionadoTresFlag = true;
                }
                this.frmAdjuntarPDF.get(campo)!.setValue(file);
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Formato de archivo no válido',
                    text: 'Por favor, selecciona un archivo PDF.',
                });
                event.target.value = '';
                this.frmAdjuntarPDF.get(campo)!.setValue(null);
                return;
            }
        } else {
            this.archivoSeleccionado = file;
            this.archivoSeleccionadoFlag = true;
            this.frmAdjuntarPDF.get(campo)!.setValue(file);
        }
        this.frmAdjuntarPDF.get(campo)!.updateValueAndValidity();
    }
}
  eliminarArchivo(campo: string): void {
      if (campo === 'infmuestra') {
        this.archivoSeleccionado = null;
        this.archivoSeleccionadoFlag = false;
      } else if (campo === 'infhumedad') {
        this.archivoSeleccionadoDos = null;
        this.archivoSeleccionadoDosFlag = false;
      }else if (campo === 'informeHechos') {
        this.archivoSeleccionadoTres = null;
        this.archivoSeleccionadoTresFlag = false;
      }
      this.frmAdjuntarPDF.get(campo)!.setValue(null);
      this.frmAdjuntarPDF.get(campo)!.updateValueAndValidity();
      this.restablecerInputFile(campo);
  }
  
  restablecerInputFile(campo: string): void {
    let inputId = '';
    if (campo === 'infmuestra') {
      inputId = 'formFileInforme1';
    } else if (campo === 'infhumedad') {
      inputId = 'formFileInforme2';
    }
    else if (campo === 'informeSellos') {
      inputId = 'formFileInforme3';
    }
  
    const inputFile = document.getElementById(inputId) as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';  
    }
  }


  eliminarResultado(modal: any, idPila: number){
    this.idPila= idPila;
    this.modal.open(modal, { size: "sm", centered: true })
  }
  closeModalRemoveResultPila(){
    this.modal.dismissAll();
  }
  removeResultPila(){
    this.resultadopila.eliminarResultLote(this.idPila).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      Swal.fire({ 
        icon: 'success',
        title: 'Éxito',
        text: 'Resultado eliminado con éxito',
      });
      this.modal.dismissAll();
      this.listarResultNomina = resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al eliminar el resultado',        
      })
    }});
  }
  
  editResultado(modal: any, id: number, idLote: number){
    this.estadoActual = '';
    this.idPila= id;
    this.idLote = idLote;
    this.resultadopila.getResultadoPilaByIdPila(this.idPila).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.estadoActual = resp.estadoMuestra;
          this.frmResultadoPilaEdit.patchValue({
            tonsEdit: resp.tons,
            muestradoPorEdit: resp.muestradoPor,
            fechaMuestreoEdit: resp.fechaMuestra,
            lugarMuestreoEdit: resp.lugarMuestreo,
            humedadFlujoEdit: resp.humedadFlujo,
            limiteHumedadEdit: resp.limiteHumedad,
            humedadEdit: resp.resultadoHumedad,            
          });
        }  
      },
      error: (error: any) => {
        Swal.fire({
            icon : 'error',
            title: 'Error',
            text: 'Error al obtener los resultados de pila',        
        });
      }
  });
    this.modal.open(modal, { size: "lm", centered: true })
  }


  editResultadoLote() {
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('idPila', this.idPila);
    formData.append('idUsuario', this.idUsuario);
    formData.append('tons', this.frmResultadoPilaEdit.get('tonsEdit')?.value);  
    formData.append('muestradoPor', this.frmResultadoPilaEdit.get('muestradoPorEdit')?.value);
    formData.append('fechaMuestra', this.frmResultadoPilaEdit.get('fechaMuestreoEdit')?.value);
    formData.append('lugarMuestreo', this.frmResultadoPilaEdit.get('lugarMuestreoEdit')?.value);
    formData.append('humedadFlujo', this.frmResultadoPilaEdit.get('humedadFlujoEdit')?.value);
    formData.append('limiteHumedad', this.frmResultadoPilaEdit.get('limiteHumedadEdit')?.value);
    formData.append('humedad', this.frmResultadoPilaEdit.get('humedadEdit')?.value);

    this.resultadopila.editResultadoLote(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.length > 0) {
            const updatedItem = response[0];
            const index = this.listarResultNomina.findIndex(item => item.idPila === updatedItem.idPila);
            if (index !== -1) {
                this.listarResultNomina[index] = updatedItem;
            }

            Swal.fire({ 
                icon: 'success',
                title: 'Éxito',
                text: 'Resultado editado con éxito',
            });
            this.modal.dismissAll();
        }
      }, 
      error: (error: any) => {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al editar el resultado',        
          });
      }
  });
}

  closemodalEditResultadoLote(){
    this.frmResultadoPilaEdit.reset();
    this.modal.dismissAll();
  }

  closemodalAddResultadoPila(){
    this.frmResultMuestraPila.reset();
    this.modal.dismissAll();
  }
  
  addResultadoLote() {
    const tons = this.frmResultMuestraPila.get('tons')?.value;
    const muestradoPor = this.frmResultMuestraPila.get('muestradoPor')?.value;
    const fechaMuestreo = this.frmResultMuestraPila.get('fechaMuestreo')?.value;
    const lugarMuestreo = this.frmResultMuestraPila.get('lugarMuestreo')?.value;
    const humedadFlujo = this.frmResultMuestraPila.get('humedadFlujo')?.value;
    const limiteHumedad = this.frmResultMuestraPila.get('limiteHumedad')?.value;
    const humedad = this.frmResultMuestraPila.get('humedad')?.value;
    
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('tons', tons);
    formData.append('muestradoPor', muestradoPor);
    formData.append('fechaMuestreo', fechaMuestreo);
    formData.append('lugarMuestreo', lugarMuestreo);
    formData.append('humedadFlujo', humedadFlujo);
    formData.append('limiteHumedad', limiteHumedad);
    formData.append('humedad', humedad);
    formData.append('idUsuario', this.idUsuario);
    
    this.resultadopila.addResultadoPila(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) => {
      if (resp.success) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Resultado ingresado con éxito',
        });
        this.resultadopila.getResultadoPila(this.idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
          this.listarResultNomina = resp;
        }, error: (error: any) => {
          Swal.fire({
            icon : 'error',
            title: 'Error',
            text: 'Error al obtener los resultados de pila',        
          })
        }});
        this.frmResultMuestraPila.reset();
        this.modal.dismissAll();
      } else {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al ingresar el resultado.',
        });
      }
    },
    error: (error: any) => {
      console.error('Error al realizar la solicitud:', error);
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al realizar la solicitud al servidor.',
      });
    }});
  }

  selecionarLote(idLote:any, idNominacion:any){
    this.idLoteMaterial = idLote;
    this.idNominacion = idNominacion;
  }

  listarlotesresultpila(idLote: any, orden: any, tonelaje: number){
    this.orden = orden;
    this.resultadopila.getResultadoPila(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
        this.nominacionListarResultPila = resp; 
        this.loteSeleccionado = true;
        this.recuperarEstadosVistaCliente(idLote);
        const resultadosAprobados = this.nominacionListarResultPila.filter(r => r.estadoMuestra === 'Aprobado');
        const tonelajeAprobado = resultadosAprobados.reduce((total, r) => total + parseFloat(r.tons), 0);
        this.nominacionListarResultPila.forEach(r => r.permitirAdjunto = false);
        if (tonelajeAprobado === Number(tonelaje) && resultadosAprobados.length > 0) {
            resultadosAprobados[resultadosAprobados.length - 1].permitirAdjunto = true;
        }

      },
      error: (error: any) => {
          Swal.fire({
              icon : 'error',
              title: 'Error',
              text: 'Error al obtener los resultados de pila',        
          });
      }
    });
  }


  openPdfInViewer(base64Data: string, modal: any){
    this.pdfPath = 'data:application/pdf;base64,' + base64Data;
    this.modal.open(modal, { size: "lm", centered: true });
  }


  //Indicadores
  listarIndocadores(idLote: any){
    this.resultadopila.getResultadoPilaIndicadores(this.idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.listarResultNomina = resp;

    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener los resultados de pila',        
      })
    }});

    this.idLote = idLote
  }

  solicitarEdicion(idNominacion: any, idLote: any, idAdjunto: any){
    const solicitud = {
      tipoAccion: "Editar y/o Eliminar",
      tabla: "muestrapila, adjunto",
      estado: "Pendiente",
      idTablaUno: 0,
      idTablaDos: idLote,
      idTablaTres: idAdjunto,
      idUsuario: this.idUsuario,
      tipoProceso: 'Proceso2'
    };
  
    this.administracion.pedirAutorizacion(solicitud).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
        this.estadosPorFilaAdjuntos[idLote] = 'Pendiente'; 
      }, 
      error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al enviar la autorización',        
        })
      }
    });
  }
  
  recuperarEstadoSolicitudes() {
    this.administracion.getAutorizaciones().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      resp.forEach((solicitud: any) => {
        if (solicitud.tipoProceso === 'Proceso2') {
          this.estadosPorFila[solicitud.idTablaDos] = solicitud.estado;
          this.estadosPorFilaAdjuntos[solicitud.idTablaTres] = solicitud.estado;
        }
        this.cdr.detectChanges();
      });
        
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener las solicitudes',        
      })
    }});
  
  }

  solicitarVistaCliente(idLote: any){
    this.resultadopila.addSolicitudVistaClientePila(this.idNominacionSeleccionado, idLote, this.idUsuario).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.estadoVistacliente[idLote] = 'Pendiente'; 
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar la solicitud.',        
      })
    }});
  }



  recuperarEstadosVistaCliente(idLote: any) {
    this.resultadopila.getAutorizacionVistaClientePila(idLote)
      .pipe(takeUntil(this.destroy$)) 
      .subscribe({
        next: (resp: any) => {
          let encontrado = false;
          resp.forEach((solicitud: any) => {           
            if (solicitud.proceso === 'Resultado toma de pila' && solicitud.idLote === idLote) {
              this.estadoVistacliente[idLote] = solicitud.estado;
              encontrado = true;
            }
          });
          if (!encontrado) {
            this.estadoVistacliente[idLote] = 'Solicitar';
          }
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al obtener la solicitudes de vista cliente.',
          });
        }
      });
  }

}
