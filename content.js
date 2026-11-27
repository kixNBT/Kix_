if (!document.getElementById("kix-executor")) {
  const ui = document.createElement("div");
  ui.id = "kix-executor";
  ui.className = "light-glass";

  // SHA-256 Hash of the target credential
  // 7852c7ed159667a5b9e26c042af96fca...ca2
  const targetHash = "a4a33c5d40371222d1a3b7f880c5c1d5b6e3e4f5d6a7b8c9d0e1f2a3b4c5d6e7"; // Placeholder (See below to generate your real hash)

  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  ui.innerHTML = `
    <div id="kix-header">
      <div class="kix-logo">Kix</div>
      <div class="kix-header-tabs">
        <span class="kix-htab active" data-target="home">Home</span>
        <span class="kix-htab" data-target="executor">Executor</span>
        <span class="kix-htab" data-target="devtools">DevTools</span>
      </div>
      <div class="kix-window-controls">
        <span id="kix-settings-btn">Settings</span>
        <span id="kix-close">X</span>
      </div>
    </div>
    
    <div id="kix-login-overlay">
      <h3>Authentication Required</h3>
      <textarea id="kix-hash-input" placeholder="Paste your hash here..." spellcheck="false"></textarea>
      <button id="kix-login-btn">Enter</button>
      <p id="kix-error-msg">Wrong Hash</p>
    </div>

    <div id="kix-main-app">
      <div id="kix-content-home" class="kix-tab-content active">
        <div class="kix-home-container">
          <h2>Welcome, Admin</h2>
          <p>Select an execution environment:</p>
          <div class="kix-lang-buttons">
            <button class="kix-lang-btn" id="select-page">
              <span class="icon" style="color: #f7df1e;">JS</span> JavaScript
            </button>
            <button class="kix-lang-btn" id="select-api">
              <span class="icon" style="color: #00ffcc;">API</span> Chrome API
            </button>
          </div>
        </div>
      </div>

      <div id="kix-content-executor" class="kix-tab-content">
        <div class="kix-toolbar">
          <span id="current-mode-display" style="font-size:12px; font-weight:600; color:#888;">Mode: JavaScript (Page)</span>
          <button class="kix-btn" id="kix-exec" style="margin-left:auto;">Execute</button>
          <button class="kix-btn" id="kix-clear">Clear</button>
        </div>
        <div class="kix-editor" style="flex: 2;">
          <textarea id="kix-code" spellcheck="false" placeholder="// Type code here..."></textarea>
        </div>
        <div class="kix-console" id="kix-console-output">
          <div style="color:#666;">Console output will appear here...</div>
        </div>
      </div>

      <div id="kix-content-devtools" class="kix-tab-content">
        <div class="kix-toolbar">
          <button class="kix-btn dev-btn" data-action="html">Page HTML</button>
          <button class="kix-btn dev-btn" data-action="cookies">Cookies</button>
          <button class="kix-btn dev-btn" data-action="network">Network</button>
        </div>
        <div class="kix-devtools-view">
          <pre id="kix-dev-output">Select an option above...</pre>
        </div>
      </div>

      <div id="kix-content-settings" class="kix-tab-content">
        <div class="kix-home-container">
          <h2>Settings</h2>
          <div class="kix-setting-row">
            <span>Dark Liquid Glass</span>
            <label class="kix-switch">
              <input type="checkbox" id="theme-toggle">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(ui);

  let execMode = "page";

  // Drag Logic
  const header = document.getElementById("kix-header");
  let isDragging = false, offsetX, offsetY;
  header.addEventListener("mousedown", (e) => {
    if (e.target.closest('.kix-window-controls') || e.target.closest('.kix-htab')) return;
    isDragging = true;
    offsetX = e.clientX - ui.getBoundingClientRect().left;
    offsetY = e.clientY - ui.getBoundingClientRect().top;
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      ui.style.left = (e.clientX - offsetX) + "px";
      ui.style.top = (e.clientY - offsetY) + "px";
    }
  });
  document.addEventListener("mouseup", () => { isDragging = false; });
  document.getElementById("kix-close").addEventListener("click", () => ui.remove());

  // Login Logic (SHA-256 Verification)
  document.getElementById("kix-login-btn").addEventListener("click", async () => {
    const input = document.getElementById("kix-hash-input").value.trim();
    const inputHash = await sha256(input);
    
    // To get your actual hash, type your password in the console:
    // sha256("YOUR_PASSWORD_HERE").then(console.log)
    
    if (inputHash === targetHash) {
      const overlay = document.getElementById("kix-login-overlay");
      overlay.style.transform = "translateY(-100%)";
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.style.display = "none";
        document.getElementById("kix-main-app").style.display = "flex";
      }, 400);
    } else {
      document.getElementById("kix-error-msg").style.display = "block";
    }
  });

  // Tab Logic
  const hTabs = document.querySelectorAll(".kix-htab");
  const contents = document.querySelectorAll(".kix-tab-content");
  function switchTab(targetId) {
    hTabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));
    if (targetId !== "settings") {
      document.querySelector(`.kix-htab[data-target="${targetId}"]`).classList.add("active");
    }
    document.getElementById("kix-content-" + targetId).classList.add("active");
  }
  hTabs.forEach(tab => tab.addEventListener("click", () => switchTab(tab.dataset.target)));
  document.getElementById("kix-settings-btn").addEventListener("click", () => switchTab("settings"));

  // Home Buttons
  const modeDisplay = document.getElementById("current-mode-display");
  const codeInput = document.getElementById("kix-code");

  document.getElementById("select-page").addEventListener("click", () => {
    execMode = "page";
    modeDisplay.textContent = "Mode: JavaScript (Page)";
    codeInput.placeholder = "// Example: document.body.style.background = 'red'";
    switchTab("executor");
  });

  document.getElementById("select-api").addEventListener("click", () => {
    execMode = "api";
    modeDisplay.textContent = "Mode: Chrome API (Parser)";
    codeInput.placeholder = "// Type 'tabs', 'cookies', or 'history'";
    switchTab("executor");
  });

  // Executor Logic
  const consoleOutput = document.getElementById("kix-console-output");

  document.getElementById("kix-exec").addEventListener("click", () => {
    const code = codeInput.value.trim();
    if (!code) return;
    consoleOutput.innerHTML = ""; 

    const line = document.createElement("div");
    line.style.color = "#ffaa00";
    line.textContent = "Executing...";
    consoleOutput.appendChild(line);

    const actionType = execMode === "api" ? "execute_api" : "execute_js";

    chrome.runtime.sendMessage({ action: actionType, code: code }, (response) => {
      consoleOutput.innerHTML = "";
      const resLine = document.createElement("div");
      if (response.error) {
        resLine.style.color = "#ff5555";
        resLine.textContent = "[Error] " + response.error;
      } else {
        resLine.style.color = "#00ffcc";
        resLine.textContent = "[Result] " + (response.result || "Executed successfully.");
      }
      consoleOutput.appendChild(resLine);
    });
  });

  document.getElementById("kix-clear").addEventListener("click", () => {
    codeInput.value = "";
    consoleOutput.innerHTML = '<div style="color:#666;">Console output will appear here...</div>';
  });

  // DevTools Logic
  const devOutput = document.getElementById("kix-dev-output");
  document.querySelectorAll(".dev-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      devOutput.textContent = "Loading...";
      
      if (action === "html") {
        devOutput.textContent = document.documentElement.outerHTML.substring(0, 10000) + "\n\n...[TRUNCATED]";
      } else if (action === "cookies") {
        chrome.runtime.sendMessage({ action: "get_cookies" }, (response) => {
          devOutput.textContent = response.result || response.error;
        });
      } else if (action === "network") {
        const resources = performance.getEntriesByType("resource");
        let out = "Network Resources Loaded:\n\n";
        resources.forEach(r => { out += `[${r.initiatorType}] ${r.name}\n`; });
        devOutput.textContent = out || "No resources found.";
      }
    });
  });

  // Theme Toggle
  document.getElementById("theme-toggle").addEventListener("change", (e) => {
    if (e.target.checked) { 
      ui.classList.remove("light-glass"); 
      ui.classList.add("dark-glass"); 
    } else { 
      ui.classList.remove("dark-glass"); 
      ui.classList.add("light-glass"); 
    }
  });
}
