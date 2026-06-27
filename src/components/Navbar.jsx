import { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Film, Tv, TrendingUp, Home, Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { CATEGORY_PAGES } from '../data/categoryConfig';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const t = useTranslation();

  const menuItems = [
    { nameKey: 'home', path: '/', icon: Home },
    { nameKey: 'movies', path: '/movies', icon: Film },
    { nameKey: 'series', path: '/series', icon: Tv },
    { nameKey: 'trending', path: '/trending', icon: TrendingUp },
  ];

  const selectedGenrePath = useMemo(
    () => CATEGORY_PAGES.find((config) => config.path === location.pathname)?.path ?? '',
    [location.pathname]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleGenreChange = (event) => {
    const targetPath = event.target.value;
    if (targetPath) {
      navigate(targetPath);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 border-b-[4px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Container Utama - Sekarang pakai items-center agar sejajar semua */}
        <div className="flex items-center justify-between h-20 gap-2 md:gap-4">
          
          {/* LOGO SECTION */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
              <div className="relative w-9 h-9 md:w-10 md:h-10 bg-[#FF0000] border-2 border-black flex items-center justify-center transform group-hover:-rotate-6 transition-transform">
                <Film className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white leading-none">
                GODENPG-WATCH
              </span>
              <span className="text-[7px] md:text-[8px] uppercase tracking-widest bg-yellow-300 border-[1.5px] md:border-2 border-black px-1 py-0.5 text-black font-black self-start">
                By Masfiq
              </span>
            </div>
          </Link>

          {/* DESKTOP CENTER NAV (Menu & Dropdown) */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-3">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 border-[3px] border-black font-black uppercase italic text-xs transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none",
                      isActive
                        ? "bg-black text-white shadow-none translate-x-1 translate-y-1"
                        : "bg-white text-black hover:bg-[#FFD700]"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{t(item.nameKey)}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Genre Select Desktop - Text label dihapus sesuai request */}
            <select
              value={selectedGenrePath}
              onChange={handleGenreChange}
              className="border-[3px] border-black bg-white text-black text-[10px] uppercase tracking-[0.2em] font-black px-3 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] outline-none focus:ring-0 dark:bg-slate-900 dark:text-white cursor-pointer hover:bg-yellow-50"
            >
              <option value="">{t('selectGenre')}</option>
              {CATEGORY_PAGES.map((config) => (
                <option key={config.key} value={config.path}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {/* RIGHT ACTIONS (Search & Hamburger) */}
          <div className="flex items-center gap-2 md:gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex relative group shrink-0">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
              <div className="relative flex items-center bg-white border-[3px] border-black">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-32 xl:w-48 px-3 py-1.5 font-bold text-xs focus:outline-none text-black bg-transparent"
                />
                <Search className="mr-2 w-4 h-4 text-black" />
              </div>
            </form>

            {/* Desktop Only Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={toggleLanguage} className="text-[10px] border-[3px] border-black px-2 py-1.5 font-black bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 text-black">
                {language.toUpperCase()}
              </button>
              <button onClick={toggleTheme} className="border-[3px] border-black rounded-full p-1.5 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] text-black">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Mobile Menu Button - Sejajar dengan Logo */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 border-[3px] border-black bg-[#FFD700] shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t-[4px] border-black bg-[#fdf6e3] dark:bg-slate-950 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="p-5 space-y-6">
            
            {/* Search Mobile */}
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
              <div className="relative flex bg-white border-[3px] border-black">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 font-black text-sm text-black outline-none"
                  placeholder={t('searchPlaceholder')}
                />
                <button type="submit" className="bg-[#FFD700] border-l-[3px] border-black px-5 font-black italic">GO</button>
              </div>
            </form>

            {/* Language & Theme Mobile */}
            <div className="flex gap-3">
              <button onClick={toggleLanguage} className="flex-1 flex items-center justify-center gap-2 bg-white border-[3px] border-black p-3 font-black uppercase text-xs shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black">
                <Globe className="w-4 h-4" /> {language.toUpperCase()}
              </button>
              <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 bg-white border-[3px] border-black p-3 font-black uppercase text-xs shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black">
                {theme === 'dark' ? <><Sun className="w-4 h-4" /> LIGHT</> : <><Moon className="w-4 h-4" /> DARK</>}
              </button>
            </div>

            {/* Nav Links Mobile */}
            <div className="grid grid-cols-2 gap-4">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-4 border-[3px] border-black font-black uppercase italic text-xs shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all",
                      isActive ? "bg-black text-white shadow-none translate-x-1 translate-y-1" : "bg-white text-black"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {t(item.nameKey)}
                  </Link>
                );
              })}
            </div>

            {/* All Genre Grid Mobile */}
            <div className="space-y-3">
              <p className="font-black uppercase italic text-[10px] text-black dark:text-white bg-yellow-300 inline-block px-2 border-2 border-black">
                Browse Genres
              </p>
              <div className="grid grid-cols-3 gap-2 pb-4">
                {CATEGORY_PAGES.map((config) => (
                  <Link
                    key={config.key}
                    to={config.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "py-2 border-2 border-black text-center font-black uppercase text-[9px] shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                      location.pathname === config.path 
                        ? "bg-[#FF0000] text-white shadow-none translate-y-0.5" 
                        : "bg-white text-black"
                    )}
                  >
                    {config.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;