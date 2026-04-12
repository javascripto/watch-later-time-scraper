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

  // Aguarda o primeiro vídeo aparecer antes de começar o scroll
  await page.waitForSelector(VIDEO_ITEM_SELECTOR, { timeout: 15_000 }).catch(() => {});

  // Scroll progressivo até não aparecerem novos vídeos
  while (true) {
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );

    // Aguarda o YouTube renderizar novos itens
    await page.waitForTimeout(1500);

    const currentCount = await page.locator(VIDEO_ITEM_SELECTOR).count();
    console.log(`  → ${currentCount} vídeos carregados...`);

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
    const filtered = labels.map((l) => l.trim()).filter(Boolean);

    if (filtered.length > 0) {
      console.log(`  → Seletor usado: "${selector}"`);
      return filtered;
    }
  }

  console.warn('  ⚠️  Nenhuma label de duração encontrada com os seletores conhecidos.');
  return [];
}
