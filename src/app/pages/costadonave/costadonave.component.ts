import { AfterViewInit, Component, Input, ViewChild, OnInit, OnDestroy, SimpleChanges} from '@angular/core';
import { DataTableDirective} from 'angular-datatables';
import { Subject } from 'rxjs';
import { takeUntil, tap, switchMap } from 'rxjs/operators';
import { NominacionService } from '../../services/nominacion.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import { CostadonaveService } from 'src/app/services/costadonave.service';
import { AdmninistracionService } from 'src/app/services/admninistracion.service';
import * as XLSX from 'xlsx';

interface Archivo {
  name: string;
}

@Component({
  selector: 'app-costadonave',
  templateUrl: './costadonave.component.html',
  styleUrls: ['./costadonave.component.css']
})
export class CostadonaveComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild (DataTableDirective, {static : false}) dtElement!: DataTableDirective;
  @Input() datosGrafico: any[] = [];
  dtOptionsLotesNave: DataTables.Settings = {}; 
  dtOptionsAdjuntarPDF: DataTables.Settings = {};
  dtOptionsLotesNaveResultado: DataTables.Settings = {}; 
  dtOptionsLotesNaveListar: DataTables.Settings = {}; 
  dtOptionsLotesNaveListarResultados: DataTables.Settings = {}; 
  dtOptionsLotesNaveResultadosListados: DataTables.Settings = {}; 
  dtOptionsLotesNaveListarIndicadores: DataTables.Settings = {}; 
  dtOptionsLotesNaveResultadosListadosIndicadores: DataTables.Settings = {}; 
  frmResultMuestraNave!: FormGroup;
  frmEditResCostadoNave!: FormGroup;
  frmAdjuntarPDF!: FormGroup;
  destroy$: Subject<void> = new Subject<void>();
  dtTrigger: Subject<any> = new Subject<any>();
  idUsuario:any;
  nombre:any;
  apellido: any;
  cargo: any;
  activeButton!: string;
  activeDiv: string = 'muestracostadonave';
  nominacionesBDNave: any[] = [];
  nominacionNave!: any;
  lotesNave: any[] = [];
  lotesNaveResultado: any[] = [];
  idNominacionSeleccionado:any;
  idLote:any;
  idCostadonave:any;
  orden:any;
  nominacionesBDNaveListar: any[] = [];
  nominacionNaveListar!: any;
  lotesNaveListar: any[] = [];
  lotesNaveListarResultados: any[] = [];
  lotesNaveListarIndicadores: any[] = [];
  nominacionNaveListarIndicadores!: any;
  lotesNaveListarResultadosIndicadores: any[] = [];
  listarAdjuntosNave: any[] = [];
  totalWMT: number = 0;
  totalPorcentajeHumedad: number = 0;
  totalMTHumedad: number = 0;
  totalDMT: number = 0;
  selloRemplazo: string = '1';
  selloRemplazoEdit: string = '1';
  loteSeleccionado: boolean = false;
  //Pdf
  archivoSeleccionado: File | null = null;
  archivoSeleccionadoTres: File | null = null;
  archivoSeleccionadoFlag: boolean = false;
  archivoSeleccionadoTresFlag: boolean = false;
  pdfPath:any;
  informeResultadosPath!: string;
  informeSellosPath!: string;
  //datos para adjuntar archivos.
  archivo: Archivo[] = [];
  archivosCargados: number = 0;
  archivosAdjuntos: { name: string }[] = [];
  existenAdjuntos!: boolean ;
  //Autorizacion 
  estadosPorFilaAdjuntos: { [idLote: number]: string } = {};
  estadoVistacliente: { [idLote: number]: string } = {};

  constructor(private nominacion: NominacionService, private cdr: ChangeDetectorRef,
    private modal: NgbModal, private fnBuilder: FormBuilder, private costadonave: CostadonaveService, private administracion: AdmninistracionService){
      this.recuperarEstadoSolicitudes();
      //Valida formulario +resultado nave 
      this.frmResultMuestraNave = this.fnBuilder.group({
        fechaMuestreo: ['', Validators.required],
        sello: ['', Validators.pattern],
        selloRemplazo: ['1', Validators.pattern],
        selloreemplazo: ['0', Validators.pattern],
        wmt: ['', [Validators.pattern(/^\d+(\.\d{0,3})?$/)]],
        moisture: ['', Validators.required],
        mt: ['', [Validators.pattern(/^\d+(\.\d{0,3})?$/)]],
        dmt: ['', [Validators.pattern(/^\d+(\.\d{0,3})?$/)]],
      });
      
      this.frmEditResCostadoNave = this.fnBuilder.group({
        fechaMuestreoEdit: ['', Validators.required],
        selloEdit: ['', Validators.pattern],
        selloreemplazoEdit: ['', Validators.pattern],
        wmtEdit: ['', [Validators.pattern(/^\d+(\.\d{0,3})?$/)]],
        moistureEdit: ['', Validators.required],
        mtEdit: ['', [Validators.pattern(/^\d+(\.\d{0,3})?$/)]],
        dmtEdit: ['', [Validators.pattern(/^\d+(\.\d{0,3})?$/)]]
      });

      this.frmAdjuntarPDF = this.fnBuilder.group({
        informeResultados: ['', Validators.required],
        informeSellos: ['', Validators.required],
      });
      
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
    this.activeButton = 'Ingresar resultado costado nave';
    //Obtiene todas las nominaciones
    this.nominacion.getNominaciones().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.nominacionesBDNave= resp;
      this.nominacionesBDNaveListar= resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener las nominaciones.',        
      })
    }});

    if (this.lotesNave && this.lotesNave.length > 0) {
      this.dtOptionsLotesNave = {
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
      this.lotesNave = [];
      this.dtOptionsLotesNave = {
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

    if (this.lotesNaveListar && this.lotesNaveListar.length > 0) {
      this.dtOptionsLotesNaveListar = {
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
      this.lotesNaveListar = [];
      this.dtOptionsLotesNaveListar = {
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

    if (this.lotesNaveListarIndicadores && this.lotesNaveListarIndicadores.length > 0) {
      this.dtOptionsLotesNaveListarIndicadores = {
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
      this.lotesNaveListarIndicadores = [];
      this.dtOptionsLotesNaveListarIndicadores = {
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
    
    if (this.lotesNaveResultado && this.lotesNaveResultado.length > 0) {
      this.dtOptionsLotesNaveResultado = {
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
      this.lotesNaveResultado = [];
      this.dtOptionsLotesNaveResultado = {
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

    if (this.lotesNaveListarResultados && this.lotesNaveListarResultados.length > 0) {
      this.dtOptionsLotesNaveResultadosListados = {
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
      this.lotesNaveListarResultados = [];
      this.dtOptionsLotesNaveResultadosListados = {
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

    if (this.lotesNaveListarResultados && this.lotesNaveListarResultados.length > 0) {
      this.dtOptionsAdjuntarPDF = {
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
      this.lotesNaveListarResultados = [];
      this.dtOptionsAdjuntarPDF = {
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
    if (this.activeDiv === 'listarresultados') {
      this.recuperarEstadoSolicitudes();
    }
  }
  
  //METODO QUE HACE VISIBLE QUE EL BOTON ACTIVADO
  isButtonActive(button: string, div: string): boolean {
    return this.activeButton === button && this.activeDiv === div;
    this.loteSeleccionado = false;
  }

  cleanNave(){
   this.nominacionNave= '';
   this.lotesNave =[];
   this.idLote= '';
   this.lotesNaveResultado=[];
  }
  cleanNaveListar(){
    this.nominacionNaveListar= '';
   this.lotesNaveListar =[];
   this.idLote= '';
   this.lotesNaveListarResultados=[];
   this.loteSeleccionado = false;
   this.frmResultMuestraNave.reset();
   this.frmEditResCostadoNave.reset();
  }

  cleanNaveListarIndicadores(){
   this.nominacionNaveListarIndicadores= '';
   this.lotesNaveListarIndicadores =[];
   this.idLote= '';
   this.lotesNaveListarResultadosIndicadores=[];
   this.loteSeleccionado = false;
  }

  //TRAE LAS PILAR PARAINGRESO DE RESULTADO
  onInput() {
    const nominacionSeleccionada = this.nominacionesBDNave.find(n => n.numeroNominacion === this.nominacionNave);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotesNave = resp;
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

  onInputListar() {
    const nominacionSeleccionada = this.nominacionesBDNaveListar.find(n => n.numeroNominacion === this.nominacionNaveListar);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotesNaveListar = resp;
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

  onInputListarIndicadores() {
    const nominacionSeleccionada = this.nominacionesBDNaveListar.find(n => n.numeroNominacion === this.nominacionNaveListarIndicadores);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotesNaveListarIndicadores = resp;
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

  openResultadoNave(modal: any, idLote: any, orden: any) {
    this.orden = orden;
    this.idLote = idLote;
    this.lotesNaveResultado = [];
    this.costadonave.getResultadoNave(this.idLote).pipe(takeUntil(this.destroy$),tap((resp: any) => {
            this.lotesNaveResultado = resp;
        }),
        switchMap(() => this.costadonave.getAdjuntosNave(idLote)),
        takeUntil(this.destroy$)
    ).subscribe({
        next: (adjuntos: any) => {
            this.existenAdjuntos = adjuntos && adjuntos.length > 0;
            // Abrir el modal solo si no hay adjuntos
            if (!this.existenAdjuntos) {
                this.modal.open(modal, { size: "lm", centered: true });
            }
            this.cdr.detectChanges();
        },
        error: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener los resultados o verificar los archivos adjuntos.',        
            });
        }
    });
  }

  eliminarResultadoNave(modal: any,idCostadonave:any){
    this.idCostadonave = idCostadonave;
    this.modal.open(modal, { size: "sm", centered: true })
  }
  closeModalRemoveResultadosNave(){
    this.idCostadonave = '';
    this.modal.dismissAll();
  }
  removeResultadosNave(){
    this.costadonave.eliminarResultNave( this.idCostadonave).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      Swal.fire({ 
        icon: 'success',
        title: 'Éxito',
        text: 'Resultado eliminado con éxito',
      });
      this.modal.dismissAll();
      this.lotesNaveResultado = resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al eliminar el resultado',        
      })
    }});
  }

  editarResultadoNave(modal: any,idCostadonave:any){
    this.idCostadonave = idCostadonave;
    this.costadonave.getResultadoNaveById(this.idCostadonave).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      if (resp && resp.length > 0) {
        const resultado = resp[0];
        // Patch los valores al formulario
        this.frmEditResCostadoNave.patchValue({
          fechaMuestreoEdit: resultado.fechaMuestreo,
          selloEdit: resultado.sello,
          selloreemplazoEdit: resultado.selloreemplazo,
          wmtEdit: resultado.wmt,
          moistureEdit: resultado.moisture,
          mtEdit: resultado.mt,
          dmtEdit: resultado.dmt,
        });
      }
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al editar resultado.',        
      })
    }});
    this.modal.open(modal, { size: "lm", centered: true })
  }
  
  editResCostadoNave(){
    const lote = this.idLote;
    const idCostadonave =this.idCostadonave;
    const fechaMuestreoEdit = this.frmEditResCostadoNave.get('fechaMuestreoEdit')?.value;
    const wmtEdit = this.frmEditResCostadoNave.get('wmtEdit')?.value;
    const moistureEdit = this.frmEditResCostadoNave.get('moistureEdit')?.value;
    const mtEdit = this.frmEditResCostadoNave.get('mtEdit')?.value;
    const dmtEdit = this.frmEditResCostadoNave.get('dmtEdit')?.value;
    const selloEdit = this.frmEditResCostadoNave.get('selloEdit')?.value;
    const selloreemplazoEdit = this.frmEditResCostadoNave.get('selloreemplazoEdit')?.value;
   
    this.costadonave.editResCostadoNave(lote, idCostadonave, fechaMuestreoEdit, selloEdit, selloreemplazoEdit, wmtEdit, moistureEdit, mtEdit, dmtEdit, this.idUsuario).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      Swal.fire({ 
        icon: 'success',
        title: 'Éxito',
        text: 'Resultado editado con éxito',
      });
      this.modal.dismissAll();
      this.lotesNaveResultado = resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al editar el resultado',        
      })
    }});

  }

  closeModalResulCostadoNave(){
    this.frmResultMuestraNave.reset();
    this.modal.dismissAll();
  }


  closeModalEditCostadoNave(){
    this.frmEditResCostadoNave.reset();
    this.modal.dismissAll();
  }

  listarResultadoNave(idLote:any,orden:any){
    this.idLote = idLote;
    this.orden = orden;
    this.costadonave.getResultadoNave(this.idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{  
      this.lotesNaveListarResultados = resp;
      this.verificarAdjuntosNave(idLote, orden);
      this.loteSeleccionado = true;
      this.recuperarEstadosVistaCliente(this.idLote);
      this.cdr.detectChanges();
      // Calcular las sumas que se agregan al footer
      this.sumarFooter();
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener los resultados.',        
      })
    }});
  }

  exportToExcel(lotesNaveListarResultados: any[], fileName: string): void {
    // Mapea tus datos para que coincidan con los encabezados de Excel
    const processedData = lotesNaveListarResultados.map((lote, index) => ({
      "N°": index + 1,
      "SELLO": lote.sello,
      "SELLO REEMP.": lote.selloreemplazo,
      "WMT": lote.wmt,
      "% HUMEDAD": lote.moisture,
      "MT HUMEDAD": lote.mt,
      "DMT": lote.dmt
    }));
  
    // Crear hoja de cálculo y libro de trabajo
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(processedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
  
    // Agregar pie de página con totales, si es necesario
    XLSX.utils.sheet_add_aoa(ws, [
      ["Total", '', '', this.totalWMT, this.totalPorcentajeHumedad, this.totalMTHumedad, this.totalDMT, '', ''],
    ], {origin: -1}); // -1 indica que añade al final de la hoja
  
    // Guardar el archivo Excel
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  verificarAdjuntosNave(idLote: any, lote:any) {
    this.orden =lote;
    this.costadonave.getAdjuntosNave(idLote).pipe(takeUntil(this.destroy$)).subscribe({
        next: (adjuntos: any) => {
            this.existenAdjuntos = adjuntos && adjuntos.length > 0;
            this.cdr.detectChanges();
        },
        error: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al verificar los archivos adjuntos.',        
            });
        }
    });
  }

  listarResultadoNaveIndicadores(idLote:any, lote:any){
    this.idLote = idLote;
    this.loteSeleccionado = false;
    this.costadonave.getResultadoNave(this.idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{    
      this.lotesNaveListarResultadosIndicadores = resp;
      this.loteSeleccionado = true;
      this.orden = lote
      this.cdr.detectChanges();
      // Calcular las sumas que se agregan al footer
      this.sumarFooterIdicadores();
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener los resultados.',        
      })
    }});
  }

  //Verifica que check esta activado 
  onSelloRemplazoChange(value: string) {
    this.selloRemplazo = value;
    const selloReemplazoControl = this.frmResultMuestraNave.get('selloreemplazo');
  
    if (value === '1') {
      if (selloReemplazoControl) {
        selloReemplazoControl.setValue('0');
      }
    } else {
      if (selloReemplazoControl) {
        selloReemplazoControl.setValue('');
      }
    }
    // Usar setTimeout para forzar la detección de cambios en la próxima vuelta
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  //Verifica que los campos esten correctos y activa el boton del formulario
  allFieldsSelected(): boolean {
    const controls = this.frmResultMuestraNave.controls;
    const selloReemplazoControl = controls['selloreemplazo'];
  
    if (selloReemplazoControl && selloReemplazoControl.value === '2') {
      // Verifica que todos los demás campos estén seleccionados, excluyendo 'selloreemplazo'
      const result = Object.keys(controls)
        .filter(key => key !== 'selloreemplazo')
        .every(key => controls[key].value !== '' && controls[key].value !== null);
      return result;
    }
    // Si la opción es 'No' ('1'), valida el resto de los campos sin excluir 'selloreemplazo'
    const result = Object.values(controls).every(control => control.value !== '' && control.value !== null);    
    return result;
  }

  addResultadoNave(){
    const fechaMuestreo = this.frmResultMuestraNave.get('fechaMuestreo')?.value;
    const lote = this.idLote;
    const wmt = this.frmResultMuestraNave.get('wmt')?.value;
    const moisture = this.frmResultMuestraNave.get('moisture')?.value;
    const mt = this.frmResultMuestraNave.get('mt')?.value;
    const dmt = this.frmResultMuestraNave.get('dmt')?.value;
    const sello = this.frmResultMuestraNave.get('sello')?.value;
    const selloReemplazo = this.frmResultMuestraNave.get('selloRemplazo')?.value;
    let selloremplazoForm: string;
    
    if(selloReemplazo === '2'){
      selloremplazoForm = this.frmResultMuestraNave.get('selloreemplazo')?.value;
    }else {
      selloremplazoForm = '0';
    }
    const formData = new FormData();
    formData.append('fechaMuestreo',fechaMuestreo);
    formData.append('wmt', wmt);
    formData.append('moisture', moisture);
    formData.append('mt', mt);
    formData.append('dmt', dmt);
    formData.append('lote', lote);
    formData.append('sello', sello);
    formData.append('selloremplazoForm', selloremplazoForm);
    formData.append('idUsuario', this.idUsuario);
  
    this.costadonave.addResultadoNave(formData)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (resp: any) => {
        if (resp.success) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Resultado ingresado con éxito',
          });
          this.lotesNaveResultado = resp.data;
          this.cdr.detectChanges();
          //SUMA LOS DATOS Y AGREGA AL FOOTER DEL DATATABLES
          this.sumarFooter();
          //Recetea solo algunos campos del formulario
          this.frmResultMuestraNave.patchValue({
            sello: '',
            selloRemplazo: '1',
            selloreemplazo:'0',
            wmt: '',
            moisture: '',
            mt: '',
            dmt: '',
          });
        } else {
          Swal.fire({
            icon : 'error',
            title: 'Error',
            text: 'Error al ingresar el resultado.',
          });
        }
      },
      error: (error: any) => {
  
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al realizar la solicitud al servidor.',
        })
      }
    });
  }

  isFileInputVisible(): boolean {
    const limiteHumedad = this.frmResultMuestraNave.get('limiteHumedad')?.value;
    const humedad = this.frmResultMuestraNave.get('humedad')?.value;
    return limiteHumedad !== null && humedad !== null && limiteHumedad > humedad;
  }
 
  sumarFooter() {
    const mtSum = parseFloat(this.lotesNaveListarResultados.reduce((acc, l) => acc + Number(l.mt), 0).toFixed(3)); 
    const dmtSum = parseFloat(this.lotesNaveListarResultados.reduce((acc, l) => acc + Number(l.dmt), 0).toFixed(3));
    const wmtSum = parseFloat(this.lotesNaveListarResultados.reduce((acc, l) => acc + Number(l.wmt), 0).toFixed(3));
    const porcentajeHumedad = (mtSum / wmtSum) * 100;

    // Convertir a string y cortar en lugar de redondear
    const porcentajeHumedadStr = porcentajeHumedad.toString();
    const dotIndex = porcentajeHumedadStr.indexOf('.');
    // Asegurarse de no cortar si no hay decimales o si hay menos de 5
    if (dotIndex !== -1 && porcentajeHumedadStr.length > dotIndex + 6) { // +1 por el punto, +5 por los decimales
        this.totalPorcentajeHumedad = parseFloat(porcentajeHumedadStr.substring(0, dotIndex + 6));
    } else {
        this.totalPorcentajeHumedad = porcentajeHumedad;
    }

    this.totalWMT = wmtSum;
    this.totalMTHumedad = mtSum;
    this.totalDMT = dmtSum;
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

  //ADJUNTOS
  eliminarAdjuntos(modal: any, lote: any){
    this.idLote = lote;
    this.modal.open(modal, { size: "sm", centered: true })
  }
  closeModalRemoveAdjuntos(){
    this.modal.dismissAll();
  }

  removeAdjuntos(){
    this.costadonave.removeAdjuntosNave(this.idLote ).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Archivos adjuntos eliminados con éxito.',
    });
    this.recuperarEstadosVistaCliente(this.idLote);
    this.existenAdjuntos = false;
      this.modal.dismissAll();
      this.cdr.detectChanges();
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al eliminar los archivos.',        
      })
    }});
  }


  adjuntar(modal: any, idLote: number){
    this.idLote= idLote;
    this.modal.open(modal, { size: "lm", centered: true })
  }

  adjuntarPDF(){
    const idLote = this.idLote;
    const formData = new FormData();
    if (this.archivoSeleccionado) {
        formData.append('informeResultados', this.archivoSeleccionado);
    }
    if (this.archivoSeleccionadoTres) {
      formData.append('informeSellos', this.archivoSeleccionadoTres);
  }
    formData.append('idLote', idLote);
    formData.append('idUsuario', this.idUsuario);
    
    this.costadonave.addAdjuntosNave(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.recuperarEstadosVistaCliente(idLote);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Los archivos se han agregado con éxito.', 
      });
      this.existenAdjuntos = resp && resp.length > 0;
      this.frmAdjuntarPDF.reset();
      this.archivoSeleccionado = null;
      this.archivoSeleccionadoTres = null;
      this.archivoSeleccionadoFlag = false;
      this.archivoSeleccionadoTresFlag = false;
      this.cdr.detectChanges();
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
    this.archivoSeleccionadoTres = null;
    this.archivoSeleccionadoFlag = false;
    this.archivoSeleccionadoTresFlag = false;
    this.modal.dismissAll();
  }

  onInformeSelected(event: any, campo: string): void {
    const file = event.target.files[0];
    if (file) {
        if (campo === 'informeResultados' || campo === 'informeSellos') {
            if (file.type.match('application/pdf')) {
                if (campo === 'informeResultados') {
                    this.archivoSeleccionado = file;
                    this.archivoSeleccionadoFlag = true;
                } else if (campo === 'informeSellos') {
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
        } else if (campo === 'informefinal') {
            this.archivoSeleccionado = file;
            this.archivoSeleccionadoFlag = true;
            this.frmAdjuntarPDF.get(campo)!.setValue(file);
        }
        this.frmAdjuntarPDF.get(campo)!.updateValueAndValidity();
    }
}

  eliminarArchivo(campo: string): void {
      if (campo === 'informeResultados') {
        this.archivoSeleccionado = null;
        this.archivoSeleccionadoFlag = false;
      }else if (campo === 'informeSellos') {
        this.archivoSeleccionadoTres = null;
        this.archivoSeleccionadoTresFlag = false;
      }
      
      this.frmAdjuntarPDF.get(campo)!.setValue(null);
      this.frmAdjuntarPDF.get(campo)!.updateValueAndValidity();
      this.restablecerInputFile(campo);
  }

  restablecerInputFile(campo: string): void {
    let inputId = '';
    if (campo === 'informeResultados') {
      inputId = 'formFileInforme1';
    } else if (campo === 'informeHechos') {
      inputId = 'formFileInforme3';
    }

    const inputFile = document.getElementById(inputId) as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';  
    }
  }

  openAdjuntos(modal: any, idLote: number) {
    this.costadonave.getAdjuntosNave(this.idLote).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
            if (resp && resp.length === 2) {
                this.informeResultadosPath = resp[0];
                this.informeSellosPath = resp[1];
            }else {
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


  solicitarEdicion(idNominacion: any, idLote: any, idAdjunto: any){
    const solicitud = {
      tipoAccion: "Editar y/o Eliminar",
      tabla: "costadonave, adjuntonave",
      estado: "Pendiente",
      idTablaUno: idNominacion,
      idTablaDos: idLote,
      idTablaTres: idAdjunto,
      idUsuario: this.idUsuario,
      tipoProceso: 'Proceso3'
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
        if (solicitud.tipoProceso === 'Proceso3') {
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
    this.costadonave.addSolicitudVistaClienteNave(this.idNominacionSeleccionado, idLote, this.idUsuario).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
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
    this.costadonave.getAutorizacionVistaClienteNave(idLote)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          let encontrado = false;
          resp.forEach((solicitud: any) => {
            if (solicitud.idLote === idLote) {
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




