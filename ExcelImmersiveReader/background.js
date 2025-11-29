// Background script для обработки сообщений и управления состоянием
class BackgroundManager {
  constructor() {
    this.previewData = null;
    this.init();
  }

  init() {
    console.log('Excel Page Viewer background script initialized');
  }

  // Сохраняем данные для предпросмотра
  setPreviewData(data) {
    this.previewData = data;
  }

  // Получаем данные для предпросмотра
  getPreviewData() {
    return this.previewData;
  }

  // Обработка сообщений
  handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'openPreview':
          this.handleOpenPreview(request.data);
          sendResponse({ success: true });
          break;

        case 'getPreviewData':
          const data = this.getPreviewData();
          sendResponse({ success: true, data: data });
          break;

        case 'exportFromPreview':
          this.handleExportFromPreview();
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error in background script:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Открытие предпросмотра
  handleOpenPreview(contentData) {
    this.setPreviewData(contentData);
    
    // Создаем URL для предпросмотра с данными
    const previewUrl = chrome.runtime.getURL('preview.html');
    
    chrome.tabs.create({
      url: previewUrl,
      active: true
    }, (tab) => {
      console.log('Preview tab opened:', tab.id);
    });
  }

  // Экспорт из предпросмотра
  handleExportFromPreview() {
    const data = this.getPreviewData();
    if (!data) {
      console.error('No preview data available for export');
      return;
    }

    // Создаем CSV контент
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Скачиваем файл
    chrome.downloads.download({
      url: url,
      filename: `preview-export-${new Date().toISOString().split('T')[0]}.csv`,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
      } else {
        console.log('Download started:', downloadId);
      }
    });
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
}

// Инициализация менеджера
const backgroundManager = new BackgroundManager();

// Обработчик сообщений
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  return backgroundManager.handleMessage(request, sender, sendResponse);
});

// Обработчик установки расширения
chrome.runtime.onInstalled.addListener(() => {
  console.log('Excel Page Viewer extension installed');
});

// Очистка при запуске
chrome.runtime.onStartup.addListener(() => {
  console.log('Excel Page Viewer extension started');
});