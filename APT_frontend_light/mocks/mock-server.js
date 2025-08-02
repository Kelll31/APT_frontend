/**
 * Mock Server для IP Roast Frontend
 * Перехватывает API запросы и возвращает данные из JSON файлов
 */

(function () {
    'use strict';

    // Проверяем, что мы в браузере и на localhost
    if (typeof window === 'undefined' ||
        (!window.location.hostname.includes('localhost') &&
            !window.location.hostname.includes('127.0.0.1'))) {
        return;
    }

    console.log('🔧 Mock Server инициализируется...');

    // Сохраняем оригинальный fetch
    const originalFetch = window.fetch;

    // Функция для загрузки JSON файлов
    async function loadMockData(url) {
        try {
            const response = await originalFetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки мок данных:', url, error);
            return null;
        }
    }

    // Мапинг API endpoints к JSON файлам
    const endpointMap = {
        '/api/analytics/dashboard': '/mocks/api/analytics/dashboard.json',
        '/api/analytics/activity': '/mocks/api/analytics/activity.json',
        '/api/analytics/threats': '/mocks/api/analytics/threats.json',
        '/api/analytics/topology': '/mocks/api/analytics/topology.json',
        '/api/devices': '/mocks/api/devices/index.json',
        '/api/scans': '/mocks/api/scans/index.json',
        '/api/vulnerabilities': '/mocks/api/vulnerabilities/index.json',
        '/api/system/status': '/mocks/api/system/status.json',
        '/api/system/settings': '/mocks/api/system/settings.json',
        '/api/reports': '/mocks/api/reports/index.json'
    };

    // Перехватчик fetch
    window.fetch = async function (input, init = {}) {
        const url = typeof input === 'string' ? input : input.url;
        const method = init.method || 'GET';

        console.log(`🌐 Запрос: ${method} ${url}`);

        // Проверяем, нужно ли обработать этот запрос
        if (url.startsWith('/api/')) {
            // Убираем query параметры для поиска в мапе
            const baseUrl = url.split('?')[0];
            const mockFile = endpointMap[baseUrl];

            if (mockFile) {
                console.log(`📄 Мок ответ из: ${mockFile}`);

                const mockData = await loadMockData(mockFile);
                if (mockData) {
                    // Имитируем задержку сети
                    await new Promise(resolve => setTimeout(resolve, 100));

                    return new Response(JSON.stringify(mockData), {
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
            }

            console.warn(`⚠️ Мок данные не найдены для: ${url}`);
        }

        // Для всех остальных запросов используем оригинальный fetch
        return originalFetch.call(this, input, init);
    };

    console.log('✅ Mock Server активен');
})();
