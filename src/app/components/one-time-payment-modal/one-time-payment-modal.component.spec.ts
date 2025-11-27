import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OneTimePaymentModalComponent } from './one-time-payment-modal.component';

describe('OneTimePaymentModalComponent', () => {
  let component: OneTimePaymentModalComponent;
  let fixture: ComponentFixture<OneTimePaymentModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OneTimePaymentModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OneTimePaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
