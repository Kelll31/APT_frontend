# Проект APT на базе Next.js

Это проект на основе [Next.js](https://nextjs.org/), созданный с помощью утилиты [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) и адаптированный под автоматизированный пентест (APT).

## Быстрый старт

1. Установите зависимости и запустите dev-сервер:

npm install
npm run dev

или
yarn install
yarn dev

или
pnpm install
pnpm dev

или
bun install
bun dev


2. Откройте в браузере http://localhost:3000 — вы попадёте на главный экран APT-дашборда.

3. Для правок перейдите в файл `app/page.tsx` (или соответствующую страницу в маршруте `/dashboard`), внесите изменения и сохраните. Next.js автоматически применит обновления благодаря Fast Refresh.

## Структура проекта

- **`app/`** — корень маршрутизатора App Router, здесь находятся страницы и их компоненты.  
- **`components/dashboard/`** — виджеты и блоки APT-дашборда: сводка, графики, таблицы результатов.  
- **`lib/menus.ts`** — конфигурация бокового меню с единственным пунктом «Дашборд».  
- **`messages/`** — локализация (русский и английский).  
- **`public/`** — статические ресурсы (иконки, фоновые изображения).  
- **`next.config.mjs`** — настройки Next.js, включая оптимизацию шрифтов и плагины.

## Оптимизация шрифтов

Проект использует встроенный модуль [next/font](https://nextjs.org/docs/basic-features/font-optimization) для автоматической оптимизации и подгрузки шрифта **Inter** с Google Fonts.

## Полезные ссылки

- Документация Next.js: https://nextjs.org/docs  
- Интерактивный туториал «Learn Next.js»: https://nextjs.org/learn  
- Репозиторий Next.js на GitHub: https://github.com/vercel/next.js  

## Деплой

Рекомендуется развернуть приложение на платформе Vercel:

1. Создайте новый проект на https://vercel.com/new и выберите репозиторий.  
2. Vercel автоматически определит настройки сборки: команда `npm run build` и запуск с помощью `npm run start`.  
3. После деплоя ваш APT-дашборд будет доступен по вашему домену.

Подробное руководство по деплою: https://nextjs.org/docs/deployment
