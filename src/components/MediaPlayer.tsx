"use client";

import ImageViewer from "./ImageViewer";

interface MediaPlayerProps {
  url: string;
  fileType: string;
  fileName: string;
}

export default function MediaPlayer({ url, fileType, fileName }: MediaPlayerProps) {
  if (fileType === "audio") {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{fileName}</p>
        <audio controls className="w-full">
          <source src={url} />
          您的浏览器不支持音频播放
        </audio>
      </div>
    );
  }

  if (fileType === "video") {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
        <video controls className="w-full max-h-[500px]">
          <source src={url} />
          您的浏览器不支持视频播放
        </video>
        <p className="text-sm text-gray-500 dark:text-gray-400 p-3">{fileName}</p>
      </div>
    );
  }

  if (fileType === "image") {
    return (
      <div className="rounded-lg overflow-hidden">
        <ImageViewer src={url} alt={fileName} className="w-full" />
      </div>
    );
  }

  return null;
}
