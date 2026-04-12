# YouTube Watch Later Duration Calculator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI tool em TypeScript + Playwright que calcula o tempo total da playlist Watch Later do YouTube, com sessão persistente via `storageState`.

**Architecture:** Dois scripts de entrada (`login.ts` e `run.ts`) orquestram módulos independentes: `scraper.ts` extrai labels do DOM via scroll progressivo, `core/` (copiado do repo de referência) parseia e soma durações ignorando labels inválidas, e `formatter.ts` produz os dois formatos de saída.

**Tech Stack:** TypeScript 5, Playwright 1.x, tsx (runtime sem build step), vitest (testes unitários de `formatter.ts`).

---

## File Map

| Arquivo | Responsabilidade |
|---|---|
| `package.json` | Scripts npm, dependências |
| `tsconfig.json` | Configuração TypeScript |
| `.gitignore` | Ignora `session.json`, `node_modules` |
| `src/core/` | Copiado do repo de referência — parseia/soma durações |
| `src/formatter.ts` | Converte `Duration` nos dois formatos de saída |
| `src/scraper.ts` | Extrai labels do DOM com scroll progressivo |
| `src/login.ts` | Login manual headed, salva `session.json` |
| `src/run.ts` | Script principal — orquestra tudo |

---

## Task 1: Scaffold do projeto

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "youtube-watch-later-duration",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "login": "tsx src/login.ts",
    "start": "tsx src/run.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "playwright": "^1.52.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.20.5",
    "typescript": "^5.8.2",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Criar `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Criar `.gitignore`**

```
node_modules/
dist/
session.json
```

- [ ] **Step 4: Instalar dependências**

```bash
npm install
```

Expected: `node_modules/` criado, `package-lock.json` gerado, sem erros.

- [ ] **Step 5: Instalar browsers do Playwright**

```bash
npx playwright install chromium
```

Expected: Chromium baixado com sucesso.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore
git commit -m "chore: project scaffold with Playwright and TypeScript"
```

---

## Task 2: Copiar `src/core` do repositório de referência

**Files:**
- Create: `src/core/constants.ts`
- Create: `src/core/math.ts`
- Create: `src/core/duration.ts`
- Create: `src/core/labels.ts`
- Create: `src/core/playlist-duration.ts`
- Create: `src/core/index.ts`

- [ ] **Step 1: Copiar os arquivos do core**

```bash
cp -r youtube-playlist-duration/src/core src/core
```

Expected: `src/core/` com 6 arquivos (constants, math, duration, labels, playlist-duration, index).

- [ ] **Step 2: Verificar que os arquivos estão corretos**

```bash
ls src/core/
```

Expected:
```
constants.ts  duration.error-paths.test.ts  duration.test.ts  duration.ts  index.ts  labels.ts  math.ts  playlist-duration.ts
```

> **Nota:** Os arquivos `.test.ts` também serão copiados — isso é positivo, já validam que o core funciona.

- [ ] **Step 3: Rodar os testes do core para confirmar que funcionam**

```bash
npm test
```

Expected: todos os testes do `src/core/*.test.ts` passando (Duration, parseDurationLabel, getPlaylistDurationFromLabels).

- [ ] **Step 4: Commit**

```bash
git add src/core/
git commit -m "feat: copy core duration utilities from reference repo"
```

---

## Task 3: `src/formatter.ts`

**Files:**
- Create: `src/formatter.ts`
- Create: `src/formatter.test.ts`

- [ ] **Step 1: Escrever os testes falhando**

Criar `src/formatter.test.ts`:

```typescript
import { describe, test, expect } from 'vitest';
import { Duration } from './core/index.js';
import { formatDuration } from './formatter.js';

describe('formatDuration', () => {
  test('formata duração menor que 1 hora', () => {
    const duration = new Duration({ minutes: 45, seconds: 30 });
    const result = formatDuration(duration);

    expect(result.clock).toBe('45:30');
    expect(result.human).toBe('0h 45min');
  });

  test('formata duração de exatamente 1 hora', () => {
    const duration = new Duration({ hours: 1 });
    const result = formatDuration(duration);

    expect(result.clock).toBe('01:00:00');
    expect(result.human).toBe('1h 00min');
  });

  test('formata duração maior que 24 horas', () => {
    const duration = new Duration({ hours: 123, minutes: 59, seconds: 59 });
    const result = formatDuration(duration);

    expect(result.clock).toBe('123:59:59');
    expect(result.human).toBe('123h 59min');
  });

  test('formata duração zero', () => {
    const duration = new Duration({ seconds: 0 });
    const result = formatDuration(duration);

    expect(result.clock).toBe('00:00');
    expect(result.human).toBe('0h 00min');
  });
});
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
npm test
```

Expected: FAIL — `Cannot find module './formatter.js'`

- [ ] **Step 3: Implementar `src/formatter.ts`**

```typescript
import { Duration } from './core/index.js';

export type FormattedDuration = {
  clock: string;  // "123:59:59"
  human: string;  // "123h 59min"
};

export function formatDuration(duration: Duration): FormattedDuration {
  const totalSeconds = Math.trunc(duration.inSeconds);
  const hours = Math.trunc(totalSeconds / 3600);
  const minutes = Math.trunc((totalSeconds % 3600) / 60);

  return {
    clock: duration.toTimeString(),
    human: `${hours}h ${String(minutes).padStart(2, '0')}min`,
  };
}
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

```bash
npm test
```

Expected: todos os testes passando, incluindo os do `core` e os novos do `formatter`.

- [ ] **Step 5: Commit**

```bash
git add src/formatter.ts src/formatter.test.ts
git commit -m "feat: add formatter with clock and human duration formats"
```

---

## Task 4: `src/scraper.ts`

**Files:**
- Create: `src/scraper.ts`

> Sem testes automatizados — depende de browser real com YouTube carregado. Testado manualmente via `run.ts` no Task 6.

- [ ] **Step 1: Criar `src/scraper.ts`**

```typescript
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
```

- [ ] **Step 2: Verificar que o TypeScript compila sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros de tipo.

- [ ] **Step 3: Commit**

```bash
git add src/scraper.ts
git commit -m "feat: add Watch Later DOM scraper with progressive scroll"
```

---

## Task 5: `src/login.ts`

**Files:**
- Create: `src/login.ts`

- [ ] **Step 1: Criar `src/login.ts`**

```typescript
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
```

- [ ] **Step 2: Verificar que o TypeScript compila sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros de tipo.

- [ ] **Step 3: Testar manualmente o fluxo de login**

```bash
npm run login
```

Expected:
1. Janela do Chromium abre com YouTube
2. Terminal exibe `🔐 Faça login no YouTube na janela aberta.`
3. Após login, terminal exibe `✅ Sessão salva com sucesso!`
4. Arquivo `session.json` criado na raiz do projeto
5. Browser fecha automaticamente

Verificar que `session.json` existe:
```bash
ls -lh session.json
```

Expected: arquivo com alguns KB (cookies + storage).

- [ ] **Step 4: Commit**

```bash
git add src/login.ts
git commit -m "feat: add manual login script with storageState persistence"
```

---

## Task 6: `src/run.ts`

**Files:**
- Create: `src/run.ts`

- [ ] **Step 1: Criar `src/run.ts`**

```typescript
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { getPlaylistDurationFromLabels } from './core/index.js';
import { scrapeWatchLaterLabels } from './scraper.js';
import { formatDuration } from './formatter.js';

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
```

- [ ] **Step 2: Verificar que o TypeScript compila sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros de tipo.

- [ ] **Step 3: Testar o script principal**

```bash
npm run start
```

Expected:
```
⏳ Carregando vídeos da playlist...

🎬 Watch Later — 247 vídeos encontrados

⏱  Watch Later: 14:32:10
⏱  Watch Later: 14h 32min
```

- [ ] **Step 4: Testar modo headed (debug)**

```bash
npm run start -- --headed
```

Expected: mesmo output no terminal, mas com janela do browser visível mostrando o scroll na playlist.

- [ ] **Step 5: Testar detecção de sessão ausente**

```bash
mv session.json session.json.bak && npm run start ; mv session.json.bak session.json
```

Expected: `❌ Sessão não encontrada. Rode: npm run login`

- [ ] **Step 6: Commit final**

```bash
git add src/run.ts
git commit -m "feat: add main runner script with session guard and output formatting"
```

---

## Checklist de Validação Final

- [ ] `npm test` — todos os testes passando (core + formatter)
- [ ] `npm run login` — abre browser, login funciona, `session.json` criado
- [ ] `npm run start` — lê sessão, scrapa playlist, exibe os dois formatos
- [ ] `npm run start -- --headed` — mesmo resultado com browser visível
- [ ] Sem `session.json`: exibe mensagem de erro clara
- [ ] `session.json` no `.gitignore` — não commitado por acidente
