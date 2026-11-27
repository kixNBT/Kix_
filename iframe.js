// Override console.log to send messages back to the UI
const originalLog = console.log;
console.log = function(...args) {
  window.parent.postMessage({ action: "console", type: "log", text: args.join(" ") }, "*");
  originalLog.apply(console, args);
};

const originalError = console.error;
console.error = function(...args) {
  window.parent.postMessage({ action: "console", type: "error", text: args.join(" ") }, "*");
  originalError.apply(console, args);
};

// Listen for code to execute
window.addEventListener("message", (e) => {
  if (e.data.action === "execute") {
    try {
      // Execute the code in the extension context
      const result = eval(e.data.code);
      
      // If it returns something and it's not a Promise/function, log it
      if (result !== undefined && typeof result !== "function" && !(result instanceof Promise)) {
        window.parent.postMessage({ action: "console", type: "result", text: String(result) }, "*");
      }
    } catch (err) {
      window.parent.postMessage({ action: "console", type: "error", text: err.message }, "*");
    }
  }
});
