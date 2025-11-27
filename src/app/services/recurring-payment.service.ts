import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { RecurringPayment } from '../models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class RecurringPaymentService {
  private readonly STORAGE_KEY = 'recurring_payments';
  private payments$ = new BehaviorSubject<RecurringPayment[]>([]);
  private storageReady = false;

  constructor(private storage: Storage) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    this.storageReady = true;
    await this.loadPayments();
  }

  private async ensureStorageReady() {
    if (!this.storageReady) {
      await this.initStorage();
    }
  }

  /**
   * Get observable stream of all payments
   */
  getPayments(): Observable<RecurringPayment[]> {
    return this.payments$.asObservable();
  }

  /**
   * Get all payments from storage
   */
  async getAll(): Promise<RecurringPayment[]> {
    await this.ensureStorageReady();
    const payments = await this.storage.get(this.STORAGE_KEY) || [];
    return payments.map((p: any) => this.deserializePayment(p));
  }

  /**
   * Get payments filtered by type and sorted by day
   */
  async getByType(type: 'income' | 'expense'): Promise<RecurringPayment[]> {
    const all = await this.getAll();
    return all
      .filter(p => p.isActive && p.type === type)
      .sort((a, b) => a.dayOfMonth - b.dayOfMonth);
  }

  /**
   * Get all active payments sorted by day
   */
  async getAllSortedByDay(): Promise<RecurringPayment[]> {
    const all = await this.getAll();
    return all
      .filter(p => p.isActive)
      .sort((a, b) => a.dayOfMonth - b.dayOfMonth);
  }

  /**
   * Get payment by ID
   */
  async getById(id: string): Promise<RecurringPayment | undefined> {
    const all = await this.getAll();
    return all.find(p => p.id === id);
  }

  /**
   * Create new payment
   */
  async create(payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'isActive'>): Promise<RecurringPayment> {
    await this.ensureStorageReady();
    
    const newPayment: RecurringPayment = {
      ...payment,
      id: uuidv4(),
      createdAt: new Date(),
      isActive: true
    };

    const payments = await this.getAll();
    payments.push(newPayment);
    await this.saveAll(payments);

    return newPayment;
  }

  /**
   * Update existing payment
   */
  async update(id: string, updates: Partial<RecurringPayment>): Promise<void> {
    await this.ensureStorageReady();
    
    const payments = await this.getAll();
    const index = payments.findIndex(p => p.id === id);
    
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updates };
      await this.saveAll(payments);
    }
  }

  /**
   * Delete payment (soft delete)
   */
  async delete(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }

  /**
   * Permanently delete payment
   */
  async permanentDelete(id: string): Promise<void> {
    await this.ensureStorageReady();
    
    const payments = await this.getAll();
    const filtered = payments.filter(p => p.id !== id);
    await this.saveAll(filtered);
  }

  /**
   * Save all payments to storage
   */
  private async saveAll(payments: RecurringPayment[]): Promise<void> {
    const serialized = payments.map(p => this.serializePayment(p));
    await this.storage.set(this.STORAGE_KEY, serialized);
    await this.loadPayments();
  }

  /**
   * Load payments and emit to subscribers
   */
  private async loadPayments(): Promise<void> {
    const payments = await this.getAll();
    this.payments$.next(payments);
  }

  /**
   * Serialize payment for storage
   */
  private serializePayment(payment: RecurringPayment): any {
    return {
      ...payment,
      createdAt: payment.createdAt.toISOString()
    };
  }

  /**
   * Deserialize payment from storage
   */
  private deserializePayment(data: any): RecurringPayment {
    return {
      ...data,
      createdAt: new Date(data.createdAt)
    };
  }
}
