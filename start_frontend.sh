#!/bin/bash

# IP Roast Frontend - Автоматический скрипт запуска
# Версия: 2.0
# Дата: 2025-07-17
# Улучшения: Очистка зависимостей, приоритет NVM, расширенная диагностика

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Константы
REQUIRED_NODE_VERSION="18.0.0"
REQUIRED_NPM_VERSION="9.0.0"
PROJECT_NAME="IP Roast Frontend"
PROJECT_VERSION="3.0.0"
NVM_VERSION="v0.39.3"

# Глобальные переменные
CLEAN_INSTALL=false
FORCE_REINSTALL=false
SKIP_SECURITY_CHECK=false
VERBOSE=false

# Логирование
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${PURPLE}[DEBUG]${NC} $1"
    fi
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Парсинг аргументов командной строки
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean)
                CLEAN_INSTALL=true
                shift
            ;;
            --force)
                FORCE_REINSTALL=true
                shift
            ;;
            --skip-security)
                SKIP_SECURITY_CHECK=true
                shift
            ;;
            --verbose)
                VERBOSE=true
                shift
            ;;
            --help)
                show_help
                exit 0
            ;;
            *)
                log_error "Неизвестный аргумент: $1"
                show_help
                exit 1
            ;;
        esac
    done
}

# Справка
show_help() {
    echo "Использование: $0 [OPTIONS]"
    echo
    echo "Опции:"
    echo "  --clean           Очистить существующие зависимости перед установкой"
    echo "  --force           Принудительная переустановка Node.js и npm"
    echo "  --skip-security   Пропустить проверку безопасности"
    echo "  --verbose         Подробный вывод"
    echo "  --help            Показать эту справку"
    echo
    echo "Примеры:"
    echo "  $0                 # Обычный запуск"
    echo "  $0 --clean         # Запуск с очисткой зависимостей"
    echo "  $0 --force --clean # Полная переустановка"
}

# Проверка операционной системы
check_os() {
    log_step "Проверка операционной системы..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        DISTRO=$(lsb_release -si 2>/dev/null || echo "Unknown")
        log_success "Обнаружена Linux система: $DISTRO"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        MACOS_VERSION=$(sw_vers -productVersion 2>/dev/null || echo "Unknown")
        log_success "Обнаружена macOS система: $MACOS_VERSION"
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
        log_success "Обнаружена Windows система"
    else
        log_error "Неподдерживаемая операционная система: $OSTYPE"
        exit 1
    fi
    
    log_debug "Операционная система: $OS"
}

# Проверка наличия базовых утилит
check_basic_tools() {
    log_step "Проверка базовых утилит..."
    
    local tools=("curl" "wget" "git" "tar" "gzip")
    local missing_tools=()
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        else
            log_debug "$tool найден: $(command -v "$tool")"
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_warning "Отсутствуют утилиты: ${missing_tools[*]}"
        install_basic_tools "${missing_tools[@]}"
    else
        log_success "Все базовые утилиты установлены"
    fi
}

# Установка базовых утилит
install_basic_tools() {
    local tools=("$@")
    log_step "Установка базовых утилит: ${tools[*]}"
    
    case $OS in
        "linux")
            if command -v apt-get &> /dev/null; then
                sudo apt-get update -qq
                for tool in "${tools[@]}"; do
                    sudo apt-get install -y "$tool"
                done
                elif command -v yum &> /dev/null; then
                for tool in "${tools[@]}"; do
                    sudo yum install -y "$tool"
                done
                elif command -v dnf &> /dev/null; then
                for tool in "${tools[@]}"; do
                    sudo dnf install -y "$tool"
                done
                elif command -v pacman &> /dev/null; then
                for tool in "${tools[@]}"; do
                    sudo pacman -S --noconfirm "$tool"
                done
            else
                log_error "Неподдерживаемый менеджер пакетов Linux"
                exit 1
            fi
        ;;
        "macos")
            if command -v brew &> /dev/null; then
                for tool in "${tools[@]}"; do
                    brew install "$tool" 2>/dev/null || true
                done
            else
                log_error "Homebrew не установлен. Установите Homebrew сначала."
                exit 1
            fi
        ;;
        "windows")
            log_error "Автоматическая установка утилит в Windows не поддерживается"
            log_info "Установите вручную: ${tools[*]}"
            exit 1
        ;;
    esac
    
    log_success "Базовые утилиты установлены"
}

# Очистка существующих зависимостей
clean_existing_dependencies() {
    log_step "Очистка существующих зависимостей..."
    
    # Список файлов и папок для удаления
    local cleanup_items=(
        "node_modules"
        "package-lock.json"
        "yarn.lock"
        "pnpm-lock.yaml"
        ".npm"
        ".cache"
        "dist"
        "build"
        ".vite"
        ".next"
        ".nuxt"
    )
    
    local removed_items=()
    
    for item in "${cleanup_items[@]}"; do
        if [ -e "$item" ]; then
            log_debug "Удаление: $item"
            rm -rf "$item"
            removed_items+=("$item")
        fi
    done
    
    # Очистка кэша npm
    if command -v npm &> /dev/null; then
        log_debug "Очистка кэша npm..."
        npm cache clean --force --silent 2>/dev/null || true
    fi
    
    # Очистка кэша yarn (если установлен)
    if command -v yarn &> /dev/null; then
        log_debug "Очистка кэша yarn..."
        yarn cache clean --silent 2>/dev/null || true
    fi
    
    # Очистка кэша pnpm (если установлен)
    if command -v pnpm &> /dev/null; then
        log_debug "Очистка кэша pnpm..."
        pnpm store prune --silent 2>/dev/null || true
    fi
    
    # Очистка временных файлов
    log_debug "Очистка временных файлов..."
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log" -delete 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
    
    if [ ${#removed_items[@]} -gt 0 ]; then
        log_success "Удалены элементы: ${removed_items[*]}"
    else
        log_success "Нет элементов для удаления"
    fi
}

# Проверка и установка NVM (приоритетная функция)
setup_nvm() {
    log_step "Настройка NVM (приоритет)..."
    
    # Проверка существующей установки NVM
    export NVM_DIR="$HOME/.nvm"
    
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        log_debug "Найдена существующая установка NVM"
        source "$NVM_DIR/nvm.sh"
        
        if command -v nvm &> /dev/null; then
            local current_nvm_version=$(nvm --version 2>/dev/null || echo "unknown")
            log_success "NVM уже установлен: $current_nvm_version"
            
            # Проверка актуальности версии
            if [ "$current_nvm_version" != "$NVM_VERSION" ] && [ "$FORCE_REINSTALL" = true ]; then
                log_warning "Обновление NVM до версии $NVM_VERSION"
                install_nvm
            fi
        else
            log_warning "NVM найден, но не загружен корректно"
            install_nvm
        fi
    else
        log_warning "NVM не найден, устанавливаем..."
        install_nvm
    fi
    
    # Загрузка NVM в текущую сессию
    load_nvm
}

# Установка NVM
install_nvm() {
    log_step "Установка NVM $NVM_VERSION..."
    
    # Создание директории NVM
    mkdir -p "$NVM_DIR"
    
    # Скачивание и установка NVM
    if command -v curl &> /dev/null; then
        curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
        elif command -v wget &> /dev/null; then
        wget -qO- "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
    else
        log_error "Не найден curl или wget для загрузки NVM"
        exit 1
    fi
    
    # Проверка установки
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        log_success "NVM установлен успешно"
    else
        log_error "Не удалось установить NVM"
        exit 1
    fi
}

# Загрузка NVM в текущую сессию
load_nvm() {
    log_step "Загрузка NVM..."
    
    export NVM_DIR="$HOME/.nvm"
    
    # Загрузка NVM скрипта
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        source "$NVM_DIR/nvm.sh"
        log_debug "Загружен nvm.sh"
    else
        log_error "Не найден файл nvm.sh"
        exit 1
    fi
    
    # Загрузка bash completion
    if [ -s "$NVM_DIR/bash_completion" ]; then
        source "$NVM_DIR/bash_completion"
        log_debug "Загружен bash_completion"
    fi
    
    # Проверка доступности команды nvm
    if command -v nvm &> /dev/null; then
        local nvm_version=$(nvm --version)
        log_success "NVM загружен успешно: $nvm_version"
        
        # Показать доступные версии Node.js
        log_debug "Установленные версии Node.js:"
        nvm list --no-colors 2>/dev/null || true
    else
        log_error "Не удалось загрузить NVM"
        exit 1
    fi
}

# Проверка и установка Node.js через NVM
setup_nodejs() {
    log_step "Настройка Node.js через NVM..."
    
    # Проверка текущей версии Node.js
    if command -v node &> /dev/null; then
        local current_version=$(node --version | sed 's/v//')
        log_info "Текущая версия Node.js: $current_version"
        
        if version_compare "$current_version" "$REQUIRED_NODE_VERSION"; then
            if [ "$FORCE_REINSTALL" = false ]; then
                log_success "Версия Node.js подходит: $current_version"
                return 0
            else
                log_warning "Принудительная переустановка Node.js"
            fi
        else
            log_warning "Требуется Node.js >= $REQUIRED_NODE_VERSION"
        fi
    else
        log_warning "Node.js не найден"
    fi
    
    # Установка Node.js через NVM
    install_nodejs_nvm
}

# Установка Node.js через NVM
install_nodejs_nvm() {
    log_step "Установка Node.js через NVM..."
    
    # Получение последней LTS версии
    log_debug "Получение информации о LTS версии..."
    local lts_version=$(nvm version-remote --lts 2>/dev/null || echo "lts/*")
    
    log_info "Установка Node.js LTS: $lts_version"
    
    # Установка LTS версии
    if nvm install --lts; then
        log_success "Node.js LTS установлен успешно"
    else
        log_error "Не удалось установить Node.js LTS"
        exit 1
    fi
    
    # Использование установленной версии
    nvm use --lts
    nvm alias default lts/*
    
    # Проверка установки
    if command -v node &> /dev/null; then
        local installed_version=$(node --version)
        local npm_version=$(npm --version)
        log_success "Node.js: $installed_version"
        log_success "npm: $npm_version"
        
        # Обновление npm до последней версии
        log_debug "Обновление npm..."
        npm install -g npm@latest --silent
        
        local new_npm_version=$(npm --version)
        log_success "npm обновлен до: $new_npm_version"
    else
        log_error "Node.js не найден после установки"
        exit 1
    fi
}

# Проверка версии npm
check_npm_version() {
    log_step "Проверка версии npm..."
    
    if command -v npm &> /dev/null; then
        local current_version=$(npm --version)
        log_info "Текущая версия npm: $current_version"
        
        if version_compare "$current_version" "$REQUIRED_NPM_VERSION"; then
            log_success "Версия npm подходит: $current_version"
            return 0
        else
            log_warning "Требуется npm >= $REQUIRED_NPM_VERSION"
            return 1
        fi
    else
        log_warning "npm не найден"
        return 1
    fi
}

# Обновление npm
update_npm() {
    log_step "Обновление npm..."
    
    npm install -g npm@latest
    
    local new_version=$(npm --version)
    log_success "npm обновлен до версии: $new_version"
}

# Сравнение версий
version_compare() {
    local version1=$1
    local version2=$2
    
    # Удаляем символы v, если есть
    version1=$(echo "$version1" | sed 's/^v//')
    version2=$(echo "$version2" | sed 's/^v//')
    
    # Конвертируем версии в числа для сравнения
    local v1=(${version1//./ })
    local v2=(${version2//./ })
    
    # Дополняем нулями до 3 компонентов
    while [ ${#v1[@]} -lt 3 ]; do v1+=(0); done
    while [ ${#v2[@]} -lt 3 ]; do v2+=(0); done
    
    # Сравниваем каждый компонент
    for i in {0..2}; do
        if [ ${v1[$i]} -gt ${v2[$i]} ]; then
            return 0
            elif [ ${v1[$i]} -lt ${v2[$i]} ]; then
            return 1
        fi
    done
    
    return 0  # Версии равны
}

# Проверка структуры проекта
check_project_structure() {
    log_step "Проверка структуры проекта..."
    
    local required_files=("package.json" "src" "tsconfig.json")
    local optional_files=("vite.config.ts" "vite.config.js" "index.html")
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -e "$file" ]; then
            missing_files+=("$file")
        else
            log_debug "Найден обязательный файл: $file"
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        log_error "Отсутствуют обязательные файлы: ${missing_files[*]}"
        log_error "Убедитесь, что скрипт запускается из корневой директории проекта"
        exit 1
    fi
    
    # Проверка опциональных файлов
    for file in "${optional_files[@]}"; do
        if [ -e "$file" ]; then
            log_debug "Найден опциональный файл: $file"
        fi
    done
    
    log_success "Структура проекта корректна"
}

# Проверка package.json
validate_package_json() {
    log_step "Проверка package.json..."
    
    if [ ! -f "package.json" ]; then
        log_error "package.json не найден"
        exit 1
    fi
    
    # Проверка валидности JSON
    if ! python3 -m json.tool package.json > /dev/null 2>&1; then
        if ! node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
            log_error "package.json содержит невалидный JSON"
            exit 1
        fi
    fi
    
    # Проверка наличия основных полей
    local required_fields=("name" "version" "scripts")
    for field in "${required_fields[@]}"; do
        if ! grep -q "\"$field\"" package.json; then
            log_warning "Отсутствует поле '$field' в package.json"
        fi
    done
    
    log_success "package.json корректный"
}

# Проверка переменных окружения
check_environment_variables() {
    log_step "Проверка переменных окружения..."
    
    local env_files=(".env.local" ".env" ".env.development")
    local env_file_found=false
    
    for env_file in "${env_files[@]}"; do
        if [ -f "$env_file" ]; then
            log_success "Найден файл окружения: $env_file"
            env_file_found=true
            
            # Проверка основных переменных
            if grep -q "VITE_" "$env_file"; then
                log_debug "Найдены переменные Vite в $env_file"
            fi
        fi
    done
    
    if [ "$env_file_found" = false ]; then
        log_warning "Файлы окружения не найдены"
        log_info "Будут использованы настройки по умолчанию"
    fi
    
    # Проверка системных переменных
    if [ -n "$NODE_ENV" ]; then
        log_debug "NODE_ENV: $NODE_ENV"
    fi
    
    if [ -n "$PORT" ]; then
        log_debug "PORT: $PORT"
    fi
}

# Установка зависимостей проекта
install_dependencies() {
    log_step "Установка зависимостей проекта..."
    
    # Проверка наличия package.json
    if [ ! -f "package.json" ]; then
        log_error "package.json не найден"
        exit 1
    fi
    
    # Выбор менеджера пакетов
    local package_manager="npm"
    if [ -f "yarn.lock" ]; then
        package_manager="yarn"
        elif [ -f "pnpm-lock.yaml" ]; then
        package_manager="pnpm"
    fi
    
    log_info "Используется менеджер пакетов: $package_manager"
    
    # Установка зависимостей
    case $package_manager in
        "npm")
            if [ "$CLEAN_INSTALL" = true ]; then
                log_debug "Выполняется npm ci..."
                npm ci --progress=false --no-audit
            else
                log_debug "Выполняется npm install..."
                npm install --progress=false --no-audit
            fi
        ;;
        "yarn")
            if command -v yarn &> /dev/null; then
                yarn install --silent
            else
                log_warning "Yarn не найден, используется npm"
                npm install --progress=false --no-audit
            fi
        ;;
        "pnpm")
            if command -v pnpm &> /dev/null; then
                pnpm install --silent
            else
                log_warning "pnpm не найден, используется npm"
                npm install --progress=false --no-audit
            fi
        ;;
    esac
    
    # Проверка установки
    if [ -d "node_modules" ]; then
        local modules_count=$(find node_modules -maxdepth 1 -type d | wc -l)
        log_success "Зависимости установлены: $modules_count модулей"
    else
        log_error "Не удалось установить зависимости"
        exit 1
    fi
}

# Проверка безопасности
check_security() {
    if [ "$SKIP_SECURITY_CHECK" = true ]; then
        log_warning "Проверка безопасности пропущена"
        return 0
    fi
    
    log_step "Проверка безопасности зависимостей..."
    
    # Аудит безопасности
    local audit_result
    if ! audit_result=$(npm audit --audit-level moderate 2>&1); then
        local audit_exit_code=$?
        log_warning "Найдены проблемы безопасности"
        
        if [ $audit_exit_code -eq 1 ]; then
            echo "$audit_result"
            echo
            read -p "Попытаться исправить автоматически? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log_info "Исправление проблем безопасности..."
                npm audit fix --force
                log_info "Попытка исправления завершена"
            fi
        fi
    else
        log_success "Проблемы безопасности не найдены"
    fi
}

# Диагностика окружения
diagnostic_info() {
    log_step "Диагностическая информация..."
    
    echo "=========================================="
    echo "  Информация о системе"
    echo "=========================================="
    echo "ОС: $OS"
    echo "Архитектура: $(uname -m)"
    echo "Процессор: $(uname -p 2>/dev/null || echo "Unknown")"
    echo "Память: $(free -h 2>/dev/null | grep Mem | awk '{print $2}' || echo "Unknown")"
    echo "Диск: $(df -h . 2>/dev/null | tail -1 | awk '{print $4}' || echo "Unknown") свободно"
    echo
    
    echo "=========================================="
    echo "  Версии инструментов"
    echo "=========================================="
    echo "Node.js: $(node --version 2>/dev/null || echo "Не установлен")"
    echo "npm: $(npm --version 2>/dev/null || echo "Не установлен")"
    echo "NVM: $(nvm --version 2>/dev/null || echo "Не установлен")"
    echo "Git: $(git --version 2>/dev/null || echo "Не установлен")"
    echo "Curl: $(curl --version 2>/dev/null | head -1 || echo "Не установлен")"
    echo
    
    echo "=========================================="
    echo "  Информация о проекте"
    echo "=========================================="
    if [ -f "package.json" ]; then
        echo "Название: $(grep -o '"name"[^,]*' package.json | cut -d'"' -f4)"
        echo "Версия: $(grep -o '"version"[^,]*' package.json | cut -d'"' -f4)"
        echo "Описание: $(grep -o '"description"[^,]*' package.json | cut -d'"' -f4)"
    fi
    echo "Рабочая директория: $(pwd)"
    echo "Размер проекта: $(du -sh . 2>/dev/null | cut -f1)"
    echo "=========================================="
}

# Выбор режима запуска
select_run_mode() {
    log_step "Выбор режима запуска..."
    
    echo "Доступные режимы запуска:"
    echo "1) Разработка (npm run dev)"
    echo "2) Сборка демо (npm run build:demo)"
    echo "3) Предпросмотр (npm run preview)"
    echo "4) Сборка продакшена (npm run build)"
    echo "5) Тестирование (npm run test)"
    echo "6) Линтинг (npm run lint)"
    echo "7) Диагностика (показать информацию о системе)"
    echo "8) Выход"
    
    read -p "Введите номер (1-8): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            RUN_MODE="dev"
            RUN_COMMAND="npm run dev"
        ;;
        2)
            RUN_MODE="build:demo"
            RUN_COMMAND="npm run build:demo"
        ;;
        3)
            RUN_MODE="preview"
            RUN_COMMAND="npm run preview"
        ;;
        4)
            RUN_MODE="build"
            RUN_COMMAND="npm run build"
        ;;
        5)
            RUN_MODE="test"
            RUN_COMMAND="npm run test"
        ;;
        6)
            RUN_MODE="lint"
            RUN_COMMAND="npm run lint"
        ;;
        7)
            diagnostic_info
            exit 0
        ;;
        8)
            log_info "Выход из программы"
            exit 0
        ;;
        *)
            log_warning "Неверный выбор, используется режим разработки"
            RUN_MODE="dev"
            RUN_COMMAND="npm run dev"
        ;;
    esac
    
    log_success "Выбран режим: $RUN_MODE"
}

# Запуск приложения
run_application() {
    log_step "Запуск приложения..."
    
    # Показать информацию о проекте
    echo
    echo "==========================================="
    echo "  $PROJECT_NAME v$PROJECT_VERSION"
    echo "==========================================="
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "NVM: $(nvm --version)"
    echo "Режим: $RUN_MODE"
    echo "Команда: $RUN_COMMAND"
    echo "==========================================="
    echo
    
    # Специальная обработка для режима разработки
    if [ "$RUN_MODE" = "dev" ]; then
        log_info "Приложение будет доступно по адресу: http://localhost:3000"
        log_info "Для остановки нажмите Ctrl+C"
        echo
        
        # Проверка доступности порта
        if command -v lsof &> /dev/null; then
            if lsof -i :3000 &> /dev/null; then
                log_warning "Порт 3000 уже используется"
                read -p "Попытаться освободить порт? (y/n): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    pkill -f "node.*3000" 2>/dev/null || true
                    log_info "Попытка освобождения порта завершена"
                fi
            fi
        fi
    fi
    
    # Выполнение команды
    log_info "Выполнение: $RUN_COMMAND"
    eval "$RUN_COMMAND"
}

# Обработка сигналов
cleanup() {
    log_info "Получен сигнал завершения..."
    log_info "Очистка ресурсов..."
    
    # Завершение дочерних процессов
    pkill -P $$ 2>/dev/null || true
    
    log_info "Остановка приложения завершена"
    exit 0
}

# Обработка ошибок
error_handler() {
    local exit_code=$?
    log_error "Произошла ошибка (код: $exit_code)"
    log_error "Строка: $1"
    log_error "Команда: $2"
    
    # Показать стек вызовов
    if [ "$VERBOSE" = true ]; then
        log_debug "Стек вызовов:"
        local frame=0
        while caller $frame; do
            ((frame++))
        done
    fi
    
    cleanup
    exit $exit_code
}

# Установка обработчиков сигналов
trap cleanup SIGINT SIGTERM
trap 'error_handler $LINENO "$BASH_COMMAND"' ERR

# Главная функция
main() {
    echo "============================================="
    echo "  $PROJECT_NAME - Скрипт запуска v2.0"
    echo "============================================="
    echo
    
    # Парсинг аргументов
    parse_arguments "$@"
    
    # Показать используемые опции
    if [ "$VERBOSE" = true ]; then
        echo "Используемые опции:"
        echo "  Чистая установка: $CLEAN_INSTALL"
        echo "  Принудительная переустановка: $FORCE_REINSTALL"
        echo "  Пропуск проверки безопасности: $SKIP_SECURITY_CHECK"
        echo "  Подробный вывод: $VERBOSE"
        echo
    fi
    
    # Основная последовательность
    check_os
    check_basic_tools
    
    # Очистка зависимостей (если требуется)
    if [ "$CLEAN_INSTALL" = true ]; then
        clean_existing_dependencies
    fi
    
    # Настройка NVM (приоритет)
    setup_nvm
    
    # Настройка Node.js через NVM
    setup_nodejs
    
    # Проверка npm
    if ! check_npm_version; then
        update_npm
    fi
    
    # Проверки проекта
    check_project_structure
    validate_package_json
    check_environment_variables
    
    # Установка зависимостей
    install_dependencies
    
    # Проверка безопасности
    check_security
    
    # Выбор режима и запуск
    select_run_mode
    run_application
}

# Проверка прямого запуска
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
