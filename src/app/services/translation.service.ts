import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Language } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: { [key: string]: any } = {};
  private currentLanguage$ = new BehaviorSubject<Language>(Language.EN);
  
  constructor() {
    this.loadTranslation(Language.EN);
  }

  async loadTranslation(language: Language): Promise<void> {
    try {
      const response = await fetch(`assets/i18n/${language}.json`);
      const translations = await response.json();
      this.translations = translations;
      this.currentLanguage$.next(language);
    } catch (error) {
      console.error(`Failed to load translations for ${language}`, error);
      // Fallback to English if loading fails
      if (language !== Language.EN) {
        await this.loadTranslation(Language.EN);
      }
    }
  }

  translate(key: string, params?: { [key: string]: string | number }): string {
    let translation = this.translations[key] || key;
    
    // Replace parameters in translation if provided
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param].toString());
      });
    }
    
    return translation;
  }

  getCurrentLanguage(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  getCurrentLanguageValue(): Language {
    return this.currentLanguage$.value;
  }

  async setLanguage(language: Language): Promise<void> {
    await this.loadTranslation(language);
  }
}
