import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { getPlaylistDurationFromLabels } from './core/index.js';
import { formatDuration } from './formatter.js';
import { scrapeWatchLaterLabels } from './scraper.js';

const SESSION_PATH = 'session.json';
const WATCH_LATER_URL = 'https://www.youtube.com/playlist?list=WL';

async function main(): Promise<void> {
  // Guarda de sessão
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

    // Detecta redirecionamento para página de login
    const currentUrl = page.url();
    if (
      currentUrl.includes('accounts.google.com') ||
      currentUrl.includes('/signin')
    ) {
      console.error('❌ Sessão expirada. Rode: npm run login');
      process.exit(1);
    }

    console.log('⏳ Carregando vídeos da playlist...');

    const labels = await scrapeWatchLaterLabels(page);

    if (labels.length === 0) {
      console.warn('⚠️  Watch Later está vazio (0 vídeos)');
      process.exit(0);
    }

    const duration = getPlaylistDurationFromLabels(labels);
    const formatted = formatDuration(duration);

    console.log(`\n🎬 Watch Later — ${labels.length} vídeos encontrados\n`);
    console.log(`⏱  Watch Later: ${formatted.clock}`);
    console.log(`⏱  Watch Later: ${formatted.human}`);
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
