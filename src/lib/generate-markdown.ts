import { writeFileSync } from 'node:fs';
import type { VideoInfo } from '../types';
import type { FormattedDuration } from './formatter';
import { trimIndent } from './trim-indent';

export function generateMarkdown(
  videos: VideoInfo[],
  duration: FormattedDuration,
  outputPath: string,
): void {
  const blocks: string[] = [];
  const pushBlock = (content: string) => blocks.push(trimIndent(content));

  const linkTemplate = ({ title, link }: { title: string; link?: string }) =>
    link ? `[${title}](${link})` : title;

  const youtubeLink = (videoId: string) =>
    `'https://www.youtube.com/watch?v='${videoId}`;

  const thumbnailLink = (videoId: string) =>
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const imgTemplate = (src: string, alt: string, width: number = 180) =>
    `<img src="${src}" alt="${alt}" width="${width}">`;

  const thumbNailTemplate = ({ title, videoId }: VideoInfo) =>
    `[${imgTemplate(thumbnailLink(videoId), title)}](${youtubeLink(videoId)})`;

  // Cabeçalho
  pushBlock(`
    # Watch Later

    **Total:** ${videos.length} vídeos -
    **Duração total:** ${duration.clock} (${duration.human})

    ------------------------------------------------

  `);
  // Um bloco por vídeo
  videos.forEach(video =>
    pushBlock(`
      ${thumbNailTemplate(video)}

      - Título: **${linkTemplate({ title: video.title, link: youtubeLink(video.videoId) })}**
      - Duração: **${video.duration}**
      - Data: **${video.date}**
      - Views: **${video.views}**
      - Canal: **${linkTemplate({ title: video.channel, link: video.channelUrl })}**

      ------------------------------------------------

    `),
  );

  writeFileSync(outputPath, blocks.join('\n'), 'utf-8');
}
