import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Detail from './pages/Detail';
import ComicDetail from './pages/ComicDetail';
import PlayerAlternative from './pages/PlayerAlternative';
import { Trending, Search } from './pages/TrendingAndSearch';
import CategoryPage from './pages/CategoryPage';
import AdultPage from './pages/AdultPage';
import AdultPlayer from './pages/AdultPlayer';
import { CATEGORY_PAGES } from './data/categoryConfig';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import { useTheme } from './contexts/ThemeContext';
import { cn } from './lib/utils';

function App() {
  const { theme } = useTheme();

  // Menyelaraskan tema ke elemen HTML paling atas
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#020617'; // Warna Slate-950
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#ffffff'; // Warna Putih
    }
  }, [theme]);

  return (
    <Router>
      <ScrollToTop />
      <div
        className={cn(
          'flex flex-col min-h-screen transition-colors duration-300',
          'selection:bg-yellow-300 selection:text-black',
          theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-black'
        )}
      >
        <Navbar />

        {/* Tambahkan bg-[var(--app-bg)] agar tidak ada celah antara konten & footer */}
        <main className="flex-grow relative mt-20 bg-[var(--app-bg)] transition-colors duration-300">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/search" element={<Search />} />
            <Route path="/adult" element={<AdultPage />} />
            <Route path="/adult/player" element={<AdultPlayer />} />
            {CATEGORY_PAGES.map((config) => (
              <Route key={config.key} path={config.path} element={<CategoryPage config={config} />} />
            ))}
            <Route path="/detail/:slug" element={<Detail />} />
            <Route path="/comic/*" element={<ComicDetail />} />
            <Route path="/player" element={<PlayerAlternative />} />
          </Routes>
        </main>

        <ScrollToTopButton />
        <Footer />

        {/* Dekorasi Garis Samping (Disesuaikan warnanya untuk Dark Mode) */}
        <div className="fixed top-0 left-0 w-1.5 h-full bg-black z-[100] hidden lg:block dark:bg-slate-800"></div>
        <div className="fixed top-0 right-0 w-1.5 h-full bg-black z-[100] hidden lg:block dark:bg-slate-800"></div>
      </div>
    </Router>
  );
}

export default App;