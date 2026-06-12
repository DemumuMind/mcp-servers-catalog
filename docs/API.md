# API Документация

## REST API v1

### `GET /api/v1/servers`
Список серверов с пагинацией и фильтрами.

**Query-параметры:**
| Параметр | Тип | Default | Описание |
|---|---|---|---|
| `page` | int | 1 | Номер страницы |
| `limit` | int | 20 | Размер страницы (max 100) |
| `q` | string | — | Поиск по названию, описанию, владельцу |
| `category` | string | — | Фильтр по категории |
| `tag` | string | — | Фильтр по тегу |
| `official` | bool | — | Только официальные |
| `remote` | bool | — | Только remote |
| `sort` | string | `createdAt` | `stars` | `createdAt` | `name` | `forks` |
| `order` | string | `desc` | `asc` | `desc` |

**Response headers:**
- `Link` — pagination (rel=first/prev/next/last)
- `X-Total-Count` — общее количество серверов
- `X-RateLimit-Limit` — лимит запросов
- `X-RateLimit-Remaining` — оставшиеся запросы
- `Cache-Control: public, max-age=60, stale-while-revalidate=300`

**Response body:**
```json
{
  "data": [{ "id", "name", "description", "owner", "repo", "category", "stars", "forks", "isOfficial", "isRemote" }],
  "meta": { "total": 1598, "page": 1, "limit": 20, "pages": 80 }
}
```

### `GET /api/v1/servers/{owner}/{repo}`
Детальная информация о сервере.

### `GET /api/v1/stats`
Каталогная статистика. `Cache-Control: max-age=60`.

```json
{
  "totalServers": 1598,
  "totalClients": 39,
  "totalUsers": 3,
  "officialCount": 0,
  "remoteCount": 0,
  "featuredCount": 0,
  "totalStars": 0,
  "categoryCounts": [],
  "recentlyAdded": [{ "id", "name", "owner", "repo", "stars" }]
}
```

### `GET /api/v1/search`
Полнотекстовый поиск.

### `GET /api/v1/export`
Экспорт данных. `Cache-Control: max-age=300`.

**Query:** `?table=servers|clients`

### `GET /api/docs`
OpenAPI 3.0.3 спецификация (JSON). `Cache-Control: max-age=3600`.

---

## Feed Endpoints

### `GET /api/feed/rss`
RSS 2.0 фид, 50 последних серверов. `Cache-Control: max-age=300`.

### `GET /api/feed/json`
JSON Feed v1.1, 50 последних серверов. `Cache-Control: max-age=300`.

---

## Cron Endpoints

Все cron endpoints требуют авторизацию: `?secret=<CRON_SECRET>`.
Shared auth: `src/lib/cron-auth.ts` — `verifyCronAuth(req)` с `.trim()`.

### `GET /api/cron/health-checks`
Проверка здоровья серверов (HTTP ping).

### `GET /api/cron/health-alerts`
Алерты при проблемах со здоровьем.

### `GET /api/cron/rankings`
Вычисление рейтингов week/month. Sequential execution (не parallel — SQLite lock).

**Response:**
```json
{ "week": { "updated": 1598, "inserted": 1598 }, "month": { ... } }
```

### `GET /api/cron/sync-github`
Синхронизация GitHub stars/forks/readme. Batch обработка с rate limit tracking.

**Query-параметры:**
| Параметр | Описание |
|---|---|
| `since` | ISO date — синхронизировать только серверы обновлённые до этой даты |
| `limit` | int — максимум серверов для синхронизации |
| `serverIds` | comma-separated — конкретные server IDs |

**Response:**
```json
{
  "updated": 120,
  "failed": 3,
  "enriched": 85,
  "processed": 150,
  "total": 1598,
  "rateLimitRemaining": 4800,
  "rateLimitLimit": 5000,
  "rateLimitResetAt": "2026-06-12T16:00:00Z",
  "params": { "since": null, "limit": null, "serverIds": null }
}
```

**Batch конфигурация (env vars):**
- `SYNC_BATCH_SIZE` — серверов на чанк (default: 50)
- `SYNC_CHUNK_DELAY_MS` — пауза между чанками (default: 1000ms)
- `SYNC_RATE_LIMIT_THRESHOLD` — пауза если remaining < N (default: 100)

### `GET /api/cron/backup`
Бэкап БД. `userId` опционален (cron context = нет сессии).

### `GET /api/cron/cleanup`
Очистка старых данных.

### `GET /api/cron/digest`
Email дайджест новых серверов.

### `GET /api/cron/expire-premium`
Снятие истёкших премиум-размещений.

---

## GraphQL

### `POST /api/graphql`
GraphQL endpoint. Схема: Server, Client, User, Query, Mutation.

---

## Server Actions (42 actions)

### Публичные

#### `getServersPublic(page, search?, category?, tag?, onlyOfficial?, onlyFeatured?)`
Список серверов с пагинацией. **Returns:** `{ servers, total, pages, currentPage }`

#### `searchServers(query, limit?)`
Умный поиск с ранжированием:
1. Точное совпадение названия (4 балла)
2. Название содержит запрос (3)
3. Описание содержит запрос (2)
4. Теги содержат запрос (1)

#### `autocompleteSearch(query, limit?)`
Автодополнение для поисковой строки.

#### `advancedSearch(params)`
Расширенный поиск с фильтрами по категориям, тегам, рейтингу.

#### `trackSearch(query, resultsCount, clickedServerId?)`
Трекинг поисковых запросов для аналитики.

#### `toggleBookmark(userId, serverId)`
Добавить/удалить закладку.

#### `rateServer(userId, serverId, value)`
Оценить сервер (1-5 звёзд).

#### `submitReview(userId, serverId, content, rating)`
Отправить текстовый отзыв с оценкой.

#### `voteReview(reviewId, direction)`
Голосовать за отзыв (up/down).

#### `addComment(userId, serverId, content)`
Комментарий (rate limit: 10/мин).

#### `getServerComments(serverId, isAdmin?)`
Комментарии сервера. Обычные пользователи видят только промодерированные.

#### `computeServerRankings(period)`
Вычисление рейтингов. Period: `week` | `month`. Batch insert, sequential.

#### `getServerRankings(period, limit?)`
Получить рейтинги за период.

#### `validateServer(url)`
Валидация GitHub URL сервера. **Returns:** `ValidationResult { valid, checks[] }`

### Профиль

- `getUserProfile(userId)` — профиль со статистикой (_count: bookmarks, comments, ratings)
- `getUserHistory(userId, limit?)` — история просмотров
- `updateProfile(userId, { name })` — обновить имя
- `updatePassword(userId, currentPassword, newPassword)` — сменить пароль
- `updateSettings(userId, { emailNotifications })` — настройки уведомлений
- `trackServerView(userId, serverId)` — записать просмотр

### API Keys

- `createApiKey(userId, name)` — создать API ключ
- `listApiKeys(userId)` — список ключей пользователя

### Уведомления

- `getUserNotifications(userId)` — последние 50
- `getUnreadNotificationsCount(userId)` — количество непрочитанных
- `markNotificationAsRead(id, userId)` — отметить прочитанным
- `createNotification({ userId, type, title, message, link? })` — создать

### Админ

- `getSubmissions(status?, search?)` — заявки на серверы
- `approveSubmission(id)` — одобрить (создаёт Server)
- `rejectSubmission(id, reason?)` — отклонить
- `syncGitHubStats(options?)` — GitHub sync (batch, rate limit, resume)
- `backupDatabase(userId?)` — бэкап (userId optional для cron)

---

## Модели данных (Drizzle Schema — 21 таблица)

### Server (`src/lib/db/schema.ts`)
- `id, name, description, owner, repo, fullSlug`
- `category, tags[]` (JSON), `isOfficial, isSponsored, isRemote`
- `githubUrl, stars, forks`
- `authType, endpoint`
- `featured, createdAt, updatedAt`

### Client
- `id, name, description, owner, repo`
- `category, tags[]`, `githubUrl, stars`
- `createdAt, updatedAt`

### ServerRanking
- `id, serverId, period` (week|month)
- `rank, score, views, stars, forks`
- `startDate, endDate, createdAt`
- **Unique index:** `(serverId, period)` — один сервер может иметь week + month

### User
- `id, email, name, image`
- `role` (user | admin), `emailNotifications`
- `createdAt, updatedAt`

### Comment
- `id, userId, serverId, content, isModerated`
- `createdAt, updatedAt`

### Review
- `id, serverId, userId, content, rating`
- `helpful, isVerifiedAuthor`
- `createdAt, updatedAt`

### ReviewVote
- `id, reviewId, userId, direction` (up/down)

### ApiKey
- `id, userId, key, name`
- `createdAt, lastUsedAt`

### HealthCheck
- `id, serverId, status, responseTime, statusCode, error`
- `checkedAt`

### ViewHistory, Bookmark, Rating, Notification, Submission, AuditLog, Collection, SearchGap, и др.

---

## Тестирование

### Unit тесты (35 тестов, 8 файлов)
| Файл | Тестов | Покрытие |
|---|---|---|
| search.test.ts | 14 | autocomplete, advanced search, tracking |
| auth.test.ts | 5 | validateServer, createApiKey, listApiKeys |
| public.test.ts | 3 | getServersPublic, getServerRankings, voteReview |
| profile.test.ts | 3 | getUserProfile, updateProfile, trackServerView |
| health-checks.test.ts | 1 | cron auth rejection (401) |
| date-utils.test.ts | 5 | formatDistanceToNow |
| security-headers.test.ts | 1 | CSP policy |
| theme-toggle.test.tsx | 2 | useTheme, useTranslations |

### E2E тесты (21 тест, 7 spec файлов)
| Spec | Тестов |
|---|---|
| homepage.spec.ts | 3 |
| server-detail.spec.ts | 5 |
| compare.spec.ts | 2 |
| submit.spec.ts | 2 |
| profile.spec.ts | 3 |
| search.spec.ts | 4 |
| navigation.spec.ts | 2 |

**Запуск:** `npm run test:e2e` (нужен запущенный dev сервер)
