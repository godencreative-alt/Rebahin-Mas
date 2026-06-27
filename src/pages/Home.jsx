import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import { ChevronRight, Flame, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { pickDetailPath } from '../lib/utils';

const Home = () => {
  const [homeData, setHomeData] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [homeRes, trendingRes] = await Promise.all([
        api.getAnimeLatest(),
        api.getDonghuaPopular()
      ]);
      
      if (homeRes.success) setHomeData(homeRes.data);
      if (trendingRes.success) setTrending(trendingRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Hero Skeleton ala Comic Box */}
          <div className="h-[400px] md:h-[500px] bg-gray-200 border-[4px] border-black animate-pulse shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
          
          <div className="space-y-6">
            <div className="h-10 w-64 bg-gray-200 border-2 border-black animate-pulse" />
            <MovieGridSkeleton count={12} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-slate-950 dark:text-white">
      {/* Hero Section */}
      {homeData.length > 0 && <Hero movie={homeData[0]} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Trending Section - Action Style */}
        {trending.length > 0 && (
          <section className="relative">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#FF0000] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-6">
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black drop-shadow-[3px_3px_0px_rgba(255,215,0,1)] dark:text-white dark:text-white">
                  HOT DEALS! <span className="text-sm font-bold block md:inline md:ml-2 not-italic tracking-normal text-gray-500 dark:text-gray-300 dark:text-gray-300">Trending Now</span>
                </h2>
              </div>
              <Link to="/trending" className="group flex items-center space-x-2 font-black uppercase italic text-sm border-b-4 border-black hover:text-[#FF0000] transition-colors dark:text-white">
                <span>See All</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
              {trending.slice(0, 12).map((movie, idx) => {
                const key = pickDetailPath(movie) || `${movie.id ?? movie.pid ?? idx}-${idx}`;
                return (
                  <div key={key} className={idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}>
                    <MovieCard movie={movie} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Latest Releases - Panel Style */}
        {homeData.length > 0 && (
          <section>
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-12 h-12 bg-[#00FFFF] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-3">
                <Sparkles className="w-7 h-7 text-black" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white">
                NEW ARRIVALS
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
              {homeData.slice(1, 19).map((movie, idx) => {
                const key = pickDetailPath(movie) || `${movie.id ?? movie.pid ?? idx}-${idx}`;
                return (
                  <div key={key} className={idx % 3 === 0 ? '-rotate-1' : 'rotate-1'}>
                    <MovieCard movie={movie} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Call to Action - Retro Comic Ad Style */}
        <section className="relative overflow-hidden bg-white border-[6px] border-black p-8 md:p-16 shadow-[15px_15px_0px_0px_rgba(255,0,0,1)] dark:bg-slate-900 dark:border-slate-700">
          {/* Halftone Pattern Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(black 2px, transparent 0)', backgroundSize: '12px 12px' }}>
          </div>
          
          <div className="relative z-10 text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-block bg-yellow-300 border-2 border-black px-6 py-1 -rotate-2 mb-4">
                <span className="font-black uppercase italic text-xl">Buruan sebelum API nya Mokad Jir</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none dark:text-white">
                NONTON SEPUASNYA <br/> <span className="text-[#FF0000]">GRATIS TIAP HARI!</span>
              </h2>
              <p className="text-xl font-bold max-w-2xl mx-auto uppercase leading-tight dark:text-white">
                Streaming ribuan film dan serial TV. Nonton kapan saja, dimana saja. <br/>
                <span className="bg-black text-white px-2">No Subscription Required!</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 justify-center pt-4">
              <Button size="lg" asChild className="h-16 px-12 text-2xl">
                <Link to="/movies">JELAJAHI FILM</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="h-16 px-12 text-2xl">
                <Link to="/series">CARI SERIES</Link>
              </Button>
            </div>
          </div>

          {/* Decorative Corner Price Tag */}
          <div className="absolute top-0 right-0 bg-black text-white p-4 font-black italic -rotate-12 translate-x-4 -translate-y-2">
            GRATIS NII! JIRLAH
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
