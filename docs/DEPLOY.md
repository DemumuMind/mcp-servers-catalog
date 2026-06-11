# Гайд по деплою

## Vercel (Рекомендуется)

### Подготовка
1. Форкните или загрузите репозиторий на GitHub
2. Убедитесь, что `next.config.ts` настроен с `output: 'standalone'`

### Деплой
1. Зайдите в [Vercel Dashboard](https://vercel.com)
2. Импортируйте репозиторий
3. Настройте переменные окружения:
   - `DATABASE_URL` — внешний PostgreSQL URL (Neon, Supabase, Vercel Postgres). Для serverless production PGLite в файловой системе не подходит.
   - `AUTH_SECRET` — случайная строка (генерируйте через `openssl rand -base64 32`)
   - `ADMIN_EMAIL` и `ADMIN_PASSWORD`
   - `GITHUB_TOKEN` (опционально)
4. Деплой запустится автоматически

### После деплоя
- Примените схему к внешней PostgreSQL базе перед первым запуском production трафика. Минимальный вариант: выполните SQL из `prisma/full-schema.sql` любым клиентом PostgreSQL для вашего провайдера.
- Создайте стартового администратора через API или добавьте вручную в БД. Локальная команда `npm run db:seed` предназначена для PGLite setup и не заменяет seed внешней production БД.
- Настройте SMTP для email-уведомлений (опционально)

## Docker

### Требования
- Docker и Docker Compose

### Запуск
```bash
# Клонирование и запуск
git clone <repo-url>
cd mcpservers-clone
docker-compose up -d

# Просмотр логов
docker-compose logs -f app
```

### Конфигурация
Переименуйте `.env.example` в `.env` и настройте переменные.

### Обновление
```bash
docker-compose down
git pull
docker-compose up -d --build
```

## Самостоятельный сервер

### Требования
- Node.js 20+
- npm или yarn

### Установка
```bash
# Настройка окружения до npm install: postinstall запускает Prisma
cp .env.example .env
# Отредактируйте .env: DATABASE_DIR, DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

npm install

# Инициализация PGLite схемы и стартовых данных
npm run db:init
npm run db:seed

# Сборка
npm run build

# Запуск
npm start
```

### PM2 (процесс-менеджер)
```bash
npm install -g pm2
pm2 start npm --name "mcp-servers" -- start
pm2 save
pm2 startup
```

## Переменные окружения

### Обязательные
| Переменная | Описание | Пример |
|---|---|---|
| `DATABASE_DIR` | Путь к PGLite | `./.pglite` |
| `DATABASE_URL` | Внешний PostgreSQL для Vercel/serverless production | `postgresql://user:password@host/db?sslmode=require` |
| `AUTH_SECRET` | JWT секрет NextAuth | `base64-encoded-secret` |
| `ADMIN_EMAIL` | Email админа | `admin@example.com` |
| `ADMIN_PASSWORD` | Пароль админа | `admin123` |

### Опциональные
| Переменная | Описание |
|---|---|
| `GITHUB_TOKEN` | GitHub PAT для синхронизации stars/forks |
| `SMTP_HOST` | SMTP сервер для email |
| `SMTP_PORT` | Порт SMTP |
| `SMTP_USER` | SMTP пользователь |
| `SMTP_PASS` | SMTP пароль |
| `CRON_SECRET` | Секрет для cron endpoints |
| `SITE_URL` | URL сайта для RSS/фидов |

## Безопасность

1. **AUTH_SECRET** — всегда используйте случайную строку длиной 32+ символов
2. **ADMIN_PASSWORD** — используйте надёжный пароль
3. **GITHUB_TOKEN** — храните в безопасности, используйте minimal scopes
4. **CRON_SECRET** — защищает cron endpoints от случайных вызовов

## Мониторинг

### Health Check
- Главная страница: `GET /ru`
- RSS фид: `GET /api/feed/rss`

### Логи
- Vercel: Dashboard → Logs
- Docker: `docker-compose logs -f app`
- PM2: `pm2 logs mcp-servers`

## Резервное копирование

### PGLite
PGLite хранит данные в файловой системе. Для резервного копирования:
```bash
# Копирование директории
cp -r .pglite .pglite-backup-$(date +%Y%m%d)
```

### Или через админ-панель
Используйте функцию "Бэкап" в админ-панели для создания SQL дампа.

## Обновление

1. Сделайте бэкап данных
2. Загрузите новую версию кода
3. Перегенерируйте Prisma Client: `npx prisma generate`
4. Запустите миграции (если есть новые)
5. Пересоберите: `npm run build`
6. Перезапустите сервер

## Устранение неполадок

### Ошибка "DATABASE_URL not found"
Для локального/self-hosted запуска PGLite использует `DATABASE_DIR`. Для Vercel/serverless production нужен внешний `DATABASE_URL`, иначе приложение перейдет в fallback без реальной БД.

### Ошибка Prisma "model not found"
Запустите `npx prisma generate` для перегенерации клиента.

### Turbopack cache corruption
```bash
rm -rf .next
npm run dev
```

### Сбой билда с PGLite
Убедитесь, что все страницы админки объявляют `export const dynamic = 'force-dynamic'`.
