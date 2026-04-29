import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepciondepilaComponent } from './recepciondepila.component';

describe('RecepciondepilaComponent', () => {
  let component: RecepciondepilaComponent;
  let fixture: ComponentFixture<RecepciondepilaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecepciondepilaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepciondepilaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
