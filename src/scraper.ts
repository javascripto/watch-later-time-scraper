import type { Page } from 'playwright';

const DURATION_SELECTOR =
  'ytd-thumbnail-overlay-time-status-renderer .badge-shape-wiz__text';

const VIDEO_ITEM_SELECTOR = 'ytd-playlist-video-renderer';

/**
 * Extrai todas as labels de duração da playlist Watch Later.
 * Faz scroll progressivo para forçar o lazy loading do YouTube.
 * Retorna string[] com todos os textos encontrados (ex: ["1:23:45", "AO VIVO", "12:34"]).
 * Labels inválidas (estreia, ao vivo, etc.) são filtradas pelo módulo core.
 */
export async function scrapeWatchLaterLabels(page: Page): Promise<string[]> {
  let previousCount = 0;

  // Scroll progressivo até não aparecerem novos vídeos
  while (true) {
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );

    // Aguarda o YouTube renderizar novos itens
    await page.waitForTimeout(1500);

    const currentCount = await page.locator(VIDEO_ITEM_SELECTOR).count();

    if (currentCount === previousCount) {
      break; // Chegou ao fim da lista
    }

    previousCount = currentCount;
  }

  const labels = await page.locator(DURATION_SELECTOR).allTextContents();

  return labels.map((label) => label.trim()).filter(Boolean);
}
