import { writeFileSync } from 'node:fs';
import type { FormattedDuration } from './formatter.js';
import type { VideoInfo } from './types.js';

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
    const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
    const channelLink = video.channelUrl
      ? `[${video.channel}](${video.channelUrl})`
      : video.channel;

    lines.push(`[<img src="${video.thumbnail}" alt="thumbnail" width="180">](${videoUrl})`);
    lines.push('');
    lines.push('');
    lines.push(`**${video.title}**`);
    lines.push('');
    lines.push(`Duração: ${video.duration} - Canal: ${channelLink}`);
    lines.push('');
  }

  writeFileSync(outputPath, lines.join('\n'), 'utf-8');
}
