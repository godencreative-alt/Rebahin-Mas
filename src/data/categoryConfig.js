import { Tv2, Sparkles, BookOpen, Heart } from 'lucide-react';

// Kategori GODENPG v2: anime (Otakudesu) + donghua (Anichin) + komik (Vault).
export const CATEGORY_PAGES = [
  {
    key: 'anime',
    path: '/anime',
    name: 'Anime',
    action: 'anime',
    title: 'Anime Universe',
    subtitle: 'Anime terbaru dengan subtitle Indonesia.',
    accent: '#FF4500',
    badge: 'ANIME',
    icon: Tv2
  },
  {
    key: 'donghua',
    path: '/donghua',
    name: 'Donghua',
    action: 'donghua',
    title: 'Donghua Spotlight',
    subtitle: 'Animasi Tiongkok pilihan, subtitle Indonesia.',
    accent: '#FF00FF',
    badge: 'DONGHUA',
    icon: Sparkles
  },
  {
    key: 'komik',
    path: '/komik',
    name: 'Komik',
    action: 'komik',
    title: 'Comic Vault',
    subtitle: 'Manga, manhwa, manhua — baca online.',
    accent: '#00AAFF',
    badge: 'KOMIK',
    icon: BookOpen
  },
];
