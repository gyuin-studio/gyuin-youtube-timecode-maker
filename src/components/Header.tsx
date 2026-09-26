import React from 'react';
import { Music2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentStep: 1 | 2 | 3;
}

export const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  return (
    <header className="w-full pt-8 pb-6 px-4 max-w-5xl mx-auto">
      {/* Title & Subtitle */}
      <div className="flex flex-col items-center text-center mb-7">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF7F0] border border-[#DDEFE4] mb-3.5 shadow-xs">
          <Music2 className="w-4 h-4 text-[#2F6F4E]" />
          <span className="text-xs font-semibold text-[#2F6F4E] tracking-tight">
            브라우저 로컬 처리 · 서버 미전송
          </span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2F6F4E] tracking-tight leading-tight">
          규인 유튜브 타임코드 메이커
        </h1>
        
        <p className="mt-2 text-sm sm:text-base text-[#417E5E] max-w-xl font-medium">
          음원 길이를 자동 계산해 유튜브 설명란용 트랙리스트를 만들어주는 도구
        </p>
      </div>

      {/* 3-Step Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-3xl mx-auto mb-5">
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            currentStep === 1
              ? 'bg-white border-[#7CCB9A] shadow-xs ring-1 ring-[#7CCB9A]/30'
              : 'bg-[#F2FAF5]/70 border-[#DDEFE4] text-[#4F8A6B]'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 1
                ? 'bg-[#7CCB9A] text-white'
                : currentStep > 1
                ? 'bg-[#2F6F4E] text-white'
                : 'bg-[#DDEFE4] text-[#2F6F4E]'
            }`}
          >
            {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#669F82]">1단계</div>
            <div className="text-xs sm:text-sm font-bold text-[#2F6F4E] truncate">음원 등록하기</div>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            currentStep === 2
              ? 'bg-white border-[#7CCB9A] shadow-xs ring-1 ring-[#7CCB9A]/30'
              : 'bg-[#F2FAF5]/70 border-[#DDEFE4] text-[#4F8A6B]'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 2
                ? 'bg-[#7CCB9A] text-white'
                : currentStep > 2
                ? 'bg-[#2F6F4E] text-white'
                : 'bg-[#DDEFE4] text-[#2F6F4E]'
            }`}
          >
            {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#669F82]">2단계</div>
            <div className="text-xs sm:text-sm font-bold text-[#2F6F4E] truncate">곡 순서 및 이름 확인</div>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            currentStep === 3
              ? 'bg-white border-[#7CCB9A] shadow-xs ring-1 ring-[#7CCB9A]/30'
              : 'bg-[#F2FAF5]/70 border-[#DDEFE4] text-[#4F8A6B]'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep === 3
                ? 'bg-[#7CCB9A] text-white'
                : 'bg-[#DDEFE4] text-[#2F6F4E]'
            }`}
          >
            3
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#669F82]">3단계</div>
            <div className="text-xs sm:text-sm font-bold text-[#2F6F4E] truncate">타임코드 바로 복사</div>
          </div>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="flex items-start sm:items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F0FAF4] border border-[#DDEFE4] text-xs text-[#2F6F4E] max-w-3xl mx-auto shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-[#2F6F4E] shrink-0 mt-0.5 sm:mt-0" />
        <span className="leading-relaxed font-medium">
          업로드하신 오디오 파일은 서버에 전송되거나 저장되지 않으며, 사용자의 브라우저 안에서만 분석됩니다.
        </span>
      </div>
    </header>
  );
};
