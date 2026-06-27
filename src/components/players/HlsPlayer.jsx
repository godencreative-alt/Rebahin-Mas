import { useEffect, useRef } from 'react';

// HLS (.m3u8) player. Uses hls.js where supported, native HLS on Safari.
// hls.js is dynamically imported so it stays out of the main bundle.
const HlsPlayer = ({ src, className }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Safari / iOS plays HLS natively.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    let hls;
    let cancelled = false;
    import('hls.js').then(({ default: Hls }) => {
      if (cancelled) return;
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        // No HLS support: best-effort direct assignment.
        video.src = src;
      }
    });

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls
      playsInline
      autoPlay
    />
  );
};

export default HlsPlayer;
