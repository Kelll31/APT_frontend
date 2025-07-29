# IP Roast Frontend - Инструкция по разворачиванию демоверсии

## Обзор

IP Roast 4.0 Enterprise Frontend - это современное веб-приложение для тестирования безопасности сети, построенное на React 18.2.0 с TypeScript и использующее Vite как сборщик. Данная инструкция поможет развернуть демоверсию фронтенда для последующего подключения к основному проекту.

## Системные требования

### Минимальные требования
- **Node.js**: версия 18.0.0 или выше
- **npm**: версия 9.0.0 или выше
- **Операционная система**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **RAM**: минимум 4 ГБ, рекомендуется 8 ГБ
- **Свободное место**: минимум 2 ГБ

### Рекомендуемые браузеры
- Google Chrome 90+
- Mozilla Firefox 88+
- Safari 14+
- Microsoft Edge 90+

## Шаг 1: Подготовка окружения

### Установка Node.js и npm

#### На Ubuntu/Debian:
```bash
# Обновление пакетов
sudo apt update
sudo apt upgrade

# Установка curl (если не установлен)
sudo apt install -y curl

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версий
node --version  # должно быть >= 18.0.0
npm --version   # должно быть >= 9.0.0
```

#### На CentOS/RHEL/AlmaLinux:
```bash
# Обновление системы
sudo dnf update -y

# Установка curl
sudo dnf install -y curl

# Установка Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install nodejs -y

# Проверка версий
node --version
npm --version
```

#### На Windows:
1. Скачайте установщик Node.js LTS с официального сайта: https://nodejs.org/
2. Запустите установщик и следуйте инструкциям
3. Перезагрузите систему
4. Откройте командную строку и проверьте установку:
```cmd
node --version
npm --version
```

#### На macOS:
```bash
# Используя Homebrew
brew install node@18

# Или скачайте установщик с официального сайта
# https://nodejs.org/
```

## Шаг 2: Получение исходного кода

### Клонирование репозитория (если доступен Git):
```bash
git clone https://github.com/ip-roast/frontend.git ip-roast-frontend
cd ip-roast-frontend
```

### Или разархивирование архива:
```bash
# Если у вас есть архив с кодом
unzip ip-roast-frontend.zip
cd ip-roast-frontend
```

## Шаг 3: Настройка переменных окружения

### Создание файла конфигурации
Создайте файл `.env.local` в корне проекта со следующим содержимым:

```bash
# Режим демонстрации
VITE_DEMO_MODE=true

# API эндпоинты (замените на ваши реальные адреса)
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000

# Информация о приложении
VITE_APP_TITLE=IP Roast 4.0 Demo
VITE_APP_VERSION=2.1.0

# Настройки разработки
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_DEBUG_MODE=true

# Дополнительные настройки
VITE_DEFAULT_THEME=dark
VITE_DEFAULT_LANGUAGE=ru
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false
```

### Настройки для продакшена
Для продакшен-среды создайте файл `.env.production`:

```bash
# Продакшен режим
VITE_DEMO_MODE=false

# Продакшен API эндпоинты
VITE_API_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-api-domain.com

# Информация о приложении
VITE_APP_TITLE=IP Roast 4.0 Enterprise
VITE_APP_VERSION=2.1.0

# Настройки продакшена
VITE_ENABLE_DEV_TOOLS=false
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

## Шаг 4: Установка зависимостей

### Установка пакетов
```bash
# Очистка кэша npm (рекомендуется)
npm cache clean --force

# Установка зависимостей
npm install

# Проверка на уязвимости
npm audit --audit-level moderate

# Исправление найденных уязвимостей (если необходимо)
npm audit fix
```

### Альтернативный способ (если есть проблемы):
```bash
# Удаление node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Переустановка
npm install
```

## Шаг 5: Настройка конфигурации

### Проверка конфигурации TypeScript
Убедитесь, что файл `tsconfig.json` содержит правильные настройки:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["vite/client", "node"],
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/stores/*": ["src/stores/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/styles/*": ["src/styles/*"]
    }
  }
}
```

### Настройка Tailwind CSS
Проверьте содержимое файла `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Шаг 6: Запуск в режиме разработки

### Локальный запуск
```bash
# Запуск сервера разработки
npm run dev

# Альтернативная команда
npm start
```

После запуска приложение будет доступно по адресу: `http://localhost:3000`

### Запуск с доступом из сети
```bash
# Запуск с привязкой ко всем интерфейсам
npm run dev -- --host 0.0.0.0 --port 3000
```

Приложение будет доступно по IP-адресу вашего компьютера в локальной сети.

## Шаг 7: Сборка для демонстрации

### Сборка демо-версии
```bash
# Сборка в демо-режиме
npm run build:demo

# Альтернативно, обычная сборка
npm run build
```

### Предварительный просмотр сборки
```bash
# Запуск preview сервера
npm run preview
```

Приложение будет доступно по адресу: `http://localhost:3001`

## Шаг 8: Развертывание

### Вариант 1: Статический хостинг (рекомендуется для демо)

#### Развертывание на Nginx:
```bash
# Скопировать собранные файлы
sudo cp -r dist/* /var/www/html/ip-roast/

# Настройка Nginx
sudo nano /etc/nginx/sites-available/ip-roast
```

Конфигурация Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/ip-roast;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Развертывание на Apache:
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html/ip-roast
    
    <Directory /var/www/html/ip-roast>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Для работы React Router
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.html [QSA,L]
</VirtualHost>
```

### Вариант 2: Docker-контейнер

#### Создание Dockerfile:
```dockerfile
# Многоэтапная сборка
FROM node:18-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build:demo

# Производственный образ
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=builder /app/dist /usr/share/nginx/html

# Копирование конфигурации Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Открытие порта
EXPOSE 80

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Создание docker-compose.yml:
```yaml
version: '3.8'

services:
  ip-roast-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - ip-roast-network

networks:
  ip-roast-network:
    driver: bridge
```

#### Запуск через Docker:
```bash
# Сборка образа
docker build -t ip-roast-frontend .

# Запуск контейнера
docker run -d -p 3000:80 --name ip-roast-frontend ip-roast-frontend

# Или через docker-compose
docker-compose up -d
```

## Шаг 9: Интеграция с основным проектом

### Настройка API подключения

#### Обновление переменных окружения:
```bash
# В .env.local или .env.production
VITE_API_URL=http://your-backend-server:5000
VITE_WS_URL=ws://your-backend-server:5000
```

#### Проверка CORS настроек на бэкенде:
Убедитесь, что ваш backend сервер поддерживает CORS для фронтенд домена:

```javascript
// Пример для Express.js сервера
app.use(cors({
  origin: ['http://localhost:3000', 'http://your-frontend-domain.com'],
  credentials: true
}));
```

### Настройка WebSocket соединения

#### Проверка WebSocket подключения:
```javascript
// В браузере откройте консоль разработчика и выполните:
const socket = io('ws://your-backend-server:5000');
socket.on('connect', () => console.log('Connected to backend'));
```

## Шаг 10: Тестирование и верификация

### Проверка функциональности

#### Основные страницы:
- `http://localhost:3000/` - Главная страница
- `http://localhost:3000/scanner` - Страница сканирования
- `http://localhost:3000/recon` - Страница разведки
- `http://localhost:3000/reports` - Страница отчетов
- `http://localhost:3000/settings` - Настройки

#### Тестирование в браузере:
```bash
# Запуск тестов
npm run test

# Запуск UI тестов
npm run test:ui

# Покрытие кода
npm run test:coverage

# E2E тесты
npm run test:e2e
```

### Проверка производительности
```bash
# Анализ размера бандла
npm run analyze

# Проверка типов
npm run type-check

# Линтинг кода
npm run lint
```

## Шаг 11: Мониторинг и отладка

### Логирование
Приложение выводит подробные логи в консоль браузера в режиме разработки. Основные события:

- Инициализация приложения
- Подключение к WebSocket
- API запросы и ответы
- Ошибки компонентов

### Отладка WebSocket соединений
```javascript
// В консоли браузера
window.__IP_ROAST_DEBUG__ = {
  config: true,
  websocket: true,
  api: true
};
```

### Горячие клавиши
- `Ctrl/Cmd + K` - Фокус на поле ввода цели
- `Ctrl/Cmd + Enter` - Запуск сканирования
- `Escape` - Остановка сканирования
- `Ctrl/Cmd + Shift + D` - Переключение темы

## Шаг 12: Возможные проблемы и их решение

### Проблема: Не устанавливаются зависимости
```bash
# Решение:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Проблема: Ошибки TypeScript
```bash
# Решение:
npm run type-check
# Исправьте найденные ошибки типов
```

### Проблема: Не работает WebSocket
1. Проверьте, что backend сервер запущен
2. Убедитесь в правильности VITE_WS_URL
3. Проверьте CORS настройки на backend
4. Убедитесь, что порты не заблокированы файрволом

### Проблема: Стили не применяются
```bash
# Пересоберите CSS
npm run build
# Проверьте настройки Tailwind CSS
```

### Проблема: Медленная работа в режиме разработки
```bash
# Решение:
# Закройте ненужные вкладки браузера
# Увеличьте RAM
# Используйте SSD диск
```

## Шаг 13: Обновление и поддержка

### Обновление зависимостей
```bash
# Проверка устаревших пакетов
npm outdated

# Обновление пакетов
npm update

# Проверка безопасности
npm audit
npm audit fix
```

### Резервное копирование
```bash
# Создание архива проекта
tar -czf ip-roast-frontend-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  .
```

## Заключение

После выполнения всех шагов у вас будет полностью функциональная демоверсия фронтенда IP Roast, готовая для интеграции с основным проектом. Приложение поддерживает:

- Современный React 18 с TypeScript
- Адаптивный дизайн с темной/светлой темами
- WebSocket соединения в реальном времени
- Интерактивные графики и диаграммы
- Экспорт отчетов в различные форматы
- PWA функциональность

Для получения дополнительной помощи обратитесь к команде разработки IP Roast или изучите документацию в папке `docs/`.