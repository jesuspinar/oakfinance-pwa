export interface PaymentLog {
  id: string;
  recurringPaymentId?: string; // Optional - null for one-time entries
  name: string; // Denormalized for display
  amount: number; // Editable per log
  iconName: string; // Denormalized
  dayOfMonth: number; // Denormalized
  type: 'income' | 'expense';
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date; // Actual date in period
  isCompleted: boolean;
  completedDate?: Date;
  createdAt: Date;
}
