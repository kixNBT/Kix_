// Inject the UI when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.startsWith("http")) return;
  
  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["style.css"]
  }).then(() => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  });
});

// Listen for messages from content.js or the iframe
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 1. PAGE EXECUTION (JavaScript Mode via Debugger)
  if (request.action === "execute_js") {
    const debuggee = { tabId: sender.tab.id };
    
    chrome.debugger.attach(debuggee, "1.3", () => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }

      chrome.debugger.sendCommand(debuggee, "Runtime.evaluate", {
        expression: request.code,
        returnByValue: true,
        awaitPromise: true
      }, (result) => {
        chrome.debugger.detach(debuggee);

        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else if (result.exceptionDetails) {
          sendResponse({ error: result.exceptionDetails.text });
        } else {
          sendResponse({ result: String(result.result.value) });
        }
      });
    });
    return true;
  }

  // 2. DEVTOOLS (Cookies)
  if (request.action === "get_cookies") {
    chrome.cookies.getAll({ url: sender.tab.url }, (cookies) => {
      sendResponse({ result: JSON.stringify(cookies, null, 2) });
    });
    return true;
  }
});
