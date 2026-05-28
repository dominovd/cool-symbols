# cool-symbols.net

AI-powered symbol art generator, fancy text fonts, and copy-paste Unicode library.

## Стек

- Статический фронтенд (`index.html`) — один файл, без сборки
- Vercel Serverless Function (`api/generate.js`) — прокси к Anthropic Claude Haiku 4.5
- IP-based rate limit: 20 AI-генераций в день на IP, in-memory (без БД)

## Деплой на Vercel

### Вариант 1: через GitHub (рекомендую)

1. Залей папку в новый репозиторий на GitHub:
   ```bash
   cd /path/to/cool-symbols.net
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/USERNAME/cool-symbols.git
   git push -u origin main
   ```

2. Зайди на [vercel.com](https://vercel.com) → **Add New → Project** → выбери репо → Import.
   Vercel сам определит, что это статический сайт с serverless-функциями. Никаких настроек сборки менять не надо.

3. На экране настроек проекта перед деплоем разверни **Environment Variables** и добавь:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (твой ключ с [console.anthropic.com](https://console.anthropic.com))
   - Environments: Production + Preview + Development (все три)

4. Жми **Deploy**. Через ~30 секунд получишь URL `cool-symbols.vercel.app`.

### Вариант 2: через Vercel CLI

```bash
npm i -g vercel
cd /path/to/cool-symbols.net
vercel              # первый раз — линкует папку с проектом
vercel env add ANTHROPIC_API_KEY    # вставишь ключ, выберешь окружения
vercel --prod       # боевой деплой
```

## Привязка домена cool-symbols.net

1. В Vercel → Project → **Settings → Domains** → введи `cool-symbols.net`.
2. Vercel покажет 2 варианта:
   - **Nameservers (рекомендуется)**: меняешь NS-записи у регистратора на `ns1.vercel-dns.com`, `ns2.vercel-dns.com`. Всё работает «из коробки», включая `www.` и SSL.
   - **A/CNAME**: оставляешь NS у текущего регистратора, добавляешь `A 76.76.21.21` для `cool-symbols.net` и `CNAME cname.vercel-dns.com` для `www`.
3. SSL выдаётся автоматически за 1-5 минут.

## Локальный запуск для разработки

```bash
npm i -g vercel
cd /path/to/cool-symbols.net
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
vercel dev          # запустит фронт + API на http://localhost:3000
```

Без AI-фич сайт работает просто как `index.html` — открой файл в браузере напрямую, fancy text и библиотека символов будут пахать без сервера.

## Ограничения и стоимость

- **Vercel Hobby (бесплатно)**: 100 GB трафика, 100k вызовов функций, 100 GB-часов выполнения в месяц. Хватит на тысячи активных пользователей в день.
- **Anthropic Claude Haiku 4.5**: ~$1 за миллион входных токенов, ~$5 за выходные. Одна AI-генерация = ~$0.0005-0.001. С лимитом 20/день на IP и кэшем популярных запросов (можно добавить позже) расходы на старте — единицы долларов в месяц.

## Структура

```
.
├── index.html          # фронтенд — генератор, библиотека, AI UI
├── api/
│   └── generate.js     # serverless-функция, прокси к Anthropic API
├── package.json        # для определения Node 18+ runtime
├── vercel.json         # конфиг функций и security headers
└── README.md           # этот файл
```

## Что добавить дальше

- **SEO-страницы** — отдельные посадки `/fancy-text-generator`, `/heart-symbols`, `/gaming-names` с уникальными title/description.
- **Кэш популярных AI-запросов** через Vercel KV (бесплатный тариф) — снизит расходы и ускорит ответ.
- **Sitemap + robots.txt** для Google.
- **Аналитика** — Plausible или Vercel Analytics, без cookie-баннера.
- **Pro-тариф через Stripe** — снять лимит, добавить историю генераций.
