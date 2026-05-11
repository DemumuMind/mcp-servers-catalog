# Awesome MCP Servers

Коллекция серверов и клиентов для Model Context Protocol (MCP). Платформа для поиска, сравнения и обмена MCP серверами.

## 🚀 Функции

### Для пользователей
- 🔍 **Поиск и фильтрация** — находите серверы по категориям, тегам, названию
- ⭐ **Закладки** — сохраняйте понравившиеся серверы
- ⭐ **Оценки** — ставьте рейтинг серверам 1-5 звёзд
- 💬 **Комментарии** — обсуждайте серверы с сообществом
- 📊 **История просмотров** — отслеживайте просмотренные серверы
- 🔔 **Уведомления** — получайте уведомления о статусе заявок и ответах
- 👤 **Профиль** — управляйте своим аккаунтом, закладками, комментариями

### Для администраторов
- 📋 **Управление заявками** — одобрение, отклонение, удаление
- 📊 **Аналитика** — графики, статистика, экспорт CSV
- 🔄 **Синхронизация GitHub** — автоматическое обновление stars/forks
- 💾 **Бэкап и восстановление** — SQL дампы базы данных
- 📡 **RSS/JSON Feed** — фиды с новыми серверами

## 🛠 Технологии

- **Next.js 16** — App Router, Server Actions
- **Prisma 7 + PGLite** — ORM и встроенная PostgreSQL
- **NextAuth v5** — аутентификация (email/password + admin credentials)
- **Tailwind CSS + shadcn/ui** — стилизация и компоненты
- **recharts** — графики и аналитика
- **Playwright + Vitest** — тестирование

## 📦 Установка

```bash
# Клонирование
git clone <repo-url>
cd mcpservers-clone

# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env
# Отредактируйте .env

# Генерация Prisma Client и миграции
npx prisma generate
npx tsx scripts/migrate-view-history.ts
npx tsx scripts/migrate-notifications.ts

# Запуск dev сервера
npm run dev
```

### Переменные окружения

| Переменная | Описание | Обязательная |
|---|---|---|
| `DATABASE_DIR` | Путь к PGLite директории | Да |
| `AUTH_SECRET` | Секрет NextAuth | Да |
| `ADMIN_EMAIL` | Email администратора | Да |
| `ADMIN_PASSWORD` | Пароль администратора | Да |
| `GITHUB_TOKEN` | GitHub PAT для API | Нет |
| `SMTP_*` | Настройки почты для уведомлений | Нет |

## 🚢 Деплой

### Vercel
1. Подключите репозиторий к Vercel
2. Установите переменные окружения в dashboard
3. Деплой произойдёт автоматически

### Docker
```bash
docker-compose up -d
```

### Самостоятельный сервер
```bash
npm run build
npm start
```

## 📝 API

### Server Actions

- `getServersPublic(page, search, category, tag)` — получить серверы
- `toggleBookmark(userId, serverId)` — добавить/удалить закладку
- `rateServer(userId, serverId, value)` — оценить сервер
- `addComment(userId, serverId, content)` — добавить комментарий
- `searchServers(query)` — умный поиск с ранжированием

См. [docs/API.md](docs/API.md) для полной документации.

## 🧪 Тесты

```bash
# Unit тесты
npm run test:unit

# E2E тесты
npm run test:e2e
```

## 📄 Лицензия

MIT
