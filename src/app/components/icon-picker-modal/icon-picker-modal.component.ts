import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ALL_ICONS, INCOME_ICONS, EXPENSE_ICONS } from '../../constants/icons';

@Component({
  selector: 'app-icon-picker-modal',
  templateUrl: './icon-picker-modal.component.html',
  styleUrls: ['./icon-picker-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class IconPickerModalComponent  implements OnInit {
  @Input() selectedIcon?: string;
  @Input() type?: 'income' | 'expense';

  allIcons: string[] = [];
  filteredIcons: string[] = [];
  searchTerm: string = '';

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    // Set icons based on type or show all
    if (this.type === 'income') {
      this.allIcons = INCOME_ICONS;
    } else if (this.type === 'expense') {
      this.allIcons = EXPENSE_ICONS;
    } else {
      this.allIcons = ALL_ICONS;
    }
    
    this.filteredIcons = [...this.allIcons];
  }

  filterIcons() {
    if (!this.searchTerm.trim()) {
      this.filteredIcons = [...this.allIcons];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredIcons = this.allIcons.filter(icon => 
      icon.toLowerCase().includes(term)
    );
  }

  selectIcon(icon: string) {
    this.modalCtrl.dismiss({ icon });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
