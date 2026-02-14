document.addEventListener('DOMContentLoaded', async () => {
    const selector = document.getElementById('ai-selector');
    const frame = document.getElementById('ai-frame');
    const btnSelection = document.getElementById('inject-selection');
    const btnPage = document.getElementById('inject-page');
    const btnScreenshot = document.getElementById('inject-screenshot');
    const toast = document.getElementById('toast');

    // Load saved AI preference
    const saved = await chrome.storage.local.get(['lastAiUrl']);
    if (saved.lastAiUrl) {
        selector.value = saved.lastAiUrl;
        frame.src = saved.lastAiUrl;
    }

    selector.addEventListener('change', (e) => {
        const url = e.target.value;
        frame.src = url;
        chrome.storage.local.set({ lastAiUrl: url });
    });

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
    }

    // Helper to get active tab
    async function getActiveTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }

    // Injection Logic
    async function injectUrl() {
        try {
            const tab = await getActiveTab();
            if (!tab) {
                showToast('No active tab');
                return;
            }

            const url = tab.url;
            await navigator.clipboard.writeText(url);
            showToast('URL Copied');

        } catch (err) {
            console.error('Copy failed:', err);
            showToast('Copy Failed');
        }
    }

    // Screenshot Logic
    async function captureScreenshot() {
        try {
            const tab = await getActiveTab();
            if (!tab) {
                showToast('No active tab');
                return;
            }

            // Capture screenshot as data URL
            const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });

            // Convert data URL to Blob for clipboard
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);

            showToast('Image Copied');

        } catch (err) {
            console.error('Screenshot failed:', err);
            showToast('Screenshot Failed');
        }
    }

    const btnUrl = document.getElementById('inject-url');

    btnUrl.addEventListener('click', injectUrl);
    btnScreenshot.addEventListener('click', captureScreenshot);
});
