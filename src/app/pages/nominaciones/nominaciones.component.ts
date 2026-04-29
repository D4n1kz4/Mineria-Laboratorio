import { Component, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { NominacionService } from '../../services/nominacion.service';
import { DataTableDirective} from 'angular-datatables';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { CostadonaveService } from 'src/app/services/costadonave.service';
import { ResultadoPilaService } from 'src/app/services/resultado-pila.service';
import { Router } from '@angular/router';
import { AdmninistracionService } from 'src/app/services/admninistracion.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-nominaciones',
    templateUrl: './nominaciones.component.html',
    styleUrls: ['./nominaciones.component.css'],
    standalone: false
})
export class NominacionesComponent {
  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective;
  @ViewChild('asignarLote') asignarLote!: TemplateRef<any>;
  dtOptionsListarCerradas: DataTables.Settings = {};
  dtOptionsLotes: DataTables.Settings = {};
  dtOptionsLotesVer: DataTables.Settings = {};
  dtOptionsLotesEdit: DataTables.Settings = {};
  formNomicacion!: FormGroup;
  formLote!: FormGroup;
  formLoteEdit!: FormGroup;
  formNomicacionEdit!: FormGroup;
  frmAdjuntarPDF!: FormGroup;
  destroy$: Subject<void> = new Subject<void>();
  idUsuario:any;
  nombre:any;
  apellido: any;
  cargo: any;
  activeButton!: string;
  activeDiv: string = 'nominacion';
  nominacionesBD: any[] = [];
  nominacionesBDLotes: any[] = [];
  ultimaNominacion: any;
  ultimaNominacionId: any;
  verNominacion: any;
  lotes: any[] = [];
  lotesVer: any[] = [];
  datosNominacion: any[] = [];
  idLote: any;
  idPila: any;
  idNominacion: any;
  orden: any
  pdfPath:any;
  nombresDeArchivos: string[] = [];
  archivoSeleccionado: File | null = null;
  mesActual!: string;
  archivoSeleccionadoFlag: boolean = false;
  estadoActual: string = '';
  loteSeleccionado: boolean = false;
  informeFinalPath!: string;
  nominacionesCerradas: any[] = [];
  informeResultadosPath!: string;
  informeHechosPath!: string;
  informeSellosPath!: string;
  informeMuestraPath!: string;
  informeHumedadPath!: string;
  fechaInicio!: string;
  fechaFin!: string;
  estadosPorFilaNominacion: { [idLote: number]: string } = {};
  estadosPorFila: { [idLote: number]: string } = {};
  estadosPorFilaAdjuntos: { [idLote: number]: string } = {};


  constructor(private fnBuilder: FormBuilder, private nominacion: NominacionService, private modal: NgbModal, 
    private costadonave: CostadonaveService, private resultadopila: ResultadoPilaService, private router: Router,
    private administracion: AdmninistracionService, private cdr: ChangeDetectorRef){
    }

    ngOnInit(){
      this.recuperarEstadoSolicitudes();
      this.mesActual = this.getMesActual();
      const idCargo = parseInt(localStorage.getItem('idCargo') || '0');
      if (idCargo === 3) {
        this.router.navigate(['/cliente']);
      }
      //Datos de usuario y nominaciones ingresadas. 
      this.idUsuario = localStorage.getItem('ID Usuario');
      this.nombre = localStorage.getItem('nombre');
      this.apellido = localStorage.getItem('apellido');
      this.cargo = localStorage.getItem('cargo');
      //Activa boton por defecto
      this.activeButton = 'Ingresar Nominación';
      //Formularionomina
      this.formNomicacion = this.fnBuilder.group({
        nominacion: ['', Validators.required],
        fechaAsignacion: ['', Validators.required]
      });
      this.formNomicacionEdit = this.fnBuilder.group({
        nominacionEdit: ['', Validators.required],
        fechaAsignacionEdit: ['', Validators.required]
      });
      //Formulario lotes
      this.formLote = this.fnBuilder.group({
        cliente: ['', Validators.required],
        orden: ['', Validators.required],
        barco: ['', Validators.required],
        armador: ['', Validators.required],
        producto: ['', Validators.required],
        tonelaje: ['', Validators.required],
        destino: ['', Validators.required],
        laycan: ['', Validators.required],
      });

      this.formLoteEdit = this.fnBuilder.group({
        clienteEdit: ['', Validators.required],
        ordenEdit: ['', Validators.required],
        barcoEdit: ['', Validators.required],
        armadorEdit: ['', Validators.required],
        productoEdit: ['', Validators.required],
        tonelajeEdit: ['', Validators.required],
        destinoEdit: ['', Validators.required],
        laycanEdit: ['', Validators.required],
      });
      //Formulario PDF
      this.frmAdjuntarPDF= this.fnBuilder.group({
        informefinal: ['', Validators.required],
      });

      // Formato mayúscula asignar Lote
      this.formNomicacion.get('cliente')?.valueChanges.subscribe((value: string | null) => {
        if (value !== null && value !== undefined) {
          this.formNomicacion.patchValue({ cliente: value.toUpperCase() }, { emitEvent: false });
        }
      });
      this.formNomicacion.get('orden')?.valueChanges.subscribe((value: string | null) => {
        if (value !== null && value !== undefined) {
          this.formNomicacion.patchValue({ orden: value.toUpperCase() }, { emitEvent: false });
        }
      });
      this.formNomicacion.get('barco')?.valueChanges.subscribe((value: string | null) => {
        if (value !== null && value !== undefined) {
          this.formNomicacion.patchValue({ barco: value.toUpperCase() }, { emitEvent: false });
        }
      });
      this.formNomicacion.get('armador')?.valueChanges.subscribe((value: string | null) => {
        if (value !== null && value !== undefined) {
          this.formNomicacion.patchValue({ armador: value.toUpperCase() }, { emitEvent: false });
        }
      });
      this.formNomicacion.get('producto')?.valueChanges.subscribe((value: string | null) => {
        if (value !== null && value !== undefined) {
          this.formNomicacion.patchValue({ producto: value.toUpperCase() }, { emitEvent: false });
        }
      });
      this.formNomicacion.get('destino')?.valueChanges.subscribe((value: string | null) => {
        if (value !== null && value !== undefined) {
          this.formNomicacion.patchValue({ destino: value.toUpperCase() }, { emitEvent: false });
        }
      });
      this.formNomicacion.get('laycan')?.valueChanges.subscribe((value: string | null) => {
        if (value !== null && value !== undefined) {
          this.formNomicacion.patchValue({ laycan: value.toUpperCase() }, { emitEvent: false });
        }
      });
      //Formato mayuscula para el ingreso de las nominas.
      this.formNomicacion.get('nominacion')?.valueChanges.subscribe((value: string | null) => {
        if (value !== null && value !== undefined) {
            this.formNomicacion.patchValue({ nominacion: value.toUpperCase() }, { emitEvent: false });
        }
      });
      //Obtiene todas las nominaciones
      this.nominacion.getNominaciones().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        this.nominacionesBDLotes = resp;
        this.nominacionesBD = resp;
      }, error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al obtener las nominaciones.',        
        })
      }});
      //Obtiene todos los lotes
      this.nominacion.getLotes().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        this.lotesVer = resp;
      }, error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al obtener los lotes',        
        })
      }});
      //Obtiene las nominaciones cerradas
      this.nominacion.getNominacionesCerradas().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        this.nominacionesCerradas =resp;
        console.log("this.nominacionesCerradas", this.nominacionesCerradas)
      }, error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al traer las nominaciones cerradas',        
        })
      }});
      //Inicializa dataOption para los lotes
      if (this.lotes && this.lotes.length > 0) {
        this.dtOptionsLotes = {
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
        this.lotes = [];
        this.dtOptionsLotes = {
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

      if (this.lotes && this.lotes.length > 0) {
        this.dtOptionsLotesEdit = {
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
        this.lotes = [];
        this.dtOptionsLotesEdit = {
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
  
      if (this.lotesVer && this.lotesVer.length > 0) {
        this.dtOptionsLotesVer = {
          pagingType: 'full_numbers',
          pageLength: 10,
          lengthChange: false,
          searching: true,
          language: {
            url: '//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json',
          },
        };
      } else {
        this.lotesVer = [];
        this.dtOptionsLotesVer = {
          pagingType: 'full_numbers',
          pageLength: 10,
          lengthChange: false,
          searching: true,
          language: {
            url: '//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json',
          },
        };
      }  

      if (this.nominacionesCerradas && this.nominacionesCerradas.length > 0) {
        this.dtOptionsListarCerradas = {
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
        this.nominacionesCerradas = [];
        this.dtOptionsListarCerradas = {
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
      // Recuperar el estado de 'activeDiv' después de recargar
    const savedActiveDiv = localStorage.getItem('activeDiv');
    if (savedActiveDiv) {
        this.activeDiv = savedActiveDiv;
        localStorage.removeItem('activeDiv');
    }
    }
  
    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }

    getMesActual(): string {
      const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const fechaActual = new Date();
      return meses[fechaActual.getMonth()];
    }
    //METODO PARA TEMPLATE USUARIOS
    getIdCargo(): number {
      return parseInt(localStorage.getItem('idCargo') || '0');
    }
    //METODO QUE INDICA QUE EL BOTON ESTA ACTIVADO
    setActiveButton(button: string, div: string): void {
      this.activeButton = button;
      this.activeDiv = div;
  
      if (this.activeDiv === 'verNominacion') {
          this.recuperarEstadoSolicitudes();
      } else if (this.activeDiv === 'listarCerradas') {
          localStorage.setItem('activeDiv', this.activeDiv);
          window.location.reload();
      }
    }
    //METODO QUE HACE VISIBLE QUE EL BOTON ACTIVADO
    isButtonActive(button: string, div: string): boolean {
      return this.activeButton === button && this.activeDiv === div;
    }
  
    //BOTÓN INGRESAR NOMINACIÓN
    saveNominacion(){
      const nmrNominacion = this.formNomicacion.get('nominacion')?.value;
      const fechaAsignacion = this.formNomicacion.get('fechaAsignacion')?.value;
      const fechaIngreso = this.formatDateWithoutTime(new Date());
      this.nominacion.addNominacion(nmrNominacion, this.idUsuario,fechaAsignacion, fechaIngreso).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        if (resp === true) {
          this.ultimaNominacion = nmrNominacion;
          //actualiza los getNominaciones
          this.nominacion.getNominaciones().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
            this.nominacionesBDLotes = resp;
            this.nominacionesBD = resp;
            // Buscar el idNominacion correspondiente al numeroNominacion recién ingresado
            const nuevaNominacion = this.nominacionesBDLotes.find((nominacion: any) => nominacion.numeroNominacion === this.ultimaNominacion);
            // Si se encontró la nueva nominación, captura el idNominacion
            if (nuevaNominacion) {
              this.ultimaNominacionId = nuevaNominacion.idNominacion;
            }
          }, error: (error: any) => {
            Swal.fire({
              icon : 'error',
              title: 'Error',
              text: 'Error al obtener las nominaciones.',        
            })
          }});
          Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Nominación ingresada con éxito',
            }).then((result) => {
              if (result.isConfirmed || result.isDismissed) {
                this.formNomicacion.reset();
                this.setActiveButton('Asignar Lote', 'asignarLote');
                this.modal.open(this.asignarLote);
              }
          });
          
        } else {
            // La nominación ya existe en el sistema
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'Nominación ya existe en el sistema',
            });
            this.formNomicacion.reset();
        }
      }, error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al ingresar la nominación',        
        })
      }});
    }
  
    // Función para eliminar la parte de la hora de un objeto Date
    formatDateWithoutTime(date: Date): string {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    }
  
  //BOTÓN ASIGNAR LOTE
  addLote(): void {
    const cliente = this.formLote.get('cliente')?.value;
    const orden = this.formLote.get('orden')?.value;
    const barco = this.formLote.get('barco')?.value;
    const armador = this.formLote.get('armador')?.value;
    const producto = this.formLote.get('producto')?.value;
    const tonelaje = this.formLote.get('tonelaje')?.value;
    const destino = this.formLote.get('destino')?.value;
    const laycan = this.formLote.get('laycan')?.value;
  
    this.nominacion.addLote(cliente, orden, barco, armador, producto, tonelaje, destino, laycan, this.ultimaNominacionId, this.idUsuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          if (resp.success) {
            this.obtenerLotesActualizados();
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Lote asignado con éxito',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: resp.message
            });
          }
          this.formLote.reset();
          this.modal.dismissAll();
        },
        error: (error: any) => {
          Swal.fire({
            icon : 'error',
            title: 'Error',
            text: 'Error al asignar lote.',
          });
        }
      });
  }
  
  private obtenerLotesActualizados(): void {
    this.nominacion.getLotesByIdNominacion(this.ultimaNominacionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          this.lotes = resp;
          // Obtener datos de nominación actualizados
          this.nominacion.getLotesByIdNominacionUno(this.ultimaNominacionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (resp: any) => {
                this.datosNominacion = resp.nominacion;
              },
              error: (error: any) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al obtener los datos de nominación.',        
                });
              }
            });
        },
        error: (error: any) => {
          Swal.fire({
            icon : 'error',
            title: 'Error',
            text: 'Error al obtener los lotes',        
          });
        }
      });
  }
  
  onInput() {
    const selectedOption: HTMLOptionElement | null = document.querySelector(`option[value="${this.ultimaNominacion}"]`);
    if (selectedOption) {
        this.ultimaNominacionId = parseInt(selectedOption.getAttribute('data-idNominacion') || '0', 10);
        this.nominacion.getLotesByIdNominacionUno(this.ultimaNominacionId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (resp: any) => {
                this.lotes = resp.lotes;
                this.datosNominacion = resp.nominacion;

                // Verificar si el estado de la nominación no es 'Cerrado'
                if (this.datosNominacion && this.datosNominacion.length > 0 && this.datosNominacion[0].estadoNominacion !== 'Cerrado') {
                    this.modal.open(this.asignarLote);
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
    } else {
        this.lotes = [];
        this.datosNominacion = [];
    }
}
  cleanAL(){
    this.ultimaNominacion = '';
    this.lotes = [];
  }
  cleanN(){
    this.formNomicacion.reset();
  }

  
  //Etidat detalle de lotes
  editLote(modal: any, idLote: any, cliente: any, orden: any, barco: any, armador: any, producto: any, tonelaje: any, destino: any, laycan: any, idNominacion: any){
    this.formLoteEdit.patchValue({
      clienteEdit: cliente,  
      ordenEdit: orden, 
      barcoEdit: barco, 
      armadorEdit: armador,      
      productoEdit: producto, 
      tonelajeEdit: tonelaje, 
      destinoEdit: destino, 
      laycanEdit: laycan
    });
    this.idLote = idLote;
    this.idNominacion = idNominacion;
    this.modal.open(modal, { size: "lm", centered: true })
  }

  editLoteAsignar(){
    const cliente = this.formLoteEdit.get('clienteEdit')?.value;
    const orden = this.formLoteEdit.get('ordenEdit')?.value;
    const barco = this.formLoteEdit.get('barcoEdit')?.value;
    const armador = this.formLoteEdit.get('armadorEdit')?.value;
    const producto = this.formLoteEdit.get('productoEdit')?.value;
    const tonelaje = this.formLoteEdit.get('tonelajeEdit')?.value;
    const destino = this.formLoteEdit.get('destinoEdit')?.value;
    const laycan = this.formLoteEdit.get('laycanEdit')?.value;
    this.nominacion.editLote(cliente, orden, barco, armador, producto, tonelaje, destino, laycan, this.idLote, this.idUsuario, this.idNominacion).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.lotes= resp
      this.formLoteEdit.reset();
      this.modal.dismissAll();
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al editar el lote.',        
      })
    }});
  }
  
  editNominacion(modal: any, idNominacion: any, numeroNominacion: any, dechaAsignacion: Date){
    this.formNomicacionEdit.patchValue({
      nominacionEdit: numeroNominacion,
      fechaAsignacionEdit: dechaAsignacion,        
    });
    this.idNominacion = idNominacion
    this.modal.open(modal, { size: "lm", centered: true })
  }

  editarnominacion(){
    const nominacionEdit = this.formNomicacionEdit.get('nominacionEdit')?.value;
    const fechaAsignacionEdit = this.formNomicacionEdit.get('fechaAsignacionEdit')?.value;
    this.nominacion.editNominacion(nominacionEdit, fechaAsignacionEdit, this.idNominacion, this.idUsuario).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.datosNominacion = resp;
      this.formNomicacionEdit.reset();
      this.modal.dismissAll();
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al editar la nominación',        
      })
    }});
  }


  eliminarAdjuntos(modal: any, idLote:number){
    this.idLote= idLote;
    this.modal.open(modal, { size: "sm", centered: true })
  }
  closeModalRemoveAdjuntos(){
    this.idLote = '';
    this.modal.dismissAll();
  }
  removeAdjuntos(){
    this.nominacion.removeAdjuntosNominacion(this.idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.lotesVer = resp;
      this.deleteSolicitudVistaClienteNomi(this.idLote);
      this.idLote = '';
      this.modal.dismissAll();
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al eliminar los archivos.',        
      })
    }});
  }
  

  adjuntar(modal: any, idNominacion: number, idLote: number){
    this.idLote= idLote;
    this.idNominacion = idNominacion;
    this.nominacion.dejarAdjuntarInformeFinal(idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      if(resp){    
      this.modal.open(modal, { size: "lm", centered: true })
    } else {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: ' Debe adjuntar informes de Muestra de Pila y Costado de Nave para poder adjuntar informe final.',        
      })
    } 
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener información del los procesos de muestra de pila y costado de nave.',        
      })
    }});
    
  }

  adjuntarPDF(){
    const formData = new FormData();
    if (this.archivoSeleccionado) {
      formData.append('informefinal', this.archivoSeleccionado);
    }
    formData.append('idLote', this.idLote);
    formData.append('idUsuario', this.idUsuario);
    this.nominacion.addAdjuntosNominacion(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
        this.lotesVer = resp;
        //Este desabilita el boton eliminar cuando se agrega el informe final, ya que debe autorizar su edicion.
        this.estadosPorFilaAdjuntos[resp.idLote] = '';
        Swal.fire({
          icon: 'success', 
          title: 'Éxito',
          text: 'Los archivos se han agregado con éxito.', 
        });
        this.solicitarVistaCliente(this.idLote, this.idNominacion);
        this.frmAdjuntarPDF.reset();
        this.archivoSeleccionado = null;
        this.archivoSeleccionadoFlag = false;
        this.idLote = '';
        this.modal.dismissAll();
      }, 
      error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al ingresar los archivos adjuntos.',        
        })
      }
    });
  }
  
  closemodalAdjuntar(){
    this.frmAdjuntarPDF.reset();
    this.archivoSeleccionado = null;
    this.archivoSeleccionadoFlag = false;
    this.modal.dismissAll();
  }

  close(){
    this.formLote.reset();
    this.modal.dismissAll();
  }

  onInformeSelected(event: any, campo: string): void {
    const file = event.target.files[0];
    if (file) {
        if (campo === 'informefinal') {
            // Verifica si el archivo es un PDF
            if (file.type.match('application/pdf')) {
                // El archivo es un PDF
                this.archivoSeleccionado = file;
                this.archivoSeleccionadoFlag = true;
                this.frmAdjuntarPDF.get(campo)!.setValue(file);
            } else {
                // El archivo no es un PDF, muestra una advertencia
                Swal.fire({
                    icon: 'warning',
                    title: 'Formato de archivo no es válido',
                    text: 'Por favor, selecciona un archivo PDF.',
                });
                // Limpia el input file y el valor en el formulario
                event.target.value = '';
                this.frmAdjuntarPDF.get(campo)!.setValue(null);
                return; // Salir de la función para evitar actualizar la validez
            }
        } else {
            // Lógica para otros campos (mantenida igual)
            this.archivoSeleccionado = file;
            this.archivoSeleccionadoFlag = true;
        }
        this.frmAdjuntarPDF.get(campo)!.updateValueAndValidity();
    }
}


  eliminarArchivo(campo: string): void {
      if (campo === 'informefinal') {
        this.archivoSeleccionado = null;
        this.archivoSeleccionadoFlag = false;
      }
      this.frmAdjuntarPDF.get(campo)!.setValue(null);
      this.frmAdjuntarPDF.get(campo)!.updateValueAndValidity();
      this.restablecerInputFile(campo);
  }
  
  restablecerInputFile(campo: string): void {
    let inputId = '';
    if (campo === 'informefinal') {
      inputId = 'formFileInforme1';
    }
    const inputFile = document.getElementById(inputId) as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';  
    }
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
    this.idPila = idPila;
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

  limpiarFechas() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.nominacionesCerradas= [];
    this.nominacion.getNominacionesCerradas().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.nominacionesCerradas =resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al traer las nominaciones cerradas.',        
      })
    }});
  }

  buscarPorFechas() {
    if (this.fechaInicio && this.fechaFin) {
      this.nominacion.getNominacionesCerradasByDate(this.fechaInicio,this.fechaFin).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        this.nominacionesCerradas = resp;
      }, error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al obtener las nominaciones por fecha.',        
        })
      }});
    }
  }

  solicitarEdicion(idNominacion: any, idLote: any, idAdjunto: any){
    const solicitud = {
      tipoAccion: "Editar y/o Eliminar",
      tabla: "nominacion, pila, adjuntonominacion",
      estado: "Pendiente",
      idTablaUno: idNominacion,
      idTablaDos: idLote,
      idTablaTres: idAdjunto,
      idUsuario: this.idUsuario,
      tipoProceso: 'Proceso1'
    };

    this.administracion.pedirAutorizacion(solicitud).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
        // Actualiza el estado de la fila específica
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
        if (solicitud.tipoProceso === 'Proceso1') {
          this.estadosPorFilaNominacion[solicitud.idTablaUno] = solicitud.estado;
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

  solicitarVistaCliente(idLote: any, idNominacion: any){
    this.nominacion.addSolicitudVistaClienteNomi(idNominacion, idLote, this.idUsuario).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
    }, error: (error: any) => {
    }});
  }

  deleteSolicitudVistaClienteNomi(idLote: any){
    this.nominacion.deleteSolicitudVistaClienteNomi(idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
    }, error: (error: any) => {
    }});
  }

}


 