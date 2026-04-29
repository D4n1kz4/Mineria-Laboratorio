import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { LoginService } from '../../services/login.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
formLogin!: FormGroup;
correo:any;
password: any;

constructor(private fnBuilder: FormBuilder, private loginservices: LoginService, private router: Router){
  this.formLogin = this.fnBuilder.group({
    correo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)],],
    password: ['', Validators.required]
  });
}

ngOninit(){}

login(){
  const correoValue = this.formLogin.get('correo')?.value;
  const passwordValue = this.formLogin.get('password')?.value;
  let data = { correo: correoValue, password: passwordValue };
  this.loginservices.login(data).subscribe({next: (resp: any) => {
    localStorage.clear();
        this.router.navigateByUrl('/nominaciones');
        localStorage.setItem('ID Usuario', resp.idUsuario);
        localStorage.setItem('nombre', resp.nombre);
        localStorage.setItem('apellido', resp.apellido);
        localStorage.setItem('cargo', resp.cargo);
        localStorage.setItem('correo', resp.correo);
        localStorage.setItem('idCargo', resp.idCargo);
  }, error:(error: any) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Usuario y/o contraseña incorrectas',
    })
  }});
}

}