import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NominacionesComponent } from './nominaciones.component';

describe('NominacionesComponent', () => {
  let component: NominacionesComponent;
  let fixture: ComponentFixture<NominacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NominacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NominacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
