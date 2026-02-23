chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  console.log('Multi-AI Side Panel extension installed');
});

// Relay messages from sidepanel to content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'PASTE_CLIPBOARD') {
    // Broadcast to all active tabs and frames
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(err => {
            // Ignore errors for tabs where content script isn't running
          });
        }
      });
    });
  } else if (message.action === 'UPDATE_URL' && message.url) {
    chrome.storage.session.get(['botUrls'], (res) => {
      let botUrls = res.botUrls || {};
      const baseParams = ['chatgpt.com', 'gemini.google.com', 'claude.ai', 'deepseek.com', 'grok.com', 'notebooklm.google.com'];
      for (const base of baseParams) {
        if (message.hostname.includes(base)) {
          botUrls[base] = message.url;
          chrome.storage.session.set({ botUrls });
          break;
        }
      }
    });
  }
});
