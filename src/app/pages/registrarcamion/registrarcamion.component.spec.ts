import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarcamionComponent } from './registrarcamion.component';

describe('RegistrarcamionComponent', () => {
  let component: RegistrarcamionComponent;
  let fixture: ComponentFixture<RegistrarcamionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarcamionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarcamionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
