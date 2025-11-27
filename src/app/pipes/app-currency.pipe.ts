import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false
})
export class AppCurrencyPipe implements PipeTransform {
  private symbol = '$';

  constructor(private settingsService: SettingsService) {
    this.settingsService.getSettings().subscribe(settings => {
      this.symbol = settings.currencySymbol;
    });
  }

  transform(value: number | string): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const formatted = numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${this.symbol}${formatted}`;
  }
}
