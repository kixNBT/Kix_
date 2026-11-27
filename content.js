if (!document.getElementById("kix-executor")) {
  const ui = document.createElement("div");
  ui.id = "kix-executor";
  ui.className = "light-glass";

  const targetHash = "7852c7ed159667a5b9e26c042af96fca\n90610908a1de9b06bfaf5d6c1151190d\nf5b07437af6dff5c84a4f57256ae64e4\n83ff5eca4e8c8ded0d2852697ac1899f\n824ec35aabbffd7090ed1cb2c33a3558\ndacf49b406a563046c114d19194e8bcd\n08760b0dce6c5ef06aac4a1ab627620e\n4b849ec61040a3f22cbf097c3e1da1f4\nfac2f9ca122838cf12c263f0dbd4397d\n4b76ffcb26cf60a587387ddd4aba5ca2";

  ui.innerHTML = `
    <div id="kix-header">
      <div class="kix-logo">Kix</div>
      <div class="kix-header-tabs">
        <span class="kix-htab active" data-target="home">Home</span>
        <span class="kix-htab" data-target="executor">Executor</span>
        <span class="kix-htab" data-target="devtools">DevTools</span>
      </div>
      <div class="kix-window-controls">
        <span id="kix-settings-btn" title="Settings">&#9881;</span>
        <span id="kix-close">&#10005;</span>
      </div>
    </div>
    
    <div id="kix-login-overlay">
      <h3>Authentication Required</h3>
      <textarea id="kix-hash-input" placeholder="Paste your hash here..." spellcheck="false"></textarea>
      <button id="kix-login-btn">Enter</button>
      <p id="kix-error-msg">Wrong Hash</p>
    </div>

    <div id="kix-main-app">
      <!-- HOME TAB -->
      <div id="kix-content-home" class="kix-tab-content active">
        <div class="kix-home-container">
          <h2>Welcome, Admin</h2>
          <p>Select an execution environment:</p>
          <div class="kix-lang-buttons">
            <button class="kix-lang-btn" id="select-js">
              <span class="icon">JS</span> Chrome API
            </button>
          </div>
        </div>
      </div>

      <!-- EXECUTOR TAB -->
      <div id="kix-content-executor" class="kix-tab-content">
        <div class="kix-toolbar">
          <span style="font-size:12px; font-weight:600; color:#888;">Context: chrome.*</span>
          <button class="kix-btn" id="kix-exec" style="margin-left:auto;">&#9654; Execute</button>
          <button class="kix-btn" id="kix-clear">&#128465; Clear</button>
        </div>
        <div class="kix-editor" style="flex: 2;">
          <textarea id="kix-code" spellcheck="false" placeholder="// Example: chrome.tabs.query({}, console.log);"></textarea>
        </div>
        <div class="kix-console" id="kix-console-output">
          <div style="color:#666;">Console output will appear here...</div>
        </div>
      </div>

      <!-- DEVTOOLS TAB -->
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

      <!-- SETTINGS TAB -->
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

    <!-- Hidden Iframe for Chrome API Execution -->
    <iframe id="kix-sandbox" src="${chrome.runtime.getURL('iframe.html')}" style="display:none;"></iframe>
  `;
  document.body.appendChild(ui);

  // --- Drag & Window Logic ---
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

  // --- Login Logic ---
  document.getElementById("kix-login-btn").addEventListener("click", () => {
    const input = document.getElementById("kix-hash-input").value.trim();
    if (input === targetHash) {
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

  // --- Tab Logic ---
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

  // --- Home Menu ---
  document.getElementById("select-js").addEventListener("click", () => switchTab("executor"));

  // --- Execution Logic (Chrome API) ---
  const codeInput = document.getElementById("kix-code");
  const consoleOutput = document.getElementById("kix-console-output");
  const sandbox = document.getElementById("kix-sandbox");

  document.getElementById("kix-exec").addEventListener("click", () => {
    const code = codeInput.value.trim();
    if (!code) return;
    
    consoleOutput.innerHTML = ""; // Clear previous
    sandbox.contentWindow.postMessage({ action: "execute", code: code }, "*");
  });

  document.getElementById("kix-clear").addEventListener("click", () => {
    codeInput.value = "";
    consoleOutput.innerHTML = '<div style="color:#666;">Console output will appear here...</div>';
  });

  // Listen to Console Logs from the Iframe
  window.addEventListener("message", (e) => {
    if (e.data.action === "console") {
      const line = document.createElement("div");
      line.style.marginBottom = "4px";
      
      if (e.data.type === "error") {
        line.style.color = "#ff5555";
        line.textContent = "❌ " + e.data.text;
      } else if (e.data.type === "result") {
        line.style.color = "#00ffcc";
        line.textContent = "➜ " + e.data.text;
      } else {
        line.style.color = "#333";
        line.textContent = e.data.text;
      }
      
      consoleOutput.appendChild(line);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
  });

  // --- DevTools Logic ---
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

  // --- Settings Theme Logic ---
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
