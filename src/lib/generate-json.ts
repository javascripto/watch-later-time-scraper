import { writeFileSync } from 'node:fs';
import { VideoInfo } from '../types';
import { FormattedDuration } from './formatter';

export function generateJSON(
  videos: VideoInfo[],
  duration: FormattedDuration,
  outputPath: string,
): void {
  const data = {
    total: videos.length,
    duration: {
      clock: duration.clock,
      human: duration.human,
    },
    videos,
  };

  writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
}
