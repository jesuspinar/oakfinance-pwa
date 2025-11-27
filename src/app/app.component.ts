import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { SettingsService } from './services/settings.service';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private storage: Storage,
    private settingsService: SettingsService,
    private translationService: TranslationService
  ) {}

  async ngOnInit() {
    // Initialize Ionic Storage
    await this.storage.create();
    
    // Load saved language and initialize translations
    const settings = await this.settingsService.get();
    await this.translationService.setLanguage(settings.language);
  }
}
