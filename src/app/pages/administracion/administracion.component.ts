import { Component, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AdmninistracionService } from 'src/app/services/admninistracion.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-administracion',
    templateUrl: './administracion.component.html',
    styleUrls: ['./administracion.component.css'],
    standalone: false
})
export class AdministracionComponent {
@ViewChild( DataTableDirective, {static : false})
dtOptionsUsuario: DataTables.Settings = {};
dtOptionsCalse: DataTables.Settings = {};
dtOptionsListarCambios: DataTables.Settings = {};
dtOptionsAutorizar: DataTables.Settings = {};
dtOptionsCliente: DataTables.Settings = {};
dtTriggerUsuario: Subject<any> = new Subject<any>();
dtTrigger: Subject<any> = new Subject<any>();
destroy$: Subject<void> = new Subject<void>();
frmSaveUsuario !: FormGroup;
frmEdit!: FormGroup;
idUsuario:any;
nombreUsuario:any;
apellido: any;
cargo: any;
correo: any;
activeButton!: string;
activeDiv: string = 'nominacion';
usuarios:any;
usuario:any;
usuarioSelected!: string;
cargos: any;
isUserActive!: boolean;
actionText!: string;
listadoCambios: any[] =[];
listadoAutorizaciones: any[] =[];
listadoVistaCliente: any[] =[];

 constructor(private modal: NgbModal,private formBuilder: FormBuilder, private administracion: AdmninistracionService, private sanitizer: DomSanitizer){
  this.idUsuario = localStorage.getItem('ID Usuario');
  this.nombreUsuario = localStorage.getItem('nombre');
  this.apellido = localStorage.getItem('apellido');
  this.cargo = localStorage.getItem('cargo');
  this.correo = localStorage.getItem('correo');
 }
 ngOnInit(){

  //Carga los Cargos de los empleados, (Clase Usuario)
  this.administracion.getCargos().subscribe({ next: (resp: any) => {
    this.cargos = resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error de conexión con el servidor.',        
      })
    }})

    //Cargar todos los empleados
    this.administracion.getUsuarios().subscribe({next: (resp: any) =>{
      this.usuarios = resp;
      this.dtTrigger.next(resp);
    }, error: (error: any) =>{
      Swal.fire ({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión con el servidor',
      })} 
  })

  //Formulario guardar un empleado
  this.frmSaveUsuario = this.formBuilder.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],],
    cargo: ['', Validators.required],
    telefono: ['', Validators.required],
    password: ['', Validators.required],
  });

  
  this.frmEdit = this.formBuilder.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],],
    idCargo: ['', Validators.required],
    telefono: ['', Validators.required],
    password: [''],
  });
 }
 ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
  this.dtTrigger.unsubscribe();
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

modalUsuario(modal: any){
  this.modal.open(modal, { size: "ml"} );
}   

 //guardar empleado
 saveUsuario(){
   this.administracion.saveUsuario(this.frmSaveUsuario.value).subscribe({ next: (resp : any) => {
   this.usuarios = resp
   this.frmSaveUsuario.reset();
   this.modal.dismissAll();
   Swal.fire({
     icon: 'success',
     title: 'Éxito',
     text: 'Usuario creado con éxtio.'
   })
 
 },error: (error: any) =>{
   Swal.fire ({
     icon: 'error',
     title: 'Error',
     text: 'El correo del usuario ya se encuentra registrado.',
   })
 }})}
//Activa o desactiva un usuario
toggleUser(modal: any, id: number, estadoActual: string, nombre: string) {
  this.idUsuario = id;
  this.nombreUsuario= nombre;
  // Determina la acción opuesta al estado actual
  this.actionText = estadoActual === 'Activado' ? 'Desactivar' : 'Activar';
  this.modal.open(modal, { size: "sm", centered: true });
}

toggleUserStatus() {
  // La lógica original para determinar la acción a realizar
  const actionParaBD = this.isUserActive ? 'desactivar' : 'activar';

  // Llamada al servicio para activar o desactivar el usuario
  this.administracion.toggleUsuario(this.idUsuario, !this.isUserActive).subscribe({
      next: (resp: any) => {
          // Actualización del estado del usuario en la respuesta
          this.usuarios = resp;
          Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: `Usuario ha sido ${this.isUserActive ? 'desactivado' : 'activado'} correctamente.`
          });
          this.modal.dismissAll();
      },
      error: (error: any) => {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Error al intentar ${actionParaBD} al usuario.`,
          });
      }
  });

  // Importante: Actualizar el estado de 'isUserActive' para reflejar el cambio
  this.isUserActive = !this.isUserActive;
}

edit(modal: any, id: number) {
  this.administracion.getUsuario(id).subscribe({next: (resp: any) => {
     this.usuario = resp;
     this.modal.open(modal, { size: "ml" });
     //Formulario Editar empleado
     this.frmEdit = this.formBuilder.group({
       nombre: [this.usuario.nombre, Validators.required],
       apellido: [this.usuario.apellido, Validators.required],
       correo: [this.usuario.correo, Validators.required],
       idCargo: [this.usuario.idCargo, Validators.required],
       telefono: [this.usuario.telefono, Validators.required],
       password: [''],
       idUsuario: [this.usuario.idUsuario]
     });
   }, error: (error: any) => { }});}

 //Edita un empleado
 editUsuario() {
   this.administracion.editUsuario(this.frmEdit.value).subscribe({next: (resp: any) =>{
     this.usuarios = resp;
     Swal.fire({
       icon: 'success',
       title: 'Éxito',
       text: 'Usuario editado!',
     })
     this.modal.dismissAll();
   }, error: (error: any) =>{
     Swal.fire({
       icon: 'error',
       title: 'Error',
       text: 'Error al editar el usuario',
     });
   }})
 }

 //Cierra todo los modal
 closeModal() {
   this.modal.dismissAll();
   this.usuarioSelected ='';
 }

 closeModalNuevo() {
  this.modal.dismissAll();
  this.frmSaveUsuario.reset();
}

closeModalListarMovimientos(){
  this.modal.dismissAll();
}

modalMovimientos(modal: any){
  if (this.listadoCambios && this.listadoCambios.length > 0) {
    this.dtOptionsListarCambios = {
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthChange: false,
      searching: true,
      order: [],
      // language: {
      //   url: '//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json',
      // },
    };
  } else {
    this.listadoCambios = [];
    this.dtOptionsListarCambios = {
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthChange: false,
      searching: true,
      order: [],
      // language: {
      //   url: '//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json',
      // },
    };
  }  
  this.administracion.gethistorialCambios().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
    this.modal.open(modal, { size: "xl"} );
    this.listadoCambios = resp;   
  }, error: (error: any) => {
    Swal.fire({
      icon : 'error',
      title: 'Error',
      text: 'Error al traer el historial de cambios.',        
    })
  }}); 
}
//NO SÉ PARA QUE SIRVE
compararYResaltar(cadena1: string, cadena2: string): SafeHtml {
  let resultado = '';
  let maxLength = Math.max(cadena1.length, cadena2.length);

  for (let i = 0; i < maxLength; i++) {
    let char1 = cadena1[i] || '';
    let char2 = cadena2[i] || '';

    if (char1 !== char2) {
      resultado += `<span class="diferencia">${char1 || char2}</span>`;
    } else {
      resultado += char1;
    }
  }

  return this.sanitizer.bypassSecurityTrustHtml(resultado);
}



closeModalAutorizar(){
  this.modal.dismissAll();
}

modalCambios(modal: any){
  if (this.listadoAutorizaciones && this.listadoAutorizaciones.length > 0) {
    this.dtOptionsAutorizar = {
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
    this.listadoAutorizaciones = [];
    this.dtOptionsAutorizar = {
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
  this.administracion.getAutorizacionesAdmin().subscribe({next: (resp: any) =>{
      this.listadoAutorizaciones= resp;
  }, error: (error: any) => {
    Swal.fire({
      icon : 'error',
      title: 'Error',
      text: 'Error al traer las autorizaciones pendientes',        
    })
  }});
  this.modal.open(modal, { size: "lg"} );
}   

autorizar(idNotificacion:any){
  this.administracion.autorizarSolicitud(idNotificacion).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
        this.listadoAutorizaciones = resp;
      }, error: (error: any) => {
        Swal.fire({
          icon : 'error',
          title: 'Error',
          text: 'Error al generar la autorización',        
        })
      }});
  }
    
  rechazar(idNotificacion:any){
    this.administracion.eliminarSolicitud(idNotificacion).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.listadoAutorizaciones=resp;
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error al eliminar la autorización',        
      })
    }});

  }

  modalCliente(modal: any){
    if (this.listadoVistaCliente && this.listadoVistaCliente.length > 0) {
      this.dtOptionsCliente = {
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
      this.listadoVistaCliente = [];
      this.dtOptionsCliente = {
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
    this.administracion.getVistaCliente().pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.listadoVistaCliente= resp; 
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error traer las solicitudes vista vliente',        
      })
    }});
    this.modal.open(modal, { size: "lg"} );
  }

  autorizarVistaCliente(idVista: any){
    this.administracion.autorizarVistaCliente(idVista).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.listadoVistaCliente= resp; 
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error en el envio del la autorización',        
      })
    }});
  }
  
  rechazarVistaClieste(idVista: any){
    this.administracion.rechazarVistaClieste(idVista).pipe(takeUntil(this.destroy$)).subscribe({next: (resp: any) =>{
      this.listadoVistaCliente= resp; 
    }, error: (error: any) => {
      Swal.fire({
        icon : 'error',
        title: 'Error',
        text: 'Error en la eliminación de la autorización',        
      })
    }});
  }

  closeModalAutorizarVistaCliente(){
    this.modal.dismissAll();
  }

}

 