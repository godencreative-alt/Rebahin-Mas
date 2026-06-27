import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { pickDetailPath } from '../lib/utils';

const COMIC_FILTERS = [
  { key: '', label: 'All' },
  { key: 'manga', label: 'Manga' },
  { key: 'manhwa', label: 'Manhwa' },
  { key: 'manhua', label: 'Manhua' },
  { key: 'adult', label: 'Adult' },
];

const CategoryPage = ({ config }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [comicType, setComicType] = useState('');
  const [genres, setGenres] = useState([]);
  const { action, title, subtitle, accent, badge } = config || {};
  const headingAccent = accent || '#FF0000';
  const headingBadge = badge || 'SERIES';
  const isComic = action === 'komik';

  // Fetch genre list untuk komik (sekali saat mount komik)
  useEffect(() => {
    if (!isComic) return;
    api.getComicGenres().then((g) => setGenres(Array.isArray(g) ? g : []));
  }, [isComic]);

  // Reset page saat ganti filter
  useEffect(() => {
    if (isComic) setPage(1);
  }, [comicType, isComic]);

  useEffect(() => {
    if (!action) return;
    const fetchData = async () => {
      setLoading(true);
      const response = isComic
        ? await api.getComics(page, comicType)
        : await api.getCategory(action, page);
      if (response.success) {
        setItems(response.data);
      }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchData();
  }, [action, page, comicType, isComic]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6e3] dark:bg-slate-900">
        <p className="text-center font-black uppercase text-2xl dark:text-white">
          Kategori tidak ditemukan.
        </p>
      </div>
    );
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#fdf6e3] dark:bg-slate-950 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 relative">
          <div
            className="inline-flex items-center gap-4 p-6 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2 bg-white dark:bg-slate-900 dark:border-slate-700"
            style={{ borderColor: headingAccent }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center text-white font-black uppercase"
              style={{ backgroundColor: headingAccent }}
            >
              {headingBadge}
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
                {title}
              </h1>
              <p className="mt-2 font-bold uppercase tracking-[0.3em] text-sm text-gray-500 dark:text-gray-300">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Filter bar — hanya komik */}
        {isComic && (
          <div className="mb-10 flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              {COMIC_FILTERS.map((f) => (
                <button
                  key={f.key || 'all'}
                  onClick={() => setComicType(f.key)}
                  className={`px-5 py-2 border-[3px] border-black font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
                    comicType === f.key
                      ? 'bg-[#00AAFF] text-white'
                      : 'bg-white text-black hover:bg-yellow-300 dark:bg-slate-900 dark:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-1">
                  Genre:
                </span>
                {genres.slice(0, 18).map((g) => (
                  <span
                    key={g.slug}
                    className="px-2 py-0.5 text-[10px] font-bold uppercase border border-black bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600"
                  >
                    {g.name} <span className="text-gray-400">{g.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 mb-16">
              {items.map((item, idx) => {
                const key = pickDetailPath(item) || `${item.id ?? idx}-${idx}`;
                return (
                  <div key={key} className={idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}>
                    <MovieCard movie={item} />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-10 border-t-4 border-black border-dashed">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="group relative flex items-center space-x-2 px-8 py-3 bg-white border-[3px] border-black font-black uppercase italic shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 disabled:opacity-30 disabled:shadow-none transition-all active:translate-x-1 active:translate-y-1 active:shadow-none dark:bg-slate-900 dark:text-white dark:border-slate-700"
              >
                <ChevronLeft className="w-6 h-6" />
                <span>Prev Page</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1"></div>
                <div className="relative px-8 py-3" style={{ backgroundColor: headingAccent, border: '3px solid black' }}>
                  <p className="font-black text-xl italic text-white tracking-widest">ISSUE #{page}</p>
                </div>
              </div>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={items.length === 0}
                className="group relative flex items-center space-x-2 px-8 py-3 bg-white border-[3px] border-black font-black uppercase italic shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-[#00FFFF] disabled:opacity-30 disabled:shadow-none transition-all active:translate-x-1 active:translate-y-1 active:shadow-none dark:bg-slate-900 dark:text-white dark:border-slate-700"
              >
                <span>Next Page</span>
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-32 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:bg-slate-900 dark:border-slate-700">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4 dark:text-white">
              Empty Panel!
            </h2>
            <p className="text-xl font-bold text-gray-500 dark:text-gray-300">Belum ada konten untuk kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
