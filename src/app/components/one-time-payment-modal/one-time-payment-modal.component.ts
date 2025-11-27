import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { MonthPeriod } from '../../models';
import { IconPickerModalComponent } from '../icon-picker-modal/icon-picker-modal.component';

@Component({
  selector: 'app-one-time-payment-modal',
  templateUrl: './one-time-payment-modal.component.html',
  styleUrls: ['./one-time-payment-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class OneTimePaymentModalComponent  implements OnInit {
  @Input() period!: MonthPeriod;
  @Input() type: 'income' | 'expense' = 'expense';

  paymentForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    
    this.paymentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      dueDate: [today, Validators.required],
      iconName: ['cash-outline', Validators.required],
      type: [this.type, Validators.required]
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
      const formValue = this.paymentForm.value;
      const dueDate = new Date(formValue.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Auto-complete if date is in the past
      const isCompleted = dueDate < today;
      
      this.modalCtrl.dismiss({
        payment: {
          ...formValue,
          dueDate,
          isCompleted,
          completedDate: isCompleted ? dueDate : undefined
        }
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
