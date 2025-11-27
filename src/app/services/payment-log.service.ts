import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { PaymentLog, RecurringPayment, MonthPeriod } from '../models';
import { DatePeriodService } from './date-period.service';
import { v4 as uuidv4 } from 'uuid';

export interface ForecastData {
  pendingExpenses: number;
  pendingIncome: number;
  forecastedBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentLogService {
  private readonly STORAGE_KEY = 'payment_logs';
  private logs$ = new BehaviorSubject<PaymentLog[]>([]);
  private storageReady = false;

  constructor(
    private storage: Storage,
    private datePeriodService: DatePeriodService
  ) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    this.storageReady = true;
    await this.loadLogs();
  }

  private async ensureStorageReady() {
    if (!this.storageReady) {
      await this.initStorage();
    }
  }

  /**
   * Get observable stream of all logs
   */
  getLogs(): Observable<PaymentLog[]> {
    return this.logs$.asObservable();
  }

  /**
   * Get all logs from storage
   */
  async getAll(): Promise<PaymentLog[]> {
    await this.ensureStorageReady();
    const logs = await this.storage.get(this.STORAGE_KEY) || [];
    return logs.map((l: any) => this.deserializeLog(l));
  }

  /**
   * Get logs for specific period
   */
  async getLogsByPeriod(period: MonthPeriod): Promise<PaymentLog[]> {
    const all = await this.getAll();
    const periodKey = this.datePeriodService.getPeriodKey(period);
    
    return all.filter(log => {
      const logKey = this.datePeriodService.getPeriodKey({
        periodStart: log.periodStart,
        periodEnd: log.periodEnd,
        displayLabel: ''
      });
      return logKey === periodKey;
    }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  /**
   * Ensure all recurring payments have logs for the given period
   */
  async ensureLogsForPeriod(
    period: MonthPeriod,
    recurringPayments: RecurringPayment[]
  ): Promise<void> {
    await this.ensureStorageReady();
    
    // Get existing logs for this period
    const existingLogs = await this.getLogsByPeriod(period);
    const existingPaymentIds = new Set(existingLogs.map(log => log.recurringPaymentId));
    
    // Find payments without logs
    const missingPayments = recurringPayments.filter(
      payment => payment.isActive && !existingPaymentIds.has(payment.id)
    );
    
    // Generate logs for missing payments
    if (missingPayments.length > 0) {
      const newLogs = missingPayments.map(payment =>
        this.createLogFromPayment(payment, period)
      );
      
      await this.createMultiple(newLogs);
    }
  }

  /**
   * Create a payment log from a recurring payment
   */
  private createLogFromPayment(
    payment: RecurringPayment,
    period: MonthPeriod
  ): Omit<PaymentLog, 'id' | 'createdAt'> {
    const dueDate = this.datePeriodService.calculateDueDate(
      payment.dayOfMonth,
      period
    );
    
    return {
      recurringPaymentId: payment.id,
      name: payment.name,
      amount: payment.defaultAmount,
      iconName: payment.iconName,
      dayOfMonth: payment.dayOfMonth,
      type: payment.type,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      dueDate,
      isCompleted: false
    };
  }

  /**
   * Create new log
   */
  async create(log: Omit<PaymentLog, 'id' | 'createdAt'>): Promise<PaymentLog> {
    await this.ensureStorageReady();
    
    const newLog: PaymentLog = {
      ...log,
      id: uuidv4(),
      createdAt: new Date()
    };

    const logs = await this.getAll();
    logs.push(newLog);
    await this.saveAll(logs);

    return newLog;
  }

  /**
   * Create multiple logs at once
   */
  async createMultiple(logs: Omit<PaymentLog, 'id' | 'createdAt'>[]): Promise<PaymentLog[]> {
    await this.ensureStorageReady();
    
    const newLogs: PaymentLog[] = logs.map(log => ({
      ...log,
      id: uuidv4(),
      createdAt: new Date()
    }));

    const allLogs = await this.getAll();
    allLogs.push(...newLogs);
    await this.saveAll(allLogs);

    return newLogs;
  }

  /**
   * Update existing log
   */
  async update(id: string, updates: Partial<PaymentLog>): Promise<void> {
    await this.ensureStorageReady();
    
    const logs = await this.getAll();
    const index = logs.findIndex(l => l.id === id);
    
    if (index !== -1) {
      logs[index] = { ...logs[index], ...updates };
      await this.saveAll(logs);
    }
  }

  /**
   * Update log amount
   */
  async updateLogAmount(id: string, amount: number): Promise<void> {
    await this.update(id, { amount });
  }

  /**
   * Mark log as completed
   */
  async markAsCompleted(id: string): Promise<void> {
    await this.update(id, {
      isCompleted: true,
      completedDate: new Date()
    });
  }

  /**
   * Mark log as incomplete
   */
  async markAsIncomplete(id: string): Promise<void> {
    await this.update(id, {
      isCompleted: false,
      completedDate: undefined
    });
  }

  /**
   * Delete log
   */
  async delete(id: string): Promise<void> {
    await this.ensureStorageReady();
    
    const logs = await this.getAll();
    const filtered = logs.filter(l => l.id !== id);
    await this.saveAll(filtered);
  }

  /**
   * Calculate forecast based on current balance and pending logs
   */
  calculateForecast(currentBalance: number, logs: PaymentLog[]): ForecastData {
    const pendingLogs = logs.filter(log => !log.isCompleted);
    
    const pendingExpenses = pendingLogs
      .filter(log => log.type === 'expense')
      .reduce((sum, log) => sum + log.amount, 0);
    
    const pendingIncome = pendingLogs
      .filter(log => log.type === 'income')
      .reduce((sum, log) => sum + log.amount, 0);
    
    const forecastedBalance = currentBalance - pendingExpenses + pendingIncome;
    
    return {
      pendingExpenses,
      pendingIncome,
      forecastedBalance
    };
  }

  /**
   * Save all logs to storage
   */
  private async saveAll(logs: PaymentLog[]): Promise<void> {
    const serialized = logs.map(l => this.serializeLog(l));
    await this.storage.set(this.STORAGE_KEY, serialized);
    await this.loadLogs();
  }

  /**
   * Load logs and emit to subscribers
   */
  private async loadLogs(): Promise<void> {
    const logs = await this.getAll();
    this.logs$.next(logs);
  }

  /**
   * Serialize log for storage
   */
  private serializeLog(log: PaymentLog): any {
    return {
      ...log,
      periodStart: log.periodStart.toISOString(),
      periodEnd: log.periodEnd.toISOString(),
      dueDate: log.dueDate.toISOString(),
      completedDate: log.completedDate?.toISOString(),
      createdAt: log.createdAt.toISOString()
    };
  }

  /**
   * Deserialize log from storage
   */
  private deserializeLog(data: any): PaymentLog {
    return {
      ...data,
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
      dueDate: new Date(data.dueDate),
      completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      createdAt: new Date(data.createdAt)
    };
  }
}
