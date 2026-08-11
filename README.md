# cool-symbols.net

Free copy-paste Unicode symbol library, fancy text generator, and AI symbol tools.
Built with Astro, deployed on Vercel.

## Стек

- **Astro 5** в статическом режиме: все страницы пререндерятся в HTML на билде
- **@astrojs/vercel** адаптер: единственная serverless-функция это `/api/generate`
- **Upstash Redis** для rate-limit и глобального бюджета AI
- **Anthropic Claude Haiku** для AI-генераторов

## Структура

```
src/
├── data/categories.json      единственный источник правды по всем категориям
├── content.config.ts         Zod-схема каталога, билд падает на кривых данных
├── pages/
│   ├── index.astro           главная
│   ├── [slug].astro          все 21 категорийная страница из каталога
│   ├── about|contact|privacy|terms.astro
│   ├── sitemap.xml.ts        генерится из каталога, статика
│   └── api/generate.ts       Anthropic proxy, единственная функция
├── layouts/                  Base (head, SEO, тема, clipboard) + ContentPage
├── components/               SymbolLibrary, ComboLibrary, FaqList и т.д.
├── styles/                   base + home + category + page
├── scripts/home.js           интерактив главной
└── lib/                      unicode, seo (JSON-LD), home-content
public/                       favicon.svg, robots.txt
```

### Как добавить категорию

1. Добавить объект в `src/data/categories.json`
2. `npm run build`

Страница, запись в sitemap и внутренние ссылки появятся сами. Никаких ручных
правок HTML и никаких сгенерированных файлов в гите.

## Локальная разработка

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev          # http://localhost:4321
```

Без KV-переменных лимит падает на in-memory счётчик, в логах будет warning.
Это ожидаемо локально и недопустимо в проде.

```bash
npm run build        # прод-сборка в dist/ + .vercel/output/
npm run preview      # посмотреть собранное
```

## Что поменять на Vercel

Проект уже подключён к Vercel, но после перехода на Astro нужно поправить
настройки сборки. Всё в **Project Settings**.

### 1. Build & Development Settings

| Поле | Значение |
|---|---|
| Framework Preset | **Astro** (было Other) |
| Build Command | `npm run build` (или оставить Override выключенным) |
| Output Directory | оставить пустым, адаптер сам пишет в `.vercel/output` |
| Install Command | `npm install` |
| Node.js Version | **20.x** или новее |

Обычно достаточно выставить Framework Preset = Astro и убрать все Override,
дальше Vercel определит остальное сам.

### 2. Environment Variables

Ничего добавлять не нужно, всё уже на месте с прошлого раза:

- `ANTHROPIC_API_KEY`
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` (от интеграции Upstash)
- `DAILY_BUDGET_USD` если задавал

`api/generate.ts` читает и `KV_REST_API_*`, и `UPSTASH_REDIS_REST_*`, так что
переименование интеграции ничего не сломает.

### 3. Что удалить в vercel.json

Уже сделано: из `vercel.json` убраны `cleanUrls`, `trailingSlash` и блок
`functions`. Теперь этим управляет адаптер, а дублирование настроек в
`vercel.json` при Build Output API v3 приводит к конфликтам. Остались только
security-заголовки.

### 4. Проверить после первого деплоя

- `/heart-symbols` открывается, `/heart-symbols/` редиректится на него с 308
- `/sitemap.xml` отдаёт 26 URL
- `/robots.txt` и `/favicon.svg` на месте
- В **Functions** ровно одна функция, `/api/generate`
- AI-генерация работает, в логах нет `KV not configured`

Ничего в Google Search Console менять не надо: URL, canonical, sitemap и
verification-мета не изменились.

## Cost protection

Каждый вызов `/api/generate` проходит два независимых лимита:

**Глобальный бюджет, $3/день по умолчанию.** Счётчик `budget:{дата}` в
милли-центах. Перед вызовом Anthropic читаем, после ответа инкрементим на
фактическую стоимость из `usage`. Fail-closed: если KV недоступен, запрос
отклоняется, а не пропускается.

**Лимит на IP, 20/день.** Атомарный `INCRBY` по ключу `rl:{ip}:{дата}` с TTL.
Fail-open на in-memory счётчик: сбой KV не должен ронять фичу, потолок всё
равно держит глобальный бюджет.

Поднять потолок: `DAILY_BUDGET_USD=10` в переменных окружения, редеплой.

## Дальше по плану

- Редизайн главной и категорийных страниц по новым макетам
- Избранное (localStorage) в сайдбаре
- Расширение каталога до 100+ символов в категории
- OG-картинки через `@vercel/og` для Pinterest
- Supporting-контент: how-to статьи под длинный хвост
