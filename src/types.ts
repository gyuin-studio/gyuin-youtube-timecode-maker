export interface AudioTrack {
  id: string;
  file?: File;
  originalFileName: string;
  title: string;
  duration: number; // in seconds
  sortIndex: number;
  objectUrl?: string;
  status: 'loading' | 'ready' | 'error';
  errorMessage?: string;
}

export type TimecodeFormatStyle = 'numbered' | 'simple' | 'hyphen';
