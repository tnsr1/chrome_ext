document.getElementById('testBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            func: () => alert("Расширение работает!")
        });
    });
});
