# Multi-AI Side Panel

A Chrome extension that puts **seven leading AI assistants** — Gemini, ChatGPT, Claude, DeepSeek, Grok, NotebookLM, and Kimi AI — right inside your browser's side panel. Switch between them instantly without leaving the page you're working on.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-0F9D58)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Multi-AI Switching** | Seamlessly switch between Gemini, ChatGPT, Claude, DeepSeek, Grok, NotebookLM, and Kimi AI from a dropdown selector. |
| **Side Panel Integration** | Runs inside Chrome's native Side Panel — chat with AI while browsing any website. |
| **Copy Current URL** | One-click copy of the active tab's URL to your clipboard for easy pasting into any AI chat. |
| **Screenshot to Clipboard** | Capture a screenshot of the visible tab and copy it to the clipboard instantly. |
| **Crop to Clipboard** | Select and crop a region of the visible tab, then copy it to the clipboard. |
| **Text Injection** | Inject selected text or page content directly into AI chatbot input fields (supports React inputs and `contenteditable` divs). |
| **Microphone Access** | Dedicated permission flow for enabling microphone access for voice-enabled AI features. |
| **Session Persistence** | Keeps your chat sessions alive across AI switches — no more losing conversations until the browser is closed. |
| **Reload Controls** | New Page button to refresh the current AI bot, and a Reload Extension button to fully restart the extension. |
| **Claude Voice Handling** | Gracefully handles Claude's voice mode limitation inside iframes with user-friendly notices. |

---

## 🚀 Installation

### Load as an Unpacked Extension

1. **Clone the repository**
   ```bash
   git clone https://github.com/NikhilKumarSingh4002/multi_ai_extension.git
   ```
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable** "Developer mode" (toggle in the top-right corner)
4. Click **"Load unpacked"** and select the cloned project folder
5. The extension icon will appear in your toolbar — click it to open the side panel

---

## 📁 Project Structure

```
multi_ai_extension/
├── manifest.json        # Extension manifest (Manifest V3)
├── background.js        # Service worker — side panel behavior & message relay
├── sidepanel.html       # Side panel UI with AI selector and action buttons
├── sidepanel.css        # Dark-themed styling for the side panel
├── sidepanel.js         # Side panel logic — AI switching, URL copy, screenshot
├── injector.js          # Content script — injects text into AI input fields
├── antidetect.js        # Claude-specific script — handles voice mode limitations
├── permission.html      # Microphone permission request page
├── permission.js        # Microphone permission handling logic
├── rules.json           # Declarative net request rules for header management
└── image.png            # Extension icon (128×128)
```

---

## 🛠️ How It Works

### Side Panel
The extension uses Chrome's **Side Panel API** to embed AI chat interfaces in an `<iframe>`. A dropdown selector lets you switch providers, and your choice is saved via `chrome.storage.local`.

### Text Injection
The `injector.js` content script listens for `INJECT_TEXT` messages and uses heuristics to locate the active input field on any AI chat page. It handles:
- **React-controlled** `<textarea>` / `<input>` elements (ChatGPT, DeepSeek)
- **`contenteditable`** divs (Gemini)

### Network Rules
`rules.json` uses Chrome's Declarative Net Request API to manage headers (origin spoofing, CSP relaxation) so AI sites load properly inside the side panel iframe.

### Claude Voice Handling
`antidetect.js` runs in the `MAIN` world on Claude pages. It uses a `MutationObserver` to intercept voice-mode error messages.

---

## 🔑 Permissions

| Permission | Reason |
|---|---|
| `sidePanel` | Opens the extension in Chrome's side panel |
| `declarativeNetRequest` | Modifies network headers so AI sites load in iframes |
| `storage` | Saves the user's last-selected AI provider |
| `scripting` | Executes scripts to capture page content |
| `activeTab` | Accesses the current tab for URL copy and screenshots |
| `<all_urls>` | Allows the extension to interact with any website |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/NikhilKumarSingh4002">Nikhil Kumar Singh</a>
</p>
