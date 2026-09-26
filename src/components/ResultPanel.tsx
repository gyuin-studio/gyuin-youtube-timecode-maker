import React, { useState, useEffect } from 'react';
import { Copy, Check, FileDown, FileText, Settings2 } from 'lucide-react';
import { AudioTrack, TimecodeFormatStyle } from '../types';
import { generateTracklistOutput, downloadTextFile } from '../utils/audio';

interface ResultPanelProps {
  tracks: (AudioTrack & { startTime: number; timecode: string })[];
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ tracks }) => {
  const [formatStyle, setFormatStyle] = useState<TimecodeFormatStyle>('numbered');
  const [customText, setCustomText] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isManualEdited, setIsManualEdited] = useState(false);

  // Automatically update text when tracks change (unless user manually touched text)
  useEffect(() => {
    if (!isManualEdited) {
      const generated = generateTracklistOutput(tracks, formatStyle);
      setCustomText(generated);
    }
  }, [tracks, formatStyle, isManualEdited]);

  const handleCopy = async () => {
    if (!customText) return;
    try {
      await navigator.clipboard.writeText(customText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = customText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    downloadTextFile(customText, `youtube_tracklist_${today}.txt`);
  };

  const handleFormatChange = (newStyle: TimecodeFormatStyle) => {
    setFormatStyle(newStyle);
    setIsManualEdited(false);
    const updated = generateTracklistOutput(tracks, newStyle);
    setCustomText(updated);
  };

  const handleResetToAuto = () => {
    setIsManualEdited(false);
    const generated = generateTracklistOutput(tracks, formatStyle);
    setCustomText(generated);
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 mb-8">
      <div className="rounded-2xl bg-white border border-[#DDEFE4] p-5 sm:p-7 shadow-xs">
        {/* Header & Format Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#EAF5EF]">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2F6F4E]" />
              <h3 className="text-lg font-bold text-[#2F6F4E]">
                생성된 유튜브 설명란용 타임코드
              </h3>
            </div>
            <p className="text-xs text-[#528A6D] mt-1">
              아래 텍스트를 복사하여 유튜브 영상 설명란이나 고정 댓글에 붙여넣으세요.
            </p>
          </div>

          {/* Format style toggle */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#F2FAF5] p-1 rounded-xl border border-[#DDEFE4]">
            <span className="text-[11px] font-semibold text-[#5A9275] px-2 flex items-center gap-1">
              <Settings2 className="w-3 h-3" /> 형식:
            </span>
            <button
              type="button"
              onClick={() => handleFormatChange('numbered')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formatStyle === 'numbered'
                  ? 'bg-white text-[#2F6F4E] shadow-2xs'
                  : 'text-[#588F72] hover:text-[#2F6F4E]'
              }`}
            >
              00:00 01. 제목 (기본)
            </button>
            <button
              type="button"
              onClick={() => handleFormatChange('simple')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formatStyle === 'simple'
                  ? 'bg-white text-[#2F6F4E] shadow-2xs'
                  : 'text-[#588F72] hover:text-[#2F6F4E]'
              }`}
            >
              00:00 제목
            </button>
            <button
              type="button"
              onClick={() => handleFormatChange('hyphen')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formatStyle === 'hyphen'
                  ? 'bg-white text-[#2F6F4E] shadow-2xs'
                  : 'text-[#588F72] hover:text-[#2F6F4E]'
              }`}
            >
              00:00 - 제목
            </button>
          </div>
        </div>

        {/* Textarea for preview and copy */}
        <div className="relative mb-5">
          <textarea
            id="output-tracklist-textarea"
            rows={Math.min(14, Math.max(6, tracks.length + 2))}
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              setIsManualEdited(true);
            }}
            className="w-full p-4 font-mono text-xs sm:text-sm text-[#1B4B34] bg-[#FAFDFC] border border-[#D0EADB] rounded-xl focus:border-[#7CCB9A] focus:ring-2 focus:ring-[#7CCB9A]/20 outline-hidden leading-relaxed shadow-inner"
            placeholder="음원 파일을 등록하면 타임코드가 여기에 자동으로 생성됩니다."
          />

          {isManualEdited && (
            <div className="absolute top-2 right-3 flex items-center gap-2">
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-sans">
                직접 편집됨
              </span>
              <button
                type="button"
                onClick={handleResetToAuto}
                className="text-[11px] text-[#2F6F4E] underline hover:text-[#19442F] cursor-pointer bg-white/90 px-1.5 py-0.5 rounded"
              >
                원래대로 복구
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons: 전체 타임코드 복사하기 (Main Prominent Button) & 메모장 저장 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#5D9478] order-2 sm:order-1">
            총 {tracks.length}개 챕터 타임라인
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
            {/* 메모장(.txt) 파일로 저장 버튼 (Feature 13) */}
            <button
              type="button"
              id="btn-save-txt"
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-[#2F6F4E] bg-[#EAF7F0] hover:bg-[#DDF2E6] border border-[#CCE8D8] active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
            >
              <FileDown className="w-4 h-4 text-[#2F6F4E]" />
              <span>메모장(.txt) 파일로 저장</span>
            </button>

            {/* 전체 타임코드 복사하기 버튼 (Feature 12 - Prominent Main Button) */}
            <button
              type="button"
              id="btn-copy-timecodes"
              onClick={handleCopy}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm sm:text-base text-white active:scale-[0.98] transition-all shadow-md cursor-pointer ${
                isCopied
                  ? 'bg-[#1E7D4E] ring-2 ring-[#7CCB9A]'
                  : 'bg-[#286745] hover:bg-[#1E5236]'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-5 h-5 text-[#86E4A8]" />
                  <span>클립보드에 복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-[#86E4A8]" />
                  <span>전체 타임코드 복사하기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success toast hint */}
        {isCopied && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#EAF7F0] border border-[#7CCB9A] text-center text-xs font-bold text-[#1F5C3B] animate-in fade-in slide-in-from-top-1">
            ✓ 유튜브 영상 설명란이나 댓글에 바로 붙여넣기(Ctrl+V / Cmd+V)하세요!
          </div>
        )}
      </div>
    </section>
  );
};
