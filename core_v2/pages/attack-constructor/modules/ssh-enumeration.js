export default class SSHEnumerationModule {
    constructor() {
        this.name = 'SSH Enumeration';
        this.category = 'enum';
        this.description = 'Модуль перечисления SSH-серверов';
    }

    execute(target) {
        if (this.constructor.safeMode) {
            return `Симуляция: Перечисление SSH на ${target}`;
        }
        return `Выполняется перечисление SSH на ${target}`;
    }
}