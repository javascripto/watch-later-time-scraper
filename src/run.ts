import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { formatDuration } from './lib/formatter';
import { generateJSON } from './lib/generate-json';
import { generateMarkdown } from './lib/generate-markdown';
import { getPlaylistDurationFromLabels } from './lib/index';
import { scrapeWatchLaterVideos } from './scraper';

const SESSION_PATH = 'session.json';
const WATCH_LATER_URL = 'https://www.youtube.com/playlist?list=WL';
const MD_OUTPUT_PATH = 'watch-later.md';
const JSON_OUTPUT_PATH = 'watch-later.json';

async function main(): Promise<void> {
  if (!existsSync(SESSION_PATH)) {
    console.error('❌ Sessão não encontrada. Rode: npm run login');
    process.exit(1);
  }

  const headless = !process.argv.includes('--headed');

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ storageState: SESSION_PATH });
  const page = await context.newPage();

  try {
    await page.goto(WATCH_LATER_URL, { timeout: 30_000 });

    const currentUrl = page.url();
    if (
      currentUrl.includes('accounts.google.com') ||
      currentUrl.includes('/signin')
    ) {
      console.error('❌ Sessão expirada. Rode: npm run login');
      process.exit(1);
    }

    console.info('⏳ Carregando vídeos da playlist...\n');

    const videos = await scrapeWatchLaterVideos(page);

    if (videos.length === 0) {
      console.warn('⚠️  Watch Later está vazio (0 vídeos)');
      process.exit(0);
    }

    const durationLabels = videos.map(v => v.duration);
    const duration = getPlaylistDurationFromLabels(durationLabels);
    const formatted = formatDuration(duration);

    generateMarkdown(videos, formatted, MD_OUTPUT_PATH);
    generateJSON(videos, formatted, JSON_OUTPUT_PATH);

    console.info(`\n🎬 Watch Later — ${videos.length} vídeos encontrados`);
    console.info(`\n⏱️  ${formatted.clock} (${formatted.human})\n`);
    console.info(`📄 Salvo em: ${MD_OUTPUT_PATH}`);
    console.info(`📄 Salvo em: ${JSON_OUTPUT_PATH}`);
  } catch (err: unknown) {
    const error = err as Error;
    if (error.name === 'TimeoutError') {
      console.error('❌ Timeout ao carregar a playlist. Tente novamente.');
    } else {
      console.error('❌ Erro inesperado:', error.message);
    }
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
