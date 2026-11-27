chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.startsWith("http")) return;
  chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["style.css"] })
    .then(() => {
      chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    });
});

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

  // 2. CHROME API EXECUTION (Command Parser Mode)
  if (request.action === "execute_api") {
    const code = request.code.toLowerCase();
    
    if (code.includes("tabs")) {
      chrome.tabs.query({}, (tabs) => {
        sendResponse({ result: JSON.stringify(tabs.map(t => t.url || t.title), null, 2) });
      });
      return true;
    } 
    if (code.includes("cookies")) {
      chrome.cookies.getAll({ url: sender.tab.url }, (cookies) => {
        sendResponse({ result: JSON.stringify(cookies, null, 2) });
      });
      return true;
    }
    if (code.includes("history")) {
      chrome.history.search({ text: '', maxResults: 5 }, (history) => {
        sendResponse({ result: JSON.stringify(history.map(h => h.url), null, 2) });
      });
      return true;
    }
    sendResponse({ error: "API command not recognized. Try typing 'tabs', 'cookies', or 'history'." });
    return true;
  }

  // 3. DEVTOOLS - Get Cookies
  if (request.action === "get_cookies") {
    chrome.cookies.getAll({ url: sender.tab.url }, (cookies) => {
      sendResponse({ result: JSON.stringify(cookies, null, 2) });
    });
    return true;
  }
});
