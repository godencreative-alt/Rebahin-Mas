import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import EpisodeList from '../components/EpisodeList';
import Loading from '../components/Loading'; // Pastikan pakai komponen Loading comic kita
import { Play, ArrowLeft } from 'lucide-react';
import { pickImage, pickTitle, pickSynopsis, pickPlayerUrl, pickCastNames, pickEpisodes } from '../lib/utils';
import { useTranslation } from '../lib/i18n';
import { Button } from '../components/ui/Button';

const flattenGenres = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenGenres(entry));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === 'object') {
    return flattenGenres(Object.values(value));
  }
  return [];
};

const getGenreList = (value) => {
  const flattened = flattenGenres(value);
  if (Array.isArray(flattened)) {
    return Array.from(new Set(flattened));
  }
  return [];
};

const Detail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const response = await api.getDetail(slug);
      if (response.success) {
        const d = response.data;
        // Komik → redirect ke /comic/{code} (ComicReader punya sendiri)
        if (d.code && String(d.code).startsWith('comic:')) {
          navigate(`/comic/${encodeURIComponent(d.code)}`, { replace: true });
          return;
        }
        setDetail(d);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [slug, navigate]);

  if (loading) return <Loading />;

  if (!detail) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-white flex items-center justify-center">
        <div className="relative p-10 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-2xl font-black uppercase italic tracking-tighter">Content Missing!</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2 bg-[#FF0000] text-white border-2 border-black font-bold uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const playerUrl = pickPlayerUrl(detail);
  const title = pickTitle(detail);
  const image = pickImage(detail);
  const synopsis = pickSynopsis(detail);
  const rating = detail.rating ?? detail.rate ?? detail.rating_score;
  const year = detail.year ?? detail.release_year ?? detail.release ?? 'Unknown';
  const country = detail.country ?? detail.region ?? 'Global';
  const castSource = detail.cast ?? detail.actors ?? detail.pemeran ?? detail.castList ?? [];
  const normalizedCastSource = Array.isArray(castSource)
    ? castSource
    : typeof castSource === 'string'
      ? [castSource]
      : castSource && typeof castSource === 'object'
        ? Object.values(castSource)
        : [];
  const castList = pickCastNames(normalizedCastSource);
  const rawGenres = detail.genres ?? detail.genre ?? [];
  const genreList = getGenreList(rawGenres);
  const episodes = pickEpisodes(detail);
  const isSeries = episodes.length > 0;
  const hasPlayerUrl = Boolean(playerUrl);
  const t = useTranslation();

  const detailPathParam = detail.detailPath || detail.slug || detail.id;

  const handlePlayMovie = () => {
    if (!playerUrl) return;
    const params = new URLSearchParams();
    params.set('url', playerUrl);
    if (detailPathParam) params.set('detailPath', detailPathParam);
    navigate(`/player?${params.toString()}`);
  };

  const handleEpisodeSelect = (episode) => {
    const episodeUrl = pickPlayerUrl(episode);
    if (!episodeUrl) return;
    const params = new URLSearchParams();
    params.set('url', episodeUrl);
    if (detailPathParam) params.set('detailPath', detailPathParam);
    if (episode.season) params.set('season', episode.season);
    if (episode.episode) params.set('episode', episode.episode);
    navigate(`/player?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] text-black dark:bg-slate-950 dark:text-white">
      {/* Hero / Backdrop ala Splash Page */}
      <div className="relative h-[350px] md:h-[450px] overflow-hidden border-b-[6px] border-black">
        <div className="absolute inset-0">
          <img
            src={image || 'https://dummyimage.com/1600x900/000/fff&text=No+Image'}
            alt={title}
            className="w-full h-full object-cover blur-[2px] opacity-40 scale-105"
          />
          {/* Halftone Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 0)', backgroundSize: '10px 10px' }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdf6e3] via-transparent to-transparent"></div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start pt-24">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-2 font-black text-lg uppercase dark:bg-yellow-400 dark:text-white italic border-black text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5 mr-2 text-black dark:text-white" strokeWidth={3} />
            <span className="hidden sm:inline">{t('backText')}</span>
          </Button>
        </div>
      </div>

      {/* Main Content Card Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Poster & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-black translate-x-3 translate-y-3"></div>
              <img
                src={image || 'https://dummyimage.com/600x900/000/fff&text=No+Image'}
                alt={title}
                className="relative w-full border-[4px] border-black transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1"
              />
            </div>
            
            {/* Quick Metadata Box */}
            <div className="bg-white dark:bg-slate-900 dark:border-slate-700 border-[3px] border-black p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 pb-2">
                <span className="font-black text-xs uppercase tracking-widest text-gray-500">Rating</span>
                <span className="font-black text-lg text-[#FF0000] italic">★ {rating ?? 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 pb-2">
                <span className="font-black text-xs uppercase tracking-widest text-gray-500">Year</span>
                <span className="font-bold">{year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-widest text-gray-500">Region</span>
                <span className="font-bold">{country}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title & Story */}
          <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 dark:border-slate-700 border-[4px] border-black p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              {/* Badge Series/Movie */}
              <div className={`inline-block px-4 py-1 mb-4 border-2 border-black font-black uppercase tracking-tighter -rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                isSeries ? 'bg-[#FF00FF] text-white' : 'bg-[#00FFFF] text-black'
              }`}>
                {isSeries ? 'SERIES' : 'MOVIE'}
              </div>

              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.9] mb-6 drop-shadow-[4px_4px_0px_rgba(255,0,0,1)]">
                {title}
              </h1>

              {/* Genre Chips ala Sticker */}
              {genreList && genreList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {genreList.map((genre, index) => (
                    <span key={`${genre}-${index}`} className="px-3 py-1 bg-yellow-300 border-2 border-black font-black text-xs uppercase rotate-1 hover:rotate-0 transition-transform">
                      #{genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis Box */}
              <div className="relative mb-8">
                <h2 className="text-2xl font-black uppercase italic mb-4 flex items-center gap-2">
                  <span className="w-8 h-2 bg-[#FF0000]"></span> The Story
                </h2>
                <div className="p-4 bg-gray-50 border-l-[6px] border-black italic font-medium leading-relaxed text-gray-800 dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700">
                  {synopsis || 'Sinopsis belum tersedia.'}
                </div>
              </div>

              {/* Cast List */}
              {castList.length > 0 && (
                <div className="mb-10">
                   <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-2">Pemeran:</h3>
                   <p className="font-bold text-black border-2 border-black bg-white p-3 inline-block shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                     {castList.join(' • ')}
                   </p>
                </div>
              )}

              {/* Final Action Button */}
              {hasPlayerUrl && !isSeries && (
                <button
                  onClick={handlePlayMovie}
                  className="group relative flex items-center space-x-4 px-10 py-5 bg-[#FF0000] text-white border-[4px] border-black font-black uppercase italic text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all w-full md:w-auto justify-center"
                >
                  <Play className="w-8 h-8" fill="currentColor" />
                  <span>{t('watchNow')}</span>
                </button>
              )}
            </div>

            {/* Episode Section for Series (Outside the white box for more space) */}
            {isSeries && (
              <div className="mt-12 bg-black text-white p-8 border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(255,0,0,1)]">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8 text-[#FFD700]">
                  Select Episode
                </h2>
                <EpisodeList episodes={episodes} onEpisodeSelect={handleEpisodeSelect} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
