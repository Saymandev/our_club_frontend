import React from 'react';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoType: 'upload' | 'youtube';
  youtubeVideoId?: string;
  duration: number;
  userProgress?: {
    watchedDuration: number;
    completionPercentage: number;
    isCompleted: boolean;
  };
}

interface VideoPlayerProps {
  video: Video;
  onTimeUpdate?: (videoId: string, currentTime: number) => void;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onTimeUpdate,
  className = ""
}) => {
  const handleTimeUpdate = (currentTime: number) => {
    if (onTimeUpdate) {
      onTimeUpdate(video._id, currentTime);
    }
  };

  const handleProgress = (progress: number) => {
    // You can add progress tracking logic here if needed
    console.log(`Video ${video._id} progress: ${progress.toFixed(2)}%`);
  };

  if (video.videoType === 'youtube' && video.youtubeVideoId) {
    return (
      <YouTubeVideoPlayer
        videoId={video.youtubeVideoId}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        className={className}
      />
    );
  }

  // Fallback to regular HTML5 video for uploaded videos
  return (
    <div className={`relative ${className}`}>
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          key={video._id}
          className="w-full h-full"
          controls
          onTimeUpdate={(e) => {
            const videoElement = e.target as HTMLVideoElement;
            handleTimeUpdate(Math.floor(videoElement.currentTime));
          }}
        >
          <source src={video.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;
