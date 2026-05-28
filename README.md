# cool-symbols.net

Free fancy text generator, copy-paste Unicode library, and AI-powered symbol art tools.

## Стек

- Статический фронтенд (`index.html` + 4 легальные страницы) — без сборки, чистый HTML/CSS/JS
- Vercel Serverless Function (`api/generate.js`) — прокси к Anthropic Claude Haiku 4.5
- **Vercel KV (Upstash Redis)** — персистентный rate-limit + глобальный daily budget cap
- IP-based лимит: 20 AI-генераций в день; глобальный потолок $3/день на AI
- Vercel Web Analytics + Google Search Console (meta-tag verification)

## Деплой на Vercel — пошагово

### 1. Залить код на GitHub

```bash
cd ~/Documents/Claude/Projects/cool-symbols.net
git add .
git commit -m "init"
git push
```

### 2. Импортировать в Vercel

[vercel.com](https://vercel.com) → **Add New → Project** → выбери репо → Import. Build settings оставляешь как есть — Vercel автоматически распознает статический сайт с serverless-функциями.

### 3. Подключить Redis (КРИТИЧЕСКИ ВАЖНО)

Нужен для cost protection — без него любой школьник с прокси-листом может выжечь твой Anthropic-баланс за ночь.

В 2024-2025 Vercel свернул свой собственный «Vercel KV» и заменил его **Marketplace-интеграцией с Upstash Redis** (это та же база, что была под капотом у KV). Шаги:

1. В Vercel-проекте → **Storage** → **Create Database** (не Connect — там только существующие БД команды).
2. На экране выбора провайдера ищи **Upstash for Redis** (или просто **Redis** — это раздел Native Integrations / Marketplace).
3. Имя `cool-symbols-kv`, регион ближайший к большинству юзеров (для глобального трафика — `us-east-1` или `eu-west-1`), Free plan, Create.
4. Когда Vercel спросит «Connect to project» — выбери `cool-symbols`. Env-переменные (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) добавятся в проект автоматически.
5. Redeploy. В Function Logs warning'а про «KV not configured» быть не должно.

**Free tier Upstash** — 10K команд/день, 256 MB. На сайт с тысячами юзеров хватит — каждый AI-запрос делает 2-3 KV-команды.

Код принимает обе схемы env-переменных (`KV_REST_API_*` и `UPSTASH_REDIS_REST_*`) — так что если у тебя старый аккаунт с legacy Vercel KV, тоже сработает.

### 4. Добавить ANTHROPIC_API_KEY

Project → **Settings → Environment Variables** → Add:

| Name | Value | Environments |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (с [console.anthropic.com](https://console.anthropic.com)) | Production, Preview, Development |
| `DAILY_BUDGET_USD` | `3` (опционально, default = 3) | Production |

### 5. Подтвердить домен и сайтмап в Google Search Console

1. [search.google.com/search-console](https://search.google.com/search-console) → Add property → URL prefix → `https://cool-symbols.net/`.
2. Метод верификации: **HTML tag**. Код `ETF-UcFG87KFsVQSFjDxOUMGDEG-hgiQfKpezTHcUUk` уже встроен во все 5 страниц — просто жми Verify.
3. После верификации: Sitemaps → Add sitemap → `https://cool-symbols.net/sitemap.xml`.

### 6. Включить Vercel Analytics

Project → **Analytics** → Enable. Скрипт уже в HTML, маршрут `/_vercel/insights/script.js` активируется автоматически.

### 7. Настроить алерты на спенд в Anthropic Console

[console.anthropic.com](https://console.anthropic.com) → **Settings → Limits & Notifications**:

1. Установи **monthly usage limit** на разумную сумму (например, $30) — это hard cap, после него API будет возвращать 429.
2. Включи **email notifications** на 50% / 80% / 100% от лимита.

Это последняя линия защиты, если что-то пошло сильно не так с KV-логикой.

## Привязка домена cool-symbols.net

Vercel → **Settings → Domains** → введи `cool-symbols.net` → Vercel покажет инструкцию (либо смена nameservers, либо A/CNAME записи у текущего регистратора). SSL выдаётся автоматом.

## Как работает cost protection

Каждый AI-запрос проходит через два независимых лимита:

**Per-IP лимит — 20/день.** Атомарный `INCRBY` в KV с ключом `rl:{ip}:{date}` и TTL 2 дня. Возвращает 429 «Daily limit reached».

**Глобальный budget cap — $3/день.** До вызова Anthropic читаем `budget:{date}` (милли-центы спента за сегодня). Если ≥ потолка — возвращаем 503. После успешного ответа от Claude инкрементим счётчик на actual cost из `usage.input_tokens` и `usage.output_tokens`, посчитанных по тарифу Haiku 4.5 ($0.80 / $4.00 за MTok).

Под потолком $3/день при среднем размере генерации (~500 input + 300 output = ~160 милли-центов) сайт выдержит ~1875 успешных AI-вызовов в день. Если больше — endpoint вежливо отвечает «AI quota reached» и юзер перенаправляется на бесплатные тулзы (fancy text + library), которые лимита не имеют вообще.

Поднять потолок: `DAILY_BUDGET_USD=10` в env-переменных, redeploy. Никакой код менять не нужно.

## Структура проекта

```
.
├── index.html          ← главная: AI tools, fancy text, library, dividers, FAQ
├── about.html          ← /about
├── contact.html        ← /contact (info@cool-symbols.net)
├── privacy.html        ← /privacy
├── terms.html          ← /terms
├── styles.css          ← общие стили для статических страниц
├── favicon.svg         ← векторная иконка
├── robots.txt          ← + ссылка на sitemap
├── sitemap.xml         ← 5 URLs
├── vercel.json         ← cleanUrls, headers, function config
├── package.json        ← Node 18+ runtime
├── api/
│   └── generate.js     ← Anthropic proxy с KV cost protection
└── README.md
```

## Локальный запуск

```bash
npm i -g vercel
cd ~/Documents/Claude/Projects/cool-symbols.net
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
# KV переменные опциональны — без них код переключится на in-memory лимит
vercel dev
```

Откроется на `http://localhost:3000`. Fancy text и symbol library работают сразу. AI tools — если задан `ANTHROPIC_API_KEY`.

## Что добавить дальше (после стабильного запуска)

- **Программатик-страницы** под длинный хвост: 13 страниц по категориям символов (/hearts, /stars, /arrows...), 6 по AI-режимам, 22 по fancy fonts. Это открывает 70-80% потенциального organic трафика.
- **Кэширование популярных AI-промптов** в KV — хэш `(mode + normalize(input))` → выходной текст на 7 дней. Экономит и деньги, и latency.
- **Cloudflare Turnstile** на AI endpoint — если увидим бот-абуз. Бесплатно, режет 90% автоматических скриптов.
- **OG-картинки auto-gen** через Vercel `@vercel/og` — генерация preview-картинок для каждой категории на лету.
- **Pinterest pin-стратегия** — основной источник трафика в этой нише.
- **5-10 supporting content** статей: «how to add symbols to Instagram bio», «best aesthetic usernames 2026», «what are Unicode block characters» — длинный хвост информационного трафика.

## Что НЕ делать

- Запускать в r/InternetIsBeautiful или Pinterest до того, как сделаны категорийные страницы. Сейчас юзеры с этих источников будут видеть one-page и баунсить.
- Подавать на AdSense до 30+ страниц контента и 4-6 недель индексации.
- Поднимать `DAILY_BUDGET_USD` выше $10-15 без анализа трафика. Лучше держать tight и постепенно расширять.
