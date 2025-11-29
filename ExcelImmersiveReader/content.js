// Content script для обработки страниц
class ContentProcessor {
  constructor() {
    this.originalObservers = [];
    this.originalTimers = [];
    this.isActive = false;
    this.shadowRoot = null;
    this.uiContainer = null;
  }

  // Мягкое обезвреживание динамического контента
  neutralizeDynamicContent() {
    // Сохраняем оригинальные функции
    this.originalObservers.push({
      MutationObserver: window.MutationObserver,
      WebKitMutationObserver: window.WebKitMutationObserver
    });

    // Блокируем MutationObserver
    window.MutationObserver = class MockMutationObserver {
      constructor() {}
      observe() {}
      disconnect() {}
      takeRecords() { return []; }
    };
    window.WebKitMutationObserver = window.MutationObserver;

    // Останавливаем таймеры
    const timerIds = [];
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;

    window.setTimeout = (callback, delay) => {
      const id = originalSetTimeout(callback, delay);
      timerIds.push({ type: 'timeout', id });
      return id;
    };

    window.setInterval = (callback, delay) => {
      const id = originalSetInterval(callback, delay);
      timerIds.push({ type: 'interval', id });
      return id;
    };

    this.originalTimers = timerIds;

    // Блокируем некоторые API
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      return originalRequestAnimationFrame(() => {
        try {
          callback(performance.now());
        } catch (e) {
          // Игнорируем ошибки в заблокированных колбэках
        }
      });
    };
  }

  // Восстановление оригинального поведения
  restoreDynamicContent() {
    // Восстанавливаем MutationObserver
    if (this.originalObservers.length > 0) {
      const original = this.originalObservers[0];
      window.MutationObserver = original.MutationObserver;
      window.WebKitMutationObserver = original.WebKitMutationObserver;
    }

    // Очищаем таймеры
    this.originalTimers.forEach(timer => {
      if (timer.type === 'interval') {
        clearInterval(timer.id);
      } else {
        clearTimeout(timer.id);
      }
    });

    this.originalObservers = [];
    this.originalTimers = [];
  }

  // Создание UI в Shadow DOM
  createUI() {
    if (this.uiContainer) return this.uiContainer;

    const container = document.createElement('div');
    container.id = 'excel-viewer-ui';
    
    // Создаем Shadow DOM для изоляции
    this.shadowRoot = container.attachShadow({ mode: 'open' });
    
    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
      .control-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: Arial, sans-serif;
      }
      .control-button {
        display: block;
        width: 100%;
        padding: 8px 12px;
        margin: 5px 0;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .control-button:hover {
        background: #45a049;
      }
      .control-button.close {
        background: #f44336;
      }
      .control-button.close:hover {
        background: #da190b;
      }
    `;
    
    this.shadowRoot.appendChild(style);
    
    // Добавляем панель управления
    const panel = document.createElement('div');
    panel.className = 'control-panel';
    panel.innerHTML = `
      <button class="control-button" id="closeReader">Закрыть режим</button>
      <button class="control-button" id="toggleDark">Темная тема</button>
    `;
    
    this.shadowRoot.appendChild(panel);
    document.body.appendChild(container);
    
    // Обработчики событий
    this.shadowRoot.getElementById('closeReader').addEventListener('click', () => {
      this.deactivate();
    });
    
    this.shadowRoot.getElementById('toggleDark').addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
    
    this.uiContainer = container;
    return container;
  }

  // Извлечение контента с помощью Readability
  extractContent() {
    try {
      // Используем Readability для извлечения чистого контента
      const documentClone = document.cloneNode(true);
      const reader = new Readability(documentClone);
      const article = reader.parse();
      
      return {
        title: article?.title || document.title,
        content: article?.content || document.body.innerHTML,
        textContent: article?.textContent || document.body.textContent,
        excerpt: article?.excerpt || '',
        byline: article?.byline || '',
        length: article?.length || 0,
        url: window.location.href
      };
    } catch (error) {
      console.error('Error extracting content:', error);
      // Fallback: возвращаем базовый контент
      return {
        title: document.title,
        content: document.body.innerHTML,
        textContent: document.body.textContent,
        excerpt: '',
        byline: '',
        length: document.body.textContent.length,
        url: window.location.href
      };
    }
  }

  // Активация режима иммерсивного чтения
  activateImmersiveReading() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.neutralizeDynamicContent();
    
    const content = this.extractContent();
    this.createUI();
    
    // Применяем стили для чтения
    const readingStyles = `
      <style>
        body.reading-mode {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          line-height: 1.6;
          font-size: 18px;
          font-family: 'Georgia', serif;
          color: #333;
          background: #f9f5e9;
        }
        body.reading-mode img {
          max-width: 100%;
          height: auto;
        }
        body.reading-mode .ad, 
        body.reading-mode .advertisement,
        body.reading-mode .social-share,
        body.reading-mode .comments {
          display: none !important;
        }
        body.dark-mode {
          background: #1a1a1a;
          color: #e0e0e0;
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', readingStyles);
    document.body.className = 'reading-mode';
    document.body.innerHTML = `
      <article>
        <h1>${content.title}</h1>
        ${content.byline ? `<p class="byline">${content.byline}</p>` : ''}
        ${content.excerpt ? `<p class="excerpt">${content.excerpt}</p>` : ''}
        <div class="content">${content.content}</div>
      </article>
    `;
  }

  // Активация режима FlexGrid
  activateFlexGrid() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.neutralizeDynamicContent();
    this.createUI();
    
    const flexGridStyles = `
      <style>
        body.flexgrid-mode {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          padding: 20px;
          background: #f0f0f0;
        }
        body.flexgrid-mode > * {
          flex: 1 1 300px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          min-height: 200px;
          overflow: auto;
        }
        body.flexgrid-mode.dark-mode {
          background: #2d2d2d;
        }
        body.flexgrid-mode.dark-mode > * {
          background: #3d3d3d;
          color: #e0e0e0;
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', flexGridStyles);
    document.body.className = 'flexgrid-mode';
  }

  // Блокировка активного содержимого
  blockDynamicContent() {
    this.neutralizeDynamicContent();
    this.createUI();
    this.showResult('Динамическое содержимое заблокировано');
  }

  // Предпросмотр контента
  previewContent() {
    const content = this.extractContent();
    
    // Отправляем контент в background script для открытия предпросмотра
    chrome.runtime.sendMessage({
      action: 'openPreview',
      data: content
    });
  }

  // Экспорт контента
  exportContent() {
    const content = this.extractContent();
    
    // Создаем CSV/Excel-совместимый контент
    const csvContent = this.convertToCSV(content);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Скачиваем файл
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showResult('Контент экспортирован в CSV');
  }

  // Конвертация в CSV
  convertToCSV(content) {
    const rows = [
      ['Title', content.title],
      ['URL', content.url],
      ['Byline', content.byline],
      ['Excerpt', content.excerpt],
      ['Length', content.length],
      ['Content', '']
    ];
    
    // Очищаем текст контента для CSV
    const cleanText = content.textContent
      .replace(/"/g, '""')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    rows.push(['Text Content', `"${cleanText}"`]);
    
    return rows.map(row => row.join(',')).join('\n');
  }

  // Деактивация всех режимов
  deactivate() {
    if (this.uiContainer) {
      this.uiContainer.remove();
      this.uiContainer = null;
    }
    
    this.restoreDynamicContent();
    document.body.className = '';
    
    // Перезагружаем страницу для восстановления оригинального состояния
    window.location.reload();
  }

  // Показать результат
  showResult(message) {
    console.log('Excel Page Viewer:', message);
  }
}

// Инициализация процессора
const processor = new ContentProcessor();

// Обработчик сообщений от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request.action) {
      case 'blockDynamicContent':
        processor.blockDynamicContent();
        sendResponse({ success: true });
        break;
        
      case 'immersiveReading':
        processor.activateImmersiveReading();
        sendResponse({ success: true });
        break;
        
      case 'flexGrid':
        processor.activateFlexGrid();
        sendResponse({ success: true });
        break;
        
      case 'previewContent':
        processor.previewContent();
        sendResponse({ success: true });
        break;
        
      case 'exportContent':
        processor.exportContent();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error processing message:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Сообщаем, что ответ будет асинхронным
});