import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerNavigationComponent } from './worker-navigation.component';

describe('WorkerNavigationComponent', () => {
  let component: WorkerNavigationComponent;
  let fixture: ComponentFixture<WorkerNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkerNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
