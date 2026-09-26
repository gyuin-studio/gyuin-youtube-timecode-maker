import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, HelpCircle, Youtube } from 'lucide-react';
import { AudioTrack } from '../types';

interface ChapterChecklistProps {
  tracks: (AudioTrack & { startTime: number; timecode: string })[];
}

export const ChapterChecklist: React.FC<ChapterChecklistProps> = ({ tracks }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Criteria checks
  // 1. Starts with 00:00
  const hasZeroStart = tracks.length > 0 && tracks[0].startTime === 0;

  // 2. At least 3 chapters
  const hasMinThreeChapters = tracks.length >= 3;

  // 3. Each chapter at least 10 seconds
  const shortTracks = tracks.filter((t) => t.duration < 10);
  const hasAllMinDuration = shortTracks.length === 0;

  // 4. In ascending order
  const isAscending = tracks.every((t, idx) => {
    if (idx === 0) return true;
    return t.startTime >= tracks[idx - 1].startTime;
  });

  const allPassed =
    tracks.length > 0 &&
    hasZeroStart &&
    hasMinThreeChapters &&
    hasAllMinDuration &&
    isAscending;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 mb-10">
      <div className="rounded-2xl bg-[#FAFDFC] border border-[#DDEFE4] overflow-hidden shadow-2xs">
        {/* Accordion Toggle Header */}
        <button
          type="button"
          id="btn-toggle-chapter-checklist"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-white hover:bg-[#F4FAF6] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EAF7F0] border border-[#CCE8D8] flex items-center justify-center text-[#2F6F4E] shrink-0">
              <Youtube className="w-4 h-4 text-[#C4302B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-[#2F6F4E]">
                  유튜브 챕터 자동 생성 조건 검사
                </span>
                <span className="text-[11px] font-semibold text-[#579172] bg-[#EAF7F0] px-2 py-0.5 rounded-full border border-[#D0EADB]">
                  고급 기능
                </span>
              </div>
              <p className="text-xs text-[#528A6D] mt-0.5">
                유튜브 영상 플레이어 하단에 타임라인 구간이 활성화되는 공식 조건을 점검합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tracks.length > 0 && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                  allPassed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {allPassed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 유튜브 조건 100% 만족
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> 조건 확인 권장
                  </>
                )}
              </span>
            )}
            <div className="w-7 h-7 rounded-lg bg-[#F2FAF5] flex items-center justify-center text-[#2F6F4E]">
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {/* Accordion Content */}
        {isOpen && (
          <div className="p-4 sm:p-6 border-t border-[#EAF5EF] bg-[#FAFFFC] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Rule 1 */}
              <div className="p-3.5 rounded-xl bg-white border border-[#DDEFE4] flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {hasZeroStart ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#2F6F4E]">
                    1. 첫 번째 타임코드 00:00 시작
                  </div>
                  <div className="text-xs text-[#5C9477] mt-0.5">
                    {hasZeroStart
                      ? '✓ 첫 곡이 00:00으로 완벽히 설정되었습니다.'
                      : '음원 등록 시 00:00으로 자동 계산됩니다.'}
                  </div>
                </div>
              </div>

              {/* Rule 2 */}
              <div className="p-3.5 rounded-xl bg-white border border-[#DDEFE4] flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {hasMinThreeChapters ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#2F6F4E]">
                    2. 최소 3개 이상의 챕터 등록
                  </div>
                  <div className="text-xs text-[#5C9477] mt-0.5">
                    현재: <span className="font-bold">{tracks.length}개</span>{' '}
                    {hasMinThreeChapters
                      ? '(3개 이상 만족)'
                      : '(유튜브는 챕터가 3개 이상이어야 표시됩니다)'}
                  </div>
                </div>
              </div>

              {/* Rule 3 */}
              <div className="p-3.5 rounded-xl bg-white border border-[#DDEFE4] flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {hasAllMinDuration ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#2F6F4E]">
                    3. 각 챕터 최소 10초 이상 지속
                  </div>
                  <div className="text-xs text-[#5C9477] mt-0.5">
                    {hasAllMinDuration
                      ? '✓ 모든 곡이 10초 이상으로 정상입니다.'
                      : `주의: ${shortTracks.length}곡이 10초 미만입니다. (${shortTracks
                          .map((t) => t.title)
                          .join(', ')})`}
                  </div>
                </div>
              </div>

              {/* Rule 4 */}
              <div className="p-3.5 rounded-xl bg-white border border-[#DDEFE4] flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isAscending ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#2F6F4E]">
                    4. 타임코드 시간 순서 오름차순 나열
                  </div>
                  <div className="text-xs text-[#5C9477] mt-0.5">
                    누적 시간 계산으로 항상 시간 순서대로 보장됩니다.
                  </div>
                </div>
              </div>
            </div>

            {/* Practical YouTube Tips */}
            <div className="p-3.5 rounded-xl bg-[#F0FAF4] border border-[#CCE8D8] text-xs text-[#2F6F4E] flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#2F6F4E] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">유튜브 업로드 꿀팁:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[#41795E]">
                  <li>
                    유튜브 영상 설명란(Description)의 첫 줄이나 단락에 타임코드를 붙여넣으세요.
                  </li>
                  <li>
                    타임코드와 제목 사이는 공백 하나를 띄워두는 것이 공식 권장 규격입니다.
                  </li>
                  <li>
                    영상이 1시간을 넘는 경우 01:00:00과 같이 3자리 형식으로 표기되어도 유튜브에서 정상 인식됩니다.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
