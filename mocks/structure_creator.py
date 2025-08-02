import os
import re


def create_structure_from_dict(base_path, structure):
    """
    Создает структуру файлов и папок из словаря.

    Args:
        base_path (str): Базовый путь для создания структуры
        structure (dict): Словарь со структурой (None для файлов, dict для папок)
    """
    for name, content in structure.items():
        path = os.path.join(base_path, name)

        if content is None:  # Это файл
            if os.path.exists(path):
                print("exist")
            else:
                # Создаем пустой файл
                with open(path, "w", encoding="utf-8") as f:
                    pass
                print(f"created file: {path}")
        else:  # Это папка
            if not os.path.exists(path):
                os.makedirs(path, exist_ok=True)
                print(f"created directory: {path}")
            else:
                print(f"directory exists: {path}")

            # Рекурсивно создаем содержимое папки
            create_structure_from_dict(path, content)


def parse_tree_structure(tree_text):
    """
    Парсит текстовое представление структуры дерева в словарь.

    Args:
        tree_text (str): Текстовое представление структуры

    Returns:
        dict: Словарь со структурой файлов и папок
    """
    lines = tree_text.strip().split("\n")
    structure = {}
    stack = [(0, structure)]  # (уровень, текущий словарь)

    for line in lines:
        if not line.strip():
            continue

        # Убираем символы дерева и определяем уровень вложенности
        clean_line = re.sub(r"^[│├└─\s]*", "", line)
        if not clean_line:
            continue

        # Подсчитываем уровень по количеству символов отступа/дерева
        original_length = len(line)
        stripped_length = len(line.lstrip("│├└─ \t"))
        level = (original_length - stripped_length) // 4

        # Убираем комментарии
        name = clean_line.split("#")[0].strip()
        if not name:
            continue

        if name.endswith("/"):
            # Это папка
            name = name.rstrip("/")
            folder_dict = {}

            # Находим правильный родительский уровень
            while len(stack) > level + 1:
                stack.pop()

            parent_dict = stack[-1][1]
            parent_dict[name] = folder_dict
            stack.append((level + 1, folder_dict))
        else:
            # Это файл
            while len(stack) > level + 1:
                stack.pop()

            parent_dict = stack[-1][1]
            parent_dict[name] = None

    return structure


def create_structure_from_text(base_path, tree_text):
    """
    Создает структуру файлов и папок из текстового представления дерева.

    Args:
        base_path (str): Базовый путь для создания структуры
        tree_text (str): Текстовое представление структуры
    """
    structure = parse_tree_structure(tree_text)

    # Создаем базовую папку если не существует
    if not os.path.exists(base_path):
        os.makedirs(base_path, exist_ok=True)
        print(f"created base directory: {base_path}")

    create_structure_from_dict(base_path, structure)


def create_structure_from_file(base_path="./project"):
    """
    Читает структуру из файла 'structure' в той же директории, что и скрипт.

    Args:
        base_path (str): Базовый путь для создания структуры (по умолчанию ./project)
    """
    # Получаем путь к директории, где лежит скрипт
    script_dir = os.path.dirname(os.path.realpath(__file__))
    structure_file = os.path.join(script_dir, "structure")

    try:
        with open(structure_file, "r", encoding="utf-8") as f:
            tree_text = f.read()

        print(f"Читаю структуру из файла: {structure_file}")
        create_structure_from_text(base_path, tree_text)
        print("Структура успешно создана!")

    except FileNotFoundError:
        print(f"Ошибка: Файл 'structure' не найден в директории скрипта!")
        print(f"Ожидаемый путь: {structure_file}")
    except Exception as e:
        print(f"Ошибка при чтении файла: {e}")


def main():
    """
    Главная функция - создает структуру из файла 'structure'
    """
    # Можете изменить путь назначения здесь
    project_path = "./my_project"

    # Читаем структуру из файла 'structure' в той же папке, что и скрипт
    create_structure_from_file(project_path)


if __name__ == "__main__":
    main()
