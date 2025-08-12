// Scanner page JavaScript
console.log('🔍 Scanner page loaded');

function initScanner() {
    console.log('🚀 Инициализация Scanner');
}

window.startScan = function() {
    const target = document.getElementById('target-input').value;
    const resultsEl = document.getElementById('scan-results');

    if (!target) {
        alert('Укажите цель сканирования');
        return;
    }

    resultsEl.innerHTML = '<p>🔍 Сканирование в процессе...</p>';

    // Симуляция сканирования
    setTimeout(() => {
        resultsEl.innerHTML = `
            <h4>Результаты для ${target}:</h4>
            <ul>
                <li>Порт 80 (HTTP) - Открыт</li>
                <li>Порт 443 (HTTPS) - Открыт</li>
                <li>Порт 22 (SSH) - Закрыт</li>
            </ul>
            <div class="status status--success">Сканирование завершено</div>
        `;
    }, 2000);
};

initScanner();