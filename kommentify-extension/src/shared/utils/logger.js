/**
 * On-screen UI logger for debugging content scripts directly on the page.
 */

let uiLogContent = null;

function createLoggerUI() {
  // Don't run in iframes or if the logger already exists
  if (window.self !== window.top || document.getElementById('ct-logger-container')) return;
  
  const container = document.createElement('div');
  container.id = 'ct-logger-container';
  
  container.innerHTML = `
    <div id="ct-logger-header">
      <strong>AutoEngagerStatus</strong>
      <button id="ct-copy-logs-btn">Copy</button>
    </div>
    <div id="ct-logger-content"></div>
  `;
  document.body.appendChild(container);

  const style = document.createElement('style');
  style.innerHTML = `
    #ct-logger-container { 
      position: fixed; 
      top: 10px; 
      right: 10px; 
      width: 350px; 
      height: 400px; 
      background: #fff; 
      border: 1px solid #ccc; 
      border-radius: 4px; 
      z-index: 9999999; 
      display: flex; 
      flex-direction: column; 
      font-family: monospace; 
      font-size: 12px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    #ct-logger-header { 
      padding: 8px; 
      background: #f1f1f1; 
      border-bottom: 1px solid #ccc; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      color: #333;
    }
    #ct-logger-content { 
      padding: 8px; 
      flex-grow: 1; 
      overflow-y: scroll; 
      display: flex; 
      flex-direction: column-reverse; /* Shows newest logs at the bottom */
    }
    .ct-log-entry { 
      margin: 0; 
      padding: 3px 0; 
      border-bottom: 1px solid #f0f0f0; 
      color: #333;
      word-break: break-all;
    }
    .ct-log-entry.error { color: #d9534f; font-weight: bold; }
    .ct-log-entry.success { color: #5cb85c; }
    #ct-copy-logs-btn { 
      padding: 3px 10px; 
      font-size: 10px; 
      cursor: pointer; 
      background: #ddd; 
      border: 1px solid #bbb; 
      border-radius: 3px; 
    }
    #ct-copy-logs-btn:active { background: #ccc; }
  `;
  document.head.appendChild(style);

  uiLogContent = document.getElementById('ct-logger-content');

  const copyBtn = document.getElementById('ct-copy-logs-btn');
  copyBtn.addEventListener('click', () => {
    if (!uiLogContent) return;
    const logs = Array.from(uiLogContent.querySelectorAll('.ct-log-entry'))
                      .map(entry => entry.textContent)
                      .reverse() // Reverse to copy in chronological order
                      .join('\\n');
    navigator.clipboard.writeText(logs).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    });
  });
}

function logToUI(message, type = 'log') {
  if (window.self !== window.top || !uiLogContent) return;
  const entry = document.createElement('p');
  entry.className = `ct-log-entry ${type}`;
  entry.textContent = message.replace('[CONTENT]', '').trim(); 
  uiLogContent.prepend(entry);
}

/**
 * The main logging function to be used throughout the content scripts.
 * Logs to both the developer console and the on-screen UI.
 * @param {'log'|'error'|'success'} type - The type of log.
 * @param {...any} args - The message(s) to log.
 */
export const log = (type, ...args) => {
  const message = `[CONTENT] ${new Date().toLocaleTimeString()}: ${args.join(' ')}`;
  console.log(message);
  logToUI(message, type);
};

export function initLogger() {
    createLoggerUI();
    log('log', "Logger initialized.");
}