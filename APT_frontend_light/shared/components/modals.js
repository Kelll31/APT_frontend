/**
 * IP Roast Enterprise 4.0 — Modal Dialogs
 * Управление модальными окнами
 * Версия: Enterprise 4.0
 */

export class Modal {
    /**
     * @param {string} id — уникальный идентификатор
     * @param {Object} [options]
     * @param {string} [options.title]
     * @param {string|HTMLElement} [options.content]
     * @param {boolean} [options.closable=true]
     */
    constructor(id, { title = '', content = '', closable = true } = {}) {
        this.id = id;
        this.closable = closable;
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'modal';
        this.backdrop.id = id;
        this.dialog = document.createElement('div');
        this.dialog.className = 'modal__dialog';
        this.backdrop.appendChild(this.dialog);

        // Header
        const header = document.createElement('div');
        header.className = 'modal__header';
        header.textContent = title;
        this.dialog.appendChild(header);

        if (closable) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal__close';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => this.close());
            this.dialog.appendChild(closeBtn);
        }

        // Body
        const body = document.createElement('div');
        body.className = 'modal__body';
        if (content instanceof HTMLElement) {
            body.appendChild(content);
        } else {
            body.innerHTML = content;
        }
        this.dialog.appendChild(body);

        // Footer slot
        this.footer = document.createElement('div');
        this.footer.className = 'modal__footer';
        this.dialog.appendChild(this.footer);

        document.body.appendChild(this.backdrop);
    }

    /**
     * Добавляет кнопку в footer
     * @param {string} text
     * @param {'primary'|'secondary'} variant
     * @param {Function} handler
     */
    addButton(text, variant = 'primary', handler) {
        const btn = document.createElement('button');
        btn.className = `btn btn--${variant}`;
        btn.textContent = text;
        btn.addEventListener('click', handler);
        this.footer.appendChild(btn);
    }

    open() {
        this.backdrop.classList.add('modal--open');
    }

    close() {
        this.backdrop.classList.remove('modal--open');
    }

    destroy() {
        this.backdrop.remove();
    }
}

export class ConfirmModal extends Modal {
    /**
     * @param {string} id
     * @param {string} message
     * @param {Function} onConfirm
     */
    constructor(id, message, onConfirm) {
        super(id, { title: 'Подтвердите действие', content: `<p>${message}</p>` });
        this.addButton('Отмена', 'secondary', () => this.close());
        this.addButton('OK', 'primary', () => {
            onConfirm();
            this.close();
        });
    }
}
