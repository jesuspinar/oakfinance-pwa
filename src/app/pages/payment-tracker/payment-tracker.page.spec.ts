import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentTrackerPage } from './payment-tracker.page';

describe('PaymentTrackerPage', () => {
  let component: PaymentTrackerPage;
  let fixture: ComponentFixture<PaymentTrackerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTrackerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
