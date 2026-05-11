# Гайд по деплою

## Vercel (Рекомендуется)

### Подготовка
1. Форкните или загрузите репозиторий на GitHub
2. Убедитесь, что `next.config.ts` настроен с `output: 'standalone'`

### Деплой
1. Зайдите в [Vercel Dashboard](https://vercel.com)
2. Импортируйте репозиторий
3. Настройте переменные окружения:
   - `DATABASE_DIR` — `./.pglite`
   - `AUTH_SECRET` — случайная строка (генерируйте через `openssl rand -base64 32`)
   - `ADMIN_EMAIL` и `ADMIN_PASSWORD`
   - `GITHUB_TOKEN` (опционально)
4. Деплой запустится автоматически

### После деплоя
- Создайте администратора через API или добавьте вручную в БД
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
npm install

# Генерация Prisma Client
npx prisma generate

# Миграции (PGLite — встроенная БД, SQL миграции через скрипты)
npx tsx scripts/migrate-view-history.ts
npx tsx scripts/migrate-notifications.ts

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
PGLite не требует DATABASE_URL. Убедитесь, что `DATABASE_DIR` установлен.

### Ошибка Prisma "model not found"
Запустите `npx prisma generate` для перегенерации клиента.

### Turbopack cache corruption
```bash
rm -rf .next
npm run dev
```

### Сбой билда с PGLite
Убедитесь, что все страницы админки объявляют `export const dynamic = 'force-dynamic'`.
