# YouTube Watch Later — Duration Calculator

Automação de browser que calcula o **tempo total** da sua playlist Watch Later do YouTube e exporta os dados em Markdown e JSON.

A API do YouTube não expõe a playlist Watch Later (ela é privada), então este projeto usa [Playwright](https://playwright.dev/) para abrir o browser, fazer scroll na página e extrair as durações diretamente do DOM.

## Exemplo de saída

```
🎬 Watch Later — 23 vídeos encontrados

⏱️  08:26:06 (8h 26min)

📄 Salvo em: watch-later.md
📄 Salvo em: watch-later.json
```

**`watch-later.md`**

```markdown
# Watch Later

**Total:** 23 vídeos - **Duração total:** 08:26:06 (8h 26min)

---

[<img src="https://i.ytimg.com/vi/ABC123/hqdefault.jpg" alt="Título" width="180">](https://youtube.com/watch?v=ABC123)

- Título: **[Nome do vídeo](https://youtube.com/watch?v=ABC123)**
- Duração: **15:35**
- Data: **há 1 dia**
- Views: **5,5 mil visualizações**
- Canal: **[Nome do Canal](https://www.youtube.com/@canal)**
```

**`watch-later.json`**

```json
{
  "total": 23,
  "duration": {
    "clock": "08:26:06",
    "human": "8h 26min"
  },
  "videos": [
    {
      "title": "Nome do vídeo",
      "channel": "Nome do Canal",
      "channelUrl": "https://www.youtube.com/@canal",
      "videoId": "ABC123",
      "duration": "15:35",
      "views": "5,5 mil visualizações",
      "date": "há 1 dia",
      "thumbnail": "https://i.ytimg.com/vi/ABC123/hqdefault.jpg"
    }
  ]
}
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Google Chrome](https://www.google.com/chrome/) instalado no sistema
- Uma conta Google com vídeos no Watch Later

## Instalação

```bash
git clone https://github.com/seu-usuario/youtube-watch-later-duration
cd youtube-watch-later-duration
npm install
npx playwright install chromium
```

## Uso

### 1. Login (apenas uma vez)

```bash
npm run login
```

Abre uma janela do Chrome. Faça login na sua conta Google normalmente. Quando o login for detectado, a sessão é salva automaticamente em `session.json` e o browser fecha.

> A sessão fica salva localmente. Você só precisa repetir este passo se ela expirar.

### 2. Calcular e exportar

```bash
npm run start
```

Abre o browser em modo headless (invisível), acessa `youtube.com/playlist?list=WL`, faz scroll até carregar todos os vídeos e gera os arquivos de saída.

Para rodar com o browser visível (útil para debug):

```bash
npm run start -- --headed
```

## Estrutura do projeto

```
src/
├── lib/                        # Utilitários de duração e geração de arquivos
│   ├── duration.ts             # Classe Duration (parse e formatação)
│   ├── labels.ts               # Filtra labels inválidas (ao vivo, estreia...)
│   ├── playlist-duration.ts    # Soma duração de uma lista de labels
│   ├── formatter.ts            # Formata Duration em HH:MM:SS e Xh Ymin
│   ├── generate-markdown.ts    # Gera watch-later.md
│   ├── generate-json.ts        # Gera watch-later.json
│   └── math.ts / constants.ts  # Helpers internos
├── scraper.ts                  # Extrai dados dos vídeos via Playwright
├── login.ts                    # Script de login manual
├── run.ts                      # Script principal
└── types.ts                    # Tipo VideoInfo
```

## Detalhes técnicos

**Sessão persistente:** O login usa `storageState` do Playwright para salvar cookies e localStorage em `session.json`. As execuções seguintes carregam esse arquivo sem precisar logar novamente.

**Detecção de bot:** O Google bloqueia o Chromium padrão do Playwright. O script de login usa o Chrome real instalado no sistema (`channel: 'chrome'`) com `--disable-blink-features=AutomationControlled` e remove o `navigator.webdriver` para evitar detecção.

**Lazy loading:** O Watch Later carrega vídeos conforme o scroll. O scraper faz scroll progressivo até a contagem de itens estabilizar, garantindo que todos os vídeos sejam capturados.

**Labels ignoradas:** Vídeos ao vivo (`AO VIVO`), estreias (`ESTREIA`) e em breve (`EM BREVE`) são ignorados no cálculo de duração.

## Arquivos gerados

`watch-later.md` e `watch-later.json` estão no `.gitignore` — eles contêm dados pessoais da sua conta e não devem ser versionados.

## Testes

```bash
npm test
```

Roda os testes unitários da lógica de parsing e formatação de duração.
