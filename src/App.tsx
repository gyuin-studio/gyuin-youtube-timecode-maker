import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { TrackList } from './components/TrackList';
import { ResultPanel } from './components/ResultPanel';
import { ChapterChecklist } from './components/ChapterChecklist';
import { AudioTrack } from './types';
import {
  parseFileName,
  readAudioDuration,
  calculateTrackTimings,
  createDemoAudioTracks,
} from './utils/audio';
import { Disc3, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function App() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');

  // Calculate cumulative timings (start time & timecode) and total duration
  const { tracksWithTimings, totalDuration } = useMemo(() => {
    return calculateTrackTimings(tracks);
  }, [tracks]);

  // Current step logic for Header indicator
  const currentStep = useMemo<1 | 2 | 3>(() => {
    if (tracks.length === 0) return 1;
    return 2;
  }, [tracks.length]);

  /**
   * Process multiple uploaded audio files:
   * 1. Natural sorting based on leading number in filename (1, 2, 3, 10, 11)
   * 2. Strip extensions (.mp3, .wav, .m4a, .flac)
   * 3. Strip leading number prefix from title
   * 4. Read duration via HTMLAudioElement loadedmetadata event
   */
  const processFiles = async (fileList: FileList | File[], append = false) => {
    const rawFiles = Array.from(fileList);
    if (rawFiles.length === 0) return;

    setIsLoading(true);
    setProgressText(`0 / ${rawFiles.length}개 음원 분석 중...`);

    // Prepare files with parsed sort orders
    const filesWithMeta = rawFiles.map((file) => {
      const parsed = parseFileName(file.name);
      return {
        file,
        parsed,
      };
    });

    // 6. Natural sort files:
    // Sort by sortNumber first (1, 2, 3, 10, 11), then natural string comparison
    filesWithMeta.sort((a, b) => {
      if (a.parsed.sortNumber !== b.parsed.sortNumber) {
        return a.parsed.sortNumber - b.parsed.sortNumber;
      }
      return a.file.name.localeCompare(b.file.name, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });

    const newTracks: AudioTrack[] = [];

    for (let i = 0; i < filesWithMeta.length; i++) {
      const { file, parsed } = filesWithMeta[i];
      setProgressText(`${i + 1} / ${filesWithMeta.length}개 음원 분석 중 (${file.name})...`);

      // Read audio duration using HTMLAudioElement loadedmetadata event (Feature 2)
      let duration = 0;
      let status: 'ready' | 'error' = 'ready';
      let errorMessage: string | undefined;

      try {
        duration = await readAudioDuration(file);
        if (duration <= 0) {
          duration = 180; // sensible default fallback if format couldn't be decoded
        }
      } catch (err) {
        status = 'error';
        errorMessage = '재생 길이를 읽을 수 없습니다.';
        duration = 180;
      }

      newTracks.push({
        id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        originalFileName: file.name,
        title: parsed.cleanTitle,
        duration,
        sortIndex: parsed.sortNumber,
        status,
        errorMessage,
      });
    }

    if (append) {
      setTracks((prev) => [...prev, ...newTracks]);
    } else {
      setTracks(newTracks);
    }

    setIsLoading(false);
    setProgressText('');
  };

  // Reordering: Move Up (Feature 10)
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setTracks((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Reordering: Move Down (Feature 10)
  const handleMoveDown = (index: number) => {
    if (index >= tracks.length - 1) return;
    setTracks((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Update track title (Feature 9)
  const handleUpdateTitle = (id: string, newTitle: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
  };

  // Remove single track
  const handleRemoveTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset all (Feature 14 & 15: clears tracks, results, total play time, and inputs)
  const handleResetAll = () => {
    setTracks([]);
    // Reset file inputs in DOM if present
    const audioInput = document.getElementById('audio-file-input') as HTMLInputElement | null;
    if (audioInput) {
      audioInput.value = '';
    }
  };

  // Load demo tracks
  const handleLoadDemo = async () => {
    setIsLoading(true);
    setProgressText('샘플 트랙을 준비하는 중...');
    const demo = await createDemoAudioTracks();
    setTracks(demo);
    setIsLoading(false);
    setProgressText('');
  };

  return (
    <div className="min-h-screen bg-[#FAFFFB] text-[#2F6F4E] flex flex-col font-sans selection:bg-[#7CCB9A]/30 selection:text-[#184E32]">
      {/* Top Header & 3-Step Flow */}
      <Header currentStep={currentStep} />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        {/* Upload Zone */}
        <UploadZone
          onFilesSelected={(files) => processFiles(files, false)}
          onLoadDemo={handleLoadDemo}
          isLoading={isLoading}
          hasTracks={tracks.length > 0}
        />

        {/* Loading status indicator */}
        {isLoading && (
          <div className="max-w-md mx-auto px-4 mb-6">
            <div className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-white border border-[#7CCB9A] shadow-xs text-sm font-bold text-[#2F6F4E] animate-pulse">
              <Disc3 className="w-5 h-5 animate-spin text-[#2F6F4E]" />
              <span>{progressText}</span>
            </div>
          </div>
        )}

        {/* If tracks are loaded */}
        {tracks.length > 0 && (
          <>
            {/* 2단계: Track List with Reordering & Inline Editing */}
            <TrackList
              tracks={tracksWithTimings}
              totalDuration={totalDuration}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onUpdateTitle={handleUpdateTitle}
              onRemoveTrack={handleRemoveTrack}
              onResetAll={handleResetAll}
              onAppendFiles={(files) => processFiles(files, true)}
            />

            {/* 3단계: Result Panel with Copy & .txt download */}
            <ResultPanel tracks={tracksWithTimings} />

            {/* Collapsible YouTube Chapter Requirements Checklist (Feature 18) */}
            <ChapterChecklist tracks={tracksWithTimings} />
          </>
        )}

        {/* Empty state hint */}
        {tracks.length === 0 && !isLoading && (
          <div className="max-w-2xl mx-auto px-4 mt-2 text-center">
            <div className="p-6 rounded-2xl bg-[#F4FAF6]/80 border border-[#DDEFE4] text-xs sm:text-sm text-[#467E60] leading-relaxed">
              <p className="font-bold text-[#2F6F4E] mb-1.5 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7CCB9A]" />
                유튜브 재생목록 설명란에 바로 쓰는 팁
              </p>
              음원 파일명 앞에 <code className="px-1.5 py-0.5 rounded bg-white border border-[#CCE8D8] font-mono font-bold text-[#2F6F4E]">01. </code>, <code className="px-1.5 py-0.5 rounded bg-white border border-[#CCE8D8] font-mono font-bold text-[#2F6F4E]">02. </code> 번호를 붙여두시면 업로드 시 자동으로 올바른 순서로 정렬되며, 번호는 제목에서 깔끔하게 제거되어 번호 없는 순수 곡 제목으로 타임코드가 생성됩니다.
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#DDEFE4] bg-white/70 py-6 px-4 text-center text-xs text-[#5D9478]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#2F6F4E]">규인 유튜브 타임코드 메이커</span>
            <span>•</span>
            <span>음원 길이 자동 계산기</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#63987E]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F6F4E]" />
            <span>오디오 파일 비저장 • 100% 클라이언트 브라우저 로컬 구동</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
