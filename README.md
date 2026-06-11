# Awesome MCP Servers

Каталог серверов и клиентов для Model Context Protocol (MCP). Платформа для поиска, сравнения и обмена MCP серверами.

## Функции

### Для пользователей
- Поиск и фильтрация — по категориям, тегам, названию, официальности, remote
- Сравнение серверов — side-by-side таблица до 6 серверов (/compare)
- Закладки — сохраняйте понравившиеся серверы
- Оценки — рейтинг 1-5 звёзд
- Комментарии — обсуждайте серверы с сообществом
- История просмотров — отслеживайте просмотренные серверы
- Уведомления — о статусе заявок и ответах
- Профиль — аккаунт, закладки, комментарии
- PWA — офлайн-доступ, установка на рабочий стол

### Для администраторов
- Управление заявками — одобрение, отклонение, удаление
- Аналитика — графики, статистика, экспорт CSV
- Синхронизация GitHub — batch-обработка с rate limit tracking
- Бэкап и восстановление — SQL дампы базы данных
- RSS/JSON Feed — фиды с новыми серверами
- 8 cron endpoints — здоровье, рейтинги, дайджест, бэкап и др.

### Для разработчиков
- REST API v2 — /api/v1/servers, /api/v1/stats, /api/v1/export, /api/v1/search
- OpenAPI 3.0 спецификация — /api/docs
- GraphQL endpoint — /api/graphql
- Pagination headers — Link, X-Total-Count, X-RateLimit-*
- Cache-Control — на статичных endpoints

## Технологии

- **Next.js 16** — App Router, Server Actions, Turbopack
- **Drizzle ORM + Turso (libsql)** — ORM и SQLite-совместимая БД
- **NextAuth v5** — аутентификация (email/password + GitHub OAuth)
- **next-intl** — интернационализация (EN/RU), i18n в admin
- **Tailwind CSS + shadcn/ui** — стилизация и компоненты
- **recharts** — графики и аналитика
- **Service Worker** — PWA, offline fallback, stale-while-revalidate

## Установка

```bash
git clone <repo-url>
cd mcpservers-clone

cp .env.example .env
# Отредактируйте .env (см. таблицу ниже)

npm install

# Инициализация БД и seed данные
npx drizzle-kit push
npm run db:seed

# Запуск dev сервера
npm run dev
```

> **WSL:** Dev сервер запускайте из PowerShell (`npx next dev`), не из WSL — libsql lockfile не работает на NTFS через WSL.

### Переменные окружения

| Переменная | Описание | Обязательная |
|---|---|---|
| `DATABASE_URL` | Turso/local DB: `file:.turso/local.db` или `libsql://...` | Да |
| `DATABASE_AUTH_TOKEN` | Turso auth token (для remote DB) | Для remote |
| `AUTH_SECRET` | Секрет NextAuth | Да |
| `ADMIN_PASSWORD` | Пароль администратора | Да |
| `CRON_SECRET` | Секрет для cron endpoints | Да |
| `GITHUB_TOKEN` | GitHub PAT для sync (scopes: `public_repo`) | Нет |
| `GITHUB_CLIENT_ID` | GitHub OAuth (для логина) | Нет |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | Нет |
| `SMTP_*` | Настройки почты для уведомлений | Нет |
| `SITE_URL` | URL сайта для RSS/OG (default: `https://mcpservers.org`) | Нет |

## Структура проекта

```
src/
├── app/
│   ├── [locale]/          # Публичные страницы (i18n)
│   │   ├── page.tsx       # Homepage
│   │   ├── servers/       # Каталог серверов + детали [owner]/[repo]
│   │   ├── compare/       # Сравнение side-by-side
│   │   ├── clients/       # Каталог клиентов
│   │   ├── rankings/      # Рейтинги
│   │   ├── all/           # Все серверы с поиском
│   │   └── ...            # guide, about-mcp, ecosystem, badges, etc.
│   ├── admin/             # Админ-панель (7 страниц, i18n)
│   ├── api/
│   │   ├── v1/            # REST API v1/v2
│   │   ├── cron/          # 8 cron endpoints (shared auth)
│   │   ├── feed/          # RSS + JSON feed
│   │   ├── docs/          # OpenAPI спецификация
│   │   ├── graphql/       # GraphQL
│   │   └── embed/         # Embed widget
│   └── actions/           # 42 server actions
├── components/            # 96 компонентов
├── lib/
│   ├── db.ts              # Drizzle + Turso connection manager
│   ├── db/schema.ts       # 21 таблица, Drizzle schema
│   ├── db/relations.ts    # Drizzle relations
│   ├── cron-auth.ts       # Shared cron verification (trim)
│   ├── github.ts          # GitHub API + rate limit tracking
│   ├── json-ld.ts         # SEO structured data generators
│   └── ...
└── messages/              # next-intl: en.json, ru.json
```

## Деплой

См. [docs/DEPLOY.md](docs/DEPLOY.md).

## API

См. [docs/API.md](docs/API.md) и интерактивную документацию на `/api/docs`.

## Cron Endpoints

Все cron endpoints требуют `?secret=<CRON_SECRET>` query параметр.

| Endpoint | Описание |
|---|---|
| `/api/cron/health-checks` | Проверка здоровья серверов |
| `/api/cron/health-alerts` | Алерты при проблемах |
| `/api/cron/rankings` | Вычисление рейтингов (week/month) |
| `/api/cron/sync-github` | Синхронизация GitHub (batch, rate limit) |
| `/api/cron/backup` | Бэкап БД |
| `/api/cron/cleanup` | Очистка старых данных |
| `/api/cron/digest` | Email дайджест |
| `/api/cron/expire-premium` | Снятие истёкших премиумов |

## SEO

- `robots.txt` — блокирует /admin, /api, /profile
- `sitemap.xml` — динамический, 3,000+ URLs
- JSON-LD — WebSite, Organization, SoftwareApplication, BreadcrumbList
- Open Graph + Twitter Cards — на всех страницах

## Лицензия

MIT
