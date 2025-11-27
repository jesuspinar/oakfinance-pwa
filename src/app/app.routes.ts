import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'recurring-payments',
    loadComponent: () => import('./pages/recurring-payments/recurring-payments.page').then( m => m.RecurringPaymentsPage)
  },
  {
    path: 'payment-tracker',
    loadComponent: () => import('./pages/payment-tracker/payment-tracker.page').then( m => m.PaymentTrackerPage)
  },
];
