import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostadonaveComponent } from './costadonave.component';

describe('CostadonaveComponent', () => {
  let component: CostadonaveComponent;
  let fixture: ComponentFixture<CostadonaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostadonaveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostadonaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
