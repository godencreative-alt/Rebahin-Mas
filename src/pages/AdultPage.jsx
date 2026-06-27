import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { api } from '../services/api';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { pickDetailPath } from '../lib/utils';

const SOURCES = [
  { key: 'pornhub', label: 'Pornhub' },
  { key: 'eporner', label: 'Eporner' },
  { key: 'xvideos', label: 'Xvideos' },
  { key: 'xhamster', label: 'Xhamster' },
  { key: 'txxx', label: 'Txxx' },
  { key: 'xnxx', label: 'Xnxx' },
];

const AdultPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('pornhub');
  const [total, setTotal] = useState(0);

  useEffect(() => { setPage(1); }, [source]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const json = await fetch(`/api/adult/${source}?page=${page}`).then(r => r.json());
      if (json?.data) {
        setItems(json.data);
        setTotal(json.total ?? 0);
      }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchData();
  }, [source, page]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#fdf6e3] dark:bg-slate-950 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-4 p-6 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2 bg-white dark:bg-slate-900" style={{ borderColor: '#DC2626' }}>
            <div className="w-12 h-12 flex items-center justify-center bg-[#DC2626] border-[3px] border-black">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Adult Zone</h1>
              <p className="mt-2 font-bold uppercase tracking-widest text-xs text-gray-500">{total} video — 6 sumber</p>
            </div>
          </div>
        </div>

        {/* Source tabs */}
        <div className="mb-8 flex flex-wrap gap-3">
          {SOURCES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSource(s.key)}
              className={`px-4 py-2 border-[3px] border-black font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
                source === s.key
                  ? 'bg-[#DC2626] text-white'
                  : 'bg-white text-black hover:bg-yellow-300 dark:bg-slate-900 dark:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 mb-16">
              {items.map((item, idx) => {
                const key = item.id ?? item.slug ?? idx;
                return (
                  <div key={key} className={idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}>
                    <MovieCard movie={item} />
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-10 border-t-4 border-black border-dashed">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-8 py-3 bg-white border-[3px] border-black font-black uppercase italic shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 disabled:opacity-30 disabled:shadow-none transition-all active:translate-x-1 active:translate-y-1 dark:bg-slate-900 dark:text-white"
              >
                <ChevronLeft className="w-6 h-6 inline" /> Prev
              </button>
              <div className="px-8 py-3 bg-[#DC2626] border-[3px] border-black font-black text-xl italic text-white">
                PAGE #{page}
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-8 py-3 bg-white border-[3px] border-black font-black uppercase italic shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-[#00FFFF] disabled:opacity-30 disabled:shadow-none transition-all active:translate-x-1 active:translate-y-1 dark:bg-slate-900 dark:text-white"
              >
                Next <ChevronRight className="w-6 h-6 inline" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-32 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-5xl font-black uppercase italic mb-4">No Content</h2>
            <p className="text-xl font-bold text-gray-500">Gak ada video untuk sumber ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdultPage;
