import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading'; // Pakai loading comic
import { TrendingUp, Search as SearchIcon, Flame } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { pickDetailPath } from '../lib/utils';

export const Trending = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslation();

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      const response = await api.getDonghuaPopular();
      if (response.success) {
        setTrending(response.data);
      }
      setLoading(false);
    };
    fetchTrending();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#fdf6e3] dark:bg-slate-950 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header ala Koran Komik */}
        <div className="mb-12">
          <div className="inline-block bg-[#FFD700] border-[4px] border-black p-6 -rotate-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter flex items-center gap-4">
              <Flame className="w-10 h-10 md:w-14 md:h-14 text-[#FF0000]" fill="currentColor" />
              {t('trendingNow')}
            </h1>
          </div>
          <p className="mt-6 font-black text-black uppercase tracking-[0.3em] bg-white border-2 border-black inline-block px-4 py-1">
            What's burning the charts right now?
          </p>
        </div>

        {trending.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {trending.map((movie, idx) => {
              const key = pickDetailPath(movie) || `${movie.id ?? movie.pid ?? idx}-${idx}`;
              return (
                <div key={key} className={idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}>
                  <MovieCard movie={movie} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border-[4px] border-dashed border-black">
            <p className="text-2xl font-black uppercase italic">The charts are empty, captain!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const response = await api.search(query);
      if (response.success) {
        setResults(response.data);
      }
      setLoading(false);
    };
    fetchResults();
  }, [query]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#fdf6e3] dark:bg-slate-950 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header ala Detective Investigation */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-16 h-16 bg-white border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">
               <SearchIcon className="w-10 h-10 text-[#FF0000]" strokeWidth={3} />
             </div>
             <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
               Case <span className="text-[#FF0000]">Files</span>
             </h1>
          </div>
          
          {query && (
            <div className="bg-black text-white px-4 py-2 inline-block -skew-x-12 border-r-[6px] border-[#FFD700]">
              <p className="font-bold text-lg uppercase italic">
                Scanning for: <span className="text-yellow-300">"{query}"</span>
              </p>
            </div>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {results.map((movie, idx) => {
              const key = pickDetailPath(movie) || `${movie.id ?? movie.pid ?? idx}-${idx}`;
              return (
                <div key={key} className={idx % 2 !== 0 ? 'rotate-1' : '-rotate-1'}>
                  <MovieCard movie={movie} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative p-12 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center">
               <SearchIcon className="w-20 h-20 text-gray-300 mx-auto mb-6 border-b-4 border-black pb-4" />
               <h2 className="text-3xl font-black uppercase italic mb-2">No Leads!</h2>
               <p className="font-bold text-gray-500 uppercase">
                 {query ? `Intel "${query}" gak ditemukan di arsip kami!` : 'Ketik sesuatu untuk mulai mencari...'}
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
