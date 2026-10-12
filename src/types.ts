export interface AudioTrack {
  id: string;
  file?: File;
  originalFileName: string;
  title: string;
  duration: number; // exact duration in seconds (float, e.g. 165.74)
  sortIndex: number;
  objectUrl?: string;
  status: 'loading' | 'ready' | 'error';
  errorMessage?: string;
}

export interface TrackWithTiming extends AudioTrack {
  startTime: number;             // backward compatibility integer seconds (= startSeconds)
  startSeconds: number;          // 시작 지점 정수 초 (Math.floor(rawStartTime))
  nextStartSeconds: number;      // 다음 시작 지점 정수 초 (Math.floor(rawEndTime))
  displayIntervalSeconds: number;// 표시 구간 정수 초 (nextStartSeconds - startSeconds)
  timecode: string;              // 시작 지점 타임코드 (e.g. "00:00")
  nextTimecode: string;          // 다음 시작 지점 타임코드 (e.g. "02:45")
  displayInterval: string;       // 표시 구간 타임코드 (e.g. "02:45")
  displayIntervalHuman: string;  // 표시 구간 한글 표기 (e.g. "2분 45초")
  rawStartTime: number;          // 소수점 누적 시작 시간
  rawEndTime: number;            // 소수점 누적 종료 시간
  rawDurationSeconds: number;    // 실제 오디오 길이 (소수점 초)
  isLast: boolean;               // 마지막 트랙 여부
}

export type TimecodeFormatStyle = 'numbered' | 'simple' | 'hyphen';

