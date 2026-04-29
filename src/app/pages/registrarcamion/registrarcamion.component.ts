import { Component, ViewChild } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import Swal from 'sweetalert2';
import { RegistrocamionService } from 'src/app/services/registrocamion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NominacionService } from 'src/app/services/nominacion.service';
import { ChangeDetectorRef } from '@angular/core';
import { DataTableDirective} from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';


@Component({
    selector: 'app-registrarcamion',
    templateUrl: './registrarcamion.component.html',
    styleUrls: ['./registrarcamion.component.css'],
    standalone: false
})
export class RegistrarcamionComponent {
  @ViewChild (DataTableDirective, {static : false}) dtElement!: DataTableDirective;
  @ViewChild('modalNumCamiones') modalNumCamiones!: TemplateRef<any>;
  dtOptionsLotesPila: DataTables.Settings = {}; 
  dtOptionsLotescamion: DataTables.Settings = {};
  dtOptionsListarcamiones: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  frmRegistrarCamion!: FormGroup;
  frmRegistrarCamionEdit!: FormGroup;
  idUsuario:any;
  nombre:any;
  apellido: any;
  cargo: any;
  activeButton!: string;
  activeDiv: string = 'registrarcamion';
  destroy$: Subject<void> = new Subject<void>();
  isSettingValue: boolean = false;
  nominacionesDB: any[] = [];
  nominacionCamion: any;
  idNominacionSeleccionado:any;
  lotesCamion: any[] = [];
  lote: any;
  idLote: any;
  idLotListar: any;
  lotesCamionListar: any;
  nominacionCamionListar: any;
  camiones: any[] = [];
  numeroCamiones: any;
  registrados: any;
  faltantes: any;
  toneladas: any;
  tonregistrados: any;
  tonfaltantes: any;
  loteSeleccionado: boolean = false;
  idRegistro: any;
  estadoVistacliente: { [idLote: number]: string } = {};

   constructor(private fnBuilder: FormBuilder, private registrocamion: RegistrocamionService, private nominacion: NominacionService, 
    private cdr: ChangeDetectorRef, private modal: NgbModal){
    this.idUsuario = localStorage.getItem('ID Usuario');
    this.nombre = localStorage.getItem('nombre');
    this.apellido = localStorage.getItem('apellido');
    this.cargo = localStorage.getItem('cargo');
    this.recuperarEstadosVistaCliente();
  
   }
   ngOnInit(){
    //Activa boton por defecto
    this.activeButton = 'Registrar camión';
     //Formulario registro camion
     this.frmRegistrarCamion = this.fnBuilder.group({
      fecha: ['', Validators.required],
      hora: ['',[Validators.required, this.horaFormatoValido]],
      placa: ['', Validators.required],
      bruto: ['', Validators.required],
      tara: ['', Validators.required],
      neto: ['',Validators.required],
      tiket: ['',Validators.required],
    });

    this.frmRegistrarCamionEdit = this.fnBuilder.group({
      fechaEdit: ['', Validators.required],
      horaEdit: ['',[Validators.required, this.horaFormatoValido]],
      placaEdit: ['', Validators.required],
      brutoEdit: ['', Validators.required],
      taraEdit: ['', Validators.required],
      netoEdit: ['',Validators.required],
      tiketEdit: ['',Validators.required],
    });
    //Formato mayuscula para la placa
    this.frmRegistrarCamion.get('placa')?.valueChanges.subscribe((value: string | null) => {
      if (value !== null && value !== undefined) {
          this.frmRegistrarCamion.patchValue({ placa: value.toUpperCase() }, { emitEvent: false });
      }
    });
    this.frmRegistrarCamion.get('tiket')?.valueChanges.subscribe((value: string | null) => {
      if (value !== null && value !== undefined) {
          this.frmRegistrarCamion.patchValue({ tiket: value.toUpperCase() }, { emitEvent: false });
      }
    });

    //Obtiene todas las nominaciones
    this.nominacion.getNominaciones().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.nominacionesDB = resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener las nominaciones.',        
      })
    }});
   
    //Inicializa el dataoption regustrar camion
    if (this.lotesCamion && this.lotesCamion.length > 0) {
      this.dtOptionsLotesPila = {
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
      this.lotesCamion = [];
      this.dtOptionsLotesPila = {
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
    //inicializa el dataoption listar camiones por idLote
    if (this.lotesCamionListar && this.lotesCamionListar.length > 0) {
      this.dtOptionsLotescamion = {
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
      this.lotesCamionListar = [];
      this.dtOptionsLotescamion = {
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
    this.recuperarEstadosVistaCliente();
  }
  //METODO QUE HACE VISIBLE QUE EL BOTON ACTIVADO
  isButtonActive(button: string, div: string): boolean {
    return this.activeButton === button && this.activeDiv === div;
    this.loteSeleccionado = false;
  } 

  registrarCamion(){
      const fecha = this.frmRegistrarCamion.get('fecha')?.value;
      const hora = this.frmRegistrarCamion.get('hora')?.value;
      const placa = this.frmRegistrarCamion.get('placa')?.value;
      const bruto = this.frmRegistrarCamion.get('bruto')?.value;
      const tara = this.frmRegistrarCamion.get('tara')?.value;
      const neto = this.frmRegistrarCamion.get('neto')?.value;
      const tiket = this.frmRegistrarCamion.get('tiket')?.value;
  
      const formData = new FormData();
      formData.append('idLote', this.idLote);
      formData.append('fecha', fecha);
      formData.append('hora', hora);
      formData.append('placa', placa);
      formData.append('bruto', bruto);
      formData.append('tara', tara);
      formData.append('neto', neto);
      formData.append('tiket',tiket);
      formData.append('idUsuario',this.idUsuario);  
      this.registrocamion.addRegistroCamion(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          if (resp.success) {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Registro de camión ingresado con éxito',
            });
            
            this.frmRegistrarCamion.patchValue({
              hora: '',
              placa: '',
              bruto:'',
              tara: '',
              neto: '',
              tiket: '',
            });
          } else {
            Swal.fire({
              icon : 'error',
              title: 'Error',
              text: 'Error al ingresar el registro de camión',
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
        }
      });
  
    }

     horaFormatoValido(control: AbstractControl): { [key: string]: boolean } | null {
       const regex = /^(0?[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[1-5][0-9])$/;
      
      if (control.value && !regex.test(control.value)) {
         return { 'formatoHoraInvalido': true };
       }
    
       return null;
     }


    onInput() {
      const nominacionSeleccionada = this.nominacionesDB.find(n => n.numeroNominacion === this.nominacionCamion);
      if (nominacionSeleccionada) {
        this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
        this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
          next: (resp: any) => {
            this.lotesCamion = resp;
            this.loteSeleccionado = true;
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

    cleanRegistroCamion(){
      this.nominacionCamion='';
      this.lotesCamion = [];
      this.idLote='';
      this.frmRegistrarCamion.reset();
    }


    selecionarLote(idLote: any, lote: any) {
      this.idLote = idLote;
      this.lote = lote;
      this.registrocamion.getListarCamionesByIdLote(this.idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
       
      },
      error: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener los camiones.',        
        });
      }
    });
    }
    
    selecionarLoteListar(idLote: any) {
      this.idLotListar = idLote;
      this.registrocamion.getListarCamionesByIdLote(this.idLotListar).pipe(takeUntil(this.destroy$)).subscribe({
          next: (resp: any) => {
              this.camiones = resp;
              this.loteSeleccionado = true;
  
              if (resp && Array.isArray(resp) && resp.length > 0) {
                  this.lote = resp[0].orden;
                  this.numeroCamiones = resp.length;
                  this.registrados = resp.length;
                  this.faltantes = this.numeroCamiones - this.registrados;
                  this.toneladas = resp[0].tonelaje;
                  this.tonregistrados = resp.reduce((suma, itemActual) => {
                      return suma + Number(itemActual.neto || 0);
                  }, 0);
              } else {
                  this.lote = '';
                  this.numeroCamiones = 0;
                  this.registrados = 0;
                  this.faltantes = 0;
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
  }
 //Exporta en excel los camiones
  exportToExcel(camiones: any[], fileName: string): void {
    const processedData = camiones.map((camion, index) => ({
      "N°": index + 1,
      "FECHA": camion.fecha,
      "HORA": camion.hora,
      "PLACA": camion.placa,
      "PESO BRUTO": camion.bruto,
      "PESO TARA": camion.tara,
      "PESO NETO": camion.neto,
      "ACUMULADO": this.calculaAcumulado(index), 
      "TIKET": camion.tiket
    }));
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(processedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Camiones');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

    cleanCamionListar(){
      this.nominacionCamionListar='';
      this.lotesCamionListar= [];
      this.camiones= [];
      this.loteSeleccionado = false;
    }
    onInputListar(){
      const nominacionSeleccionada = this.nominacionesDB.find(n => n.numeroNominacion === this.nominacionCamionListar);
      if (nominacionSeleccionada) {
        this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
        this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
          next: (resp: any) => {
            this.lotesCamionListar = resp;
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


  editarCamiones(modal: any, idRegistro:any){
    this.idRegistro= idRegistro;
    this.registrocamion.getCamionByIdRegistro(idRegistro).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.frmRegistrarCamionEdit.patchValue({
        fechaEdit: resp.fecha,
        horaEdit: resp.hora,
        placaEdit: resp.placa,
        brutoEdit: resp.bruto,
        taraEdit: resp.tara,
        netoEdit: resp.neto, 
        tiketEdit: resp.tiket,            
      });

    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al traer el registro del camión',        
      })
    }});

    this.modal.open(modal, { size: "sm", centered: true });
  }

  closeModalCamiones(){
    this.modal.dismissAll();
  }

  editCamiones() {
    const fecha = this.frmRegistrarCamionEdit.get('fechaEdit')?.value;
    const hora = this.frmRegistrarCamionEdit.get('horaEdit')?.value;
    const placa = this.frmRegistrarCamionEdit.get('placaEdit')?.value;
    const bruto = this.frmRegistrarCamionEdit.get('brutoEdit')?.value;
    const tara = this.frmRegistrarCamionEdit.get('taraEdit')?.value;
    const neto = this.frmRegistrarCamionEdit.get('netoEdit')?.value;
    const tiket = this.frmRegistrarCamionEdit.get('tiketEdit')?.value;
    const formData = new FormData();
    formData.append('fecha', fecha);
    formData.append('hora', hora);
    formData.append('placa', placa);
    formData.append('bruto', bruto);
    formData.append('tara', tara);
    formData.append('neto', neto);
    formData.append('tiket', tiket);
    formData.append('idUsuario', this.idUsuario);
    formData.append('idRegistro', this.idRegistro);
    formData.append('idLote', this.idLotListar);

    this.registrocamion.editCamionByIdRegistro(formData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          const index = this.camiones.findIndex(camion => camion.idRegistro === this.idRegistro);
          if (index !== -1) {
              const updatedCamion = resp.data[0];
              this.camiones[index].fecha = updatedCamion.fecha;
              this.camiones[index].hora = updatedCamion.hora;
              this.camiones[index].placa = updatedCamion.placa;
              this.camiones[index].bruto = updatedCamion.bruto;
              this.camiones[index].tara = updatedCamion.tara;
              this.camiones[index].neto = updatedCamion.neto;
              this.camiones[index].tiket = updatedCamion.tiket;
              this.camiones[index].acumulado = this.calculaAcumulado(index);
          }
        this.tonfaltantes = this.toneladas - this.tonregistrados;
        this.selecionarLoteListar(this.idLotListar);
            this.idRegistro = '';
            this.modal.dismissAll();
        },
        error: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al editar el camión.',
            });
        }
    });
  }

  calculaAcumulado(index: number) {
    let totalAcumulado = 0;
    for (let i = 0; i <= index; i++) {
        totalAcumulado += Number(this.camiones[i].neto);
    }
    return totalAcumulado;
  }

  eliminarCamiones(modal: any, idRegistro:any){
    this.idRegistro= idRegistro;
    this.modal.open(modal, { size: "sm", centered: true });
  }

  closeModalDElete(){
    this.idRegistro= '';
    this.modal.dismissAll();
  }   
  deleteCamion() {
    this.registrocamion.eliminarCamion(this.idRegistro).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Registro de camión eliminado con éxito',
            });
            const index = this.camiones.findIndex(camion => camion.idRegistro === this.idRegistro);
            if (index !== -1) {
                this.camiones.splice(index, 1);
            }
            const indexD = this.camiones.findIndex(camion => camion.idRegistro === this.idRegistro);
                 if (indexD !== -1) {
                    this.camiones[indexD] = resp.data[0];
                     this.camiones.forEach((camion, idx) => {
                       camion.acumulado = this.calculaAcumulado(idx);
                     });
            }
            this.selecionarLoteListar(this.idLotListar);
            this.idRegistro = '';
            this.modal.dismissAll();
        }, 
        error: (error: any) => {
            Swal.fire({
                icon : 'error',
                title: 'Error',
                text: 'Error al eliminar el registro del camión',        
            });
        }
    });
  }

  solicitarVistaCliente(){
    this.registrocamion.addSolicitudVistaClienteCamion(this.idNominacionSeleccionado, this.idLotListar, this.idUsuario).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.estadoVistacliente[this.idLotListar] = 'Pendiente'; 
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar la solicitud.',        
      })
    }});
  }

  recuperarEstadosVistaCliente(){
    this.registrocamion.getAutorizacionVistaClienteCamion().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      resp.forEach((solicitud: any) => {
        if (solicitud.proceso === 'Registro de camión') {
          this.estadoVistacliente[solicitud.idLote] = solicitud.estado;
        }
        this.cdr.detectChanges();
      });
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener la solicitudes de vista cliente.',        
      })
    }});
  }





}
  