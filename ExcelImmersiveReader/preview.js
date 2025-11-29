// Загрузка и отображение контента предпросмотра
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Запрашиваем данные у background script
    const response = await chrome.runtime.sendMessage({ 
      action: 'getPreviewData' 
    });

    if (response.success && response.data) {
      const content = response.data;
      displayContent(content);
    } else {
      showError('Контент не найден или произошла ошибка при загрузке');
    }
  } catch (error) {
    console.error('Error loading preview:', error);
    showError(`Ошибка загрузки: ${error.message}`);
  }
});

// Отображение контента
function displayContent(content) {
  document.getElementById('contentTitle').textContent = content.title;
  
  const contentBody = document.getElementById('contentBody');
  contentBody.innerHTML = `
    <div class="metadata">
      <div><strong>URL:</strong> <a href="${content.url}" target="_blank">${content.url}</a></div>
      ${content.byline ? `<div><strong>Автор:</strong> ${content.byline}</div>` : ''}
      ${content.excerpt ? `<div><strong>Описание:</strong> ${content.excerpt}</div>` : ''}
      <div><strong>Длина:</strong> ${content.length.toLocaleString()} символов</div>
    </div>
    <div class="article-content">${content.content}</div>
  `;
}

// Показать ошибку
function showError(message) {
  document.getElementById('contentTitle').textContent = 'Ошибка';
  document.getElementById('contentBody').innerHTML = `
    <div class="error-message">
      <p>${message}</p>
      <button onclick="window.close()">Закрыть</button>
    </div>
  `;
}

// Обработчики кнопок
document.getElementById('exportBtn').addEventListener('click', async () => {
  try {
    const response = await chrome.runtime.sendMessage({ 
      action: 'exportFromPreview' 
    });
    
    if (response.success) {
      showNotification('Экспорт завершен успешно');
    } else {
      showNotification('Ошибка при экспорте: ' + response.error, true);
    }
  } catch (error) {
    showNotification('Ошибка при экспорте: ' + error.message, true);
  }
});

document.getElementById('closeBtn').addEventListener('click', () => {
  window.close();
});

// Показать уведомление
function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${isError ? '#e74c3c' : '#27ae60'};
    color: white;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}