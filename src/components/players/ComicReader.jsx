import { useState } from 'react';
import { ImageOff } from 'lucide-react';

// Vertical comic/webtoon reader. Renders an ordered list of page image URLs.
const ComicReader = ({ pages = [], className }) => {
  const [broken, setBroken] = useState({});

  if (!pages.length) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 py-20 text-black dark:text-white ${className || ''}`}>
        <ImageOff size={48} strokeWidth={3} />
        <p className="font-black uppercase italic text-sm">Halaman komik belum tersedia</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center bg-neutral-900 ${className || ''}`}>
      {pages.map((src, idx) => (
        broken[idx] ? (
          <div
            key={idx}
            className="w-full max-w-3xl flex flex-col items-center justify-center gap-2 py-16 text-white border-b border-neutral-800"
          >
            <ImageOff size={32} strokeWidth={3} />
            <span className="font-black uppercase text-xs">Halaman {idx + 1} gagal dimuat</span>
          </div>
        ) : (
          <img
            key={idx}
            src={src}
            alt={`Halaman ${idx + 1}`}
            loading="lazy"
            onError={() => setBroken((prev) => ({ ...prev, [idx]: true }))}
            className="w-full max-w-3xl block"
          />
        )
      ))}
    </div>
  );
};

export default ComicReader;
