import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent {
  idCargo: any;

  constructor(private router: Router){}

  ngOnInit(){
  }

  getIdCargo(): number {
    return parseInt(localStorage.getItem('idCargo') || '0');
  }


  salir(){
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }

}
