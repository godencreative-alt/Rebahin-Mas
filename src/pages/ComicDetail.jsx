import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ComicReader from '../components/players/ComicReader';
import Loading from '../components/Loading';
import { ArrowLeft, BookOpen, ChevronDown } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

const ComicDetail = () => {
  const params = useParams();
  const splat = params['*'] || '';
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslation();

  const code = decodeURIComponent(splat);

  useEffect(() => {
    if (!code) return;
    const fetchComic = async () => {
      setLoading(true);
      const resp = await api.getComicDetail(code);
      if (resp.success) {
        setDetail(resp.data);
        const chs = resp.data.chapters || [];
        if (chs.length) {
          setActiveChapter(chs[0].chapter);
          setPages(chs[0].pages.map((p) => p.url));
        }
      }
      setLoading(false);
    };
    fetchComic();
  }, [code]);

  const handleChapterChange = (e) => {
    const ch = e.target.value;
    setActiveChapter(ch);
    const found = detail?.chapters?.find((c) => c.chapter === ch);
    if (found) setPages(found.pages.map((p) => p.url));
  };

  if (loading) return <Loading />;

  if (!detail) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="relative p-10 bg-white dark:bg-slate-900 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-slate-700">
          <p className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">Comic Missing!</p>
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

  const title = detail.title || detail.code || 'Comic';
  const synopsis = detail.synopsis || 'Sinopsis belum tersedia.';
  const thumbUrl = detail.thumbnail?.url || null;
  const chapters = detail.chapters || [];
  const allPages = chapters.reduce((sum, ch) => sum + ch.pages.length, 0);
  const comicType = detail.comicType || null;
  const comicGenres = Array.isArray(detail.genres) ? detail.genres : [];

  // Format label chapter: "chapter-01" → "Chapter 1"
  const chLabel = (name) => {
    const match = name.match(/chapter[-_](\d+)/i);
    return match ? `Chapter ${match[1]}` : name;
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-slate-950 dark:text-white">
      {/* Hero */}
      <div className="relative h-[300px] overflow-hidden border-b-[6px] border-black">
        <div className="absolute inset-0">
          {thumbUrl && (
            <img
              src={thumbUrl}
              alt={title}
              className="w-full h-full object-cover blur-[2px] opacity-30 scale-105"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 0)', backgroundSize: '10px 10px' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdf6e3] via-transparent to-transparent dark:from-slate-950" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start pt-24">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border-[3px] border-black font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-x-0.5 active:translate-y-0.5 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={3} />
            <span className="hidden sm:inline">{t('backText') || 'Back'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        {/* Info box */}
        <div className="bg-white dark:bg-slate-900 dark:border-slate-700 border-[4px] border-black p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mb-10">
          <div className="inline-block px-4 py-1 mb-4 bg-[#00AAFF] text-white border-2 border-black font-black uppercase tracking-tighter -rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            KOMIK
          </div>
          {comicType && (
            <div className="inline-block px-3 py-1 ml-2 mb-4 bg-red-600 text-white border-2 border-black font-black uppercase tracking-tighter rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              {comicType}
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.9] mb-6 drop-shadow-[4px_4px_0px_rgba(0,170,255,1)] dark:text-white">
            {title}
          </h1>

          {comicGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {comicGenres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 text-[11px] font-bold uppercase border border-black bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="relative mb-8">
            <h2 className="text-2xl font-black uppercase italic mb-4 flex items-center gap-2 dark:text-white">
              <span className="w-8 h-2 bg-[#00AAFF]"></span> Sinopsis
            </h2>
            <div className="p-4 bg-gray-50 border-l-[6px] border-black italic font-medium leading-relaxed text-gray-800 dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700">
              {synopsis}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00AAFF] text-white border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <BookOpen className="w-5 h-5" />
            <span>{chapters.length} Chapter &middot; {allPages} Halaman</span>
          </div>
        </div>

        {/* Chapter Selector */}
        {chapters.length > 0 && (
          <div className="bg-black border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,170,255,1)] mb-8">
            <div className="px-6 py-4 bg-black border-b-2 border-neutral-800 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#00AAFF]" />
              <h2 className="text-lg font-black uppercase tracking-wider text-white">Reader View</h2>
            </div>

            {/* Chapter selector */}
            <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800">
              <div className="relative inline-block">
                <select
                  value={activeChapter || ''}
                  onChange={handleChapterChange}
                  className="appearance-none bg-white border-[3px] border-black text-black font-black uppercase text-sm px-6 py-3 pr-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer"
                >
                  {chapters.map((ch) => (
                    <option key={ch.chapter} value={ch.chapter}>
                      {chLabel(ch.chapter)} ({ch.pages.length} hlm)
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
              </div>
              <span className="text-xs text-neutral-400 ml-4 font-bold">
                {activeChapter ? chLabel(activeChapter) : '-'} &middot; {(pages.length)} pages
              </span>
            </div>

            <ComicReader pages={pages} />
          </div>
        )}

        {!chapters.length && (
          <div className="bg-black border-[4px] border-black p-10 text-center">
            <p className="text-white font-black uppercase italic text-lg">Belum ada chapter tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComicDetail;
