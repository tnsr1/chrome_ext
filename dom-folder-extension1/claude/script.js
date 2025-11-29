// Получаем элементы
const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');
const result = document.getElementById('result');

// Функция для показа результата
function showResult(message) {
  result.style.display = 'block';
  result.textContent = message;
}

// Обработчики кнопок
btn1.addEventListener('click', function() {
  // Здесь ваша функция 1
  console.log('Выполнена функция 1');
  showResult('✓ Функция 1 выполнена успешно!');
  
  // Пример: получить URL текущей вкладки
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const url = tabs[0].url;
    console.log('URL текущей страницы:', url);
  });
});

btn2.addEventListener('click', function() {
  // Здесь ваша функция 2
  console.log('Выполнена функция 2');
  showResult('✓ Функция 2 выполнена успешно!');
  
  // Пример: вставить скрипт на страницу
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: function() {
        alert('Привет от расширения!');
      }
    });
  });
});

btn3.addEventListener('click', function() {
  // Здесь ваша функция 3
  console.log('Выполнена функция 3');
  showResult('✓ Функция 3 выполнена успешно!');
  
  // Пример: открыть новую вкладку
  chrome.tabs.create({
    url: 'https://www.google.com'
  });
});