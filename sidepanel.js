document.addEventListener('DOMContentLoaded', async () => {
    const selector = document.getElementById('ai-selector');
    const frame = document.getElementById('ai-frame');

    // Load saved AI preference
    const saved = await chrome.storage.local.get(['lastAiUrl']);
    if (saved.lastAiUrl) {
        selector.value = saved.lastAiUrl;
        frame.src = saved.lastAiUrl;
    }

    selector.addEventListener('change', (e) => {
        const url = e.target.value;
        frame.src = url;

        // Save preference
        chrome.storage.local.set({ lastAiUrl: url });
    });

    // Optional: Handle frame loading states
    frame.addEventListener('load', () => {
        console.log('Frame loaded:', frame.src);
    });
});
