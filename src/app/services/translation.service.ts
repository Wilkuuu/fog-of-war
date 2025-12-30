import { Injectable } from '@angular/core';

export interface Translations {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage: string = 'en';
  private translations: { [lang: string]: Translations } = {
    en: {
      // App
      'app.title': 'Fog of War',
      'app.controls': 'Controls',
      
      // Empty state
      'empty.selectVideo': 'Select a video to begin revealing hidden content',
      'empty.selectVideoButton': 'Select Video',
      'empty.changeVideoButton': 'Change Video',
      
      // Menu sections
      'menu.video': 'Video',
      'menu.brushSize': 'Brush Size',
      'menu.actions': 'Actions',
      'menu.settings': 'Settings',
      'menu.language': 'Language',
      
      // Actions
      'action.revealAll': 'Reveal All',
      'action.undo': 'Undo',
      'action.resetFog': 'Reset Fog',
      
      // Alerts
      'alert.exitApp': 'Exit App?',
      'alert.exitConfirm': 'Are you sure you want to exit Fog of War?',
      'alert.cancel': 'Cancel',
      'alert.exit': 'Exit',
      'alert.addFog': 'Add Fog of War?',
      'alert.addFogMessage': 'Do you want to start with fog of war covering the video?',
      'alert.noFog': 'No Fog',
      'alert.addFogButton': 'Add Fog',
      
      // Tutorial
      'tutorial.welcome': 'Welcome to Fog of War!',
      'tutorial.step1.title': 'Select a Video',
      'tutorial.step1.description': 'Tap "Select Video" to choose a video from your device',
      'tutorial.step2.title': 'Reveal Content',
      'tutorial.step2.description': 'Drag your finger or mouse over the video to reveal hidden content',
      'tutorial.step3.title': 'Adjust Brush Size',
      'tutorial.step3.description': 'Open the menu (two-finger tap or hamburger icon) to change brush size',
      'tutorial.step4.title': 'Menu Controls',
      'tutorial.step4.description': 'Use the menu to reveal all, undo, or reset the fog',
      'tutorial.gotIt': 'Got it!',
      'tutorial.next': 'Next',
      'tutorial.previous': 'Previous',
      'tutorial.skip': 'Skip',
      
      // Language Selector
      'language.select': 'Select Language',
      'language.choose': 'Choose your preferred language',
      'language.continue': 'Continue'
    },
    es: {
      // App
      'app.title': 'Niebla de Guerra',
      'app.controls': 'Controles',
      
      // Empty state
      'empty.selectVideo': 'Selecciona un video para comenzar a revelar contenido oculto',
      'empty.selectVideoButton': 'Seleccionar Video',
      'empty.changeVideoButton': 'Cambiar Video',
      
      // Menu sections
      'menu.video': 'Video',
      'menu.brushSize': 'Tamaño del Pincel',
      'menu.actions': 'Acciones',
      'menu.settings': 'Configuración',
      'menu.language': 'Idioma',
      
      // Actions
      'action.revealAll': 'Revelar Todo',
      'action.undo': 'Deshacer',
      'action.resetFog': 'Restablecer Niebla',
      
      // Alerts
      'alert.exitApp': '¿Salir de la App?',
      'alert.exitConfirm': '¿Estás seguro de que quieres salir de Niebla de Guerra?',
      'alert.cancel': 'Cancelar',
      'alert.exit': 'Salir',
      'alert.addFog': '¿Agregar Niebla de Guerra?',
      'alert.addFogMessage': '¿Quieres comenzar con niebla de guerra cubriendo el video?',
      'alert.noFog': 'Sin Niebla',
      'alert.addFogButton': 'Agregar Niebla',
      
      // Tutorial
      'tutorial.welcome': '¡Bienvenido a Niebla de Guerra!',
      'tutorial.step1.title': 'Selecciona un Video',
      'tutorial.step1.description': 'Toca "Seleccionar Video" para elegir un video de tu dispositivo',
      'tutorial.step2.title': 'Revela Contenido',
      'tutorial.step2.description': 'Arrastra tu dedo o mouse sobre el video para revelar contenido oculto',
      'tutorial.step3.title': 'Ajusta el Tamaño del Pincel',
      'tutorial.step3.description': 'Abre el menú (toque con dos dedos o ícono de hamburguesa) para cambiar el tamaño del pincel',
      'tutorial.step4.title': 'Controles del Menú',
      'tutorial.step4.description': 'Usa el menú para revelar todo, deshacer o restablecer la niebla',
      'tutorial.gotIt': '¡Entendido!',
      'tutorial.next': 'Siguiente',
      'tutorial.previous': 'Anterior',
      'tutorial.skip': 'Omitir',
      
      // Language Selector
      'language.select': 'Seleccionar Idioma',
      'language.choose': 'Elige tu idioma preferido',
      'language.continue': 'Continuar'
    },
    pl: {
      // App
      'app.title': 'Mgła Wojny',
      'app.controls': 'Sterowanie',
      
      // Empty state
      'empty.selectVideo': 'Wybierz wideo, aby rozpocząć odkrywanie ukrytej zawartości',
      'empty.selectVideoButton': 'Wybierz Wideo',
      'empty.changeVideoButton': 'Zmień Wideo',
      
      // Menu sections
      'menu.video': 'Wideo',
      'menu.brushSize': 'Rozmiar Pędzla',
      'menu.actions': 'Akcje',
      'menu.settings': 'Ustawienia',
      'menu.language': 'Język',
      
      // Actions
      'action.revealAll': 'Odkryj Wszystko',
      'action.undo': 'Cofnij',
      'action.resetFog': 'Resetuj Mgłę',
      
      // Alerts
      'alert.exitApp': 'Zamknąć Aplikację?',
      'alert.exitConfirm': 'Czy na pewno chcesz zamknąć Mgłę Wojny?',
      'alert.cancel': 'Anuluj',
      'alert.exit': 'Zamknij',
      'alert.addFog': 'Dodać Mgłę Wojny?',
      'alert.addFogMessage': 'Czy chcesz rozpocząć z mgłą wojny pokrywającą wideo?',
      'alert.noFog': 'Bez Mgły',
      'alert.addFogButton': 'Dodaj Mgłę',
      
      // Tutorial
      'tutorial.welcome': 'Witaj w Mgle Wojny!',
      'tutorial.step1.title': 'Wybierz Wideo',
      'tutorial.step1.description': 'Dotknij "Wybierz Wideo", aby wybrać wideo z urządzenia',
      'tutorial.step2.title': 'Odkryj Zawartość',
      'tutorial.step2.description': 'Przeciągnij palcem lub myszką po wideo, aby odkryć ukrytą zawartość',
      'tutorial.step3.title': 'Dostosuj Rozmiar Pędzla',
      'tutorial.step3.description': 'Otwórz menu (dotknięcie dwoma palcami lub ikona hamburgera), aby zmienić rozmiar pędzla',
      'tutorial.step4.title': 'Kontrolki Menu',
      'tutorial.step4.description': 'Użyj menu, aby odkryć wszystko, cofnąć lub zresetować mgłę',
      'tutorial.gotIt': 'Rozumiem!',
      'tutorial.next': 'Dalej',
      'tutorial.previous': 'Wstecz',
      'tutorial.skip': 'Pomiń',
      
      // Language Selector
      'language.select': 'Wybierz Język',
      'language.choose': 'Wybierz swój preferowany język',
      'language.continue': 'Kontynuuj'
    }
  };

  constructor() {
    // Load saved language preference
    const savedLang = localStorage.getItem('fog-of-war-language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    } else {
      // Try to detect language from browser
      const browserLang = navigator.language.split('-')[0];
      if (this.translations[browserLang]) {
        this.currentLanguage = browserLang;
      }
    }
  }

  setLanguage(lang: string): void {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('fog-of-war-language', lang);
    }
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  translate(key: string, params?: { [key: string]: string }): string {
    const translation = this.translations[this.currentLanguage]?.[key] || 
                       this.translations['en'][key] || 
                       key;
    
    if (params) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }
    
    return translation;
  }

  // Shortcut method
  t(key: string, params?: { [key: string]: string }): string {
    return this.translate(key, params);
  }
}

