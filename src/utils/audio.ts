import { AudioTrack, TimecodeFormatStyle } from '../types';

/**
 * Remove audio extensions (.mp3, .wav, .m4a, .flac, etc.)
 * Extract leading number for natural sorting
 * Strip leading track number from the clean title
 * Deduplicate repeated identical halves if present
 */
export function parseFileName(fileName: string): {
  cleanTitle: string;
  sortNumber: number;
  extension: string;
} {
  // 1. Extract and remove extension
  const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extMatch ? extMatch[1].toLowerCase() : '';
  const nameWithoutExt = fileName.replace(/\.[a-zA-Z0-9]+$/, '').trim();

  // 2. Detect leading number for natural sorting
  // Matches patterns like: "01.", "1 -", "02_", "3 ", "3. ", "Track 04", "[01]", "(2)"
  const leadingNumMatch = nameWithoutExt.match(/^\s*(?:track\s*|no\.?\s*|#\s*)?(\d+)/i);
  let sortNumber = Infinity;
  if (leadingNumMatch && leadingNumMatch[1]) {
    sortNumber = parseInt(leadingNumMatch[1], 10);
  }

  // 3. Strip leading number / track prefix from title
  // e.g. "01. 곡 제목" -> "곡 제목"
  // "3. Blue Hour, Warm Keys" -> "Blue Hour, Warm Keys"
  // "01 - 곡 제목" -> "곡 제목"
  // "01_곡 제목" -> "곡 제목"
  // "1 곡 제목" -> "곡 제목"
  // "[01] 곡 제목" -> "곡 제목"
  // "(01) 곡 제목" -> "곡 제목"
  // "Track 01 - 곡 제목" -> "곡 제목"
  let cleanTitle = nameWithoutExt
    .replace(/^\s*\[?\s*(?:track\s*|no\.?\s*|#\s*)?\d+\s*\]?\s*[-_.)\]~:—–]*\s*/i, '')
    .trim();

  // If after stripping it's empty, fallback to nameWithoutExt
  if (!cleanTitle) {
    cleanTitle = nameWithoutExt;
  }

  // 4. Fix title duplication bug (e.g. "Blue Hour, Warm KeysBlue Hour, Warm Keys")
  cleanTitle = deduplicateString(cleanTitle);

  return {
    cleanTitle,
    sortNumber,
    extension,
  };
}

/**
 * Checks if a string consists of an exact repeated substring (e.g. "ABCABC" -> "ABC")
 * or separated by common delimiters like "ABC - ABC" or "ABC / ABC".
 */
export function deduplicateString(str: string): string {
  if (!str) return str;
  const trimmed = str.trim();
  const len = trimmed.length;

  // Case 1: Exactly repeated halves (e.g. "Blue Hour, Warm KeysBlue Hour, Warm Keys")
  if (len >= 4 && len % 2 === 0) {
    const halfLen = len / 2;
    const firstHalf = trimmed.slice(0, halfLen);
    const secondHalf = trimmed.slice(halfLen);
    if (firstHalf === secondHalf) {
      return firstHalf.trim();
    }
  }

  // Case 2: Delimiter-separated repeated halves (e.g. "Song - Song", "Song / Song", "Song, Song")
  const delimiterMatch = trimmed.match(/^(.{2,})\s*[-–—|/,]\s*\1$/);
  if (delimiterMatch && delimiterMatch[1]) {
    return delimiterMatch[1].trim();
  }

  return trimmed;
}

/**
 * Reads audio duration using HTMLAudioElement loadedmetadata event.
 * Falls back to Web Audio API decodeAudioData if HTMLAudioElement fails or returns invalid duration.
 * Always returns rounded/floored integer seconds to ensure 100% consistent duration across all calculations.
 */
export function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;

    let isResolved = false;

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    const done = (rawDuration: number) => {
      if (isResolved) return;
      isResolved = true;
      cleanup();

      // Enforce Math.floor integer duration for single source of truth
      const duration = Math.max(0, Math.floor(rawDuration));

      if (duration > 0) {
        resolve(duration);
      } else {
        URL.revokeObjectURL(objectUrl);
        // Fallback to Web Audio API
        fallbackWebAudio(file).then((fallbackDur) => {
          resolve(Math.max(0, Math.floor(fallbackDur)));
        });
      }
    };

    const onLoaded = () => {
      const d = audio.duration;
      if (typeof d === 'number' && !isNaN(d) && isFinite(d) && d > 0) {
        done(d);
      } else {
        done(0);
      }
    };

    const onError = () => {
      done(0);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);

    // Timeout safety in case browser hangs on corrupted metadata
    setTimeout(() => {
      if (!isResolved) {
        done(0);
      }
    }, 4000);
  });
}

/**
 * Fallback duration reader using browser's native AudioContext
 */
async function fallbackWebAudio(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return 0;
    const ctx = new AudioCtx();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;
    ctx.close();
    return Math.max(0, Math.floor(duration || 0));
  } catch {
    return 0;
  }
}

/**
 * Formats seconds into YouTube timecode (MM:SS or HH:MM:SS)
 * Strictly uses Math.floor for all parts.
 * e.g. 0 -> "00:00"
 * 166 -> "02:46"
 * 3665 -> "01:01:05"
 */
export function formatTimecode(seconds: number, forceHours: boolean = false): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (forceHours || hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Formats duration into user-friendly text like "3분 24초" or "1시간 15분 4초"
 * Strictly uses Math.floor, matching formatTimecode exactly.
 * e.g. 166 -> "2분 46초" (matching "02:46" without 1-second discrepancy)
 */
export function formatDurationHuman(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs}시간 ${mins}분 ${secs}초`;
  }
  if (mins > 0) {
    return `${mins}분 ${secs}초`;
  }
  return `${secs}초`;
}

/**
 * Compute cumulative start times for each track
 */
export function calculateTrackTimings(tracks: AudioTrack[], forceHours: boolean = false): {
  tracksWithTimings: (AudioTrack & { startTime: number; timecode: string })[];
  totalDuration: number;
} {
  let cumulative = 0;
  const anyPastHour = tracks.reduce((acc, t) => acc + (t.duration || 0), 0) >= 3600;
  const useHours = forceHours || anyPastHour;

  const tracksWithTimings = tracks.map((track) => {
    const startTime = cumulative;
    const timecode = formatTimecode(startTime, useHours);
    cumulative += Math.max(0, track.duration || 0);
    return {
      ...track,
      startTime,
      timecode,
    };
  });

  return {
    tracksWithTimings,
    totalDuration: cumulative,
  };
}

/**
 * Generate YouTube timecode description text
 * Default format as requested:
 * 00:00 01. 곡 제목
 * 02:04 02. 곡 제목
 * 04:15 03. 곡 제목
 */
export function generateTracklistOutput(
  tracks: (AudioTrack & { startTime: number; timecode: string })[],
  style: TimecodeFormatStyle = 'numbered'
): string {
  return tracks
    .map((track, idx) => {
      const numStr = String(idx + 1).padStart(2, '0');
      const safeTitle = track.title.trim() || `곡 ${idx + 1}`;

      switch (style) {
        case 'numbered':
          return `${track.timecode} ${numStr}. ${safeTitle}`;
        case 'simple':
          return `${track.timecode} ${safeTitle}`;
        case 'hyphen':
          return `${track.timecode} - ${safeTitle}`;
        default:
          return `${track.timecode} ${numStr}. ${safeTitle}`;
      }
    })
    .join('\n');
}

/**
 * Downloads a string as a UTF-8 .txt file
 */
export function downloadTextFile(content: string, filename = 'youtube_tracklist.txt') {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates sample demo audio tracks purely in-memory using Web Audio API
 * (Safe, instant, client-only, requires zero internet or server).
 */
export async function createDemoAudioTracks(): Promise<AudioTrack[]> {
  const sampleData = [
    { title: '봄날의 햇살 (Acoustic Intro)', duration: 124, fileName: '01. 봄날의 햇살 (Acoustic Intro).mp3' },
    { title: '바람이 머무는 언덕', duration: 131, fileName: '02. 바람이 머무는 언덕.mp3' },
    { title: '별빛 아래의 산책', duration: 195, fileName: '03. 별빛 아래의 산책.wav' },
    { title: '기억의 조각들 (Piano Ver.)', duration: 218, fileName: '04. 기억의 조각들 (Piano Ver.).flac' },
    { title: '내일로 가는 길 (Outro)', duration: 142, fileName: '05. 내일로 가는 길 (Outro).m4a' },
  ];

  return sampleData.map((item, idx) => ({
    id: `demo-${idx}-${Date.now()}`,
    originalFileName: item.fileName,
    title: item.title,
    duration: item.duration,
    sortIndex: idx + 1,
    status: 'ready',
  }));
}
