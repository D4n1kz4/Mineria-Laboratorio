import {  Component, ViewChild, TemplateRef} from '@angular/core';
import { DataTableDirective} from 'angular-datatables';
import { Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NominacionService } from '../../services/nominacion.service';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ResultadoPilaService } from 'src/app/services/resultado-pila.service';
import { LaboratorioService } from 'src/app/services/laboratorio.service';

interface FilaDeterminacionHumedad {
  numero: number;
  numeroCharola: string;
  numeroCharolaUsuario?: string;
  pesoTara: number;
  pesoHumedo: number;
  pesoBrutoNumerico: number;
  pesoBruto: string;
  pesoSeco1: number;
  pesoSeco2: number;
  pesoSeco3: number;
  condicion: string;
  porcentajeHumedad: number;
  promedioHumedad: number;
  estado: string;
  idInicioResultHumedad: number;
}

@Component({
  selector: 'app-laboratorio',
  templateUrl: './laboratorio.component.html',
  styleUrls: ['./laboratorio.component.css']
})
export class LaboratorioComponent{
  @ViewChild (DataTableDirective, {static : false}) dtElement!: DataTableDirective;
  @ViewChild('modalIncremento') modalTemplateRef!: TemplateRef<any>;
  dtOptionsLoteslotesREG: DataTables.Settings = {}; 
  dtOptionsLoteslotesHumedad: DataTables.Settings = {}; 
  dtOptionsDeterminacionHumedad: DataTables.Settings = {}; 
  dtOptionsDeterminacionHumedadPromedio: DataTables.Settings = {}; 
  dtOptionsFPMTML: DataTables.Settings = {}; 
  destroy$: Subject<void> = new Subject<void>();
  dtTrigger: Subject<any> = new Subject<any>();
  formRegistroLab!: FormGroup;
  formInicioResultIMO!: FormGroup;
  formAnatural!: FormGroup;
  formBPreliminar!: FormGroup;
  formCBeforeUno!: FormGroup;
  formCBeforeDos!: FormGroup;
  formDAboveUno!: FormGroup;
  formDAboveDos!: FormGroup;
  idUsuario:any;
  nombreUsuario:any;
  apellido: any;
  cargo: any;
  correo: any;
  activeButton!: string;
  activeDiv: string = 'registro';
  
  //Registro
  nominacionesLAB: any[]=[];
  nominacionLAB: any;
  lotesREG: any[]=[];
  idNominacionSeleccionado: any;
  registrar: boolean = false;
  loteSelecionado: any;
  idLote: any;
  orden: any;
  registroExiste: boolean = false;

  //Humedad
  nominacionesHumedad: any[]=[];
  nominacionHumedad: any;
  lotesHumedad: any[]=[];
  loteHSelecionado : any;
  detSiempleSelecionada: boolean = false;
  detIncrementoSelecionada: boolean = false;
  valorIncremento!: number | undefined;
  valorIncrementoS!: number | undefined;
  filas: FilaDeterminacionHumedad[] = [];
  filas22: FilaDeterminacionHumedad[] = [];
  filasR: FilaDeterminacionHumedad[] = [];
  filas22R: FilaDeterminacionHumedad[] = [];
  incrementos: any[]=[];
  paresListosParaGuardarFilas22: any[] = [];
  paresListosParaGuardarFilas: any[] = [];
  paresListosParaGuardarFilas22R: any[] = [];
  paresListosParaGuardarFilasR: any[] = []
  getResultadosHumedad: any[]=[];
  procesoI1: { [numero:string] : boolean} = {};
  procesoI2: { [numero:string]: boolean} = {};
  procesoI3: { [numero:string]: boolean} = {};
  procesoI4: { [numero:string]: boolean} = {};
  procesoS1: { [numero:string]: boolean} = {};
  procesoS2: { [numero:string]: boolean} = {};
  procesoS3: { [numero:string]: boolean} = {};
  procesoS4: { [numero:string]: boolean} = {};
  procesoI1R: { [numero:string] : boolean} = {};
  procesoI2R: { [numero:string]: boolean} = {};
  procesoI3R: { [numero:string]: boolean} = {};
  procesoI4R: { [numero:string]: boolean} = {};
  procesoS1R: { [numero:string]: boolean} = {};
  procesoS2R: { [numero:string]: boolean} = {};
  procesoS3R: { [numero:string]: boolean} = {};
  procesoS4R: { [numero:string]: boolean} = {};
  idInicioResultHumedad: any[]=[];
  estadoActual!: string;
  estadoFilas: { [numeroFila: number]: { procesoI1: boolean, procesoI2: boolean, procesoI3: boolean, procesoI4: boolean } } = {};
  valorIncremento22!: number;

  //FMP TML
  nominacionesIMO: any[]=[];
  nominacionIMO: any;
  lotesIMO: any[]=[];
  loteIMOSelecionado : any;
  resultInicioIMO: boolean = false;
  resultAnatural: boolean = false;
  resultBPreliminar: boolean = false;
  resultCBeforeUno: boolean = false;
  resultCBeforeDos: boolean = false;
  resultDAboveUno: boolean = false;
  resulDAboveDos: boolean = false;
  resultFMPTML: boolean = false;
  registrarResultIMO: boolean = false;
  registrarResultAnatural: boolean = false;
  registrarResultBPreliminar: boolean = false;
  registrarResultCBeforeUno: boolean = false;
  registrarResultCBeforeDos: boolean = false;
  registrarResultDAboveUno: boolean = false;
  registrarResultDAboveDos: boolean = false;
  resultadosFMPTML: any;
  promedioPSI!: number;
  muestraDesplazamiento: boolean = false;
  promC1!: number;
  promC2!: number;
  promD1!: number;
  promD2!: number;
  nombreMuestra: string ='';
  fechaMuestra: string ='';
  nombreaAnatural: string ='';
  fechaAnatural: string ='';
  nombrePreliminar: string ='';
  fechaPreliminar: string ='';
  nombreCJustbeforeuno: string ='';
  fechaCJustbeforeuno: string ='';
  nombreCJustbeforedos: string ='';
  fechaCJustbeforedos: string ='';
  nombreDJustaboveuno: string ='';
  fechaDJustaboveuno: string ='';
  nombreDJustabovedos: string ='';
  fechaDJustabovedos: string ='';
  inicioresultimoSuccess: boolean = false;
  anaturalSuccess: boolean = false;
  preliminarSuccess: boolean = false;
  cjustbeforeunoSuccess: boolean = false;
  cjustbeforedosSuccess: boolean = false;
  djustaboveunoSuccess: boolean = false;
  djustabovedosSuccess: boolean = false;
  showDetails: boolean = false;
  detalleHumedad: any[]=[];
  resultadoComparacion: any;
  autorizado = false;
  nombreAutorizador = '';

  constructor(private nominacion: NominacionService, private cdr: ChangeDetectorRef,
    private modal: NgbModal, private fnBuilder: FormBuilder, private resultadopila: ResultadoPilaService,
    private lab: LaboratorioService){}

  ngOnInit(){
    this.idUsuario = localStorage.getItem('ID Usuario');
    this.nombreUsuario = localStorage.getItem('nombre');
    this.apellido = localStorage.getItem('apellido');
    this.cargo = localStorage.getItem('cargo');
    this.correo = localStorage.getItem('correo');
    //Activa el boton para que aparezca seleccionado
    this.activeButton = 'registro de muestra';

    this.nominacion.getNominaciones().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.nominacionesLAB = resp;
      this.nominacionesHumedad = resp;
      this.nominacionesIMO = resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al obtener las nominaciones.',        
      })
    }});
    this.formRegistroLab = this.fnBuilder.group({
      fechaRecepcion: ['', Validators.required],
      orden: ['', Validators.required],
      pesoMuestra: ['', Validators.required],
      numSello: ['', Validators.required],
      inspector: ['', Validators.required]
     
    });

    this.formInicioResultIMO = this.fnBuilder.group({
      calidad: ['', Validators.required],
      muestraUnoTara: ['', Validators.required],
      muestraUnoBruto: ['', Validators.required],
      muestraUnoNeto: [{value: 0, disabled: true}],
      muestraUnoDensidad: [{value: 0, disabled: true}],
      muestraDosTara: ['', Validators.required],
      muestraDosBruto: ['', Validators.required],
      muestraDosNeto: [{value: 0, disabled: true}],
      muestraDosDensidad: [{value: 0, disabled: true}],
      muestraTresTara: ['', Validators.required],
      muestraTresBruto: ['', Validators.required],
      muestraTresNeto: [{value: 0, disabled: true}],
      muestraTresDensidad: [{value: 0, disabled: true}],
      promedio: [{value: 0, disabled: true}],
      psi: [{value: 0, disabled: true}]
     
    });

    this.formInicioResultIMO.get('calidad')?.valueChanges.subscribe((value: string | null) => {
      if (value !== null && value !== undefined) {
          this.formInicioResultIMO.patchValue({ calidad: value.toUpperCase() }, { emitEvent: false });
      }
    });

    this.formAnatural = this.fnBuilder.group({
      desInicialAAN: ['', Validators.required],
      desInicialBAN: ['', Validators.required],
      desInicialCAN: ['', Validators.required],
      desInicialDAN: ['', Validators.required],
      desFinalAAN: ['', Validators.required],
      desFinalBAN: ['', Validators.required],
      desFinalCAN: ['', Validators.required],
      desFinalDAN: ['', Validators.required],
      desplazamientoAAN: [{value: 0, disabled: true}],
      desplazamientoBAN: [{value: 0, disabled: true}],
      desplazamientoCAN: [{value: 0, disabled: true}],
      desplazamientoDAN: [{value: 0, disabled: true}],
      promedioDesplazamientoAN: [{value: 0, disabled: true}],
      charolaUnoAN: ['', Validators.required],
      charolaUnoTaraAN: ['', Validators.required],
      charolaUnoPIAN: ['', Validators.required],
      charolaUnoPSUAN: ['', Validators.required],
      charolaUnoPSDAN: ['', Validators.required],
      charolaUnoPHumedadAN: [{value: 0, disabled: true}],
      charolaDosAN: ['', Validators.required],
      charolaDosTaraAN: ['', Validators.required],
      charolaDosPIAN: ['', Validators.required],
      charolaDosPSUAN: ['', Validators.required],
      charolaDosPSDAN: ['', Validators.required],
      charolaDosPHumedadAN: [{value: 0, disabled: true}],
    });

    this.formBPreliminar = this.fnBuilder.group({
      mlBP: ['', Validators.required],
      desInicialABP: ['', Validators.required],
      desInicialBBP: ['', Validators.required],
      desInicialCBP: ['', Validators.required],
      desInicialDBP: ['', Validators.required],
      desFinalABP: ['', Validators.required],
      desFinalBBP: ['', Validators.required],
      desFinalCBP: ['', Validators.required],
      desFinalDBP: ['', Validators.required],
      desplazamientoABP: [{value: 0, disabled: true}],
      desplazamientoBBP: [{value: 0, disabled: true}],
      desplazamientoCBP: [{value: 0, disabled: true}],
      desplazamientoDBP: [{value: 0, disabled: true}],
      promedioDesplazamientoBP: [{value: 0, disabled: true}],
      charolaUnoBP: ['', Validators.required],
      charolaUnoTaraBP: ['', Validators.required],
      charolaUnoPIBP: ['', Validators.required],
      charolaUnoPSUBP: ['', Validators.required],
      charolaUnoPSDBP: ['', Validators.required],
      charolaUnoPHumedadBP: [{value: 0, disabled: true}],
      charolaDosBP: ['', Validators.required],
      charolaDosTaraBP: ['', Validators.required],
      charolaDosPIBP: ['', Validators.required],
      charolaDosPSUBP: ['', Validators.required],
      charolaDosPSDBP: ['', Validators.required],
      charolaDosPHumedadBP: [{value: 0, disabled: true}],
    });

    this.formCBeforeUno = this.fnBuilder.group({
      mlC1: ['', Validators.required],
      desInicialAC1: ['', Validators.required],
      desInicialBC1: ['', Validators.required],
      desInicialCC1: ['', Validators.required],
      desInicialDC1: ['', Validators.required],
      desFinalAC1: ['', Validators.required],
      desFinalBC1: ['', Validators.required],
      desFinalCC1: ['', Validators.required],
      desFinalDC1: ['', Validators.required],
      desplazamientoAC1: [{value: 0, disabled: true}],
      desplazamientoBC1: [{value: 0, disabled: true}],
      desplazamientoCC1: [{value: 0, disabled: true}],
      desplazamientoDC1: [{value: 0, disabled: true}],
      promedioDesplazamientoC1: [{value: 0, disabled: true}],
      charolaUnoC1: ['', Validators.required],
      charolaUnoTaraC1: ['', Validators.required],
      charolaUnoPIC1: ['', Validators.required],
      charolaUnoPSUC1: ['', Validators.required],
      charolaUnoPSDC1: ['', Validators.required],
      charolaUnoPHumedadC1: [{value: 0, disabled: true}],
      charolaDosC1: ['', Validators.required],
      charolaDosTaraC1: ['', Validators.required],
      charolaDosPIC1: ['', Validators.required],
      charolaDosPSUC1: ['', Validators.required],
      charolaDosPSDC1: ['', Validators.required],
      charolaDosPHumedadC1: [{value: 0, disabled: true}]
    });

    this.formCBeforeDos = this.fnBuilder.group({
      mlC2: ['', Validators.required],
      desInicialAC2: ['', Validators.required],
      desInicialBC2: ['', Validators.required],
      desInicialCC2: ['', Validators.required],
      desInicialDC2: ['', Validators.required],
      desFinalAC2: ['', Validators.required],
      desFinalBC2: ['', Validators.required],
      desFinalCC2: ['', Validators.required],
      desFinalDC2: ['', Validators.required],
      desplazamientoAC2: [{value: 0, disabled: true}],
      desplazamientoBC2: [{value: 0, disabled: true}],
      desplazamientoCC2: [{value: 0, disabled: true}],
      desplazamientoDC2: [{value: 0, disabled: true}],
      promedioDesplazamientoC2: [{value: 0, disabled: true}],
      charolaUnoC2: ['', Validators.required],
      charolaUnoTaraC2: ['', Validators.required],
      charolaUnoPIC2: ['', Validators.required],
      charolaUnoPSUC2: ['', Validators.required],
      charolaUnoPSDC2: ['', Validators.required],
      charolaUnoPHumedadC2: [{value: 0, disabled: true}],
      charolaDosC2: ['', Validators.required],
      charolaDosTaraC2: ['', Validators.required],
      charolaDosPIC2: ['', Validators.required],
      charolaDosPSUC2: ['', Validators.required],
      charolaDosPSDC2: ['', Validators.required],
      charolaDosPHumedadC2: [{value: 0, disabled: true}]
    });

    this.formDAboveUno = this.fnBuilder.group({
      mlD1: ['', Validators.required],
      desInicialAD1: ['', Validators.required],
      desInicialBD1: ['', Validators.required],
      desInicialCD1: ['', Validators.required],
      desInicialDD1: ['', Validators.required],
      desFinalAD1: ['', Validators.required],
      desFinalBD1: ['', Validators.required],
      desFinalCD1: ['', Validators.required],
      desFinalDD1: ['', Validators.required],
      desplazamientoAD1: [{value: 0, disabled: true}],
      desplazamientoBD1: [{value: 0, disabled: true}],
      desplazamientoCD1: [{value: 0, disabled: true}],
      desplazamientoDD1: [{value: 0, disabled: true}],
      promedioDesplazamientoD1: [{value: 0, disabled: true}],
      charolaUnoD1: ['', Validators.required],
      charolaUnoTaraD1: ['', Validators.required],
      charolaUnoPID1: ['', Validators.required],
      charolaUnoPSUD1: ['', Validators.required],
      charolaUnoPSDD1: ['', Validators.required],
      charolaUnoPHumedadD1: [{value: 0, disabled: true}],
      charolaDosD1: ['', Validators.required],
      charolaDosTaraD1: ['', Validators.required],
      charolaDosPID1: ['', Validators.required],
      charolaDosPSUD1: ['', Validators.required],
      charolaDosPSDD1: ['', Validators.required],
      charolaDosPHumedadD1: [{value: 0, disabled: true}]
    });

    this.formDAboveDos = this.fnBuilder.group({
      mlD2: ['', Validators.required],
      desInicialAD2: ['', Validators.required],
      desInicialBD2: ['', Validators.required],
      desInicialCD2: ['', Validators.required],
      desInicialDD2: ['', Validators.required],
      desFinalAD2: ['', Validators.required],
      desFinalBD2: ['', Validators.required],
      desFinalCD2: ['', Validators.required],
      desFinalDD2: ['', Validators.required],
      desplazamientoAD2: [{value: 0, disabled: true}],
      desplazamientoBD2: [{value: 0, disabled: true}],
      desplazamientoCD2: [{value: 0, disabled: true}],
      desplazamientoDD2: [{value: 0, disabled: true}],
      promedioDesplazamientoD2: [{value: 0, disabled: true}],
      charolaUnoD2: ['', Validators.required],
      charolaUnoTaraD2: ['', Validators.required],
      charolaUnoPID2: ['', Validators.required],
      charolaUnoPSUD2: ['', Validators.required],
      charolaUnoPSDD2: ['', Validators.required],
      charolaUnoPHumedadD2: [{value: 0, disabled: true}],
      charolaDosD2: ['', Validators.required],
      charolaDosTaraD2: ['', Validators.required],
      charolaDosPID2: ['', Validators.required],
      charolaDosPSUD2: ['', Validators.required],
      charolaDosPSDD2: ['', Validators.required],
      charolaDosPHumedadD2: [{value: 0, disabled: true}]
    });


    if (this.lotesREG && this.lotesREG.length > 0) {
      this.dtOptionsLoteslotesREG = {
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
      this.lotesREG= [];
      this.dtOptionsLoteslotesREG = {
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

    if (this.lotesHumedad && this.lotesHumedad.length > 0) {
      this.dtOptionsLoteslotesHumedad = {
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
      this.lotesHumedad = [];
      this.dtOptionsLoteslotesHumedad = {
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
  //no depende de una array, depemde de la determinación de humedad que se seleccione
    this.dtOptionsDeterminacionHumedad = {
      paging: false,
      searching: false,
      language: {
        emptyTable: '',
        info: '',
        infoEmpty: '',
        infoFiltered: '',
        zeroRecords: ''
      }, columnDefs: [
        {
          targets: '_all',
          orderable: false
        }
      ]
    };

    if (this.resultadosFMPTML && this.resultadosFMPTML.length > 0) {
      this.dtOptionsFPMTML = {
        paging: false,
        searching: false,
        language: {
          emptyTable: '',
          info: '',
          infoEmpty: '',
          infoFiltered: '',
          zeroRecords: ''
        },
        columnDefs: [
          {
            targets: '_all',
            orderable: false
          }
        ]
      };
    } else {
      this.resultadosFMPTML= [];
      this.dtOptionsFPMTML = {
        paging: false,
        searching: false,
        language: {
          emptyTable: '',
          info: '',
          infoEmpty: '',
          infoFiltered: '',
          zeroRecords: ''
        },
        columnDefs: [
          {
            targets: '_all',
            orderable: false
          }
        ]
      };
    }
  }

  //METODO QUE INDICA QUE EL BOTON ESTA ACTIVADO
  setActiveButton(button: string, div: string): void {
    this.activeButton = button;
    this.activeDiv = div;

    }
  
  //METODO QUE HACE VISIBLE QUE EL BOTON ACTIVADO
  isButtonActive(button: string, div: string): boolean {
    return this.activeButton === button && this.activeDiv === div;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //REGISTRAR MUESTRA

  //TRAE LAS PILAR PARA INGRESO DE RESULTADO
  onInput() {
    const nominacionSeleccionada = this.nominacionesLAB.find(n => n.numeroNominacion === this.nominacionLAB);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotesREG = resp;
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
  
  cleanRegistro(){
    this.nominacionLAB= '';
    this.lotesREG = [];
    this.registrar = false;
    this.loteSelecionado = '';
    this.formRegistroLab.reset();
  }

  cleanR(){
    this.formRegistroLab.reset();
  }

  saveRegistro(){
    this.idUsuario;
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('orden', this.loteSelecionado);
    formData.append('idUsuario', this.idUsuario);
    formData.append('fechaRecepcion', this.formRegistroLab.get('fechaRecepcion')?.value);  
    formData.append('pesoMuestra', this.formRegistroLab.get('pesoMuestra')?.value);
    formData.append('numSello', this.formRegistroLab.get('numSello')?.value);
    formData.append('inspector', this.formRegistroLab.get('inspector')?.value);
    this.lab.addRegistroMuestra(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.getRegistrosByID(this.idLote);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Regitro ingresado con éxto.',
      });
    this.registroExiste = true;
    //Hace  que el boron editar se deshabilite, si no hay cambios
    this.formRegistroLab.markAsPristine();
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar el registro',        
      })
    }});
  }

  openAddRegistro(idLote: any, orden: any){
    this.idLote= idLote;
    this. registrar= true;
    this.loteSelecionado = orden;
    this.getRegistrosByID(idLote);
    //Hace  que el boron editar se deshabilite, si no hay cambios
    this.formRegistroLab.markAsPristine();
  }

  inicializarFormulario() {
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = ('0' + (fechaActual.getMonth() + 1)).slice(-2);
    const dia = ('0' + fechaActual.getDate()).slice(-2);
    const fechaFormateada = `${año}-${mes}-${dia}`;
    const usuario = this.nombreUsuario + ' ' + this.apellido;
    const orden = this.loteSelecionado;
    this.formRegistroLab = this.fnBuilder.group({
      fechaRecepcion: [fechaFormateada],
      orden: [orden],
      pesoMuestra: ['', Validators.required],
      numSello: ['', Validators.required],
      inspector: [usuario]
    });
  }


  editarRegistro(){
    this.idUsuario;
    const formData = new FormData();
    const fechaRecepcion = this.formRegistroLab.get('fechaRecepcion')?.value;
    const pesoMuestra = this.formRegistroLab.get('pesoMuestra')?.value;  
    const numSello = this.formRegistroLab.get('numSello')?.value;
    const inspector = this.formRegistroLab.get('inspector')?.value;
    const data = {
      idLote: this.idLote,
      idUsuario: this.idUsuario,
      fechaRecepcion: fechaRecepcion,
      pesoMuestra: pesoMuestra,
      numSello: numSello,
      inspector: inspector,
    };
    this.lab.editRegistroByIdLote(JSON.stringify(data)).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Registro editado con éxito.',
        });
        this.getRegistrosByID(this.idLote);
        //Hace  que el boron editar se deshabilite, si no hay cambios
        this.formRegistroLab.markAsPristine();
    },
    error: (error: any) => {
      // Manejo general de errores
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al editar el registro',
      });
    }    
    });
  }

  getRegistrosByID(idLote: any){
    this.lab.getRegistroByIdLote(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
        if(resp && Object.keys(resp).length > 0) {
          this.formRegistroLab.patchValue({
            fechaRecepcion: resp.fechaRecepcion,
            orden: resp.orden,
            pesoMuestra: resp.pesoMuestra,
            numSello: resp.numSello,
            inspector: resp.inspector,
          });
          this.registroExiste = true;
        } else {
          this.inicializarFormulario();
          this.registroExiste = false;
        }
      },
      error: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al traer el registro',        
        });
      }
    });
  }










  

  //DETERMINACIÓN DE HUMEDAD

  //TRAE LAS PILAR PARA INGRESO DE RESULTADO
  onInputH() {
    const nominacionSeleccionada = this.nominacionesHumedad.find(n => n.numeroNominacion === this.nominacionHumedad);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotesHumedad = resp;
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
  
  cleanHumedad(){
    this.showDetails=false;
    this.nominacionHumedad= '';
    this.lotesHumedad = [];
    this.loteHSelecionado = '';
    this.detSiempleSelecionada = false;
    this.detIncrementoSelecionada = false;
    this.valorIncrementoS = undefined;
    this.valorIncremento = undefined;
    this.filas = [];
    this.filas22 = [];
    this.detalleHumedad = [];
  }

  
  determinacionSimple(idLote: any, orden: any) {
    this.detalleHumedad = [];
    this.getdetalleHumedad(idLote);
    this.filas = [];
    this.filasR = [];
    this.obtenerResultadoIngresados(idLote,"filas");
    this.idLote = idLote;
    this.orden = orden;
    this.cdr.detectChanges();
    this.valorIncrementoS = 1; 
    this.detIncrementoSelecionada = false;
    this.detSiempleSelecionada = true;  
  }

  determinacionIncremento(idLote: any, orden: any){
    this.detalleHumedad = [];
    this.getdetalleHumedad(idLote);
    this.filas22 = [];
    this.filas22R = [];
    this.obtenerResultadoIngresados(idLote, "filas22");
    this.orden = orden;
    this.idLote = idLote;
    this.cdr.detectChanges();
    this.valorIncremento = undefined;
    this.detSiempleSelecionada = false;
    this.detIncrementoSelecionada = true;
  }


obtenerResultadoIngresados(idLote: any, filasIncremento: string) {
  this.lab.getResultHumedadIniciados(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          if (resp && resp.length > 0) {
              this.filas = [];
              this.filas22 = [];
              this.filasR = [];
              this.filas22R = [];
              let todosSimple = true; 
              let todosIncremento = true;
              this.valorIncremento22= 0;
              resp.forEach((resultado: any) => {              
                if (resultado.estado === 'Proceso finalizado' && resultado.debeRepetir && resultado.debeRepetir === 'SI') {
                  const numero = resultado.numero;            
                  // Verificar y crear el objeto para el número de muestra si no existe
                  if (!this.idInicioResultHumedad[numero]) {
                      this.idInicioResultHumedad[numero] = {};
                  }        
                  // Capturar el ID para la charola actual del resultado, sin importar si es A o B
                  this.idInicioResultHumedad[numero][resultado.numeroCharola] = resultado.idInicioResultHumedad;           
                  // Proceder según el valor de incremento y la existencia del número en los arrays correspondientes
                  if (resultado.valorIncremento > 1) {
                      if (!this.filas22R.some(fila => fila.numero === numero)) {
                          // Verificar que ambos IDs estén disponibles antes de agregar a filas22R
                          if (this.idInicioResultHumedad[numero]['A'] && this.idInicioResultHumedad[numero]['B']) {
                              this.filas22R.push(this.crearFilaR(numero, 'A', this.idInicioResultHumedad[numero]['A']));
                              this.filas22R.push(this.crearFilaR(numero, 'B', this.idInicioResultHumedad[numero]['B']));
                          }
                      }
                  } else {
                      if (!this.filasR.some(fila => fila.numero === numero)) {
                          // Verificar que ambos IDs estén disponibles antes de agregar a filasR
                          if (this.idInicioResultHumedad[numero]['A'] && this.idInicioResultHumedad[numero]['B']) {
                              this.filasR.push(this.crearFilaR(numero, 'A', this.idInicioResultHumedad[numero]['A']));
                              this.filasR.push(this.crearFilaR(numero, 'B', this.idInicioResultHumedad[numero]['B']));
                          }
                      }
                    }
                }
                if (resultado.valorIncremento >= 1 && resultado.valorIncremento <= 22) {
                    if (resultado.valorIncremento == 1) {
                      this.filas.push(this.crearFilaResultSimple(resultado));
                        todosIncremento = false;
                        switch (resultado.estado) {
                          case 'Proceso finalizado':
                              this.procesoS1[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoS2[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoS3[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true; 
                              this.procesoS4[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true; 
                              break;
                          case 'Iniciando Secado 3':
                              this.procesoS1[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoS2[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoS3[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              break;
                          case 'Iniciando Secado 2':
                              this.procesoS1[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoS2[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoS3[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = false;
                              break;
                          case 'Iniciando Secado 1': 
                              this.procesoS1[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoS2[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = false;
                              this.procesoS3[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = false;  
                              break;
                      }
                      
                      
                    } else {
                      this.filas22.push(this.crearFilaResultSimple(resultado));
                        todosSimple = false; 
                        this.valorIncremento22 =  resultado.valorIncremento;
                        switch (resultado.estado) {
                          case 'Proceso finalizado':
                              this.procesoI1[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoI2[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoI3[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true; 
                              this.procesoI4[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;  
                              break;
                          case 'Iniciando Secado 3':
                              this.procesoI1[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoI2[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoI3[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              break;
                          case 'Iniciando Secado 2':
                              this.procesoI1[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoI2[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoI3[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = false;
                              break;
                          case 'Iniciando Secado 1': 
                              this.procesoI1[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = true;
                              this.procesoI2[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = false;
                              this.procesoI3[resultado.idInicioResultHumedad + '_' + resultado.numero + '_' + this.idLote] = false;  
                              break;
                        }
                        
                    }
                  }
                  
              });

              let ultimoNumero = this.filas22.reduce((max, fila) => Math.max(max, fila.numero), 0);
                // Obtiene el valor de incremento del resultado (Asegurándose de que es un número)
                let valorIncremento = this.valorIncremento22;
                // Añadir filas nuevas desde el último número utilizado más uno
                for (let i = ultimoNumero + 1; i <= valorIncremento; i++) {
                    this.filas22.push(this.crearFila(i, 'A'));
                    this.filas22.push(this.crearFila(i, 'B'));
                }

                
              if (todosSimple && filasIncremento === "filas22") {
                  this.modal.open(this.modalTemplateRef, { size: "sm" });
              } else if (todosIncremento && filasIncremento === "filas") {
                  this.agregarFilasPorIncremento(filasIncremento);
              }
          } else {
              if (filasIncremento === "filas") {
                  this.agregarFilasPorIncremento(filasIncremento);
              } else {
                  this.modal.open(this.modalTemplateRef, { size: "sm" });
              }
          }
      },
      error: (error: any) => {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al obtener los resultados del lote seleccionado',
          })
      }
  });
}

 

  crearFilaR(incremento: number, charola: string, idInicioResultHumedad: number): FilaDeterminacionHumedad {
    return {
      numero: incremento,
      numeroCharola: `${charola}`,
      numeroCharolaUsuario: '',
      pesoTara: 0,
      pesoHumedo: 0,
      pesoBrutoNumerico: 0,
      pesoBruto: '',
      pesoSeco1: 0,
      pesoSeco2: 0,
      pesoSeco3: 0,
      condicion: '',
      porcentajeHumedad: 0,
      promedioHumedad: 0,
      estado: 'No Iniciado',
      idInicioResultHumedad: idInicioResultHumedad || 0
    };
  }

    //CREA LAS FILAS
    crearFila(incremento: number, charola: string): FilaDeterminacionHumedad {
      return {
        numero: incremento,
        numeroCharola: `${charola}`,
        numeroCharolaUsuario: '',
        pesoTara: 0,
        pesoHumedo: 0,
        pesoBrutoNumerico: 0,
        pesoBruto: '',
        pesoSeco1: 0,
        pesoSeco2: 0,
        pesoSeco3: 0,
        condicion: '',
        porcentajeHumedad: 0,
        promedioHumedad: 0,
        estado: 'No Iniciado',
        idInicioResultHumedad: 0
      };
    }

crearFilaResultSimple(resultado: any): FilaDeterminacionHumedad {
    return {
      numero: resultado.numero,
      numeroCharola: resultado.numeroCharola,
      numeroCharolaUsuario: resultado.numeroCharolaUsuario || '',
      pesoTara: parseFloat(resultado.pesoTara) || 0,
      pesoHumedo: parseFloat(resultado.pesoHumedo) || 0,
      pesoBrutoNumerico: parseFloat(resultado.pesoBrutoNumerico) || 0,
      pesoBruto: resultado.pesoBruto || '',
      pesoSeco1: parseFloat(resultado.pesoSecoUno) || 0, 
      pesoSeco2: parseFloat(resultado.pesoSecoDos) || 0,
      pesoSeco3: parseFloat(resultado.pesoSecoTres) || 0,
      condicion: resultado.condicion || '',
      porcentajeHumedad: parseFloat(resultado.porcentajeHumedad) || 0,
      promedioHumedad: parseFloat(resultado.promedioHumedad) || 0,
      estado: resultado.estado,
      idInicioResultHumedad: resultado.idInicioResultHumedad || 0
  };
}

//resultadosSimples

resultadosSimples(){}

  agregarIncremento() {
      this.filas22 = [];
      this.agregarFilasPorIncremento("filas22");
      this.closeModalIncremento();
    }

    agregarFilasPorIncremento(valorFila:string) {
      if( valorFila ===  "filas22"){
        if (this.valorIncremento! >= 1 && this.valorIncremento! <= 22) {
          for (let i = 1; i <= this.valorIncremento!; i++) {
            // Añadir dos filas por cada incremento, una para charola A y otra para B
            this.filas22.push(this.crearFila(i, 'A'));
            this.filas22.push(this.crearFila(i, 'B'));
          }
        }
      } else{
        if (this.valorIncrementoS! >= 1 && this.valorIncrementoS! <= 22) {
          for (let i = 1; i <= this.valorIncrementoS!; i++) {
            // Añadir dos filas por cada incremento, una para charola A y otra para B
            this.filas.push(this.crearFila(i, 'A'));
            this.filas.push(this.crearFila(i, 'B'));
          }
        }
      }   
    }


  closeModalIncremento(){
    this.modal.dismissAll();
  }

  //ADEMÁS DE CALCULAR EL PESO BRUTO, HABILITA EL BOTON GUARDAR, CUANDO SE INGRESA EL ULTIMO PESO HUMEDO
  calcularPesoBruto(index: number, valorFila:string) {
    let fila;
    if (valorFila === "filas22") {
      fila = this.filas22[index];
    } else if (valorFila === "filas"){
      fila = this.filas[index];
    }else if (valorFila === "filas22R"){
      fila = this.filas22R[index];
    } else {
      fila = this.filasR[index];
    }
    fila.pesoBrutoNumerico = (fila.pesoTara || 0) + (fila.pesoHumedo || 0);
    fila.pesoBruto = fila.pesoBrutoNumerico.toFixed(2);
    this.verificarEstadoBotonGuardar(index, valorFila);
  }
 
//VERIFICA QUE EL PROCESO 1 ESTE COMPLETO, PARA AHABILITAR EL BOTON GUARDAR. 
verificarEstadoBotonGuardar(index: number, valorFila: string) {
  let indicePar = index % 2 === 0 ? index : index - 1;
  let filas;
  let listaActual;

  if (valorFila === "filas22") {
      filas = this.filas22;
      listaActual = this.paresListosParaGuardarFilas22;
  } else if (valorFila === "filas") {
      filas = this.filas;
      listaActual = this.paresListosParaGuardarFilas;
  } else if (valorFila === "filas22R") {
      filas = this.filas22R;
      listaActual = this.paresListosParaGuardarFilas22R;
  } else if (valorFila === "filasR") {
      filas = this.filasR;
      listaActual = this.paresListosParaGuardarFilasR;
  } else {
      return;
  }

  // Identificación de las filas A y B
  let filaA = filas[indicePar];
  let filaB = filas[indicePar + 1];

  // Ajustando la clave compuesta según el tipo de lista
  let claveCompuesta = (valorFila === "filasR" || valorFila === "filas22R") ?
                       `${filaA.numero}_${this.idLote}` :
                       `${filaA.idInicioResultHumedad}_${filaA.numero}_${this.idLote}`;

  if (filaA.pesoHumedo > 0 && filaB.pesoHumedo > 0 && filaA.numeroCharolaUsuario && filaB.numeroCharolaUsuario) {
      if (!listaActual.includes(claveCompuesta)) {
          listaActual.push(claveCompuesta);
      }
  } else {
      const indice = listaActual.indexOf(claveCompuesta);
      if (indice > -1) {
          listaActual.splice(indice, 1);
      }
  }
}

  determinarEstadoCondicion(fila: FilaDeterminacionHumedad, valorFila: string, numeroFila:any) {  
    if (fila.pesoSeco1 === 0 && fila.pesoSeco2 === 0 && fila.pesoSeco3 === 0) {
      fila.condicion = 'NO';
      return;
    }
    const esSeco2Valido = Math.abs(fila.pesoSeco1 - fila.pesoSeco2) <= 1;
    if (!esSeco2Valido) {
      fila.condicion = 'NO';
      } else {
        fila.condicion = 'OK';
      }
      this.actualizarHabilitacionBoton(fila, valorFila, numeroFila);
  }

  determinarEstadoCondicion3(fila: FilaDeterminacionHumedad, valorFila: string, numeroFila:any) {
    const pesoSeco3Ingresado = fila.pesoSeco3 !== 0;
    const esSeco3Valido = pesoSeco3Ingresado && Math.abs(fila.pesoSeco1 - fila.pesoSeco3) <= 1;
    if (!esSeco3Valido) {
      fila.condicion = 'NO';
    } else {
      fila.condicion = 'OK';
    }

    this.actualizarHabilitacionBoton(fila, valorFila, numeroFila);
  }


  actualizarHabilitacionBoton(fila: FilaDeterminacionHumedad, valorFila: string, numeroFila:any) {
    let par: FilaDeterminacionHumedad | undefined;
    let listaActual: Array<string>;
    // Asignar el par correcto dependiendo del valor de valorFila
    if (valorFila === "filas22") {  
      par = this.filas22.find(f => f.numero === fila.numero && f.numeroCharola !== fila.numeroCharola);
      listaActual = this.paresListosParaGuardarFilas22;
      this.cdr.detectChanges();
    } else{
      par = this.filas.find(f => f.numero === fila.numero && f.numeroCharola !== fila.numeroCharola);
      listaActual = this.paresListosParaGuardarFilas;
      this.cdr.detectChanges();
    }
    if (!par) return; 
    let clave= fila.idInicioResultHumedad + '_' + numeroFila + '_' + this.idLote;
    // Comprobando los estados completos de los procesos.
    let procesosCompletos = true;  // Suponemos que los procesos están completos, a menos que se demuestre lo contrario

    if (this.procesoS1[clave] && valorFila === "filas") {
        procesosCompletos = procesosCompletos && fila.pesoSeco1 > 0 && par.pesoSeco1 > 0;
    }
    if (this.procesoS2[clave] && valorFila === "filas") {
        procesosCompletos = procesosCompletos && fila.pesoSeco2 > 0 && par.pesoSeco2 > 0;
    }
    if (this.procesoS3[clave] && valorFila === "filas") {
        procesosCompletos = procesosCompletos && fila.pesoSeco3 > 0 && par.pesoSeco3 > 0;
    }
    if (this.procesoI1[clave] && valorFila === "filas22") {
      procesosCompletos = procesosCompletos && fila.pesoSeco1 > 0 && par.pesoSeco1 > 0;
    }
    if (this.procesoI2[clave] && valorFila === "filas22") {
        procesosCompletos = procesosCompletos && fila.pesoSeco2 > 0 && par.pesoSeco2 > 0;
    }
    if (this.procesoI3[clave] && valorFila === "filas22") {
        procesosCompletos = procesosCompletos && fila.pesoSeco3 > 0 && par.pesoSeco3 > 0;
    }
    // Determinar si los procesos necesarios están completos para habilitar el botón
    if (procesosCompletos) {     
      if (!listaActual.includes(clave)) {
        listaActual.push(clave);}
    } else {
      const index = listaActual.indexOf(clave);
      if (index > -1) {
          listaActual.splice(index, 1);
      }
    }
  }

  convertirAMayusculas(event:any) {
    event.target.value = event.target.value.toUpperCase();
}
  
  calcularPorcentajeHumedad(fila: any): number {
    const pesoTara = fila.pesoTara || 0;
    const pesoHumedo = fila.pesoHumedo || 0;
    const pesoSeco = fila.pesoSeco3 || 0;

    // Calcula el porcentaje de humedad
    const porcentajeHumedad = ((pesoTara + pesoHumedo - pesoSeco) * 100) / pesoHumedo;
    // Redondea el resultado a 5 decimales
    return parseFloat(porcentajeHumedad.toFixed(5));
  }


  actualizarPesoSeco3(fila: FilaDeterminacionHumedad, index: number, valorFila:string): void {
    if( valorFila ===  "filas22"){
        // Actualiza el porcentaje de humedad para la fila actual.
      fila.porcentajeHumedad = this.calcularPorcentajeHumedad(fila);
      // Verifica si la fila actual es una fila "B", lo que implica que su par "A" ya ha sido procesado.
      if (index % 2 == 1) {
        const filaA = this.filas22[index - 1];
        const filaB = fila; // La fila actual es B.
        // Asegúrate de que ambas filas del par tienen calculado su porcentaje de humedad.
        if (filaA.porcentajeHumedad !== undefined && filaB.porcentajeHumedad !== undefined) {
          const promedioHumedad = (filaA.porcentajeHumedad + filaB.porcentajeHumedad) / 2;
          filaB.promedioHumedad = promedioHumedad;      
        this.cdr.detectChanges();
        }
      }  
    }else{
      fila.porcentajeHumedad = this.calcularPorcentajeHumedad(fila);
      if (index % 2 == 1) {
        const filaA = this.filas[index - 1];
        const filaB = fila;
        if (filaA.porcentajeHumedad !== undefined && filaB.porcentajeHumedad !== undefined) {
          const promedioHumedad = (filaA.porcentajeHumedad + filaB.porcentajeHumedad) / 2;
          filaB.promedioHumedad = promedioHumedad;
        this.cdr.detectChanges();
        } 
      }   
    }
    }
  
// Guardar Resultados
guardarResultIncremento(modal: any, numeroPar: number, valorFila: string, estado: string, idInicioResultHumedad: any) {
  if (idInicioResultHumedad == null || idInicioResultHumedad === 0) {
    if( valorFila ===  "filas22"){
      const filasDelPar = this.filas22.filter(fila => fila.numero === numeroPar);
      this.guardarDatos(filasDelPar, estado, valorFila);
    }else {
      const filasDelPar = this.filas.filter(fila => fila.numero === numeroPar);
      this.guardarDatos(filasDelPar, estado, valorFila);
    }
  } 
  // Suponemos que idInicioResultHumedad es para la charola B
  let claveCompuestaB = idInicioResultHumedad + '_' + numeroPar + '_' + this.idLote;
  let claveCompuestaA = (idInicioResultHumedad - 1) + '_' + numeroPar + '_' + this.idLote;  // Charola A es siempre uno menos que B

  let filasDelPar: any[] = [];
  if (valorFila === "filas22") {
    // Buscar la charola A y B en filas22
    let filaA = this.filas22.find(fila => (fila.idInicioResultHumedad + '_' + fila.numero + '_' + this.idLote) === claveCompuestaA);
    let filaB = this.filas22.find(fila => (fila.idInicioResultHumedad + '_' + fila.numero + '_' + this.idLote) === claveCompuestaB);
    if (filaA && filaB) filasDelPar = [filaA, filaB];
  } else {
    // Buscar la charola A y B en filas
    let filaA = this.filas.find(fila => (fila.idInicioResultHumedad + '_' + fila.numero + '_' + this.idLote) === claveCompuestaA);
    let filaB = this.filas.find(fila => (fila.idInicioResultHumedad + '_' + fila.numero + '_' + this.idLote) === claveCompuestaB);
    if (filaA && filaB) filasDelPar = [filaA, filaB];
  }
  if (filasDelPar.length === 2) {
    const tieneResultadoRechazado = filasDelPar.some(fila => fila.condicion === 'NO');
    if (tieneResultadoRechazado) {
      const ref = this.modal.open(modal, { size: "sm" });
      ref.result.then((resultadoDelModal) => {
        if (resultadoDelModal === 'Guardar') {
          this.guardarDatos(filasDelPar, estado, valorFila);
        }
      });
    } else {
      this.guardarDatos(filasDelPar, estado, valorFila);
    }
  }
}

  guardarDatos(filasDelPar: any[], estado:string, valorFila:string) {
    const datosParaGuardar = {
      numero: filasDelPar[0].numero,
      datosCharolaA: this.prepararDatosFila(filasDelPar[0], estado, valorFila),
      datosCharolaB: this.prepararDatosFila(filasDelPar[1], estado, valorFila)
    };
     this.lab.saveResultHumedad(datosParaGuardar).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      if (resp.success) {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `Se agregó correctamente, proceso ${resp.process}`,
        });
        this.obtenerResultadoIngresados(this.idLote, valorFila);
        // Determinar cuál lista actualizar
        if (valorFila === 'filas22') {
          this.paresListosParaGuardarFilas22 = [];
        } else{
          this.paresListosParaGuardarFilas = [];
        }
        this.valorIncremento = undefined;
    } else {
        // Si el backend responde con éxito: false, pero sin proceso, podría ser un error de validación previo a intentar los inserts
        const procesoMensaje = resp.process ? `, proceso ${resp.process}` : '';
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Error al guardar ${procesoMensaje}`,
        });
    }

    }, error: (error: any) => {
      console.error('Error de conexión con el servidor.', error);
    }});
  }

  prepararDatosFila(fila: FilaDeterminacionHumedad, estado: string, valorFila:string) {  
    if(estado === "No Iniciado"){
      if(valorFila === 'filas'){
        this.valorIncremento = 1;
      }
      return {
        idUsuario: this.idUsuario,
        idLote: this.idLote,
        orden: this.orden,
        valorIncremento: this.valorIncremento || this.valorIncremento22,
        numero: fila.numero,
        numeroCharola: fila.numeroCharola,
        numeroCharolaUsuario: fila.numeroCharolaUsuario,
        pesoTara: fila.pesoTara,
        pesoHumedo: fila.pesoHumedo,
        pesoBrutoNumerico: fila.pesoBrutoNumerico,
        pesoBruto: fila.pesoBruto,
        estado: 'Iniciando Secado 1',
      };
    } else if (estado === "Iniciando Secado 1") {
       return{
        idUsuario: this.idUsuario,
        idLote: this.idLote,
        orden: this.orden,
        pesoSecoUno: fila.pesoSeco1,
        numero: fila.numero,
        idInicioResultHumedad: fila.idInicioResultHumedad,
        estado: 'Iniciando Secado 2',
       };      
    } else if (estado === "Iniciando Secado 2") {
      return{
        idUsuario: this.idUsuario,
        idLote: this.idLote,
        orden: this.orden,
        pesoSecoDos: fila.pesoSeco2,
        numero: fila.numero,
        idInicioResultHumedad: fila.idInicioResultHumedad,
        estado: 'Iniciando Secado 3',
        condicion: fila.condicion
      };
    } else if (estado === "Iniciando Secado 3") {
      return{
        idUsuario: this.idUsuario,
        idLote: this.idLote,
        orden: this.orden,
        pesoSecoTres: fila.pesoSeco3,
        condicion: fila.condicion,
        estado: "Proceso finalizado",
        numero: fila.numero,
        idInicioResultHumedad: fila.idInicioResultHumedad,
        porcentajeHumedad: fila.porcentajeHumedad,
        promedioHumedad: fila.promedioHumedad
      };
    } else{ 
      return{
      };
    }
  }

    //GUARDAR RESULTADOS
    guardarResultIncrementoR(numeroPar: number, valorFila:string, estado:string) {
      if( valorFila ===  "filas22R"){
        const filasDelPar = this.filas22R.filter(fila => fila.numero === numeroPar);
        if (filasDelPar.length === 2) {
            this.guardarDatosR(filasDelPar, estado, valorFila);         
        }
      }else{
        const filasDelPar = this.filasR.filter(fila => fila.numero === numeroPar);
        if (filasDelPar.length === 2) {
          this.guardarDatosR(filasDelPar, estado, valorFila); 
        }
      }
    }
  
    guardarDatosR(filasDelPar: any[], estado:string, valorFila:string) {
      const datosParaGuardar = {
        numero: filasDelPar[0].numero,
        datosCharolaA: this.prepararDatosFilaR(filasDelPar[0], estado, valorFila),
        datosCharolaB: this.prepararDatosFilaR(filasDelPar[1], estado, valorFila)
      };
       this.lab.saveResultHumedad(datosParaGuardar).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        if (resp.success) {
          Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: `Se agregó correctamente, proceso ${resp.process}`,
          });
          this.obtenerResultadoIngresados(this.idLote, valorFila);
          // Determinar cuál lista actualizar
          let listaActual = valorFila === 'filas22R' ? this.paresListosParaGuardarFilas22R : this.paresListosParaGuardarFilasR;
          const indice = listaActual.indexOf(filasDelPar[0].numero);
          if (indice !== -1) {
              listaActual.splice(indice, 1);
          }
      } else {
          // Si el backend responde con éxito: false, pero sin proceso, podría ser un error de validación previo a intentar los inserts
          const procesoMensaje = resp.process ? `, proceso ${resp.process}` : '';
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Error al guardar ${procesoMensaje}`,
          });
      }
  
      }, error: (error: any) => {
        console.error('Error de conexión con el servidor.', error);
      }});
    }

    prepararDatosFilaR(fila: FilaDeterminacionHumedad, estado: string, valorFila:string) {  
      if(estado === "No Iniciado"){
        if(valorFila === 'filasR'){
          this.valorIncremento = 1;
        }else {
          this.valorIncremento = this.valorIncremento22;
        }
        return {
          idUsuario: this.idUsuario,
          idLote: this.idLote,
          orden: this.orden,
          valorIncremento: this.valorIncremento,
          numero: fila.numero,
          numeroCharola: fila.numeroCharola,
          numeroCharolaUsuario: fila.numeroCharolaUsuario,
          pesoTara: fila.pesoTara,
          pesoHumedo: fila.pesoHumedo,
          pesoBrutoNumerico: fila.pesoBrutoNumerico,
          pesoBruto: fila.pesoBruto,
          idInicioResultHumedad: fila.idInicioResultHumedad,
          estado: 'Iniciando Secado 1',
        };
      } else if (estado === "Iniciando Secado 1") {
         return{
          idUsuario: this.idUsuario,
          idLote: this.idLote,
          orden: this.orden,
          pesoSecoUno: fila.pesoSeco1,
          numero: fila.numero,
          idInicioResultHumedad: fila.idInicioResultHumedad,
          estado: 'Iniciando Secado 2',
         };      
      } else if (estado === "Iniciando Secado 2") {
        return{
          idUsuario: this.idUsuario,
          idLote: this.idLote,
          orden: this.orden,
          pesoSecoDos: fila.pesoSeco2,
          numero: fila.numero,
          idInicioResultHumedad: fila.idInicioResultHumedad,
          estado: 'Iniciando Secado 3',
          condicion: fila.condicion
        };
      } else if (estado === "Iniciando Secado 3") {
        return{
          idUsuario: this.idUsuario,
          idLote: this.idLote,
          orden: this.orden,
          pesoSecoTres: fila.pesoSeco3,
          condicion: fila.condicion,
          estado: "Proceso finalizado",
          numero: fila.numero,
          idInicioResultHumedad: fila.idInicioResultHumedad,
          porcentajeHumedad: fila.porcentajeHumedad,
          promedioHumedad: fila.promedioHumedad
        };
      } else{ 
        return{
        };
      }
    }

    openDetalleHumedad(modal: any, idLote:any){
      this.getdetalleHumedad(idLote);
      this.autorizaciones(idLote);
      this.modal.open(modal, { size: "xl"} );
    }


  getdetalleHumedad(idLote: any) {
    this.lab.getDatosHumedad(idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        this.detalleHumedad= resp;
  
        let incrementosUnicos = new Set();  // Utilizo un Set para almacenar valores únicos de incremento
        let totalIncremento = 0;
        let fechasPromedioHumedad = resp.filter((item: any) => item.FechaPromedioHumedad !== "Proceso no iniciado" && item.FechaPromedioHumedad !== undefined && item.FechaPromedioHumedad !== "").length;
        // Extraer todos los valores únicos de incremento y sumarlos
        resp.forEach((item: any) => {
          if (!incrementosUnicos.has(item.Incremento)) {
            incrementosUnicos.add(item.Incremento);
            totalIncremento += parseFloat(item.Incremento);
          }
        });
        console.log('totalIncremento:', totalIncremento);
        // Comparar la suma de los incrementos con la cantidad de fechas válidas
        const resultado = (fechasPromedioHumedad >= totalIncremento);
        this.resultadoComparacion = resultado; 
        console.log('resultadoComparacion:', this.resultadoComparacion);

        console.log('autorizado:', this.autorizado);
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener los datos de humedad',
        })
      }
    });
  }
  

  getIdCargo(): string {
    const administrador = 'Administrador';
    return administrador; 
  }

  autorizar(){
    var nombreCompleto = this.nombreUsuario + ' ' + this.apellido;
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('idUsuario', this.idUsuario);
    formData.append('proceso', 'Determinación de Humedad');  
    formData.append('nombre', nombreCompleto);
   this.lab.addAutorizacion(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.autorizaciones(this.idLote);
   }, error: (error: any) => {
     Swal.fire({
       icon : 'error',
       title: 'Error',
       text: 'Error al aprobar el proceso',        
     })
   }});

  }
  autorizaciones(idLote:any){
   this.lab.getAutorizaciones(idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      if (resp.success && resp.autorizado) {
         this.autorizado = true;
         this.nombreAutorizador = resp.data[0].nombre; 
       } else {
         this.autorizado = false;
         this.nombreAutorizador = '';
       }
   }, error: (error: any) => {
     Swal.fire({
       icon : 'error',
       title: 'Error',
       text: 'Error al obtener las autorizaciones',        
     })
   }});

  }

































  // FMP/TML
  
  //TRAE LAS PILAR PARA INGRESO DE RESULTADO
  onInputIMO() {
    const nominacionSeleccionada = this.nominacionesIMO.find(n => n.numeroNominacion === this.nominacionIMO);
    if (nominacionSeleccionada) {
      this.idNominacionSeleccionado = nominacionSeleccionada.idNominacion;
      this.nominacion.getLotesByIdNominacion(this.idNominacionSeleccionado).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
          this.lotesIMO = resp;
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
  
  cleanIMO(){
    this.nominacionIMO= '';
    this.lotesIMO = [];
    this.loteIMOSelecionado = '';
    this.registrarResultIMO = false;
    this.formInicioResultIMO.reset();
    this.formAnatural.reset();
    this.formBPreliminar.reset();
    this.formCBeforeUno.reset();
    this.formCBeforeDos.reset();
    this.formDAboveUno.reset();
    this.formDAboveDos.reset();
    this.promedioPSI=0;
    this.orden = '';
    this.idLote=0;
    this.registrarResultAnatural=false;
    this.muestraDesplazamiento = false;
    this.registrarResultBPreliminar=false;
    this.registrarResultCBeforeUno=false;
    this.registrarResultCBeforeDos=false;
    this.registrarResultDAboveUno=false;
    this.registrarResultDAboveDos=false;
    this.resultadosFMPTML=false;
    this.inicioresultimoSuccess=false;
    this.showDetails=false;
  }

  openIMO(idLote: any, orden: any){
    this.registrarResultAnatural=false;
    this.muestraDesplazamiento = false;
    this.registrarResultBPreliminar=false;
    this.registrarResultCBeforeUno=false;
    this.registrarResultCBeforeDos=false;
    this.registrarResultDAboveUno=false;
    this.registrarResultDAboveDos=false;
    this.resultadosFMPTML=false;
    this.inicioresultimoSuccess=false;
    this.showDetails=false;
    this.orden = orden;
    this.idLote = idLote;
    this.registrosFMPTML(idLote);
    this.getIMO(idLote);
    this.registrarResultIMO = true;
  }

  // INICO RESULTADO IMO

  saveInicioResultIMO(){
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('orden', this.orden);
    formData.append('idUsuario', this.idUsuario);
    formData.append('calidad', this.formInicioResultIMO.get('calidad')?.value);  
    formData.append('muestraUnoTara', this.formInicioResultIMO.get('muestraUnoTara')?.value);
    formData.append('muestraUnoBruto', this.formInicioResultIMO.get('muestraUnoBruto')?.value);
    formData.append('muestraUnoNeto', this.formInicioResultIMO.get('muestraUnoNeto')?.value);
    formData.append('muestraUnoDensidad', this.formInicioResultIMO.get('muestraUnoDensidad')?.value);
    formData.append('muestraDosTara', this.formInicioResultIMO.get('muestraDosTara')?.value);
    formData.append('muestraDosBruto', this.formInicioResultIMO.get('muestraDosBruto')?.value);
    formData.append('muestraDosNeto', this.formInicioResultIMO.get('muestraDosNeto')?.value);
    formData.append('muestraDosDensidad', this.formInicioResultIMO.get('muestraDosDensidad')?.value);
    formData.append('muestraTresTara', this.formInicioResultIMO.get('muestraTresTara')?.value);
    formData.append('muestraTresBruto', this.formInicioResultIMO.get('muestraTresBruto')?.value);
    formData.append('muestraTresNeto', this.formInicioResultIMO.get('muestraTresNeto')?.value);
    formData.append('muestraTresDensidad', this.formInicioResultIMO.get('muestraTresDensidad')?.value);
    formData.append('promedio', this.formInicioResultIMO.get('promedio')?.value);
    formData.append('psi', this.formInicioResultIMO.get('psi')?.value);
    this.lab.addResultIMO(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        this.getIMO(this.idLote);
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar los datos',        
      })
    }});

  }

  getIMO(idLote: any){
    this.formInicioResultIMO.reset();
    this.lab.getResultIMOoByIdLote(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          if (resp.success && resp.data.length > 0) {
            
            this.formInicioResultIMO.patchValue({
                calidad: resp.data[0].calidad,
                muestraUnoTara: resp.data[0].muestraUnoTara,
                muestraUnoBruto: resp.data[0].muestraUnoBruto,
                muestraUnoNeto: resp.data[0].muestraUnoNeto,
                muestraUnoDensidad: resp.data[0].muestraUnoDensidad,
                muestraDosTara: resp.data[0].muestraDosTara,
                muestraDosBruto: resp.data[0].muestraDosBruto,
                muestraDosNeto: resp.data[0].muestraDosNeto,
                muestraDosDensidad: resp.data[0].muestraDosDensidad,
                muestraTresTara: resp.data[0].muestraTresTara,
                muestraTresBruto: resp.data[0].muestraTresBruto,
                muestraTresNeto: resp.data[0].muestraTresNeto,
                muestraTresDensidad: resp.data[0].muestraTresDensidad,
                promedio: resp.data[0].promedio,
                psi: resp.data[0].psi
            });
            //BLOQUEA LOS CAMPOS DESPUES DE TRAER LOS DATOS
            Object.keys(this.formInicioResultIMO.controls).forEach(key => {
              this.formInicioResultIMO.get(key)?.disable();
          });  
            this.registrarResultAnatural=true;
            this.resultInicioIMO=true;
            this.getANatural(idLote);
            this.registrosFMPTML(idLote);
          }else {
            // Habilitar todos los campos si no hay datos
            Object.keys(this.formInicioResultIMO.controls).forEach(key => {
                this.formInicioResultIMO.get(key)?.enable();
            });
            this.registrarResultAnatural = false;
            this.muestraDesplazamiento = false;
            this.resultInicioIMO=false;
          }
      },
      error: (error: any) => {
          Swal.fire({
              icon : 'error',
              title: 'Error',
              text: 'Error al obtener los resultados.',
          });
      }
    });
  }  

  calcularPesoNeto() {
    ['Uno', 'Dos', 'Tres'].forEach((muestra) => {
      const tara = this.formInicioResultIMO.get(`muestra${muestra}Tara`)!.value;
      const bruto = this.formInicioResultIMO.get(`muestra${muestra}Bruto`)!.value;
      if (tara !== null && tara !== undefined && tara !== '' && bruto !== null && bruto !== undefined && bruto !== '') {
        const neto = bruto - tara;
        this.formInicioResultIMO.get(`muestra${muestra}Neto`)!.setValue(neto);
        this.calcularDensidad();
      }
    });
  }
  
  calcularDensidad() {
    let todasCalculadas = true;
    ['Uno', 'Dos', 'Tres'].forEach((muestra) => {
      const neto = this.formInicioResultIMO.get(`muestra${muestra}Neto`)!.value;
      if (neto !== null && neto !== undefined && neto !== '' && neto !== 0) {
        const densidad = neto / 1000;
        const densidadRedondeada = parseFloat(densidad.toFixed(4));
        this.formInicioResultIMO.get(`muestra${muestra}Densidad`)!.setValue(densidadRedondeada);
      } else {
        todasCalculadas = false;
      }
    });
    if (todasCalculadas) {
      this.calcularPromedio();
    }
  }

  calcularPromedio() {
    let sumaDensidades = 0;
    let contador = 0;
    ['Uno', 'Dos', 'Tres'].forEach((muestra) => {
      const densidad = this.formInicioResultIMO.get(`muestra${muestra}Densidad`)!.value;
      if (densidad !== null && densidad !== undefined && densidad !== '' && densidad !== 0) {
        sumaDensidades += densidad;
        contador++;
      }
    });
    if (contador === 3) {
      const promedio = sumaDensidades / contador;
      const promedioRedondeado = promedio.toFixed(2);
      this.promedioPSI = promedio;
      this.formInicioResultIMO.get('promedio')!.setValue(promedioRedondeado);
      this.calcularPSI();
    }
  }

  calcularPSI() {
    const netoUno = this.formInicioResultIMO.get('muestraUnoNeto')!.value;
    const netoDos = this.formInicioResultIMO.get('muestraDosNeto')!.value;
    const netoTres = this.formInicioResultIMO.get('muestraTresNeto')!.value;
    const densidad1PSI = parseFloat(((netoUno + netoDos + netoTres) / 3).toFixed(2));
    const promedio = parseFloat((densidad1PSI).toFixed(2));
    const densidad2PSI = parseFloat((this.promedioPSI * 7 * 9.81 * 25).toFixed(6));   
    const psi = densidad2PSI * 0.145;
    this.formInicioResultIMO.get('psi')!.setValue(psi.toFixed(3));
  }

   // A NATURAL

  saveformAnatural(){
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('orden', this.orden);
    formData.append('idUsuario', this.idUsuario);
    formData.append('desInicialA', this.formAnatural.get('desInicialAAN')?.value);  
    formData.append('desInicialB', this.formAnatural.get('desInicialBAN')?.value);
    formData.append('desInicialC', this.formAnatural.get('desInicialCAN')?.value);
    formData.append('desInicialD', this.formAnatural.get('desInicialDAN')?.value);
    if (!this.muestraDesplazamiento){
      formData.append('desFinalA', '0');
      formData.append('desFinalB', '0');
      formData.append('desFinalC', '0');
      formData.append('desFinalD', '0');
      formData.append('desplazamientoA', '0');
      formData.append('desplazamientoB', '0');
      formData.append('desplazamientoC', '0');
      formData.append('desplazamientoD', '0');
      formData.append('promedioDesplazamiento', '0');
      formData.append('charolaUno', '0');
      formData.append('charolaUnoTara', '0');
      formData.append('charolaUnoPI', '0');
      formData.append('charolaUnoPSU', '0');
      formData.append('charolaUnoPSD', '0');
      formData.append('charolaUnoPHumedad', '0');
      formData.append('charolaDos', '0');
      formData.append('charolaDosTara', '0');
      formData.append('charolaDosPI', '0');
      formData.append('charolaDosPSU', '0');
      formData.append('charolaDosPSD', '0');
      formData.append('charolaDosPHumedad', '0');
    }else{
      formData.append('desFinalA', this.formAnatural.get('desFinalAAN')?.value);
      formData.append('desFinalB', this.formAnatural.get('desFinalBAN')?.value);
      formData.append('desFinalC', this.formAnatural.get('desFinalCAN')?.value);
      formData.append('desFinalD', this.formAnatural.get('desFinalDAN')?.value);
      formData.append('desplazamientoA', this.formAnatural.get('desplazamientoAAN')?.value);
      formData.append('desplazamientoB', this.formAnatural.get('desplazamientoBAN')?.value);
      formData.append('desplazamientoC', this.formAnatural.get('desplazamientoCAN')?.value);
      formData.append('desplazamientoD', this.formAnatural.get('desplazamientoDAN')?.value);
      formData.append('promedioDesplazamiento', this.formAnatural.get('promedioDesplazamientoAN')?.value);
      formData.append('charolaUno', this.formAnatural.get('charolaUnoAN')?.value);
      formData.append('charolaUnoTara', this.formAnatural.get('charolaUnoTaraAN')?.value);
      formData.append('charolaUnoPI', this.formAnatural.get('charolaUnoPIAN')?.value);
      formData.append('charolaUnoPSU', this.formAnatural.get('charolaUnoPSUAN')?.value);
      formData.append('charolaUnoPSD', this.formAnatural.get('charolaUnoPSDAN')?.value);
      formData.append('charolaUnoPHumedad', this.formAnatural.get('charolaUnoPHumedadAN')?.value);
      formData.append('charolaDos', this.formAnatural.get('charolaDosAN')?.value);
      formData.append('charolaDosTara', this.formAnatural.get('charolaDosTaraAN')?.value);
      formData.append('charolaDosPI', this.formAnatural.get('charolaDosPIAN')?.value);
      formData.append('charolaDosPSU', this.formAnatural.get('charolaDosPSUAN')?.value);
      formData.append('charolaDosPSD', this.formAnatural.get('charolaDosPSDAN')?.value);
      formData.append('charolaDosPHumedad', this.formAnatural.get('charolaDosPHumedadAN')?.value);
    }
    this.lab.addResultAnatural(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.getANatural(this.idLote);
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar A Natural',        
      })
    }});
  }

  getANatural(idLote: any){
    this.formAnatural.reset();
    this.lab.getAnatural(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          if (resp.success && resp.data.length > 0) {
            //if(resp.data[0].charolaDosPHumedad === "0.0000" && resp.data[0].charolaUnoPHumedad === "0.0000") FINCIONA DE MANERA LOCAL
            if(resp.data[0].charolaDosPHumedad === 0.0000 && resp.data[0].charolaUnoPHumedad === 0.0000){
              this.muestraDesplazamiento = false;
            }else{
              this.muestraDesplazamiento = true;
            }
            this.formAnatural.patchValue({
                desInicialAAN: resp.data[0].desInicialA,
                desInicialBAN: resp.data[0].desInicialB,
                desInicialCAN: resp.data[0].desInicialC,
                desInicialDAN: resp.data[0].desInicialD,
                desFinalAAN: resp.data[0].desFinalA,
                desFinalBAN: resp.data[0].desFinalB,
                desFinalCAN: resp.data[0].desFinalC,
                desFinalDAN: resp.data[0].desFinalD,
                desplazamientoAAN: resp.data[0].desplazamientoA,
                desplazamientoBAN: resp.data[0].desplazamientoB,
                desplazamientoCAN: resp.data[0].desplazamientoC,
                desplazamientoDAN: resp.data[0].desplazamientoD,
                promedioDesplazamientoAN: resp.data[0].promedioDesplazamiento,
                charolaUnoAN: resp.data[0].charolaUno,
                charolaUnoTaraAN: resp.data[0].charolaUnoTara,
                charolaUnoPIAN: resp.data[0].charolaUnoPI,
                charolaUnoPSUAN: resp.data[0].charolaUnoPSU,
                charolaUnoPSDAN: resp.data[0].charolaUnoPSD,
                charolaUnoPHumedadAN: resp.data[0].charolaUnoPHumedad,
                charolaDosAN: resp.data[0].charolaDos,
                charolaDosTaraAN: resp.data[0].charolaDosTara,
                charolaDosPIAN: resp.data[0].charolaDosPI,
                charolaDosPSUAN: resp.data[0].charolaDosPSU,
                charolaDosPSDAN: resp.data[0].charolaDosPSD,
                charolaDosPHumedadAN: resp.data[0].charolaDosPHumedad,
            });
            //BLOQUEA LOS CAMPOS DESPUES DE TRAER LOS DATOS
            Object.keys(this.formAnatural.controls).forEach(key => {
              this.formAnatural.get(key)?.disable();
          });
            this.registrarResultBPreliminar=true;
            this.resultAnatural=true;
            this.getBPreliminar(idLote);
            this.registrosFMPTML(idLote);
          }else {
            // Habilitar todos los campos si no hay datos
            Object.keys(this.formAnatural.controls).forEach(key => {
                this.formAnatural.get(key)?.enable();
            });
            this.registrarResultBPreliminar=false;
            this.resultAnatural=false;
          }
      },
      error: (error: any) => {
          Swal.fire({
              icon : 'error',
              title: 'Error',
              text: 'Error al obtener los resultados.',
          });
      }
    });
  }

  
  toggleDesplazamiento() {
    this.formAnatural.reset();
    this.muestraDesplazamiento = !this.muestraDesplazamiento;
    const action = this.muestraDesplazamiento ? 'enable' : 'disable';
    [
      'desFinalAAN', 'desFinalBAN', 'desFinalCAN', 'desFinalDAN',
      'desplazamientoAAN', 'desplazamientoBAN', 'desplazamientoCAN', 'desplazamientoDAN',
      'promedioDesplazamientoAN', 'charolaUnoPHumedadAN', 'charolaDosPHumedadAN'
    ].forEach(field => {
      this.formAnatural.get(field)![action]();
    });
  }

  esFormularioValido(): boolean {
    // Si muestraDesplazamiento es falso, verifica solo la validez de los campos siempre visibles
    if (!this.muestraDesplazamiento) {
      return this.formAnatural.get('desInicialAAN')!.valid &&
             this.formAnatural.get('desInicialBAN')!.valid &&
             this.formAnatural.get('desInicialCAN')!.valid &&
             this.formAnatural.get('desInicialDAN')!.valid 
    }
    // Si muestraDesplazamiento es verdadero, verifica todo el formulario
    return this.formAnatural.valid;
  }

  calcularDesplazamiento() {
    const letras = ['A', 'B', 'C', 'D'];
    let todosCalculados = true;
  
    letras.forEach(letra => {
      const inicial = this.formAnatural.get(`desInicial${letra}AN`)!.value;
      const final = this.formAnatural.get(`desFinal${letra}AN`)!.value;
  
      if (inicial != null && final != null) {
        let desplazamiento = (final - inicial).toFixed(2);
        desplazamiento = desplazamiento.replace(/(\.\d*?)0+$/, '$1');
        this.formAnatural.get(`desplazamiento${letra}AN`)!.setValue(desplazamiento);
      } else {
        todosCalculados = false;
      }
    });
  
    if (todosCalculados) {
      this.calcularPromedioDesplazamiento();
    }
  }

  calcularPromedioDesplazamiento() {
    const letras = ['A', 'B', 'C', 'D'];
    let suma = 0;
    let contador = 0;
    letras.forEach(letra => {
        const desplazamiento = parseFloat(this.formAnatural.get(`desplazamiento${letra}AN`)!.value);
        if (!isNaN(desplazamiento)) {
          suma += desplazamiento;
          contador++;
        }
    });
    if (contador === 4) { 
      let promedio = suma / contador;
       // Redondea el promedio correctamente al tercer decimal
       promedio = Math.floor((promedio * 1000) + 0.5) / 1000;
       // Convertir a string para formateo si necesario y luego convertir de vuelta a número
       promedio = parseFloat(promedio.toFixed(3));
      this.formAnatural.get('promedioDesplazamientoAN')!.setValue(promedio);
    }
  }


  calcularHumedadCharolaUno() {
    const tara = parseFloat(this.formAnatural.get('charolaUnoTaraAN')!.value);
    const pesoInicial = parseFloat(this.formAnatural.get('charolaUnoPIAN')!.value);
    const pesoSeco2 = parseFloat(this.formAnatural.get('charolaUnoPSDAN')!.value);

    if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
      const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
      this.formAnatural.get('charolaUnoPHumedadAN')!.setValue(porcentajeHumedad.toFixed(4));
    }
  }

  calcularHumedadCharolaDos() {
    const tara = parseFloat(this.formAnatural.get('charolaDosTaraAN')!.value);
    const pesoInicial = parseFloat(this.formAnatural.get('charolaDosPIAN')!.value);
    const pesoSeco2 = parseFloat(this.formAnatural.get('charolaDosPSDAN')!.value);

    if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
      const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
      this.formAnatural.get('charolaDosPHumedadAN')!.setValue(porcentajeHumedad.toFixed(4));
    }
  }





  // B PRELIMINAR

  saveformBPreliminar(){
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('orden', this.orden);
    formData.append('idUsuario', this.idUsuario);
    formData.append('ml', this.formBPreliminar.get('mlBP')?.value);
    formData.append('desInicialA', this.formBPreliminar.get('desInicialABP')?.value);  
    formData.append('desInicialB', this.formBPreliminar.get('desInicialBBP')?.value);
    formData.append('desInicialC', this.formBPreliminar.get('desInicialCBP')?.value);
    formData.append('desInicialD', this.formBPreliminar.get('desInicialDBP')?.value);
    formData.append('desFinalA', this.formBPreliminar.get('desFinalABP')?.value);
    formData.append('desFinalB', this.formBPreliminar.get('desFinalBBP')?.value);
    formData.append('desFinalC', this.formBPreliminar.get('desFinalCBP')?.value);
    formData.append('desFinalD', this.formBPreliminar.get('desFinalDBP')?.value);
    formData.append('desplazamientoA', this.formBPreliminar.get('desplazamientoABP')?.value);
    formData.append('desplazamientoB', this.formBPreliminar.get('desplazamientoBBP')?.value);
    formData.append('desplazamientoC', this.formBPreliminar.get('desplazamientoCBP')?.value);
    formData.append('desplazamientoD', this.formBPreliminar.get('desplazamientoDBP')?.value);
    formData.append('promedioDesplazamiento', this.formBPreliminar.get('promedioDesplazamientoBP')?.value);
    formData.append('charolaUno', this.formBPreliminar.get('charolaUnoBP')?.value);
    formData.append('charolaUnoTara', this.formBPreliminar.get('charolaUnoTaraBP')?.value);
    formData.append('charolaUnoPI', this.formBPreliminar.get('charolaUnoPIBP')?.value);
    formData.append('charolaUnoPSU', this.formBPreliminar.get('charolaUnoPSUBP')?.value);
    formData.append('charolaUnoPSD', this.formBPreliminar.get('charolaUnoPSDBP')?.value);
    formData.append('charolaUnoPHumedad', this.formBPreliminar.get('charolaUnoPHumedadBP')?.value);
    formData.append('charolaDos', this.formBPreliminar.get('charolaDosBP')?.value);
    formData.append('charolaDosTara', this.formBPreliminar.get('charolaDosTaraBP')?.value);
    formData.append('charolaDosPI', this.formBPreliminar.get('charolaDosPIBP')?.value);
    formData.append('charolaDosPSU', this.formBPreliminar.get('charolaDosPSUBP')?.value);
    formData.append('charolaDosPSD', this.formBPreliminar.get('charolaDosPSDBP')?.value);
    formData.append('charolaDosPHumedad', this.formBPreliminar.get('charolaDosPHumedadBP')?.value);
    this.lab.addResultBPreliminar(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.getBPreliminar(this.idLote);
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar B Preliminar',        
      })
    }});
  }


  getBPreliminar(idLote: any){
    this.formBPreliminar.reset();
    this.lab.getBPreliminar(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          if (resp.success && resp.data.length > 0) {
            this.formBPreliminar.patchValue({
                mlBP: resp.data[0].ml,
                desInicialABP: resp.data[0].desInicialA,
                desInicialBBP: resp.data[0].desInicialB,
                desInicialCBP: resp.data[0].desInicialC,
                desInicialDBP: resp.data[0].desInicialD,
                desFinalABP: resp.data[0].desFinalA,
                desFinalBBP: resp.data[0].desFinalB,
                desFinalCBP: resp.data[0].desFinalC,
                desFinalDBP: resp.data[0].desFinalD,
                desplazamientoABP: resp.data[0].desplazamientoA,
                desplazamientoBBP: resp.data[0].desplazamientoB,
                desplazamientoCBP: resp.data[0].desplazamientoC,
                desplazamientoDBP: resp.data[0].desplazamientoD,
                promedioDesplazamientoBP: resp.data[0].promedioDesplazamiento,
                charolaUnoBP: resp.data[0].charolaUno,
                charolaUnoTaraBP: resp.data[0].charolaUnoTara,
                charolaUnoPIBP: resp.data[0].charolaUnoPI,
                charolaUnoPSUBP: resp.data[0].charolaUnoPSU,
                charolaUnoPSDBP: resp.data[0].charolaUnoPSD,
                charolaUnoPHumedadBP: resp.data[0].charolaUnoPHumedad,
                charolaDosBP: resp.data[0].charolaDos,
                charolaDosTaraBP: resp.data[0].charolaDosTara,
                charolaDosPIBP: resp.data[0].charolaDosPI,
                charolaDosPSUBP: resp.data[0].charolaDosPSU,
                charolaDosPSDBP: resp.data[0].charolaDosPSD,
                charolaDosPHumedadBP: resp.data[0].charolaDosPHumedad,
            });
            //BLOQUEA LOS CAMPOS DESPUES DE TRAER LOS DATOS
            Object.keys(this.formBPreliminar.controls).forEach(key => {
            this.formBPreliminar.get(key)?.disable();
          });
            this.registrarResultCBeforeUno=true;
            this.resultBPreliminar=true;
            this.getCBefore1(idLote);
            this.registrosFMPTML(idLote);
          }else {
            // Habilitar todos los campos si no hay datos
            Object.keys(this.formBPreliminar.controls).forEach(key => {
                this.formBPreliminar.get(key)?.enable();
            });
            this.registrarResultCBeforeUno=false;
            this.resultBPreliminar=false;
          }
      },
      error: (error: any) => {
          Swal.fire({
              icon : 'error',
              title: 'Error',
              text: 'Error al obtener los resultados.',
          });
      }
    });
  }


  calcularDesplazamientoBP() {
    const letras = ['A', 'B', 'C', 'D'];
    let todosCalculados = true;
  
    letras.forEach(letra => {
      const inicial = this.formBPreliminar.get(`desInicial${letra}BP`)!.value;
      const final = this.formBPreliminar.get(`desFinal${letra}BP`)!.value;
  
      if (inicial != null && final != null) {
        let desplazamiento = (final - inicial).toFixed(2);
        desplazamiento = desplazamiento.replace(/(\.\d*?)0+$/, '$1');
        this.formBPreliminar.get(`desplazamiento${letra}BP`)!.setValue(desplazamiento);
      } else {
        todosCalculados = false;
      }
    });
  
    if (todosCalculados) {
      this.calcularPromedioDesplazamientoBP();
    }
  }

  calcularPromedioDesplazamientoBP() {
    const letras = ['A', 'B', 'C', 'D'];
    let suma = 0;
    let contador = 0;
    letras.forEach(letra => {
        const desplazamiento = parseFloat(this.formBPreliminar.get(`desplazamiento${letra}BP`)!.value);
        if (!isNaN(desplazamiento)) {
          suma += desplazamiento;
          contador++;
        }
    });
    if (contador === 4) { // Asegura que todos los desplazamientos están calculados
      let promedio = suma / contador;
       // Redondea el promedio correctamente al tercer decimal
       promedio = Math.floor((promedio * 1000) + 0.5) / 1000;
       // Convertir a string para formateo si necesario y luego convertir de vuelta a número
       promedio = parseFloat(promedio.toFixed(3));
      this.formBPreliminar.get('promedioDesplazamientoBP')!.setValue(promedio);
    }
  }


calcularHumedadCharolaUnoBP() {
  const tara = parseFloat(this.formBPreliminar.get('charolaUnoTaraBP')!.value);
  const pesoInicial = parseFloat(this.formBPreliminar.get('charolaUnoPIBP')!.value);
  const pesoSeco2 = parseFloat(this.formBPreliminar.get('charolaUnoPSDBP')!.value);

  if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
    const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
    this.formBPreliminar.get('charolaUnoPHumedadBP')!.setValue(porcentajeHumedad.toFixed(4));
  }
}

calcularHumedadCharolaDosBP() {
  const tara = parseFloat(this.formBPreliminar.get('charolaDosTaraBP')!.value);
  const pesoInicial = parseFloat(this.formBPreliminar.get('charolaDosPIBP')!.value);
  const pesoSeco2 = parseFloat(this.formBPreliminar.get('charolaDosPSDBP')!.value);

  if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
    const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
    this.formBPreliminar.get('charolaDosPHumedadBP')!.setValue(porcentajeHumedad.toFixed(4));
  }
}



  // C Before 1

  saveformCBeforeUno(){
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('orden', this.orden);
    formData.append('idUsuario', this.idUsuario);
    formData.append('ml', this.formCBeforeUno.get('mlC1')?.value);
    formData.append('desInicialA', this.formCBeforeUno.get('desInicialAC1')?.value);  
    formData.append('desInicialB', this.formCBeforeUno.get('desInicialBC1')?.value);
    formData.append('desInicialC', this.formCBeforeUno.get('desInicialCC1')?.value);
    formData.append('desInicialD', this.formCBeforeUno.get('desInicialDC1')?.value);
    formData.append('desFinalA', this.formCBeforeUno.get('desFinalAC1')?.value);
    formData.append('desFinalB', this.formCBeforeUno.get('desFinalBC1')?.value);
    formData.append('desFinalC', this.formCBeforeUno.get('desFinalCC1')?.value);
    formData.append('desFinalD', this.formCBeforeUno.get('desFinalDC1')?.value);
    formData.append('desplazamientoA', this.formCBeforeUno.get('desplazamientoAC1')?.value);
    formData.append('desplazamientoB', this.formCBeforeUno.get('desplazamientoBC1')?.value);
    formData.append('desplazamientoC', this.formCBeforeUno.get('desplazamientoCC1')?.value);
    formData.append('desplazamientoD', this.formCBeforeUno.get('desplazamientoDC1')?.value);
    formData.append('promedioDesplazamiento', this.formCBeforeUno.get('promedioDesplazamientoC1')?.value);
    formData.append('charolaUno', this.formCBeforeUno.get('charolaUnoC1')?.value);
    formData.append('charolaUnoTara', this.formCBeforeUno.get('charolaUnoTaraC1')?.value);
    formData.append('charolaUnoPI', this.formCBeforeUno.get('charolaUnoPIC1')?.value);
    formData.append('charolaUnoPSU', this.formCBeforeUno.get('charolaUnoPSUC1')?.value);
    formData.append('charolaUnoPSD', this.formCBeforeUno.get('charolaUnoPSDC1')?.value);
    formData.append('charolaUnoPHumedad', this.formCBeforeUno.get('charolaUnoPHumedadC1')?.value);
    formData.append('charolaDos', this.formCBeforeUno.get('charolaDosC1')?.value);
    formData.append('charolaDosTara', this.formCBeforeUno.get('charolaDosTaraC1')?.value);
    formData.append('charolaDosPI', this.formCBeforeUno.get('charolaDosPIC1')?.value);
    formData.append('charolaDosPSU', this.formCBeforeUno.get('charolaDosPSUC1')?.value);
    formData.append('charolaDosPSD', this.formCBeforeUno.get('charolaDosPSDC1')?.value);
    formData.append('charolaDosPHumedad', this.formCBeforeUno.get('charolaDosPHumedadC1')?.value);
    this.lab.addResultCBeforeUno(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.getCBefore1(this.idLote);
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar B Preliminar',        
      })
    }});
  }
  
  
  getCBefore1(idLote: any){
    this.formCBeforeUno.reset();
    this.lab.getCBeforeUno(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          if (resp.success && resp.data.length > 0) {
            this.formCBeforeUno.patchValue({
                mlC1: resp.data[0].ml,
                desInicialAC1: resp.data[0].desInicialA,
                desInicialBC1: resp.data[0].desInicialB,
                desInicialCC1: resp.data[0].desInicialC,
                desInicialDC1: resp.data[0].desInicialD,
                desFinalAC1: resp.data[0].desFinalA,
                desFinalBC1: resp.data[0].desFinalB,
                desFinalCC1: resp.data[0].desFinalC,
                desFinalDC1: resp.data[0].desFinalD,
                desplazamientoAC1: resp.data[0].desplazamientoA,
                desplazamientoBC1: resp.data[0].desplazamientoB,
                desplazamientoCC1: resp.data[0].desplazamientoC,
                desplazamientoDC1: resp.data[0].desplazamientoD,
                promedioDesplazamientoC1: resp.data[0].promedioDesplazamiento,
                charolaUnoC1: resp.data[0].charolaUno,
                charolaUnoTaraC1: resp.data[0].charolaUnoTara,
                charolaUnoPIC1: resp.data[0].charolaUnoPI,
                charolaUnoPSUC1: resp.data[0].charolaUnoPSU,
                charolaUnoPSDC1: resp.data[0].charolaUnoPSD,
                charolaUnoPHumedadC1: resp.data[0].charolaUnoPHumedad,
                charolaDosC1: resp.data[0].charolaDos,
                charolaDosTaraC1: resp.data[0].charolaDosTara,
                charolaDosPIC1: resp.data[0].charolaDosPI,
                charolaDosPSUC1: resp.data[0].charolaDosPSU,
                charolaDosPSDC1: resp.data[0].charolaDosPSD,
                charolaDosPHumedadC1: resp.data[0].charolaDosPHumedad,
            });
            //BLOQUEA LOS CAMPOS DESPUES DE TRAER LOS DATOS
            Object.keys(this.formCBeforeUno.controls).forEach(key => {
            this.formCBeforeUno.get(key)?.disable();
          });
            this.registrarResultCBeforeDos=true;
            this.resultCBeforeUno=true;
            this.getCBefore2(idLote);
            this.registrosFMPTML(idLote);
          }else {
            // Habilitar todos los campos si no hay datos
            Object.keys(this.formCBeforeUno.controls).forEach(key => {
                this.formCBeforeUno.get(key)?.enable();
            });
            this.registrarResultCBeforeDos=false;
            this.resultCBeforeUno=false;
          }
      },
      error: (error: any) => {
          Swal.fire({
              icon : 'error',
              title: 'Error',
              text: 'Error al obtener los resultados.',
          });
      }
    });
  }
  
  
  calcularDesplazamientoC1() {
    const letras = ['A', 'B', 'C', 'D'];
    let todosCalculados = true;
  
    letras.forEach(letra => {
      const inicial = this.formCBeforeUno.get(`desInicial${letra}C1`)!.value;
      const final = this.formCBeforeUno.get(`desFinal${letra}C1`)!.value;
  
      if (inicial != null && final != null) {
        let desplazamiento = (final - inicial).toFixed(2);
        desplazamiento = desplazamiento.replace(/(\.\d*?)0+$/, '$1');
        this.formCBeforeUno.get(`desplazamiento${letra}C1`)!.setValue(desplazamiento);
      } else {
        todosCalculados = false;
      }
    });
  
    if (todosCalculados) {
      this.calcularPromedioDesplazamientoC1();
    }
  }
  
  calcularPromedioDesplazamientoC1() {
    const letras = ['A', 'B', 'C', 'D'];
    let suma = 0;
    let contador = 0;
    letras.forEach(letra => {
        const desplazamiento = parseFloat(this.formCBeforeUno.get(`desplazamiento${letra}C1`)!.value);
        if (!isNaN(desplazamiento)) {
          suma += desplazamiento;
          contador++;
        }
    });
    if (contador === 4) { // Asegura que todos los desplazamientos están calculados
      let promedio = suma / contador;
       // Redondea el promedio correctamente al tercer decimal
       promedio = Math.floor((promedio * 1000) + 0.5) / 1000;
       // Convertir a string para formateo si necesario y luego convertir de vuelta a número
       promedio = parseFloat(promedio.toFixed(3));
      this.formCBeforeUno.get('promedioDesplazamientoC1')!.setValue(promedio);
    }
  }
  
  
  calcularHumedadCharolaUnoC1() {
    const tara = parseFloat(this.formCBeforeUno.get('charolaUnoTaraC1')!.value);
    const pesoInicial = parseFloat(this.formCBeforeUno.get('charolaUnoPIC1')!.value);
    const pesoSeco2 = parseFloat(this.formCBeforeUno.get('charolaUnoPSDC1')!.value);
    
    if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
      const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
      this.formCBeforeUno.get('charolaUnoPHumedadC1')!.setValue(porcentajeHumedad.toFixed(4));
    }
  }
  
  calcularHumedadCharolaDosC1() {
    const tara = parseFloat(this.formCBeforeUno.get('charolaDosTaraC1')!.value);
    const pesoInicial = parseFloat(this.formCBeforeUno.get('charolaDosPIC1')!.value);
    const pesoSeco2 = parseFloat(this.formCBeforeUno.get('charolaDosPSDC1')!.value);
    
    if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
      const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
      this.formCBeforeUno.get('charolaDosPHumedadC1')!.setValue(porcentajeHumedad.toFixed(4));
    }
  }


  // C Before 2

  saveformCBeforeDos(){
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('orden', this.orden);
    formData.append('idUsuario', this.idUsuario);
    formData.append('ml', this.formCBeforeDos.get('mlC2')?.value);
    formData.append('desInicialA', this.formCBeforeDos.get('desInicialAC2')?.value);  
    formData.append('desInicialB', this.formCBeforeDos.get('desInicialBC2')?.value);
    formData.append('desInicialC', this.formCBeforeDos.get('desInicialCC2')?.value);
    formData.append('desInicialD', this.formCBeforeDos.get('desInicialDC2')?.value);
    formData.append('desFinalA', this.formCBeforeDos.get('desFinalAC2')?.value);
    formData.append('desFinalB', this.formCBeforeDos.get('desFinalBC2')?.value);
    formData.append('desFinalC', this.formCBeforeDos.get('desFinalCC2')?.value);
    formData.append('desFinalD', this.formCBeforeDos.get('desFinalDC2')?.value);
    formData.append('desplazamientoA', this.formCBeforeDos.get('desplazamientoAC2')?.value);
    formData.append('desplazamientoB', this.formCBeforeDos.get('desplazamientoBC2')?.value);
    formData.append('desplazamientoC', this.formCBeforeDos.get('desplazamientoCC2')?.value);
    formData.append('desplazamientoD', this.formCBeforeDos.get('desplazamientoDC2')?.value);
    formData.append('promedioDesplazamiento', this.formCBeforeDos.get('promedioDesplazamientoC2')?.value);
    formData.append('charolaUno', this.formCBeforeDos.get('charolaUnoC2')?.value);
    formData.append('charolaUnoTara', this.formCBeforeDos.get('charolaUnoTaraC2')?.value);
    formData.append('charolaUnoPI', this.formCBeforeDos.get('charolaUnoPIC2')?.value);
    formData.append('charolaUnoPSU', this.formCBeforeDos.get('charolaUnoPSUC2')?.value);
    formData.append('charolaUnoPSD', this.formCBeforeDos.get('charolaUnoPSDC2')?.value);
    formData.append('charolaUnoPHumedad', this.formCBeforeDos.get('charolaUnoPHumedadC2')?.value);
    formData.append('charolaDos', this.formCBeforeDos.get('charolaDosC2')?.value);
    formData.append('charolaDosTara', this.formCBeforeDos.get('charolaDosTaraC2')?.value);
    formData.append('charolaDosPI', this.formCBeforeDos.get('charolaDosPIC2')?.value);
    formData.append('charolaDosPSU', this.formCBeforeDos.get('charolaDosPSUC2')?.value);
    formData.append('charolaDosPSD', this.formCBeforeDos.get('charolaDosPSDC2')?.value);
    formData.append('charolaDosPHumedad', this.formCBeforeDos.get('charolaDosPHumedadC2')?.value);
    this.lab.addResultCBeforeDos(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.getCBefore2(this.idLote);
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar B Preliminar',        
      })
    }});
  }


  getCBefore2(idLote: any){
    this.formCBeforeDos.reset();
    this.lab.getCBeforeDos(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          if (resp.success && resp.data.length > 0) {
            this.formCBeforeDos.patchValue({
                mlC2: resp.data[0].ml,
                desInicialAC2: resp.data[0].desInicialA,
                desInicialBC2: resp.data[0].desInicialB,
                desInicialCC2: resp.data[0].desInicialC,
                desInicialDC2: resp.data[0].desInicialD,
                desFinalAC2: resp.data[0].desFinalA,
                desFinalBC2: resp.data[0].desFinalB,
                desFinalCC2: resp.data[0].desFinalC,
                desFinalDC2: resp.data[0].desFinalD,
                desplazamientoAC2: resp.data[0].desplazamientoA,
                desplazamientoBC2: resp.data[0].desplazamientoB,
                desplazamientoCC2: resp.data[0].desplazamientoC,
                desplazamientoDC2: resp.data[0].desplazamientoD,
                promedioDesplazamientoC2: resp.data[0].promedioDesplazamiento,
                charolaUnoC2: resp.data[0].charolaUno,
                charolaUnoTaraC2: resp.data[0].charolaUnoTara,
                charolaUnoPIC2: resp.data[0].charolaUnoPI,
                charolaUnoPSUC2: resp.data[0].charolaUnoPSU,
                charolaUnoPSDC2: resp.data[0].charolaUnoPSD,
                charolaUnoPHumedadC2: resp.data[0].charolaUnoPHumedad,
                charolaDosC2: resp.data[0].charolaDos,
                charolaDosTaraC2: resp.data[0].charolaDosTara,
                charolaDosPIC2: resp.data[0].charolaDosPI,
                charolaDosPSUC2: resp.data[0].charolaDosPSU,
                charolaDosPSDC2: resp.data[0].charolaDosPSD,
                charolaDosPHumedadC2: resp.data[0].charolaDosPHumedad,
            });
            //BLOQUEA LOS CAMPOS DESPUES DE TRAER LOS DATOS
            Object.keys(this.formCBeforeDos.controls).forEach(key => {
              this.formCBeforeDos.get(key)?.disable();
          });
            this.registrarResultDAboveUno=true;
            this.resultCBeforeDos=true;
            this.getDAbove1(this.idLote);
            this.registrosFMPTML(idLote);
          }else {
            // Habilitar todos los campos si no hay datos
            Object.keys(this.formCBeforeDos.controls).forEach(key => {
                this.formCBeforeDos.get(key)?.enable();
            });
            this.registrarResultDAboveUno=false;
            this.resultCBeforeDos=false;
          }
      },
      error: (error: any) => {
          Swal.fire({
              icon : 'error',
              title: 'Error',
              text: 'Error al obtener los resultados.',
          });
      }
    });
  }

  calcularDesplazamientoC2() {
    const letras = ['A', 'B', 'C', 'D'];
    let todosCalculados = true;

    letras.forEach(letra => {
      const inicial = this.formCBeforeDos.get(`desInicial${letra}C2`)!.value;
      const final = this.formCBeforeDos.get(`desFinal${letra}C2`)!.value;

      if (inicial != null && final != null) {
        let desplazamiento = (final - inicial).toFixed(2);
        desplazamiento = desplazamiento.replace(/(\.\d*?)0+$/, '$1');
        this.formCBeforeDos.get(`desplazamiento${letra}C2`)!.setValue(desplazamiento);
      } else {
        todosCalculados = false;
      }
    });

    if (todosCalculados) {
      this.calcularPromedioDesplazamientoC2();
    }
  }

  calcularPromedioDesplazamientoC2() {
    const letras = ['A', 'B', 'C', 'D'];
    let suma = 0;
    let contador = 0;
    letras.forEach(letra => {
        const desplazamiento = parseFloat(this.formCBeforeDos.get(`desplazamiento${letra}C2`)!.value);
        if (!isNaN(desplazamiento)) {
          suma += desplazamiento;
          contador++;
        }
    });
    if (contador === 4) { // Asegura que todos los desplazamientos están calculados
      let promedio = suma / contador;
      // Redondea el promedio correctamente al tercer decimal
      promedio = Math.floor((promedio * 1000) + 0.5) / 1000;
      // Convertir a string para formateo si necesario y luego convertir de vuelta a número
      promedio = parseFloat(promedio.toFixed(3));
      this.formCBeforeDos.get('promedioDesplazamientoC2')!.setValue(promedio);
    }
  }


  calcularHumedadCharolaUnoC2() {
    const tara = parseFloat(this.formCBeforeDos.get('charolaUnoTaraC2')!.value);
    const pesoInicial = parseFloat(this.formCBeforeDos.get('charolaUnoPIC2')!.value);
    const pesoSeco2 = parseFloat(this.formCBeforeDos.get('charolaUnoPSDC2')!.value);

    if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
      const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
      this.formCBeforeDos.get('charolaUnoPHumedadC2')!.setValue(porcentajeHumedad.toFixed(4));
    }  
  }

  calcularHumedadCharolaDosC2() {
    const tara = parseFloat(this.formCBeforeDos.get('charolaDosTaraC2')!.value);
    const pesoInicial = parseFloat(this.formCBeforeDos.get('charolaDosPIC2')!.value);
    const pesoSeco2 = parseFloat(this.formCBeforeDos.get('charolaDosPSDC2')!.value);

    if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
      const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
      this.formCBeforeDos.get('charolaDosPHumedadC2')!.setValue(porcentajeHumedad.toFixed(4));
    }
  }



    // D ABOVE 1

    saveformDAboveUno(){
      const formData = new FormData();
      formData.append('idLote', this.idLote);
      formData.append('orden', this.orden);
      formData.append('idUsuario', this.idUsuario);
      formData.append('ml', this.formDAboveUno.get('mlD1')?.value);
      formData.append('desInicialA', this.formDAboveUno.get('desInicialAD1')?.value);  
      formData.append('desInicialB', this.formDAboveUno.get('desInicialBD1')?.value);
      formData.append('desInicialC', this.formDAboveUno.get('desInicialCD1')?.value);
      formData.append('desInicialD', this.formDAboveUno.get('desInicialDD1')?.value);
      formData.append('desFinalA', this.formDAboveUno.get('desFinalAD1')?.value);
      formData.append('desFinalB', this.formDAboveUno.get('desFinalBD1')?.value);
      formData.append('desFinalC', this.formDAboveUno.get('desFinalCD1')?.value);
      formData.append('desFinalD', this.formDAboveUno.get('desFinalDD1')?.value);
      formData.append('desplazamientoA', this.formDAboveUno.get('desplazamientoAD1')?.value);
      formData.append('desplazamientoB', this.formDAboveUno.get('desplazamientoBD1')?.value);
      formData.append('desplazamientoC', this.formDAboveUno.get('desplazamientoCD1')?.value);
      formData.append('desplazamientoD', this.formDAboveUno.get('desplazamientoDD1')?.value);
      formData.append('promedioDesplazamiento', this.formDAboveUno.get('promedioDesplazamientoD1')?.value);
      formData.append('charolaUno', this.formDAboveUno.get('charolaUnoD1')?.value);
      formData.append('charolaUnoTara', this.formDAboveUno.get('charolaUnoTaraD1')?.value);
      formData.append('charolaUnoPI', this.formDAboveUno.get('charolaUnoPID1')?.value);
      formData.append('charolaUnoPSU', this.formDAboveUno.get('charolaUnoPSUD1')?.value);
      formData.append('charolaUnoPSD', this.formDAboveUno.get('charolaUnoPSDD1')?.value);
      formData.append('charolaUnoPHumedad', this.formDAboveUno.get('charolaUnoPHumedadD1')?.value);
      formData.append('charolaDos', this.formDAboveUno.get('charolaDosD1')?.value);
      formData.append('charolaDosTara', this.formDAboveUno.get('charolaDosTaraD1')?.value);
      formData.append('charolaDosPI', this.formDAboveUno.get('charolaDosPID1')?.value);
      formData.append('charolaDosPSU', this.formDAboveUno.get('charolaDosPSUD1')?.value);
      formData.append('charolaDosPSD', this.formDAboveUno.get('charolaDosPSDD1')?.value);
      formData.append('charolaDosPHumedad', this.formDAboveUno.get('charolaDosPHumedadD1')?.value);
      this.lab.addResultDAboveUno(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.getDAbove1(this.idLote);
      }, error: (error: any) => {
        Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar B Preliminar',        
      })
       }});
    }
  
  
    getDAbove1(idLote: any){
      this.formDAboveUno.reset();
      this.lab.getDAboveUno(idLote).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp: any) => {
            if (resp.success && resp.data.length > 0) {
              this.formDAboveUno.patchValue({
                  mlD1: resp.data[0].ml,
                  desInicialAD1: resp.data[0].desInicialA,
                  desInicialBD1: resp.data[0].desInicialB,
                  desInicialCD1: resp.data[0].desInicialC,
                  desInicialDD1: resp.data[0].desInicialD,
                  desFinalAD1: resp.data[0].desFinalA,
                  desFinalBD1: resp.data[0].desFinalB,
                  desFinalCD1: resp.data[0].desFinalC,
                  desFinalDD1: resp.data[0].desFinalD,
                  desplazamientoAD1: resp.data[0].desplazamientoA,
                  desplazamientoBD1: resp.data[0].desplazamientoB,
                  desplazamientoCD1: resp.data[0].desplazamientoC,
                  desplazamientoDD1: resp.data[0].desplazamientoD,
                  promedioDesplazamientoD1: resp.data[0].promedioDesplazamiento,
                  charolaUnoD1: resp.data[0].charolaUno,
                  charolaUnoTaraD1: resp.data[0].charolaUnoTara,
                  charolaUnoPID1: resp.data[0].charolaUnoPI,
                  charolaUnoPSUD1: resp.data[0].charolaUnoPSU,
                  charolaUnoPSDD1: resp.data[0].charolaUnoPSD,
                  charolaUnoPHumedadD1: resp.data[0].charolaUnoPHumedad,
                  charolaDosD1: resp.data[0].charolaDos,
                  charolaDosTaraD1: resp.data[0].charolaDosTara,
                  charolaDosPID1: resp.data[0].charolaDosPI,
                  charolaDosPSUD1: resp.data[0].charolaDosPSU,
                  charolaDosPSDD1: resp.data[0].charolaDosPSD,
                  charolaDosPHumedadD1: resp.data[0].charolaDosPHumedad,
              });
              //BLOQUEA LOS CAMPOS DESPUES DE TRAER LOS DATOS
              Object.keys(this.formDAboveUno.controls).forEach(key => {
                this.formDAboveUno.get(key)?.disable();
            });
              this.registrarResultDAboveDos=true;
              this.resultDAboveUno=true;
              this.getDAbove2(this.idLote);
              this.registrosFMPTML(idLote);
              
            }else {
              // Habilitar todos los campos si no hay datos
              Object.keys(this.formDAboveUno.controls).forEach(key => {
                  this.formDAboveUno.get(key)?.enable();
              });
              this.registrarResultDAboveDos=false;
              this.resultDAboveUno=false;
            }
        },
        error: (error: any) => {
            Swal.fire({
                icon : 'error',
                title: 'Error',
                text: 'Error al obtener los resultados.',
            });
        }
      });
    }
  
    calcularDesplazamientoD1() {
      const letras = ['A', 'B', 'C', 'D'];
      let todosCalculados = true;
  
      letras.forEach(letra => {
        const inicial = this.formDAboveUno.get(`desInicial${letra}D1`)!.value;
        const final = this.formDAboveUno.get(`desFinal${letra}D1`)!.value;
  
        if (inicial != null && final != null) {
          let desplazamiento = (final - inicial).toFixed(2);
          desplazamiento = desplazamiento.replace(/(\.\d*?)0+$/, '$1');
          this.formDAboveUno.get(`desplazamiento${letra}D1`)!.setValue(desplazamiento);
        } else {
          todosCalculados = false;
        }
      });
  
      if (todosCalculados) {
        this.calcularPromedioDesplazamientoD1();
      }
    }
  
    calcularPromedioDesplazamientoD1() {
      const letras = ['A', 'B', 'C', 'D'];
      let suma = 0;
      let contador = 0;
      letras.forEach(letra => {
          const desplazamiento = parseFloat(this.formDAboveUno.get(`desplazamiento${letra}D1`)!.value);
          if (!isNaN(desplazamiento)) {
            suma += desplazamiento;
            contador++;
          }
      });
      if (contador === 4) { // Asegura que todos los desplazamientos están calculados
        let promedio = suma / contador;
        // Redondea el promedio correctamente al tercer decimal
        promedio = Math.floor((promedio * 1000) + 0.5) / 1000;
        // Convertir a string para formateo si necesario y luego convertir de vuelta a número
        promedio = parseFloat(promedio.toFixed(3));
        this.formDAboveUno.get('promedioDesplazamientoD1')!.setValue(promedio);
      }
    }
  
  
    calcularHumedadCharolaUnoD1() {
      const tara = parseFloat(this.formDAboveUno.get('charolaUnoTaraD1')!.value);
      const pesoInicial = parseFloat(this.formDAboveUno.get('charolaUnoPID1')!.value);
      const pesoSeco2 = parseFloat(this.formDAboveUno.get('charolaUnoPSDD1')!.value);
  
      if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
        const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
        this.formDAboveUno.get('charolaUnoPHumedadD1')!.setValue(porcentajeHumedad.toFixed(4));
      }  
    }
  
    calcularHumedadCharolaDosD1() {
      const tara = parseFloat(this.formDAboveUno.get('charolaDosTaraD1')!.value);
      const pesoInicial = parseFloat(this.formDAboveUno.get('charolaDosPID1')!.value);
      const pesoSeco2 = parseFloat(this.formDAboveUno.get('charolaDosPSDD1')!.value);
  
      if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
        const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
        this.formDAboveUno.get('charolaDosPHumedadD1')!.setValue(porcentajeHumedad.toFixed(4));
      }
    }
  

   // D ABOVE 2

   saveformDAboveDos(){
    const formData = new FormData();
    formData.append('idLote', this.idLote);
    formData.append('orden', this.orden);
    formData.append('idUsuario', this.idUsuario);
    formData.append('ml', this.formDAboveDos.get('mlD2')?.value);
    formData.append('desInicialA', this.formDAboveDos.get('desInicialAD2')?.value);  
    formData.append('desInicialB', this.formDAboveDos.get('desInicialBD2')?.value);
    formData.append('desInicialC', this.formDAboveDos.get('desInicialCD2')?.value);
    formData.append('desInicialD', this.formDAboveDos.get('desInicialDD2')?.value);
    formData.append('desFinalA', this.formDAboveDos.get('desFinalAD2')?.value);
    formData.append('desFinalB', this.formDAboveDos.get('desFinalBD2')?.value);
    formData.append('desFinalC', this.formDAboveDos.get('desFinalCD2')?.value);
    formData.append('desFinalD', this.formDAboveDos.get('desFinalDD2')?.value);
    formData.append('desplazamientoA', this.formDAboveDos.get('desplazamientoAD2')?.value);
    formData.append('desplazamientoB', this.formDAboveDos.get('desplazamientoBD2')?.value);
    formData.append('desplazamientoC', this.formDAboveDos.get('desplazamientoCD2')?.value);
    formData.append('desplazamientoD', this.formDAboveDos.get('desplazamientoDD2')?.value);
    formData.append('promedioDesplazamiento', this.formDAboveDos.get('promedioDesplazamientoD2')?.value);
    formData.append('charolaUno', this.formDAboveDos.get('charolaUnoD2')?.value);
    formData.append('charolaUnoTara', this.formDAboveDos.get('charolaUnoTaraD2')?.value);
    formData.append('charolaUnoPI', this.formDAboveDos.get('charolaUnoPID2')?.value);
    formData.append('charolaUnoPSU', this.formDAboveDos.get('charolaUnoPSUD2')?.value);
    formData.append('charolaUnoPSD', this.formDAboveDos.get('charolaUnoPSDD2')?.value);
    formData.append('charolaUnoPHumedad', this.formDAboveDos.get('charolaUnoPHumedadD2')?.value);
    formData.append('charolaDos', this.formDAboveDos.get('charolaDosD2')?.value);
    formData.append('charolaDosTara', this.formDAboveDos.get('charolaDosTaraD2')?.value);
    formData.append('charolaDosPI', this.formDAboveDos.get('charolaDosPID2')?.value);
    formData.append('charolaDosPSU', this.formDAboveDos.get('charolaDosPSUD2')?.value);
    formData.append('charolaDosPSD', this.formDAboveDos.get('charolaDosPSDD2')?.value);
    formData.append('charolaDosPHumedad', this.formDAboveDos.get('charolaDosPHumedadD2')?.value);
    this.lab.addResultDAboveDos(formData).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.getDAbove2(this.idLote);
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al ingresar B Preliminar',        
      })
    }});
  }


  getDAbove2(idLote: any){
    this.formDAboveDos.reset();
    this.lab.getDAboveDos(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          if (resp.success && resp.data.length > 0) {
            this.formDAboveDos.patchValue({
                mlD2: resp.data[0].ml,
                desInicialAD2: resp.data[0].desInicialA,
                desInicialBD2: resp.data[0].desInicialB,
                desInicialCD2: resp.data[0].desInicialC,
                desInicialDD2: resp.data[0].desInicialD,
                desFinalAD2: resp.data[0].desFinalA,
                desFinalBD2: resp.data[0].desFinalB,
                desFinalCD2: resp.data[0].desFinalC,
                desFinalDD2: resp.data[0].desFinalD,
                desplazamientoAD2: resp.data[0].desplazamientoA,
                desplazamientoBD2: resp.data[0].desplazamientoB,
                desplazamientoCD2: resp.data[0].desplazamientoC,
                desplazamientoDD2: resp.data[0].desplazamientoD,
                promedioDesplazamientoD2: resp.data[0].promedioDesplazamiento,
                charolaUnoD2: resp.data[0].charolaUno,
                charolaUnoTaraD2: resp.data[0].charolaUnoTara,
                charolaUnoPID2: resp.data[0].charolaUnoPI,
                charolaUnoPSUD2: resp.data[0].charolaUnoPSU,
                charolaUnoPSDD2: resp.data[0].charolaUnoPSD,
                charolaUnoPHumedadD2: resp.data[0].charolaUnoPHumedad,
                charolaDosD2: resp.data[0].charolaDos,
                charolaDosTaraD2: resp.data[0].charolaDosTara,
                charolaDosPID2: resp.data[0].charolaDosPI,
                charolaDosPSUD2: resp.data[0].charolaDosPSU,
                charolaDosPSDD2: resp.data[0].charolaDosPSD,
                charolaDosPHumedadD2: resp.data[0].charolaDosPHumedad,
            });
            //BLOQUEA LOS CAMPOS DESPUES DE TRAER LOS DATOS
            Object.keys(this.formDAboveDos.controls).forEach(key => {
              this.formDAboveDos.get(key)?.disable();
          });
            this.resulDAboveDos=true;
            this.getFMPTML(idLote);
            this.registrosFMPTML(idLote);
          }else {
            // Habilitar todos los campos si no hay datos
            Object.keys(this.formDAboveDos.controls).forEach(key => {
                this.formDAboveDos.get(key)?.enable();
            });
            this.resulDAboveDos=false;
          }
      },
      error: (error: any) => {
          Swal.fire({
              icon : 'error',
              title: 'Error',
              text: 'Error al obtener los resultados.',
          });
      }
    });
  }

  calcularDesplazamientoD2() {
    const letras = ['A', 'B', 'C', 'D'];
    let todosCalculados = true;

    letras.forEach(letra => {
      const inicial = this.formDAboveDos.get(`desInicial${letra}D2`)!.value;
      const final = this.formDAboveDos.get(`desFinal${letra}D2`)!.value;

      if (inicial != null && final != null) {
        let desplazamiento = (final - inicial).toFixed(2);
        desplazamiento = desplazamiento.replace(/(\.\d*?)0+$/, '$1');
        this.formDAboveDos.get(`desplazamiento${letra}D2`)!.setValue(desplazamiento);
      } else {
        todosCalculados = false;
      }
    });

    if (todosCalculados) {
      this.calcularPromedioDesplazamientoD2();
    }
  }

  calcularPromedioDesplazamientoD2() {
    const letras = ['A', 'B', 'C', 'D'];
    let suma = 0;
    let contador = 0;
    letras.forEach(letra => {
        const desplazamiento = parseFloat(this.formDAboveDos.get(`desplazamiento${letra}D2`)!.value);
        if (!isNaN(desplazamiento)) {
          suma += desplazamiento;
          contador++;
        }
    });
    if (contador === 4) { // Asegura que todos los desplazamientos están calculados
      let promedio = suma / contador;
      // Redondea el promedio correctamente al tercer decimal
      promedio = Math.floor((promedio * 1000) + 0.5) / 1000;
      // Convertir a string para formateo si necesario y luego convertir de vuelta a número
      promedio = parseFloat(promedio.toFixed(3));
      this.formDAboveDos.get('promedioDesplazamientoD2')!.setValue(promedio);
    }
  }


  calcularHumedadCharolaUnoD2() {
    const tara = parseFloat(this.formDAboveDos.get('charolaUnoTaraD2')!.value);
    const pesoInicial = parseFloat(this.formDAboveDos.get('charolaUnoPID2')!.value);
    const pesoSeco2 = parseFloat(this.formDAboveDos.get('charolaUnoPSDD2')!.value);

    if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
      const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
      this.formDAboveDos.get('charolaUnoPHumedadD2')!.setValue(porcentajeHumedad.toFixed(4));
    }  
  }

  calcularHumedadCharolaDosD2() {
    const tara = parseFloat(this.formDAboveDos.get('charolaDosTaraD2')!.value);
    const pesoInicial = parseFloat(this.formDAboveDos.get('charolaDosPID2')!.value);
    const pesoSeco2 = parseFloat(this.formDAboveDos.get('charolaDosPSDD2')!.value);

    if (!isNaN(tara) && !isNaN(pesoInicial) && !isNaN(pesoSeco2) && pesoInicial !== 0) {
      const porcentajeHumedad = (((tara + pesoInicial) - pesoSeco2) / pesoInicial) * 100;
      this.formDAboveDos.get('charolaDosPHumedadD2')!.setValue(porcentajeHumedad.toFixed(4));
    }
  }

  getFMPTML(idLote:any){
    this.lab.getFMPTML(idLote).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.resultadosFMPTML = resp; 
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error obtener los resultados FPM y TML',        
      })
    }});

  }

  registrosFMPTML(idLote: any) {
    this.lab.getDatosFMPTML(idLote).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
          if (resp['inicioresultimo'].success) {
              this.nombreMuestra = resp['inicioresultimo'].data[0].nombre;
              this.fechaMuestra = resp['inicioresultimo'].data[0].fecha;
              this.inicioresultimoSuccess=true;
          }else{this.inicioresultimoSuccess=false;}
          if (resp['anatural'].success) {
              this.nombreaAnatural = resp['anatural'].data[0].nombre;
              this.fechaAnatural = resp['anatural'].data[0].fecha;
              this.anaturalSuccess=true;
          }else{this.anaturalSuccess=false;}
          if (resp['preliminar'].success) {
            this.nombrePreliminar = resp['preliminar'].data[0].nombre;
            this.fechaPreliminar = resp['preliminar'].data[0].fecha;
            this.preliminarSuccess=true;
        }else{this.preliminarSuccess=false;}
          if (resp['cjustbeforeuno'].success) {
              this.nombreCJustbeforeuno = resp['cjustbeforeuno'].data[0].nombre;
              this.fechaCJustbeforeuno = resp['cjustbeforeuno'].data[0].fecha;
              this.cjustbeforeunoSuccess=true;
          }else{this.cjustbeforeunoSuccess=false;}
          if (resp['cjustbeforedos'].success) {
              this.nombreCJustbeforedos = resp['cjustbeforedos'].data[0].nombre;
              this.fechaCJustbeforedos = resp['cjustbeforedos'].data[0].fecha;
              this.cjustbeforedosSuccess=true;
          }else{this.cjustbeforedosSuccess=false;}
          if (resp['djustaboveuno'].success) {
              this.nombreDJustaboveuno = resp['djustaboveuno'].data[0].nombre;
              this.fechaDJustaboveuno = resp['djustaboveuno'].data[0].fecha;
              this.djustaboveunoSuccess=true;
          }else{this.djustaboveunoSuccess=false;}
          if (resp['djustabovedos'].success) {
              this.nombreDJustabovedos = resp['djustabovedos'].data[0].nombre;
              this.fechaDJustabovedos = resp['djustabovedos'].data[0].fecha;
              this.djustabovedosSuccess=true;
          }else{this.djustabovedosSuccess=false;}
          // Puedes agregar más condiciones para otras tablas si es necesario.
      },
      error: (error: any) => {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error al obtener los registros',
          });
      }
    });
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
}

