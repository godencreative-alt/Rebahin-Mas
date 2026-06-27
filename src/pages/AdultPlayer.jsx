import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const AdultPlayer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const source = searchParams.get('source');
  const id = searchParams.get('id');
  const title = searchParams.get('title') || 'Adult Video';
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!source || !id) {
      setError('Missing source or id');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/adult/${source}/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (json?.data?.videoUrl) {
          setVideoUrl(json.data.videoUrl);
        } else {
          setError('Video not available');
        }
      } catch (e) {
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [source, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">{error || 'Video not available'}</h1>
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
        {videoUrl.includes('.mp4') || videoUrl.includes('.m3u8') ? (
          // Direct video — use video tag
          <video
            key={videoUrl}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full"
            src={videoUrl}
          />
        ) : (
          // Embed iframe
          <iframe
            src={videoUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            frameBorder="0"
            scrolling="no"
          />
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-gray-900 text-white">
        <p className="text-sm text-gray-400">
          {videoUrl.includes('.mp4') ? 'Direct video stream' : 'Tekan fullscreen untuk tampilan terbaik'}
        </p>
      </div>
    </div>
  );
};

export default AdultPlayer;