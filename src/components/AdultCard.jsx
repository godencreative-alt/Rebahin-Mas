import { useState } from 'react';
import { Play } from 'lucide-react';

const AdultCard = ({ item }) => {
  const [imgError, setImgError] = useState(false);

  const title = item.title || 'Untitled';
  const thumbnail = item.thumbnail;
  const videoUrl = item.videoUrl;
  const duration = item.duration;
  const views = item.views;

  const handleClick = () => {
    if (videoUrl) {
      // Navigate to internal player page — stays on godenpg, no redirect to provider
      const params = new URLSearchParams({ url: videoUrl, title });
      window.location.href = `/adult/player?${params}`;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-white dark:bg-slate-900 border-[3px] border-black dark:border-slate-700 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:-translate-x-1 cursor-pointer ${
        !videoUrl ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] overflow-hidden border-b-[3px] border-black dark:border-slate-700 bg-gray-100 dark:bg-slate-800">
        {!imgError && thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-slate-800">
            <span className="text-4xl">🔞</span>
          </div>
        )}

        {/* Play overlay */}
        {videoUrl && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 border-[3px] border-white flex items-center justify-center rotate-12">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-0.5">
            {duration}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 bg-white dark:bg-slate-900">
        <h3 className="font-black text-[10px] uppercase italic leading-tight line-clamp-2 text-black dark:text-white">
          {title}
        </h3>
        {views && (
          <p className="text-[8px] text-gray-500 mt-1">{views}</p>
        )}
        <p className="text-[8px] text-gray-400 mt-1 uppercase font-bold">{item.source}</p>
      </div>
    </div>
  );
};

export default AdultCard;