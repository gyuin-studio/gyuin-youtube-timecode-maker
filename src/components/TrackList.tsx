import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Plus, Clock, ListMusic } from 'lucide-react';
import { AudioTrack } from '../types';
import { TrackItem } from './TrackItem';
import { formatDurationHuman, formatTimecode } from '../utils/audio';

interface TrackListProps {
  tracks: (AudioTrack & { startTime: number; timecode: string })[];
  totalDuration: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onRemoveTrack: (id: string) => void;
  onResetAll: () => void;
  onAppendFiles: (files: FileList | File[]) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  totalDuration,
  onMoveUp,
  onMoveDown,
  onUpdateTitle,
  onRemoveTrack,
  onResetAll,
  onAppendFiles,
}) => {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const addFilesInputRef = useRef<HTMLInputElement>(null);

  // Stop playback when track is removed or component unmounts
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };
  }, []);

  const handleTogglePlay = (id: string) => {
    if (playingTrackId === id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingTrackId(null);
      return;
    }

    const targetTrack = tracks.find((t) => t.id === id);
    if (!targetTrack || !targetTrack.file) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.onended = () => {
        setPlayingTrackId(null);
      };
    }

    const fileUrl = URL.createObjectURL(targetTrack.file);
    audioPlayerRef.current.src = fileUrl;
    audioPlayerRef.current.play().then(() => {
      setPlayingTrackId(id);
    }).catch(() => {
      setPlayingTrackId(null);
    });
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAppendFiles(e.target.files);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-8">
      {/* Hidden input for adding more files */}
      <input
        ref={addFilesInputRef}
        type="file"
        multiple
        accept=".mp3,.wav,.m4a,.flac,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/flac"
        onChange={handleAddFiles}
        onClick={(e) => {
          e.currentTarget.value = '';
        }}
        className="hidden"
      />

      {/* Control Header & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#DDEFE4] shadow-xs mb-4">
        {/* Left: Summary Metrics */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-[#2F6F4E]">
            <ListMusic className="w-5 h-5 text-[#4E886A]" />
            <span className="font-bold text-sm sm:text-base">등록된 곡:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF7F0] border border-[#CCE8D8] font-bold text-xs sm:text-sm text-[#2F6F4E]">
              총 {tracks.length}곡
            </span>
          </div>

          <div className="h-4 w-px bg-[#DDEFE4] hidden sm:block" />

          <div className="flex items-center gap-2 text-[#2F6F4E]">
            <Clock className="w-5 h-5 text-[#4E886A]" />
            <span className="font-bold text-sm sm:text-base">총 재생 시간:</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-[#1E5236] bg-[#E5F5EC] px-2.5 py-0.5 rounded-md border border-[#BFE2CE]">
              {formatTimecode(totalDuration)}
            </span>
            <span className="text-xs text-[#528A6D] hidden md:inline">
              ({formatDurationHuman(totalDuration)})
            </span>
          </div>
        </div>

        {/* Right: Actions (새로 시작 & 추가 등록) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            id="btn-append-audio"
            onClick={() => addFilesInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#2F6F4E] bg-[#EAF7F0] hover:bg-[#DDF2E6] border border-[#CCE8D8] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>음원 추가</span>
          </button>

          {/* 새로 시작 버튼 (Feature 14, 15) */}
          <button
            type="button"
            id="btn-reset-all"
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#8B4848] hover:text-[#722A2A] bg-[#FFF2F2] hover:bg-[#FFE5E5] border border-[#FFD6D6] active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>새로 시작</span>
          </button>
        </div>
      </div>

      {/* Guide tooltip for ordering and editing */}
      <div className="flex items-center justify-between px-2 mb-2 text-xs text-[#5C9477]">
        <span>↑ / ↓ 버튼으로 순서를 변경하면 타임코드가 즉시 재계산됩니다.</span>
        <span>곡 제목을 클릭하면 직접 수정할 수 있습니다.</span>
      </div>

      {/* List of Tracks */}
      <div className="space-y-2.5">
        {tracks.map((track, idx) => (
          <TrackItem
            key={track.id}
            track={track}
            index={idx}
            totalTracks={tracks.length}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onUpdateTitle={onUpdateTitle}
            onRemoveTrack={onRemoveTrack}
            isPlaying={playingTrackId === track.id}
            onTogglePlay={handleTogglePlay}
          />
        ))}
      </div>
    </div>
  );
};
