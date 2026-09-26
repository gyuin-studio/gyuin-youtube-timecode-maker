import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Trash2, Play, Pause, Edit2, Volume2, AlertCircle } from 'lucide-react';
import { AudioTrack } from '../types';
import { formatTimecode, formatDurationHuman } from '../utils/audio';

interface TrackItemProps {
  track: AudioTrack & { startTime: number; timecode: string };
  index: number;
  totalTracks: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onRemoveTrack: (id: string) => void;
  isPlaying: boolean;
  onTogglePlay: (id: string) => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  index,
  totalTracks,
  onMoveUp,
  onMoveDown,
  onUpdateTitle,
  onRemoveTrack,
  isPlaying,
  onTogglePlay,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(track.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempTitle(track.title);
  }, [track.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = tempTitle.trim();
    if (trimmed) {
      onUpdateTitle(track.id, trimmed);
    } else {
      setTempTitle(track.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempTitle(track.title);
      setIsEditing(false);
    }
  };

  const formattedNum = String(index + 1).padStart(2, '0');

  return (
    <div
      id={`track-item-${track.id}`}
      className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all ${
        isPlaying
          ? 'bg-[#F2FAF5] border-[#7CCB9A] shadow-xs ring-1 ring-[#7CCB9A]/40'
          : 'bg-white border-[#DDEFE4] hover:border-[#BCE2CD] hover:bg-[#FAFDFC]'
      }`}
    >
      {/* Left section: Number, Timecode & Title */}
      <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
        {/* Track Number & Up/Down Ordering Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-7 text-center font-mono font-bold text-xs sm:text-sm text-[#468263]">
            {formattedNum}
          </span>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              aria-label={`${track.title} 위로 이동`}
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              className="p-1 rounded-md text-[#2F6F4E] hover:bg-[#EAF7F0] disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label={`${track.title} 아래로 이동`}
              disabled={index === totalTracks - 1}
              onClick={() => onMoveDown(index)}
              className="p-1 rounded-md text-[#2F6F4E] hover:bg-[#EAF7F0] disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Start Timecode Badge */}
        <div className="shrink-0 px-2.5 py-1 rounded-md bg-[#2F6F4E] text-white font-mono font-bold text-xs tracking-wider shadow-2xs">
          {track.timecode}
        </div>

        {/* Play/Pause Preview Button (if file available) */}
        {track.file && (
          <button
            type="button"
            onClick={() => onTogglePlay(track.id)}
            title={isPlaying ? '미리듣기 정지' : '미리듣기 재생'}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[#7CCB9A] text-[#13462B] ring-2 ring-[#7CCB9A]/50'
                : 'bg-[#EAF7F0] text-[#2F6F4E] hover:bg-[#DDF2E6]'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
        )}

        {/* Track Title (Inline Edit) */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1.5 w-full">
              <input
                ref={inputRef}
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm font-semibold text-[#1B4B34] bg-white border-2 border-[#7CCB9A] rounded-md outline-hidden shadow-xs focus:ring-1 focus:ring-[#7CCB9A]"
                placeholder="곡 제목을 입력하세요"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-2.5 py-1 text-xs font-bold text-white bg-[#2F6F4E] rounded-md hover:bg-[#23583D] shrink-0 cursor-pointer"
              >
                저장
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group/edit cursor-pointer" onClick={() => setIsEditing(true)}>
              <span className="font-semibold text-sm sm:text-base text-[#1E4D36] truncate hover:text-[#0C3B24]">
                {track.title}
              </span>
              <button
                type="button"
                aria-label="곡 제목 수정"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="opacity-0 group-hover/edit:opacity-100 p-1 text-[#69A083] hover:text-[#2F6F4E] transition-opacity cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Original file name subtext */}
          <div className="text-[11px] text-[#719E86] truncate mt-0.5 flex items-center gap-1 font-mono">
            <span>원본: {track.originalFileName}</span>
            {track.duration < 10 && track.duration > 0 && (
              <span className="inline-flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-sans text-[10px] font-medium">
                <AlertCircle className="w-2.5 h-2.5" /> 10초 미만
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Duration pill, audio status, delete button */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBF5EF] shrink-0">
        {/* Track Duration Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF7F0] border border-[#CCE8D8] text-xs font-mono font-semibold text-[#2F6F4E]">
          <Volume2 className="w-3.5 h-3.5 text-[#5B9C7B]" />
          <span>{formatTimecode(track.duration)}</span>
          <span className="text-[10px] text-[#6CA589] font-sans">
            ({formatDurationHuman(track.duration)})
          </span>
        </div>

        {/* Delete Track Button */}
        <button
          type="button"
          aria-label={`${track.title} 삭제`}
          title="목록에서 제거"
          onClick={() => onRemoveTrack(track.id)}
          className="p-1.5 rounded-md text-[#78A891] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
