import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslationService } from '../../services/translation.service';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
  languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' }
  ];

  selectedLanguage: string = 'en';

  constructor(
    private modalController: ModalController,
    public translation: TranslationService
  ) {}

  ngOnInit() {
    // Get current language
    this.selectedLanguage = this.translation.getLanguage();
  }

  selectLanguage(langCode: string) {
    this.selectedLanguage = langCode;
    this.translation.setLanguage(langCode);
  }

  confirm() {
    // Language is already set when selected, just close
    localStorage.setItem('fog-of-war-language-selected', 'true');
    this.modalController.dismiss({
      languageChanged: true
    });
  }

  get currentLanguageName(): string {
    const lang = this.languages.find(l => l.code === this.selectedLanguage);
    return lang ? lang.nativeName : 'English';
  }
}

