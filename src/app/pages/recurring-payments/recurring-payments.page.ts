import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { RecurringPayment } from '../../models';
import { RecurringPaymentService } from '../../services/recurring-payment.service';
import { PaymentFormModalComponent } from '../../components/payment-form-modal/payment-form-modal.component';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-recurring-payments',
  templateUrl: './recurring-payments.page.html',
  styleUrls: ['./recurring-payments.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, AppCurrencyPipe, TranslatePipe]
})
export class RecurringPaymentsPage implements OnInit {
  incomePayments: RecurringPayment[] = [];
  expensePayments: RecurringPayment[] = [];
  selectedSegment: 'income' | 'expense' = 'expense';

  constructor(
    private paymentService: RecurringPaymentService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    await this.loadPayments();
  }

  async ionViewWillEnter() {
    await this.loadPayments();
  }

  async loadPayments() {
    this.incomePayments = await this.paymentService.getByType('income');
    this.expensePayments = await this.paymentService.getByType('expense');
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: PaymentFormModalComponent,
      componentProps: {
        type: this.selectedSegment
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.payment) {
      await this.paymentService.create(data.payment);
      await this.loadPayments();
    }
  }

  async openEditModal(payment: RecurringPayment) {
    const modal = await this.modalCtrl.create({
      component: PaymentFormModalComponent,
      componentProps: {
        payment: payment,
        type: payment.type
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.payment && data?.isEdit) {
      await this.paymentService.update(payment.id, data.payment);
      await this.loadPayments();
    }
  }

  async confirmDelete(payment: RecurringPayment) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Payment',
      message: `Are you sure you want to delete "${payment.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.paymentService.delete(payment.id);
            await this.loadPayments();
          }
        }
      ]
    });

    await alert.present();
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }
}
