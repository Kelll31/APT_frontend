#!/bin/bash

# IP Roast Frontend - Автоматический скрипт исправления v3.0
# Автоматизированное исправление распространенных проблем разработки
# Поддерживает React + TypeScript + Vite + ESLint + Prettier

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
PROJECT_NAME="IP Roast Frontend"
BACKUP_DIR=".fix-backup-$(date +%Y%m%d_%H%M%S)"
LOG_FILE="fix-$(date +%Y%m%d_%H%M%S).log"

# Флаги
VERBOSE=false
DRY_RUN=false
SKIP_BACKUP=false
AUTO_YES=false

# Логирование
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1" | tee -a "$LOG_FILE"
}

log_debug() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${PURPLE}[DEBUG]${NC} $1" | tee -a "$LOG_FILE"
    fi
}

# Парсинг аргументов
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --verbose|-v)
                VERBOSE=true
                shift
            ;;
            --dry-run|-n)
                DRY_RUN=true
                shift
            ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
            ;;
            --yes|-y)
                AUTO_YES=true
                shift
            ;;
            --help|-h)
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
    cat << EOF
Использование: $0 [OPTIONS]

Автоматический скрипт исправления для IP Roast Frontend

Опции:
  -v, --verbose         Подробный вывод
  -n, --dry-run        Показать что будет сделано без выполнения
  -y, --yes            Автоматически отвечать "да" на все вопросы
  --skip-backup        Пропустить создание резервной копии
  -h, --help           Показать эту справку

Примеры:
  $0                   # Обычное исправление
  $0 --verbose         # С подробным выводом
  $0 --dry-run         # Посмотреть что будет сделано
  $0 --yes --verbose   # Автоматическое исправление с подробным выводом

EOF
}

# Выполнение команды с проверкой dry-run
execute_command() {
    local cmd="$1"
    local description="$2"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Будет выполнено: $cmd"
        log_info "[DRY-RUN] Описание: $description"
        return 0
    fi
    
    log_debug "Выполняется: $cmd"
    if eval "$cmd" >> "$LOG_FILE" 2>&1; then
        log_success "$description"
        return 0
    else
        log_error "Не удалось: $description"
        log_error "Команда: $cmd"
        return 1
    fi
}

# Проверка требований
check_requirements() {
    log_step "Проверка системных требований..."
    
    local required_tools=("node" "npm" "npx")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        else
            local version
            case $tool in
                "node")
                    version=$(node --version)
                    log_debug "Node.js: $version"
                ;;
                "npm")
                    version=$(npm --version)
                    log_debug "npm: $version"
                ;;
                "npx")
                    log_debug "npx: доступен"
                ;;
            esac
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Отсутствуют требуемые инструменты: ${missing_tools[*]}"
        exit 1
    fi
    
    log_success "Все требуемые инструменты доступны"
}

# Проверка структуры проекта
check_project_structure() {
    log_step "Проверка структуры проекта..."
    
    local required_files=("package.json" "src" "tsconfig.json")
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -e "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        log_error "Отсутствуют обязательные файлы проекта: ${missing_files[*]}"
        log_error "Убедитесь, что скрипт запускается из корневой директории проекта"
        exit 1
    fi
    
    log_success "Структура проекта корректна"
}

# Создание резервной копии
create_backup() {
    if [ "$SKIP_BACKUP" = true ]; then
        log_warning "Создание резервной копии пропущено"
        return 0
    fi
    
    log_step "Создание резервной копии..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Будет создана резервная копия в: $BACKUP_DIR"
        return 0
    fi
    
    mkdir -p "$BACKUP_DIR"
    
    # Копируем важные файлы
    local backup_items=(
        "package.json"
        "package-lock.json"
        "tsconfig.json"
        "vite.config.ts"
        ".eslintrc.json"
        ".prettierrc"
        "src"
    )
    
    for item in "${backup_items[@]}"; do
        if [ -e "$item" ]; then
            cp -r "$item" "$BACKUP_DIR/" 2>/dev/null || true
            log_debug "Создана резервная копия: $item"
        fi
    done
    
    log_success "Резервная копия создана: $BACKUP_DIR"
}

# Очистка кэшей и временных файлов
clean_caches() {
    log_step "Очистка кэшей и временных файлов..."
    
    local cache_dirs=(
        "node_modules/.cache"
        "node_modules/.vite"
        ".next"
        ".nuxt"
        "dist"
        "build"
        ".eslintcache"
        ".tsbuildinfo"
    )
    
    for dir in "${cache_dirs[@]}"; do
        if [ -d "$dir" ]; then
            execute_command "rm -rf '$dir'" "Удален кэш: $dir"
        fi
    done
    
    # Очистка npm кэша
    execute_command "npm cache clean --force" "Очищен npm кэш"
    
    log_success "Кэши очищены"
}

# Исправление package.json
fix_package_json() {
    log_step "Проверка и исправление package.json..."
    
    if [ ! -f "package.json" ]; then
        log_error "package.json не найден"
        return 1
    fi
    
    # Проверяем валидность JSON без внешних зависимостей
    if ! node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        log_error "package.json содержит невалидный JSON"
        if [ "$AUTO_YES" = true ] || confirm_action "Попытаться исправить package.json?"; then
            # Используем встроенные инструменты вместо jsonlint
            execute_command "npx prettier --parser json --write package.json" "Форматирование package.json"
        fi
    else
        log_success "package.json валиден"
    fi
    
    # Проверяем наличие необходимых скриптов
    local required_scripts=("dev" "build" "lint" "type-check")
    for script in "${required_scripts[@]}"; do
        if ! grep -q "\"$script\":" package.json; then
            log_warning "Отсутствует скрипт: $script"
        fi
    done
    
    log_success "package.json проверен"
}

# Исправление зависимостей
fix_dependencies() {
    log_step "Проверка и исправление зависимостей..."
    
    # Удаляем node_modules если есть проблемы
    if [ -d "node_modules" ]; then
        execute_command "rm -rf node_modules" "Удаление node_modules"
    fi
    
    # Удаляем lock файлы при конфликтах
    if [ -f "package-lock.json" ]; then
        execute_command "rm -f package-lock.json" "Удаление package-lock.json"
    fi
    
    # Установка зависимостей
    execute_command "npm install" "Установка зависимостей"
    
    # Проверка на уязвимости
    if npm audit --audit-level moderate &>/dev/null; then
        log_success "Уязвимости не обнаружены"
    else
        log_warning "Обнаружены уязвимости в зависимостях"
        if [ "$AUTO_YES" = true ] || confirm_action "Попытаться исправить уязвимости?"; then
            execute_command "npm audit fix" "Исправление уязвимостей"
        fi
    fi
    
    log_success "Зависимости проверены"
}

# Исправление TypeScript проблем
fix_typescript() {
    log_step "Исправление TypeScript проблем..."
    
    # Проверка tsconfig.json
    if [ -f "tsconfig.json" ]; then
        execute_command "npx -q tsc --noEmit --skipLibCheck" "Проверка TypeScript" || {
            log_warning "Обнаружены ошибки TypeScript"
            
            # Попытка исправления распространенных проблем
            if [ "$AUTO_YES" = true ] || confirm_action "Попытаться исправить TypeScript проблемы?"; then
                # Обновление @types пакетов
                execute_command "npm update @types/node @types/react @types/react-dom" "Обновление типов"
                
                # Повторная проверка
                execute_command "npx -q tsc --noEmit --skipLibCheck" "Повторная проверка TypeScript"
            fi
        }
    else
        log_warning "tsconfig.json не найден"
    fi
    
    log_success "TypeScript проверен"
}

# Исправление ESLint проблем
fix_eslint() {
    log_step "Исправление ESLint проблем..."
    
    # Проверяем наличие ESLint конфигурации
    local eslint_configs=(".eslintrc.json" ".eslintrc.js" ".eslintrc.yml" "eslint.config.js")
    local config_found=false
    
    for config in "${eslint_configs[@]}"; do
        if [ -f "$config" ]; then
            config_found=true
            log_debug "Найден ESLint конфиг: $config"
            break
        fi
    done
    
    if [ "$config_found" = false ]; then
        log_warning "ESLint конфигурация не найдена"
        if [ "$AUTO_YES" = true ] || confirm_action "Создать базовую ESLint конфигурацию?"; then
            create_eslint_config
        fi
        return 0
    fi
    
    # Проверка и исправление
    if npx eslint src --ext .ts,.tsx,.js,.jsx &>/dev/null; then
        log_success "ESLint проблемы не найдены"
    else
        log_warning "Обнаружены ESLint проблемы"
        if [ "$AUTO_YES" = true ] || confirm_action "Исправить ESLint проблемы автоматически?"; then
            execute_command "npx eslint src --ext .ts,.tsx,.js,.jsx --fix" "Автоисправление ESLint"
        fi
    fi
    
    log_success "ESLint проверен"
}

# Исправление Prettier
fix_prettier() {
    log_step "Форматирование кода с Prettier..."
    
    # Проверяем наличие Prettier конфигурации
    local prettier_configs=(".prettierrc" ".prettierrc.json" ".prettierrc.js" "prettier.config.js")
    local config_found=false
    
    for config in "${prettier_configs[@]}"; do
        if [ -f "$config" ]; then
            config_found=true
            break
        fi
    done
    
    if [ "$config_found" = false ]; then
        log_warning "Prettier конфигурация не найдена"
        if [ "$AUTO_YES" = true ] || confirm_action "Создать базовую Prettier конфигурацию?"; then
            create_prettier_config
        fi
    fi
    
    # Форматирование файлов
    execute_command "npx prettier --write 'src/**/*.{ts,tsx,js,jsx,json,css,scss,md}'" "Форматирование кода"
    
    log_success "Код отформатирован"
}

# Исправление импортов
fix_imports() {
    log_step "Исправление импортов..."
    
    # Организация импортов с помощью TypeScript
    if command -v npx &> /dev/null; then
        execute_command "npx organize-imports-cli 'src/**/*.ts' 'src/**/*.tsx'" "Организация импортов" || {
            log_debug "organize-imports-cli недоступен, пропускаем"
        }
    fi
    
    # Удаление неиспользуемых импортов
    execute_command "npx unimported" "Проверка неиспользуемых импортов" || {
        log_debug "unimported недоступен, пропускаем"
    }
    
    log_success "Импорты проверены"
}

# Исправление файловых проблем
fix_file_issues() {
    log_step "Исправление файловых проблем..."
    
    # Переименование .tsx файлов без JSX в .ts
    find src -name "*.tsx" -type f | while read -r file; do
        if ! grep -q "jsx\|JSX\|<.*>" "$file" 2>/dev/null; then
            local new_file="${file%.tsx}.ts"
            execute_command "mv '$file' '$new_file'" "Переименование $file -> $new_file"
        fi
    done
    
    # Исправление расширений в импортах
    find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from.*\.tsx\|import.*\.tsx" 2>/dev/null | while read -r file; do
        execute_command "sed -i 's/\.tsx\"/\"/g; s/\.tsx'\''/'\''/g' '$file'" "Исправление импортов в $file"
    done
    
    log_success "Файловые проблемы исправлены"
}

# Создание ESLint конфигурации
create_eslint_config() {
    log_info "Создание базовой ESLint конфигурации..."
    
    cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "env": {
    "browser": true,
    "es2020": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "ignorePatterns": ["dist", ".eslintrc.cjs"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["react-refresh"],
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ],
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
EOF
    
    log_success "ESLint конфигурация создана"
}

# Создание Prettier конфигурации
create_prettier_config() {
    log_info "Создание базовой Prettier конфигурации..."
    
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
EOF
    
    log_success "Prettier конфигурация создана"
}

# Подтверждение действия
confirm_action() {
    local question="$1"
    
    if [ "$AUTO_YES" = true ]; then
        return 0
    fi
    
    read -p "$question (y/n): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Финальная проверка
final_check() {
    log_step "Финальная проверка проекта..."
    
    local checks_passed=0
    local total_checks=4
    
    # TypeScript проверка
    if npx tsc --noEmit --skipLibCheck &>/dev/null; then
        log_success "✓ TypeScript: OK"
        ((checks_passed++))
    else
        log_error "✗ TypeScript: Ошибки остались"
    fi
    
    # ESLint проверка
    if npx eslint src --ext .ts,.tsx,.js,.jsx &>/dev/null; then
        log_success "✓ ESLint: OK"
        ((checks_passed++))
    else
        log_warning "✗ ESLint: Предупреждения остались"
    fi
    
    # Prettier проверка
    if npx prettier --check 'src/**/*.{ts,tsx,js,jsx}' &>/dev/null; then
        log_success "✓ Prettier: OK"
        ((checks_passed++))
    else
        log_warning "✗ Prettier: Файлы требуют форматирования"
    fi
    
    # Сборка проверка
    if npm run build &>/dev/null; then
        log_success "✓ Сборка: OK"
        ((checks_passed++))
    else
        log_error "✗ Сборка: Ошибки сборки"
    fi
    
    echo
    log_info "Проверок пройдено: $checks_passed/$total_checks"
    
    if [ $checks_passed -eq $total_checks ]; then
        log_success "🎉 Все проверки пройдены успешно!"
        elif [ $checks_passed -gt $((total_checks / 2)) ]; then
        log_warning "⚠️  Большинство проверок пройдено, но есть проблемы"
    else
        log_error "❌ Много проблем требует внимания"
    fi
}

# Восстановление из резервной копии
restore_backup() {
    if [ "$SKIP_BACKUP" = true ] || [ ! -d "$BACKUP_DIR" ]; then
        log_error "Резервная копия недоступна"
        return 1
    fi
    
    log_warning "Восстановление из резервной копии: $BACKUP_DIR"
    
    if confirm_action "Восстановить проект из резервной копии?"; then
        cp -r "$BACKUP_DIR"/* . 2>/dev/null || true
        log_success "Проект восстановлен из резервной копии"
    fi
}

# Обработка ошибок
error_handler() {
    local exit_code=$?
    log_error "Произошла критическая ошибка (код: $exit_code)"
    
    if [ "$DRY_RUN" = false ] && [ -d "$BACKUP_DIR" ]; then
        echo
        log_warning "Доступна резервная копия: $BACKUP_DIR"
        if confirm_action "Восстановить из резервной копии?"; then
            restore_backup
        fi
    fi
    
    exit $exit_code
}

# Очистка ресурсов
cleanup() {
    log_info "Очистка временных ресурсов..."
    
    # Удаляем старые резервные копии (старше 7 дней)
    find . -maxdepth 1 -name ".fix-backup-*" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    
    # Удаляем старые логи (старше 14 дней)
    find . -maxdepth 1 -name "fix-*.log" -type f -mtime +14 -delete 2>/dev/null || true
}

# Главная функция
main() {
    echo "=============================================="
    echo "  $PROJECT_NAME - Автоисправление v3.0"
    echo "=============================================="
    echo
    
    # Парсинг аргументов
    parse_arguments "$@"
    
    # Показываем режим работы
    if [ "$DRY_RUN" = true ]; then
        log_warning "РЕЖИМ СИМУЛЯЦИИ - изменения не будут применены"
    fi
    
    if [ "$VERBOSE" = true ]; then
        log_info "Подробный режим включен"
    fi
    
    echo
    
    # Основная последовательность исправлений
    check_requirements
    check_project_structure
    create_backup
    
    clean_caches
    fix_package_json
    fix_dependencies
    fix_file_issues
    fix_typescript
    fix_eslint
    fix_prettier
    fix_imports
    
    final_check
    cleanup
    
    echo
    if [ "$DRY_RUN" = false ]; then
        log_success "🚀 Автоисправление завершено!"
        log_info "Лог сохранен: $LOG_FILE"
        if [ -d "$BACKUP_DIR" ]; then
            log_info "Резервная копия: $BACKUP_DIR"
        fi
    else
        log_info "Симуляция завершена. Для применения изменений запустите без --dry-run"
    fi
}

# Установка обработчиков
trap error_handler ERR
trap cleanup EXIT

# Запуск если скрипт вызван напрямую
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
