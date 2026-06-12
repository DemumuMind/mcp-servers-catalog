# Гайд по деплою

## Vercel (Рекомендуется)

### Подготовка
1. Форкните репозиторий на GitHub
2. Создайте Turso DB: `turso db create mcpservers`
3. Получите URL и auth token: `turso db show mcpservers --url` и `turso db tokens create mcpservers`

### Деплой
1. Импортируйте репозиторий в [Vercel Dashboard](https://vercel.com)
2. Настройте переменные окружения:
   - `DATABASE_URL` — Turso URL (`libsql://mcpservers-xxx.turso.io`)
   - `DATABASE_AUTH_TOKEN` — Turso auth token
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `ADMIN_PASSWORD` — пароль администратора
   - `CRON_SECRET` — секрет для cron endpoints
   - `GITHUB_TOKEN` — (опционально) для sync-github
3. Деплой запустится автоматически

### После деплоя
- Примените схему к Turso: `npx drizzle-kit push`
- Seed: `npm run db:seed` (создаёт admin + демо-данные)
- Настройте Vercel Cron для вызова `/api/cron/*` endpoints

### Vercel Cron
Добавьте в `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/health-checks?secret=YOUR_CRON_SECRET", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/rankings?secret=YOUR_CRON_SECRET", "schedule": "0 0 * * *" },
    { "path": "/api/cron/sync-github?secret=YOUR_CRON_SECRET&limit=100", "schedule": "0 3 * * *" },
    { "path": "/api/cron/cleanup?secret=YOUR_CRON_SECRET", "schedule": "0 4 * * 0" }
  ]
}
```

## Локальная разработка

### Требования
- Node.js 20+
- npm

### Установка
```bash
cp .env.example .env
# Настройте .env

npm install

# Инициализация локальной Turso DB
npx drizzle-kit push
npm run db:seed

# Dev сервер
npm run dev
```

> **WSL:** Запускайте dev сервер из PowerShell. Libsql lockfile не работает на NTFS через WSL — используйте `powershell.exe -Command "npm run dev"`.

### Локальная БД
По умолчанию `DATABASE_URL=file:.turso/local.db` — локальный SQLite файл через libsql.
Схема: 21 таблица, Drizzle ORM. Миграция: `npx drizzle-kit push`.

### Миграции
```bash
# Применить схему к DB (create/alter tables)
npx drizzle-kit push

# Генерация SQL миграции (для ручного контроля)
npx drizzle-kit generate

# Применить сгенерированную миграцию
npx drizzle-kit migrate
```

### Тестирование
```bash
# Unit тесты (Vitest)
npm run test:unit

# E2E тесты (Playwright) — нужен запущенный dev сервер
npm run test:e2e

# TypeScript проверка
npm run typecheck

# Качество кода
npx aislop scan
```

## Docker

### Запуск
```bash
git clone https://github.com/DemumuMind/mcp-servers-catalog.git
cd mcpservers-clone
docker-compose up -d

# Логи
docker-compose logs -f app
```

### Обновление
```bash
docker-compose down
git pull
docker-compose up -d --build
```

## Самостоятельный сервер

### PM2
```bash
npm install -g pm2
npm run build
pm2 start npm --name "mcp-servers" -- start
pm2 save
pm2 startup
```

## Переменные окружения

### Обязательные
| Переменная | Описание | Пример |
|---|---|---|
| `DATABASE_URL` | Turso/local DB URL | `file:.turso/local.db` или `libsql://db.turso.io` |
| `AUTH_SECRET` | JWT секрет NextAuth | `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Пароль администратора | `secure-password` |
| `CRON_SECRET` | Секрет для cron endpoints | `random-36-char-string` |

### Turso Remote
| Переменная | Описание |
|---|---|
| `DATABASE_AUTH_TOKEN` | Turso auth token (для remote DB) |

### Опциональные
| Переменная | Описание |
|---|---|
| `GITHUB_TOKEN` | GitHub PAT для sync (scopes: `public_repo`) |
| `GITHUB_CLIENT_ID` | GitHub OAuth для логина |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |
| `SITE_URL` | URL сайта для RSS/OG (via `getSiteUrl()`) |
| `SMTP_HOST/PORT/USER/PASS` | SMTP для email уведомлений |
| `SYNC_BATCH_SIZE` | Чанк для sync-github (default: 50) |
| `SYNC_CHUNK_DELAY_MS` | Пауза между чанками (default: 1000) |
| `SYNC_RATE_LIMIT_THRESHOLD` | Пауза если GitHub API remaining < N (default: 100) |

## Безопасность

1. **AUTH_SECRET** — случайная строка 32+ символов
2. **ADMIN_PASSWORD** — надёжный пароль
3. **CRON_SECRET** — 36+ символов, защищает cron endpoints. `.trim()` обязателен (env whitespace баг)
4. **GITHUB_TOKEN** — минимальные scopes (`public_repo`)
5. **DATABASE_AUTH_TOKEN** — не коммитьте в репозиторий

## Мониторинг

### Health Check
- Homepage: `GET /en` (200)
- API: `GET /api/v1/stats` (200)
- RSS: `GET /api/feed/rss` (200)

### Cron Status
Все cron endpoints возвращают JSON с результатом. Мониторьте `failed` и `rateLimitRemaining`.

## Резервное копирование

### Turso
```bash
turso db dump mcpservers > backup-$(date +%Y%m%d).sql
```

### Локальная DB
```bash
cp .turso/local.db .turso/local.db.bak
```

### Через cron endpoint
`GET /api/cron/backup?secret=<CRON_SECRET>` — создаёт SQL дамп.

## Обновление

1. Бэкап БД
2. `git pull`
3. `npx drizzle-kit push` — применить новую схему
4. `npm install` — обновить зависимости
5. `npm run build` — пересобрать
6. Перезапустить сервер

## Устранение неполадок

### "libsql lockfile" ошибка (WSL)
Не запускайте `npm run dev` из WSL. Используйте PowerShell:
```bash
powershell.exe -Command "cd C:\path\to\project; npm run dev"
```

### Cron 401 (Unauthorized)
Проверьте: (1) CRON_SECRET в .env без trailing whitespace, (2) `?secret=` параметр совпадает полностью, (3) `verifyCronAuth` использует `.trim()`.

### Rankings 500 (UNIQUE constraint)
ServerRanking имеет unique index `(serverId, period)`. Если возникает — запустите `npx drizzle-kit push` для обновления схемы.

### Turbopack cache corruption
```bash
rm -rf .next
npm run dev
```

### tsc зависает
Всегда используйте `npx tsc --noEmit --incremental false` — без `--incremental false` tsc зависает из-за кэша `.next`.

### Drizzle "model not found"
```bash
npx drizzle-kit push
```
