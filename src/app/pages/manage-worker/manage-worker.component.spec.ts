import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWorkerComponent } from './manage-worker.component';

describe('ManageWorkerComponent', () => {
  let component: ManageWorkerComponent;
  let fixture: ComponentFixture<ManageWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageWorkerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
