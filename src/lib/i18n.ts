import type { SiteLanguage } from '../types';

export const LANGUAGE_OPTIONS: { code: SiteLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'Hindi (Hindi)' },
  { code: 'es', label: 'Spanish', native: 'Espanol' },
];

type Dict = Record<string, string>;

const dictionaries: Record<SiteLanguage, Dict> = {
  en: {
    'nav.home': 'Home',
    'nav.library': 'Library',
    'nav.write': 'Write',
    'nav.readingList': 'Reading List',
    'nav.leaderboard': 'Leaderboard',
    'nav.community': 'Community',
    'nav.analytics': 'Analytics',
    'nav.about': 'About',
    'nav.explore': 'Explore',
    'nav.help': 'Help',
    'settings.title': 'Settings Studio',
    'help.title': 'Help Center',
    'help.assistant': 'Helping Assistant',
    'tutorial.title': 'Quick Tour',
  },
  hi: {
    'nav.home': 'होम',
    'nav.library': 'लाइब्रेरी',
    'nav.write': 'लिखें',
    'nav.readingList': 'रीडिंग लिस्ट',
    'nav.leaderboard': 'लीडरबोर्ड',
    'nav.community': 'कम्युनिटी',
    'nav.analytics': 'एनालिटिक्स',
    'nav.about': 'अबाउट',
    'nav.explore': 'एक्सप्लोर',
    'nav.help': 'मदद',
    'settings.title': 'सेटिंग्स स्टूडियो',
    'help.title': 'हेल्प सेंटर',
    'help.assistant': 'हेल्पिंग असिस्टेंट',
    'tutorial.title': 'क्विक टूर',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.library': 'Biblioteca',
    'nav.write': 'Escribir',
    'nav.readingList': 'Lista de lectura',
    'nav.leaderboard': 'Clasificacion',
    'nav.community': 'Comunidad',
    'nav.analytics': 'Analiticas',
    'nav.about': 'Acerca de',
    'nav.explore': 'Explorar',
    'nav.help': 'Ayuda',
    'settings.title': 'Estudio de Ajustes',
    'help.title': 'Centro de Ayuda',
    'help.assistant': 'Asistente de Ayuda',
    'tutorial.title': 'Recorrido Rapido',
  },
};

export function t(language: SiteLanguage, key: string, fallback: string): string {
  return dictionaries[language]?.[key] || fallback;
}
