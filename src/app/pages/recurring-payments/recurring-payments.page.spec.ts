import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecurringPaymentsPage } from './recurring-payments.page';

describe('RecurringPaymentsPage', () => {
  let component: RecurringPaymentsPage;
  let fixture: ComponentFixture<RecurringPaymentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringPaymentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
