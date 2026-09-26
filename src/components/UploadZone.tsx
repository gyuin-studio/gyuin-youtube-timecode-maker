import React, { useRef, useState } from 'react';
import { FolderSearch, UploadCloud, Sparkles, Music, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onLoadDemo: () => void;
  isLoading: boolean;
  hasTracks: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  onLoadDemo,
  isLoading,
  hasTracks,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  const triggerFileDialog = () => {
    if (fileInputRef.current) {
      // Clear value so the exact same file can be re-selected
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 mb-8">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="audio-file-input"
        multiple
        accept=".mp3,.wav,.m4a,.flac,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/flac"
        onChange={handleFileChange}
        onClick={(e) => {
          // Resetting value ensures selecting identical files will re-trigger change event
          e.currentTarget.value = '';
        }}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-9 text-center transition-all ${
          isDragOver
            ? 'border-[#7CCB9A] bg-[#EDF8F2] scale-[1.008]'
            : 'border-[#DDEFE4] bg-white hover:border-[#B5DEC8] shadow-xs'
        }`}
      >
        <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
          {/* Upload Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EAF7F0] border border-[#CDE8D8] flex items-center justify-center mb-4 text-[#2F6F4E] shadow-2xs">
            {isLoading ? (
              <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-[#2F6F4E]" />
            ) : (
              <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 text-[#2F6F4E]" />
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[#2F6F4E] mb-2">
            {isLoading
              ? '음원 메타데이터를 분석하고 있습니다...'
              : '음원 파일들을 여기에 끌어다 놓으세요'}
          </h2>

          <p className="text-xs sm:text-sm text-[#4E886A] mb-5 leading-relaxed">
            파일명 앞의 번호(1, 2, 10...)를 자동으로 인식해 자연스럽게 정렬하고,
            <br className="hidden sm:inline" />
            오디오 파일의 재생 길이를 자동으로 계산합니다.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Main Prominent Button: 내 컴퓨터에서 음원 파일 찾기 */}
            <button
              type="button"
              id="btn-upload-audio"
              onClick={triggerFileDialog}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-[#286745] hover:bg-[#1E5236] active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FolderSearch className="w-5 h-5 text-[#86E4A8]" />
              <span className="tracking-tight">내 컴퓨터에서 음원 파일 찾기</span>
            </button>

            {/* Load Demo Button */}
            {!hasTracks && (
              <button
                type="button"
                id="btn-load-demo"
                onClick={onLoadDemo}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-[#2F6F4E] bg-[#EAF7F0] hover:bg-[#DDF2E6] border border-[#CCE8D7] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#2F6F4E]" />
                <span>샘플 음원 5곡으로 바로 체험</span>
              </button>
            )}
          </div>

          {/* Supported Formats Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#528A6E]">
            <span className="font-semibold text-[#2F6F4E] mr-1 flex items-center gap-1">
              <Music className="w-3.5 h-3.5" /> 지원 형식:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#F0FAF4] border border-[#DDEFE4] font-mono text-[11px] font-bold text-[#2F6F4E]">
              MP3
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#F0FAF4] border border-[#DDEFE4] font-mono text-[11px] font-bold text-[#2F6F4E]">
              WAV
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#F0FAF4] border border-[#DDEFE4] font-mono text-[11px] font-bold text-[#2F6F4E]">
              M4A
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#F0FAF4] border border-[#DDEFE4] font-mono text-[11px] font-bold text-[#2F6F4E]">
              FLAC
            </span>
            <span className="ml-2 text-[11px] text-[#699E83]">
              • 여러 파일 동시 선택 가능
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
