import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { PeriodBalance, MonthPeriod } from '../models';
import { DatePeriodService } from './date-period.service';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private readonly STORAGE_KEY = 'period_balances';
  private balances$ = new BehaviorSubject<Map<string, number>>(new Map());
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
    await this.loadBalances();
  }

  private async ensureStorageReady() {
    if (!this.storageReady) {
      await this.initStorage();
    }
  }

  /**
   * Get observable stream of all balances
   */
  getBalances(): Observable<Map<string, number>> {
    return this.balances$.asObservable();
  }

  /**
   * Get all balances from storage
   */
  async getAll(): Promise<PeriodBalance[]> {
    await this.ensureStorageReady();
    return (await this.storage.get(this.STORAGE_KEY)) || [];
  }

  /**
   * Get balance for specific period
   */
  async getBalanceForPeriod(period: MonthPeriod): Promise<number> {
    await this.ensureStorageReady();
    const periodKey = this.datePeriodService.getPeriodKey(period);
    const balances = await this.getAll();
    const periodBalance = balances.find(b => b.periodKey === periodKey);
    return periodBalance?.currentAccountBalance || 0;
  }

  /**
   * Set balance for specific period
   */
  async setBalanceForPeriod(period: MonthPeriod, balance: number): Promise<void> {
    await this.ensureStorageReady();
    const periodKey = this.datePeriodService.getPeriodKey(period);
    const balances = await this.getAll();
    
    const index = balances.findIndex(b => b.periodKey === periodKey);
    
    if (index !== -1) {
      balances[index].currentAccountBalance = balance;
    } else {
      balances.push({
        periodKey,
        currentAccountBalance: balance
      });
    }
    
    await this.saveAll(balances);
  }

  /**
   * Save all balances to storage
   */
  private async saveAll(balances: PeriodBalance[]): Promise<void> {
    await this.storage.set(this.STORAGE_KEY, balances);
    await this.loadBalances();
  }

  /**
   * Load balances and emit to subscribers
   */
  private async loadBalances(): Promise<void> {
    const balances = await this.getAll();
    const balanceMap = new Map<string, number>();
    balances.forEach(b => balanceMap.set(b.periodKey, b.currentAccountBalance));
    this.balances$.next(balanceMap);
  }
}
