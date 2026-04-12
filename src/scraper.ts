import type { Page } from 'playwright';
import type { VideoInfo } from './types';

const VIDEO_ITEM_SELECTOR = 'ytd-playlist-video-renderer';

/**
 * Extrai todas as labels de duração da playlist Watch Later.
 * Faz scroll progressivo para forçar o lazy loading do YouTube.
 * Retorna string[] com todos os textos encontrados (ex: ["1:23:45", "AO VIVO", "12:34"]).
 * Labels inválidas (estreia, ao vivo, etc.) são filtradas pelo módulo core.
 */
export async function scrapeWatchLaterLabels(page: Page): Promise<string[]> {
  let previousCount = 0;

  // Aguarda o primeiro vídeo aparecer antes de começar o scroll
  await page
    .waitForSelector(VIDEO_ITEM_SELECTOR, { timeout: 15_000 })
    .catch(() => {});

  // Scroll progressivo até não aparecerem novos vídeos
  while (true) {
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );

    // Aguarda o YouTube renderizar novos itens
    await page.waitForTimeout(1500);

    const currentCount = await page.locator(VIDEO_ITEM_SELECTOR).count();
    console.info(`  → ${currentCount} vídeos carregados...`);

    if (currentCount === previousCount) {
      break; // Chegou ao fim da lista
    }

    previousCount = currentCount;
  }

  // Tenta o seletor principal, com fallback para variantes do YouTube
  const selectors = [
    'ytd-thumbnail-overlay-time-status-renderer .badge-shape-wiz__text',
    'ytd-thumbnail-overlay-time-status-renderer span#text',
    'ytd-thumbnail-overlay-time-status-renderer span',
  ];

  for (const selector of selectors) {
    const labels = await page.locator(selector).allTextContents();
    const filtered = labels.map(l => l.trim()).filter(Boolean);

    if (filtered.length > 0) {
      // console.info(`  → Seletor usado: "${selector}"`);
      return filtered;
    }
  }

  console.warn(
    '  ⚠️  Nenhuma label de duração encontrada com os seletores conhecidos.',
  );
  return [];
}

/**
 * Extrai informações completas de cada vídeo da playlist Watch Later.
 * Faz o mesmo scroll progressivo e retorna VideoInfo[] com todos os metadados visíveis.
 */
export async function scrapeWatchLaterVideos(page: Page): Promise<VideoInfo[]> {
  let totalCount = 0;

  // Aguarda o primeiro vídeo aparecer antes de começar o scroll
  await page
    .waitForSelector(VIDEO_ITEM_SELECTOR, { timeout: 15_000 })
    .catch(() => {});

  // Scroll progressivo para carregar todos os vídeos
  while (true) {
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );

    await page.waitForTimeout(1500);

    const currentCount = await page.locator(VIDEO_ITEM_SELECTOR).count();

    if (currentCount === totalCount) break;
    totalCount = currentCount;
  }

  console.info(`  → ${totalCount} vídeos carregados...`);

  // Extrai os dados de cada item via evaluate (mais eficiente que N locator calls)
  const videos = await page.evaluate(videoSelector => {
    const items = Array.from(document.querySelectorAll(videoSelector));

    return items.map(item => {
      // Título e Video ID
      const titleEl = item.querySelector<HTMLAnchorElement>('a#video-title');
      const title = titleEl?.textContent?.trim() ?? '';
      const href = titleEl?.href ?? '';
      const videoId =
        new URL(href, 'https://www.youtube.com').searchParams.get('v') ?? '';

      // Canal e URL do canal
      const channelEl = item.querySelector<HTMLElement>(
        'ytd-channel-name yt-formatted-string',
      );
      const channel = channelEl?.textContent?.trim() ?? '';
      const channelLinkEl =
        item.querySelector<HTMLAnchorElement>('ytd-channel-name a');
      const channelUrl = channelLinkEl?.href ?? '';

      // Duração
      const durationEl =
        item.querySelector<HTMLElement>('.badge-shape-wiz__text') ??
        item.querySelector<HTMLElement>(
          'ytd-thumbnail-overlay-time-status-renderer span#text',
        ) ??
        item.querySelector<HTMLElement>(
          'ytd-thumbnail-overlay-time-status-renderer span',
        );
      const duration = durationEl?.textContent?.trim() ?? '';

      // Views e Data (ficam nos spans de metadata)
      const metaSpans = Array.from(
        item.querySelectorAll<HTMLElement>('#video-info span'),
      ).map(el => el.textContent?.trim() ?? '');

      const views = metaSpans[0] ?? '';
      const date = metaSpans[2] ?? '';

      return { title, channel, channelUrl, videoId, duration, views, date };
    });
  }, VIDEO_ITEM_SELECTOR);

  return videos.filter(v => v.videoId !== '');
}
