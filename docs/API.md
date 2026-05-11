# API Документация

## Server Actions

### Публичные

#### `getServersPublic(page, search?, category?, tag?, onlyOfficial?, onlyFeatured?)`
Получить список серверов с пагинацией и фильтрами.

**Параметры:**
- `page: number` — номер страницы (по умолчанию 1)
- `search?: string` — поиск по названию, описанию, владельцу
- `category?: string` — фильтр по категории
- `tag?: string` — фильтр по тегу
- `onlyOfficial?: boolean` — только официальные
- `onlyFeatured?: boolean` — только рекомендуемые

**Возвращает:** `{ servers, total, pages, currentPage }`

#### `searchServers(query, limit?)`
Умный поиск с ранжированием по релевантности.

**Параметры:**
- `query: string` — поисковый запрос
- `limit?: number` — максимум результатов (по умолчанию 20)

**Ранжирование:**
1. Точное совпадение названия (4 балла)
2. Название содержит запрос (3 балла)
3. Описание содержит запрос (2 балла)
4. Теги содержат запрос (1 балл)

#### `toggleBookmark(userId, serverId)`
Добавить или удалить сервер из закладок.

#### `rateServer(userId, serverId, value)`
Оценить сервер (1-5 звёзд).

#### `addComment(userId, serverId, content)`
Добавить комментарий (с rate limiting: 10/мин).

#### `getServerComments(serverId, isAdmin?)`
Получить комментарии сервера. Для обычных пользователей показываются только промодерированные.

### Профиль

#### `getUserProfile(userId)`
Получить профиль пользователя со статистикой (количество закладок, комментариев, оценок).

#### `getUserHistory(userId, limit?)`
Получить историю просмотров (дедуплицированная, сортированная по времени).

#### `updateProfile(userId, { name })`
Обновить имя пользователя.

#### `updatePassword(userId, currentPassword, newPassword)`
Сменить пароль (требует текущий пароль).

#### `updateSettings(userId, { emailNotifications })`
Обновить настройки уведомлений.

### Уведомления

#### `getUserNotifications(userId)`
Получить уведомления пользователя (последние 50).

#### `getUnreadNotificationsCount(userId)`
Получить количество непрочитанных уведомлений.

#### `markNotificationAsRead(id, userId)`
Отметить уведомление как прочитанное.

#### `createNotification({ userId, type, title, message, link? })`
Создать уведомление (внутреннее API).

### Админ

#### `getSubmissions(status?, search?)`
Получить заявки на добавление серверов.

#### `approveSubmission(id)`
Одобрить заявку (создаёт Server автоматически).

#### `rejectSubmission(id, reason?)`
Отклонить заявку.

#### `syncGitHubStats()`
Синхронизировать stars/forks всех серверов с GitHub API.

## REST API

### `/api/feed/rss`
RSS 2.0 фид с 50 последними серверами.

### `/api/feed/json`
JSON Feed v1.1 с 50 последними серверами.

### `/api/cron/sync-github`
Cron endpoint для синхронизации GitHub stats. Требует `CRON_SECRET` в заголовке.

## Модели данных

### Server
- `id, name, description, owner, repo, fullSlug`
- `category, tags[], isOfficial, isSponsored`
- `githubUrl, stars, forks`
- `isRemote, authType, endpoint`
- `featured, createdAt, updatedAt`

### User
- `id, email, name, image`
- `role` (user | admin)
- `emailNotifications`
- `createdAt, updatedAt`

### Comment
- `id, userId, serverId, content`
- `isModerated`
- `createdAt, updatedAt`

### Notification
- `id, userId, type, title, message`
- `link?, read, createdAt`

### ViewHistory
- `id, userId, serverId, createdAt`
