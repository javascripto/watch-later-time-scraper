# Design: YouTube Watch Later — Total Duration Calculator

**Data:** 2026-04-12  
**Status:** Aprovado

---

## Objetivo

Calcular o tempo total somado de todos os vídeos da playlist **Watch Later** do YouTube, usando automação de browser com Playwright + TypeScript. A funcionalidade não está disponível via API do YouTube (a playlist é privada e não exposta pela API).

---

## Output

Ao rodar o script principal, o terminal exibe:

```
🎬 Watch Later — 247 vídeos encontrados

⏱  Watch Later: 123:59:59
⏱  Watch Later: 123h 59min
```

**Dois formatos obrigatórios:**
- `HH:MM:SS` — horas sem limite de 24h (ex: `123:59:59`)
- `Xh Ymin` — legível por humanos (ex: `123h 59min`)

---

## Arquitetura

```
src/
├── core/                  ← copiado do repo de referência (sem modificações)
│   ├── duration.ts        # Classe Duration: parseia e formata durações
│   ├── labels.ts          # parseDurationLabel(): ignora labels não-duração
│   ├── math.ts            # padZero(), restOfDivision()
│   ├── constants.ts       # Constantes de tempo + KNOWN_NON_DURATION_LABELS
│   ├── playlist-duration.ts  # getPlaylistDurationFromLabels()
│   └── index.ts           # Re-exports públicos
├── login.ts               # Script de login manual (headed, roda uma vez)
├── run.ts                 # Script principal (headless)
├── scraper.ts             # Extrai labels de duração do DOM via Playwright
└── formatter.ts           # Formata Duration nos dois formatos de saída
```

---

## Módulos

### `src/core/` — Reaproveitado do repositório de referência

Copiado integralmente de `youtube-playlist-duration/src/core/`. Nenhuma modificação.

- **`Duration`** — classe que armazena tempo internamente em milissegundos. Métodos relevantes:
  - `Duration.fromTimeString("1:23:45")` → instância
  - `.inSeconds` → número total de segundos
  - `.toTimeString()` → `"01:23:45"` (formato `HH:MM:SS`)
- **`parseDurationLabel(label)`** — retorna `Duration | null`. Retorna `null` para strings que não são durações.
- **`KNOWN_NON_DURATION_LABELS`** — set com labels ignoradas: `"ESTREIA"`, `"AO VIVO"`, `"EM BREVE"`.
- **`getPlaylistDurationFromLabels(labels)`** — recebe `string[]`, retorna `Duration` com total somado.

---

### `src/login.ts` — Login manual

**Como usar:** `npm run login`

1. Abre o Playwright em modo **headed** (browser visível)
2. Navega para `https://www.youtube.com`
3. Aguarda o usuário completar o login manualmente (detecta autenticação via presença do avatar/menu de conta no DOM)
4. Salva `storageState` (cookies + localStorage + sessionStorage) em `session.json`
5. Exibe `"✅ Sessão salva com sucesso!"` e fecha o browser

`session.json` está no `.gitignore`.

---

### `src/run.ts` — Script principal

**Como usar:** `npm run start` | `npm run start -- --headed`

Fluxo:
1. Checa se `session.json` existe — senão: erro `"❌ Sessão não encontrada. Rode: npm run login"`
2. Carrega sessão via `storageState` no Playwright
3. Navega para `https://www.youtube.com/playlist?list=WL`
4. Detecta redirecionamento para página de login — se sim: erro `"❌ Sessão expirada. Rode: npm run login"`
5. Chama `scraper.ts` para extrair todas as labels de duração
6. Chama `getPlaylistDurationFromLabels()` para somar
7. Chama `formatter.ts` para formatar e exibe o resultado

---

### `src/scraper.ts` — Extração do DOM

Responsabilidade única: extrair as strings de duração de todos os vídeos da playlist.

- Seletor principal: `.ytd-thumbnail-overlay-time-status-renderer` (texto de duração sobre a thumbnail)
- **Scroll progressivo:** Watch Later usa lazy loading — o scraper faz scroll até o fim da página, aguardando novos itens carregarem a cada ciclo, até não haver mais novos elementos
- Retorna `string[]` com todos os labels encontrados (ex: `["1:23:45", "AO VIVO", "12:34", ...]`)
- Labels inválidas são filtradas pelo `core` — o scraper não precisa saber disso

---

### `src/formatter.ts` — Formatação de saída

Recebe um `Duration` e retorna os dois formatos:

```typescript
type FormattedDuration = {
  clock: string;   // "123:59:59"
  human: string;   // "123h 59min"
};
```

- **`clock`**: usa `Duration.toTimeString()` (já implementado no `core`)
- **`human`**: implementação própria — `Math.trunc(totalSeconds / 3600)` + `Math.trunc((totalSeconds % 3600) / 60)`

---

## Tratamento de Erros

| Situação | Comportamento |
|---|---|
| `session.json` não existe | Erro: `"❌ Sessão não encontrada. Rode: npm run login"` |
| Sessão expirada (redirect para login) | Erro: `"❌ Sessão expirada. Rode: npm run login"` |
| Playlist vazia (0 vídeos) | Aviso: `"⚠️  Watch Later está vazio (0 vídeos)"` |
| Timeout no carregamento da página | Erro: `"❌ Timeout ao carregar a playlist. Tente novamente."` |

---

## Scripts npm

```bash
npm run login          # Login manual (headed, interativo)
npm run start          # Scraping principal (headless)
npm run start --headed # Scraping com browser visível (debug)
```

---

## Dependências

```json
{
  "playwright": "^1.x",
  "typescript": "^5.x",
  "tsx": "^4.x"
}
```

`tsx` é usado para rodar TypeScript diretamente sem build step.

---

## O que está fora do escopo

- Suporte a outras playlists (apenas Watch Later)
- Download de vídeos
- Exportação para arquivo
- Agendamento / execução automática
