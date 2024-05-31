import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualOptimizerComponent } from './manual-optimizer.component';

describe('ManualOptimizerComponent', () => {
  let component: ManualOptimizerComponent;
  let fixture: ComponentFixture<ManualOptimizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualOptimizerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManualOptimizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
