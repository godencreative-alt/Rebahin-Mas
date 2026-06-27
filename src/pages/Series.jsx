import { useEffect, useState } from 'react';
import { api } from '../services/api';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { pickDetailPath } from '../lib/utils';
import { cn } from '../lib/utils';

const FILTERS = [
  { key: 'latest', label: 'Latest' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'popular', label: 'Popular' },
];

const Series = () => {
  const [series, setSeries] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('latest');

  useEffect(() => { setPage(1); }, [filter]);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      const response = await api.getDonghuaLatest(page);
      if (filter !== 'latest') {
        const filterFn = {
          ongoing: api.getDonghuaOngoing,
          completed: api.getDonghuaCompleted,
          popular: api.getDonghuaPopular,
        }[filter];
        if (filterFn) {
          const r = await filterFn(page);
          if (r.success) { setSeries(r.data); setLoading(false); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        }
      }
      if (response.success) { setSeries(response.data); }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchSeries();
  }, [page, filter]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[var(--app-bg)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Comic Series Anthology Style */}
        <div className="mb-12 relative">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF00FF] border-[4px] border-black p-3 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] -rotate-3">
              <Tv className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            <div>
              <div className="inline-block bg-black text-white px-6 py-2 rotate-1 shadow-[4px_4px_0px_0px_rgba(255,0,255,1)]">
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                  TV ANTHOLOGY
                </h1>
              </div>
              <p className="mt-3 font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest text-[10px] bg-[var(--app-bg)] border-2 border-black inline-block px-2 py-0.5">
                Binge-watch your favorite series episodes!
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-8 flex flex-wrap gap-3">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-4 py-2 border-[3px] border-black font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none",
                filter === f.key
                  ? 'bg-[#FF00FF] text-white'
                  : 'bg-white text-black hover:bg-yellow-300 dark:bg-slate-900 dark:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Series Grid */}
        {series.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 mb-16">
              {series.map((show, idx) => {
                const key = pickDetailPath(show) || `${show.id ?? show.pid ?? idx}-${idx}`;
                return (
                  <div key={key} className={idx % 2 !== 0 ? 'rotate-1' : '-rotate-1'}>
                    <MovieCard movie={show} />
                  </div>
                );
              })}
            </div>

            {/* Pagination - Disesuaikan dengan Home agar terbaca di Dark Mode */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-10 border-t-4 border-black border-double">
              
              {/* Previous Button */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  "group relative flex items-center space-x-2 px-8 py-3 border-[3px] border-black font-black uppercase italic shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-30 disabled:shadow-none",
                  "bg-white text-black hover:bg-[#00FFFF]", // Light Mode
                  "dark:bg-slate-800 dark:text-white dark:border-white dark:hover:bg-[#00FFFF] dark:hover:text-black" // Dark Mode Fix
                )}
              >
                <ChevronLeft className="w-6 h-6" strokeWidth={3} />
                <span>Previous Arc</span>
              </button>
              
              {/* Volume/Page Indicator */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#FF00FF] translate-x-1 translate-y-1 rotate-2 border-2 border-black"></div>
                <div className={cn(
                  "relative px-8 py-3 border-[3px] border-black font-black text-xl italic transition-transform group-hover:rotate-0",
                  "bg-white text-black", // Light
                  "dark:bg-slate-900 dark:text-white dark:border-white" // Dark
                )}>
                  VOLUME {page}
                </div>
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={series.length === 0}
                className={cn(
                  "group relative flex items-center space-x-2 px-8 py-3 border-[3px] border-black font-black uppercase italic shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-30 disabled:shadow-none",
                  "bg-white text-black hover:bg-[#FF00FF] hover:text-white", // Light Mode
                  "dark:bg-slate-800 dark:text-white dark:border-white dark:hover:bg-[#FF00FF]" // Dark Mode Fix
                )}
              >
                <span>Next Arc</span>
                <ChevronRight className="w-6 h-6" strokeWidth={3} />
              </button>
              
            </div>
          </>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-slate-900 border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] -rotate-1">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4 text-[#FF00FF]">End of Season!</h2>
            <p className="text-xl font-bold text-gray-500 dark:text-gray-400">No more episodes found in this archive.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Series;