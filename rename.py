import os
import glob

def rename_ts_to_tsx(directory='.'):
    # Найти все .ts файлы рекурсивно
    ts_files = glob.glob(os.path.join(directory, '**/*.ts'), recursive=True)
    
    for file_path in ts_files:
        # Создать новое имя файла
        new_path = file_path[:-3] + '.tsx'
        
        # Переименовать файл
        os.rename(file_path, new_path)
        print(f'Переименован: {file_path} -> {new_path}')

# Запустить для текущей директории
rename_ts_to_tsx()
