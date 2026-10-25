# Creative School

React + Vite (интерфейс) и Cloudflare Worker (API) с базой Cloudflare D1 (это SQLite).
От Replit ничего не зависит. Секретов в коде нет: пароли хранятся как PBKDF2-хеши, сессии — как хеши токенов в D1.

## Запуск в облаке (только через браузер)

1. **GitHub.** Создайте репозиторий (можно приватный) → *Add file → Upload files* → загрузите содержимое этой папки.
   В веб-загрузке лимит 100 файлов за раз, поэтому `src/components/ui` загрузите отдельным заходом.
2. **Cloudflare.** Зарегистрируйтесь на dash.cloudflare.com (аккаунт и пароль создаёте вы сами).
3. **База.** *Storage & databases → D1 → Create database*, имя `creative-school`.
   Скопируйте *Database ID*. Откройте вкладку *Console*, вставьте весь файл `migrations/0001_init.sql`, нажмите *Execute*.
4. **ID базы в репозитории.** На GitHub откройте `wrangler.toml` (значок карандаша) и замените
   `ВСТАВЬТЕ-СЮДА-ID-БАЗЫ-D1` на ваш Database ID → *Commit*. (ID не секрет.)
5. **Деплой.** *Workers & Pages → Create → Import a repository* → выберите репозиторий.
   Build command: `npm install && npm run build`. Deploy command: `npx wrangler deploy`.
   После сборки сайт будет доступен на бесплатном домене `creative-school.<ваш-поддомен>.workers.dev`.
   Каждый коммит в GitHub дальше деплоится сам.

## Секреты
Сейчас сайту секреты не нужны. Если понадобятся (почта, капча и т.п.): *Worker → Settings → Variables and secrets → тип Secret*.
Не кладите ключи в GitHub, в чат и в файлы проекта. `.dev.vars` и `.env` уже в `.gitignore`.

## Локально (по желанию)
`npm install`, `npm run db:local`, в двух терминалах `npm run dev:api` и `npm run dev`.

## Что где
`src/` — интерфейс, `src/lib/api.ts` — клиент API, `worker/index.ts` — API, `migrations/` — схема SQLite.
