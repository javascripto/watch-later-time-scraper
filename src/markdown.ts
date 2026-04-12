import { writeFileSync } from 'node:fs';
import type { VideoInfo } from './types.js';
import type { FormattedDuration } from './formatter.js';

export function generateMarkdown(
  videos: VideoInfo[],
  duration: FormattedDuration,
  outputPath: string,
): void {
  const lines: string[] = [];

  // Cabeçalho
  lines.push('# Watch Later');
  lines.push('');
  lines.push(`**Total:** ${videos.length} vídeos`);
  lines.push(`**Duração total:** ${duration.clock} (${duration.human})`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Um bloco por vídeo
  for (const video of videos) {
    lines.push(`## ${video.title}`);
    lines.push('');
    lines.push(`**Canal:** ${video.channel}`);
    lines.push(`**Video ID:** ${video.videoId}`);
    lines.push(`**Duração:** ${video.duration}`);
    lines.push(`**Views:** ${video.views}`);
    lines.push(`**Data:** ${video.date}`);
    lines.push(`**Thumbnail:** ${video.thumbnail}`);
    lines.push(`**Link:** https://www.youtube.com/watch?v=${video.videoId}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  writeFileSync(outputPath, lines.join('\n'), 'utf-8');
}
