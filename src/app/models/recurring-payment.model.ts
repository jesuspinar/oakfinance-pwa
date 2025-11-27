export interface RecurringPayment {
  id: string;
  name: string;
  defaultAmount: number;
  dayOfMonth: number; // 1-31
  iconName: string;
  type: 'income' | 'expense';
  createdAt: Date;
  isActive: boolean;
}
