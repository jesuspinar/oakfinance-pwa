import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { RecurringPayment } from '../../models';
import { IconPickerModalComponent } from '../icon-picker-modal/icon-picker-modal.component';

@Component({
  selector: 'app-payment-form-modal',
  templateUrl: './payment-form-modal.component.html',
  styleUrls: ['./payment-form-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class PaymentFormModalComponent  implements OnInit {
  @Input() payment?: RecurringPayment;
  @Input() type: 'income' | 'expense' = 'expense';

  paymentForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.isEditMode = !!this.payment;
    
    this.paymentForm = this.fb.group({
      name: [this.payment?.name || '', [Validators.required, Validators.minLength(1)]],
      defaultAmount: [this.payment?.defaultAmount || 0, [Validators.required, Validators.min(0.01)]],
      dayOfMonth: [this.payment?.dayOfMonth || 1, [Validators.required, Validators.min(1), Validators.max(31)]],
      iconName: [this.payment?.iconName || 'cash-outline', Validators.required],
      type: [this.payment?.type || this.type, Validators.required]
    });
  }

  async openIconPicker() {
    const modal = await this.modalCtrl.create({
      component: IconPickerModalComponent,
      componentProps: {
        selectedIcon: this.paymentForm.value.iconName,
        type: this.paymentForm.value.type
      }
    });
    
    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    if (data?.icon) {
      this.paymentForm.patchValue({ iconName: data.icon });
    }
  }

  save() {
    if (this.paymentForm.valid) {
      this.modalCtrl.dismiss({
        payment: this.paymentForm.value,
        isEdit: this.isEditMode
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
