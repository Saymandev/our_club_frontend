import React, { useEffect, useRef, useState } from 'react';

interface YouTubeVideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({
  videoId,
  onTimeUpdate,
  onProgress,
  className = ""
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initializePlayer = () => {
      if (window.YT && window.YT.Player && playerRef.current) {
        youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 1,
            cc_load_policy: 0,
            iv_load_policy: 3,
            autohide: 0
          },
          events: {
            onReady: () => {
              setIsPlayerReady(true);
              console.log('YouTube player ready');
            },
            onStateChange: () => {
              // Handle player state changes
              if (youtubePlayerRef.current) {
                const state = youtubePlayerRef.current.getPlayerState();
                if (state === window.YT.PlayerState.PLAYING) {
                  startProgressTracking();
                } else if (state === window.YT.PlayerState.PAUSED) {
                  stopProgressTracking();
                }
              }
            }
          }
        });
      }
    };

    // Wait for YouTube API to load
    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, [videoId]);

  const startProgressTracking = () => {
    const interval = setInterval(() => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
        const currentTime = youtubePlayerRef.current.getCurrentTime();
        const duration = youtubePlayerRef.current.getDuration();
        
        if (onTimeUpdate) {
          onTimeUpdate(Math.floor(currentTime));
        }
        
        if (onProgress && duration > 0) {
          const progress = (currentTime / duration) * 100;
          onProgress(progress);
        }
      }
    }, 1000);

    // Store interval ID for cleanup
    (youtubePlayerRef.current as any).progressInterval = interval;
  };

  const stopProgressTracking = () => {
    if (youtubePlayerRef.current && (youtubePlayerRef.current as any).progressInterval) {
      clearInterval((youtubePlayerRef.current as any).progressInterval);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={playerRef}
        className="w-full h-full"
        style={{ aspectRatio: '16/9' }}
      />
      {!isPlayerReady && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading video...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default YouTubeVideoPlayer;
