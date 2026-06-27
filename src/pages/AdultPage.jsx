import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, AlertTriangle } from 'lucide-react';
import AdultCard from '../components/AdultCard';
import Loading from '../components/Loading';

const AgeGate = ({ onConfirm }) => (
  <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white dark:bg-slate-900 border-4 border-red-600 p-8 text-center rotate-1">
      <div className="w-20 h-20 mx-auto mb-6 bg-red-600 border-4 border-black flex items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-4xl font-black uppercase italic mb-4 tracking-tight">21+ Only</h1>
      <p className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-8 uppercase tracking-wide">
        Konten ini hanya untuk dewasa.<br />
        Anda harus berusia 21 tahun atau lebih untuk melanjutkan.
      </p>
      <div className="space-y-4">
        <button
          onClick={onConfirm}
          className="w-full py-4 px-6 bg-red-600 border-4 border-black font-black uppercase italic text-xl text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 active:translate-x-2 active:translate-y-2 active:shadow-none transition-all"
        >
          Saya berusia 21+ tahun
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full py-3 px-6 bg-white border-4 border-black font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all dark:bg-slate-800 dark:text-white"
        >
          Saya masih di bawah umur
        </button>
      </div>
      <p className="mt-6 text-xs text-gray-400 font-bold uppercase">
        Dengan melanjutkan, Anda menyatakan bahwa Anda berusia legal di wilayah Anda.
      </p>
    </div>
  </div>
);

// Genre tabs yang tidak butuh search keyword (agregat semua source)
const SPECIAL_TABS = new Set(['popular', 'latest']);

const AdultPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [verified, setVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('popular');
  const [genres, setGenres] = useState([]);

  // Cek age gate dari localStorage
  useEffect(() => {
    setVerified(localStorage.getItem('adult_verified') === 'true');
  }, []);

  // Fetch genre list
  useEffect(() => {
    if (!verified) return;
    fetch('/api/adult/genres')
      .then(r => r.json())
      .then(json => {
        if (json?.data) setGenres(json.data);
      })
      .catch(() => {});
  }, [verified]);

  const handleAgeConfirm = () => {
    localStorage.setItem('adult_verified', 'true');
    setVerified(true);
  };

  // Reset page saat ganti tab
  useEffect(() => { setPage(1); }, [activeTab]);

  // Fetch data
  useEffect(() => {
    if (!verified) return;

    const fetchData = async () => {
      setLoading(true);
      let url;
      if (SPECIAL_TABS.has(activeTab)) {
        url = `/api/adult/${activeTab}`;
      } else {
        url = `/api/adult/genre/${encodeURIComponent(activeTab)}`;
      }
      url += `?page=${page}`;

      try {
        const json = await fetch(url).then(r => r.json());
        setItems(json?.data || []);
        setTotal(json?.total ?? json?.data?.length ?? 0);
      } catch {
        setItems([]);
        setTotal(0);
      }
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    fetchData();
  }, [verified, activeTab, page]);

  if (!verified) return <AgeGate onConfirm={handleAgeConfirm} />;
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
              <p className="mt-2 font-bold uppercase tracking-widest text-xs text-gray-500">{total} video</p>
            </div>
          </div>
        </div>

        {/* Genre tabs — scroll horizontal on mobile */}
        <div className="mb-8 flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.slug}
              onClick={() => setActiveTab(genre.slug)}
              className={`px-4 py-2 border-[3px] border-black font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${
                activeTab === genre.slug
                  ? 'bg-[#DC2626] text-white'
                  : 'bg-white text-black hover:bg-yellow-300 dark:bg-slate-900 dark:text-white'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-16">
              {items.map((item, idx) => (
                <AdultCard key={item.id || idx} item={item} />
              ))}
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
            <p className="text-xl font-bold text-gray-500">Gak ada video untuk kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdultPage;