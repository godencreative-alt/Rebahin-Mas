import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Maximize, AlertCircle, ExternalLink, Play, Minimize, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn, pickEpisodes, pickPlayerUrl } from '../lib/utils';
import { api } from '../services/api';
import { useTranslation } from '../lib/i18n';
import HlsPlayer from '../components/players/HlsPlayer';
import ComicReader from '../components/players/ComicReader';

// Decide which player to render: comic reader, HLS, or iframe.
const resolvePlayerMode = (mode, url) => {
  if (mode === 'comic') return 'comic';
  if (mode === 'hls' || /\.m3u8(\?|$)/i.test(url || '')) return 'hls';
  return 'iframe';
};

const PlayerAlternative = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const playerUrl = searchParams.get('url');
  const detailPathParam = searchParams.get('detailPath');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [episodeList, setEpisodeList] = useState([]);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const t = useTranslation();

  const toNumberParam = (value) => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const seasonParam = toNumberParam(searchParams.get('season'));
  const episodeParam = toNumberParam(searchParams.get('episode'));

  const playerMode = resolvePlayerMode(searchParams.get('mode'), playerUrl);
  // Comic pages: comma-separated image URLs passed via the `pages` param.
  const comicPages = useMemo(() => {
    const raw = searchParams.get('pages');
    return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
  }, [searchParams]);

  useEffect(() => {
    if (!detailPathParam) {
      setEpisodeList([]);
      return;
    }
    setEpisodeLoading(true);
    api.getDetail(detailPathParam)
      .then((response) => {
        if (response.success && response.data) {
          setEpisodeList(pickEpisodes(response.data));
        } else {
          setEpisodeList([]);
        }
      })
      .catch(() => setEpisodeList([]))
      .finally(() => setEpisodeLoading(false));
  }, [detailPathParam]);

  const updateSearchParams = (overrides) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const navigateToEpisode = (episode) => {
    const targetUrl = pickPlayerUrl(episode);
    if (!targetUrl) return;
    updateSearchParams({
      url: targetUrl,
      detailPath: detailPathParam,
      season: episode.season,
      episode: episode.episode
    });
  };

  const currentEpisodeIndex = useMemo(() => {
    if (!episodeList.length) return -1;
    if (seasonParam !== null && episodeParam !== null) {
      return episodeList.findIndex((ep) => Number(ep.season) === seasonParam && Number(ep.episode) === episodeParam);
    }
    if (playerUrl) return episodeList.findIndex((ep) => pickPlayerUrl(ep) === playerUrl);
    return -1;
  }, [episodeList, seasonParam, episodeParam, playerUrl]);

  const prevEpisode = currentEpisodeIndex > 0 ? episodeList[currentEpisodeIndex - 1] : null;
  const nextEpisode = currentEpisodeIndex >= 0 && currentEpisodeIndex < episodeList.length - 1 ? episodeList[currentEpisodeIndex + 1] : null;

  const handleFullscreen = async () => {
    const container = document.getElementById('player-container');
    if (container) {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    }
  };

  // Comic mode has no single playerUrl; it relies on the pages param instead.
  if (!playerUrl && playerMode !== 'comic') return null;

  return (
    <div className={cn("min-h-screen transition-colors duration-500", isTheaterMode ? "bg-black" : "bg-[var(--app-bg)]")}>
      
      {/* 1. NAVIGATION BAR - DISEJAJARKAN DENGAN NAVBAR */}
      <div className={cn(
        "sticky top-0 z-50 border-b-[4px] border-black transition-all shadow-[0_4px_0_0_rgba(0,0,0,1)]",
        isTheaterMode ? "bg-black border-gray-800" : "bg-white dark:bg-slate-950 dark:border-slate-800"
      )}>
        {/* Container max-w-7xl agar sejajar dengan Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="border-2 font-black text-lg uppercase dark:bg-yellow-400 dark:text-white italic border-black text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <ArrowLeft className="w-5 h-5 mr-2 text-black dark:text-white" strokeWidth={3} />
                <span className="hidden sm:inline">{t('backText')}</span>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="p-2 border-2 border-black bg-white text-black hover:bg-yellow-300 shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all hidden md:block"
              >
                {isTheaterMode ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
              
              <Button
                onClick={handleFullscreen}
                className="font-black italic bg-[#FF0000] text-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 hover:shadow-none"
              >
                <Maximize size={18} className="mr-2" />
                FULLSCREEN
              </Button>

              {playerUrl && (
                <Button
                  onClick={() => window.open(playerUrl, '_blank')}
                  variant="outline"
                  className="flex items-center gap-2 border-2 border-black bg-white text-black font-black uppercase italic shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#00FFFF] hover:shadow-none transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-xs hidden md:inline">Buka Tab Baru</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PLAYER & CONTENT AREA - DISEJAJARKAN DENGAN NAVBAR */}
      <div className={cn(
        "mx-auto transition-all duration-500",
        isTheaterMode ? "max-w-full p-0" : "max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
      )}>
        
        <div
          id="player-container"
          className={cn(
            "relative bg-black border-[6px] border-black overflow-hidden touch-none",
            playerMode === 'comic'
              ? cn("overflow-y-auto", isTheaterMode ? "h-screen border-none" : "max-h-[80vh] shadow-[15px_15px_0_0_rgba(0,0,0,1)]")
              : cn(isTheaterMode ? "aspect-video border-none" : "aspect-video shadow-[15px_15px_0_0_rgba(0,0,0,1)]")
          )}
        >
          {playerMode === 'comic' ? (
            <ComicReader pages={comicPages} className="min-h-full" />
          ) : playerMode === 'hls' ? (
            <HlsPlayer src={playerUrl} className="w-full h-full" />
          ) : (
            <iframe
              src={playerUrl}
              className="w-full h-full pointer-events-auto"
              frameBorder="0"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
              title="Video Player"
            />
          )}
        </div>

        {/* 3. EPISODE CONTROLS - FIX FONT DI DARK MODE */}
        {!isTheaterMode && episodeList.length > 0 && (
          <div className="py-8 flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => prevEpisode && navigateToEpisode(prevEpisode)}
              disabled={!prevEpisode || episodeLoading}
              variant="outline"
              className={cn(
                "border-2 font-black uppercase italic border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5",
                "bg-white text-black", // Light Mode
                "dark:bg-slate-800 dark:text-white dark:border-white" // Fix Dark Mode
              )}
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={3} />
              <span className="text-xs">{t('prevEpisode')}</span>
            </Button>
            
            <Button
              onClick={() => nextEpisode && navigateToEpisode(nextEpisode)}
              disabled={!nextEpisode || episodeLoading}
              variant="outline"
              className={cn(
                "border-2 font-black uppercase italic border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5",
                "bg-white text-black", // Light Mode
                "dark:bg-slate-800 dark:text-white dark:border-white" // Fix Dark Mode
              )}
            >
              <span className="text-xs">{t('nextEpisode')}</span>
              <ChevronRight className="w-4 h-4" strokeWidth={3} />
            </Button>
          </div>
        )}

        {/* 4. TIPS SECTION - DISEJAJARKAN DENGAN NAVBAR */}
        {!isTheaterMode && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-[3px] border-black p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)] rotate-1 text-black dark:bg-slate-900 dark:border-white dark:text-white">
              <h3 className="font-black uppercase italic text-[#FF0000] text-sm md:text-base mb-2 flex items-center gap-2">
                <Play size={20} fill="currentColor" /> Pro Tip
              </h3>
              <p className="text-xs md:text-sm font-black leading-tight uppercase">
                Gunakan Landscape mode untuk layar penuh dan pengalaman menonton maksimal!
              </p>
            </div>

            <div className="bg-[#FFD700] border-[3px] border-black p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)] -rotate-1 text-black">
              <h3 className="font-black uppercase italic text-black text-sm md:text-base mb-2 flex items-center gap-2">
                <AlertCircle size={20} fill="black" /> Anti Skip
              </h3>
              <p className="text-xs md:text-sm font-black leading-tight uppercase">
                Fitur scroll dimatikan di area video agar menit tidak terloncat!
              </p>
            </div>

            <div className="bg-[#00FFFF] border-[3px] border-black p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)] rotate-1 text-black">
              <h3 className="font-black uppercase italic text-black text-sm md:text-base mb-2 flex items-center gap-2">
                <ExternalLink size={20} /> Tab Baru
              </h3>
              <p className="text-xs md:text-sm font-black leading-tight uppercase">
                Jika player terasa berat, klik tombol biru "Buka Tab Baru" di bagian atas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerAlternative;