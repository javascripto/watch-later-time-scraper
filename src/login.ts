import { chromium } from 'playwright';

const SESSION_PATH = 'session.json';
const YOUTUBE_URL = 'https://www.youtube.com';

// Seletor do botão de avatar — presente apenas quando logado
const LOGGED_IN_SELECTOR = '#avatar-btn';
const LOGIN_TIMEOUT_MS = 120_000; // 2 minutos para o usuário logar

async function login(): Promise<void> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(YOUTUBE_URL);

  console.log('🔐 Faça login no YouTube na janela aberta.');
  console.log('   Aguardando até 2 minutos...');

  await page.waitForSelector(LOGGED_IN_SELECTOR, {
    timeout: LOGIN_TIMEOUT_MS,
  });

  await context.storageState({ path: SESSION_PATH });
  console.log('✅ Sessão salva com sucesso!');
  console.log(`   Arquivo: ${SESSION_PATH}`);

  await browser.close();
}

login().catch((err: Error) => {
  if (err.name === 'TimeoutError') {
    console.error('❌ Timeout: login não detectado em 2 minutos.');
  } else {
    console.error('❌ Erro durante o login:', err.message);
  }
  process.exit(1);
});
