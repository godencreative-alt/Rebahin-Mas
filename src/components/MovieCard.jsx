import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Film } from 'lucide-react'; // Tambah ikon Film
import { cn, pickDetailPath, pickImage, pickTitle } from '../lib/utils';

const MovieCard = ({ movie }) => {
  const [imgError, setImgError] = useState(false);
  const imageSrc = pickImage(movie);
  const title = pickTitle(movie);
  const detailSlug = pickDetailPath(movie);
  const detailLink = detailSlug ? `/detail/${detailSlug}` : '/';
  const releaseYear = movie.year ?? movie.release_year ?? movie.release ?? movie.pub_year;
  const rating = movie.rating ?? movie.rate ?? movie.rating_score;
  // Komik: pakai comicType (manga/manhwa/manhua/adult) sebagai badge kalau ada.
  // Anime/donghua: fallback type/series/movie.
  const badgeType = movie.comicType
    ? movie.comicType
    : movie.type ?? (movie.episodes && movie.episodes.length ? 'series' : 'movie');
  const isComicBadge = Boolean(movie.comicType);

  return (
    <Link
      to={detailLink}
      className="group relative bg-white dark:bg-slate-900 border-[3px] border-black dark:border-slate-700 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none"
    >
      {/* Thumbnail Container */}
        <div className="relative aspect-[2/3] overflow-hidden border-b-[3px] border-black bg-gray-100 dark:bg-slate-800">
        
        {/* Logika Gambar / Placeholder */}
        {!imgError ? (
          <img
            src={imageSrc || 'https://dummyimage.com/400x600/000/fff&text=No+Image'}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1"
            loading="lazy"
          />
        ) : (
          /* Placeholder ala Komik saat gambar Gagal/Loading */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-slate-800 relative">
            {/* Tekstur Halftone Tipis di background placeholder */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 0)', backgroundSize: '10px 10px' }}></div>
            
            <div className="relative p-4 bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
              <Film className="w-12 h-12 text-gray-400 mb-2" strokeWidth={1.5} />
              <span className="text-[10px] font-black uppercase text-gray-400 italic">No Visual</span>
            </div>
            
            <div className="mt-4 px-2 py-1 bg-black text-white text-[8px] font-bold uppercase tracking-tighter -rotate-1">
              Check Connection
            </div>
          </div>
        )}
        
        {/* Overlay ala Panel Komik saat Hover */}
        <div className="absolute inset-0 bg-[#FF0000]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button - Action Bubble Style */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-yellow-400 border-[3px] border-black flex items-center justify-center transform -rotate-12 scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Badges tetap muncul di atas placeholder */}
        <div className="absolute top-3 right-[-10px] rotate-12 group-hover:rotate-0 transition-transform">
          <span className={cn(
            "px-3 py-1 text-[10px] font-black tracking-tighter border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase",
            isComicBadge
              ? (badgeType === 'adult' ? 'bg-red-600 text-white' : 'bg-[#00AAFF] text-white')
              : badgeType === 'movie' ? 'bg-[#00FFFF] text-black' : 'bg-[#FF00FF] text-white'
          )}>
            {isComicBadge ? badgeType : (badgeType === 'movie' ? 'MOVIE' : 'SERIES')}
          </span>
        </div>

        {rating && (
          <div className="absolute top-3 left-2 flex items-center space-x-1 bg-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-3">
            <Star className="w-3.5 h-3.5 text-[#FFD700]" fill="currentColor" />
            <span className="text-[11px] font-black text-black">{rating}</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 bg-white dark:bg-slate-900 min-h-[80px] flex flex-col justify-center">
        <h3 className="font-black text-sm uppercase italic leading-tight line-clamp-2 group-hover:text-[#FF0000] transition-colors tracking-tighter text-black dark:text-white">
          {title}
        </h3>
        {releaseYear && (
          <div className="mt-1 inline-block">
            <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 uppercase">
              Release: {releaseYear}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default MovieCard;
