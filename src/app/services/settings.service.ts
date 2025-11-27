import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings, Language } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'app_settings';
  private settings$ = new BehaviorSubject<AppSettings>({
    monthStartDay: 1,
    currency: 'USD',
    currencySymbol: '$',
    language: Language.EN
  });
  private storageReady = false;

  constructor(private storage: Storage) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    this.storageReady = true;
    await this.loadSettings();
  }

  private async ensureStorageReady() {
    if (!this.storageReady) {
      await this.initStorage();
    }
  }

  /**
   * Get observable stream of settings
   */
  getSettings(): Observable<AppSettings> {
    return this.settings$.asObservable();
  }

  /**
   * Get current settings
   */
  async get(): Promise<AppSettings> {
    await this.ensureStorageReady();
    const settings = await this.storage.get(this.STORAGE_KEY);
    const defaultSettings = this.settings$.value;
    // Ensure all required properties have defaults, especially language
    return settings ? { ...defaultSettings, ...settings } : defaultSettings;
  }

  /**
   * Get month start day
   */
  async getMonthStartDay(): Promise<number> {
    const settings = await this.get();
    return settings.monthStartDay;
  }

  /**
   * Update settings
   */
  async update(updates: Partial<AppSettings>): Promise<void> {
    await this.ensureStorageReady();
    const currentSettings = await this.get();
    const newSettings = { ...currentSettings, ...updates };
    await this.storage.set(this.STORAGE_KEY, newSettings);
    this.settings$.next(newSettings);
  }

  /**
   * Set month start day
   */
  async setMonthStartDay(day: number): Promise<void> {
    if (day < 1 || day > 31) {
      throw new Error('Month start day must be between 1 and 31');
    }
    await this.update({ monthStartDay: day });
  }

  /**
   * Set currency
   */
  async setCurrency(currency: string, symbol: string): Promise<void> {
    await this.update({ currency, currencySymbol: symbol });
  }

  /**
   * Set language
   */
  async setLanguage(language: Language): Promise<void> {
    await this.update({ language });
  }

  /**
   * Load settings from storage
   */
  private async loadSettings(): Promise<void> {
    const settings = await this.get();
    this.settings$.next(settings);
  }
}
