import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { getPlaylistDurationFromLabels } from './core/index.js';
import { scrapeWatchLaterVideos } from './scraper.js';
import { formatDuration } from './formatter.js';
import { generateMarkdown } from './markdown.js';

const SESSION_PATH = 'session.json';
const WATCH_LATER_URL = 'https://www.youtube.com/playlist?list=WL';
const OUTPUT_PATH = 'watch-later.md';

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

    console.log('⏳ Carregando vídeos da playlist...');

    const videos = await scrapeWatchLaterVideos(page);

    if (videos.length === 0) {
      console.warn('⚠️  Watch Later está vazio (0 vídeos)');
      process.exit(0);
    }

    const durationLabels = videos.map((v) => v.duration);
    const duration = getPlaylistDurationFromLabels(durationLabels);
    const formatted = formatDuration(duration);

    generateMarkdown(videos, formatted, OUTPUT_PATH);

    console.log(`\n🎬 Watch Later — ${videos.length} vídeos encontrados\n`);
    console.log(`⏱  Watch Later: ${formatted.clock}`);
    console.log(`⏱  Watch Later: ${formatted.human}`);
    console.log(`\n📄 Salvo em: ${OUTPUT_PATH}`);
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
