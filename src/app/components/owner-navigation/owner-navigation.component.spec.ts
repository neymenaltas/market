import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerNavigationComponent } from './owner-navigation.component';

describe('OwnerNavigationComponent', () => {
  let component: OwnerNavigationComponent;
  let fixture: ComponentFixture<OwnerNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
