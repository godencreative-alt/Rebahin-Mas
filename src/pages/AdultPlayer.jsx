import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

const AdultPlayer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const videoUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'Adult Video';
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoUrl) setError(true);
  }, [videoUrl]);

  if (error || !videoUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Video tidak tersedia</h1>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-black/80 text-white border-b border-gray-800">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold truncate flex-1">{title}</h1>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-800 rounded"
          title="Buka di tab baru"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      {/* Player */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={videoUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          frameBorder="0"
          scrolling="no"
        />
      </div>

      {/* Info */}
      <div className="p-4 bg-gray-900 text-white">
        <p className="text-sm text-gray-400">Tekan fullscreen untuk tampilan terbaik</p>
      </div>
    </div>
  );
};

export default AdultPlayer;