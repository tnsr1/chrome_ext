// Функция для показа результата
function showResult(message, isError = false) {
  const result = document.getElementById('result');
  result.textContent = message;
  result.style.display = 'block';
  result.style.backgroundColor = isError ? '#ffebee' : '#f0f0f0';
  result.style.color = isError ? '#c62828' : '#333';
  
  setTimeout(() => {
    result.style.display = 'none';
  }, 3000);
}

// Функция для отправки сообщения активной вкладке
async function sendMessageToActiveTab(action, data = {}) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showResult('Не удалось найти активную вкладку', true);
      return null;
    }
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: action,
      data: data
    });
    
    return response;
  } catch (error) {
    showResult('Ошибка: ' + error.message, true);
    return null;
  }
}

// Обработчики кнопок
document.getElementById('btn1').addEventListener('click', async () => {
  const response = await sendMessageToActiveTab('blockDynamicContent');
  if (response && response.success) {
    showResult('Динамическое содержимое заблокировано');
  }
});

document.getElementById('btn2').addEventListener('click', async () => {
  const response = await sendMessageToActiveTab('immersiveReading');
  if (response && response.success) {
    showResult('Режим иммерсивного чтения активирован');
  }
});

document.getElementById('btn3').addEventListener('click', async () => {
  const response = await sendMessageToActiveTab('flexGrid');
  if (response && response.success) {
    showResult('Режим FlexGrid активирован');
  }
});

document.getElementById('btnPreview').addEventListener('click', async () => {
  const response = await sendMessageToActiveTab('previewContent');
  if (response && response.success) {
    showResult('Предпросмотр открывается...');
  }
});

document.getElementById('btnExport').addEventListener('click', async () => {
  const response = await sendMessageToActiveTab('exportContent');
  if (response && response.success) {
    showResult('Экспорт завершен');
  }
});