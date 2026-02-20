document.addEventListener('DOMContentLoaded', async () => {
    const selector = document.getElementById('ai-selector');
    const frame = document.getElementById('ai-frame');
    const btnScreenshot = document.getElementById('inject-screenshot');
    const toast = document.getElementById('toast');

    // Load saved AI preference
    const saved = await chrome.storage.local.get(['lastAiUrl']);
    if (saved.lastAiUrl) {
        selector.value = saved.lastAiUrl;
        frame.src = saved.lastAiUrl;
        if (saved.lastAiUrl.includes('claude.ai')) {
            showToast('⚠️ Voice mode is unavailable for Claude in the side panel.', 5000);
        }
    }

    selector.addEventListener('change', (e) => {
        const url = e.target.value;
        frame.src = url;
        chrome.storage.local.set({ lastAiUrl: url });
        if (url.includes('claude.ai')) {
            showToast('⚠️ Voice mode is unavailable for Claude in the side panel.');
        }
    });

    function showToast(message, duration = 2000) {
        toast.textContent = message;
        toast.classList.add('show');
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, duration);
    }

    // Helper to get active tab
    async function getActiveTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }

    // Helper: focus the AI iframe so user can Ctrl+V
    function focusIframe() {
        frame.focus();
    }

    // URL Injection Logic
    async function injectUrl() {
        try {
            const tab = await getActiveTab();
            if (!tab) {
                showToast('No active tab');
                return;
            }

            const url = tab.url;
            await navigator.clipboard.writeText(url);
            focusIframe();
            showToast('URL Copied — Ctrl+V to paste');

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

            const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });

            // Write to clipboard
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);

            focusIframe();
            showToast('Screenshot Copied — Ctrl+V to paste');

        } catch (err) {
            console.error('Screenshot failed:', err);
            showToast('Screenshot Failed');
        }
    }

    // Crop Logic
    async function captureCrop() {
        try {
            const tab = await getActiveTab();
            if (!tab) {
                showToast('No active tab');
                return;
            }

            showToast('Select area on page to crop', 2500);

            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    return new Promise((resolve) => {
                        const overlay = document.createElement('div');
                        overlay.style.position = 'fixed';
                        overlay.style.top = '0';
                        overlay.style.left = '0';
                        overlay.style.width = '100vw';
                        overlay.style.height = '100vh';
                        overlay.style.backgroundColor = 'rgba(0,0,0,0.3)';
                        overlay.style.zIndex = '2147483647';
                        overlay.style.cursor = 'crosshair';
                        overlay.style.overflow = 'hidden';

                        const selection = document.createElement('div');
                        selection.style.position = 'absolute';
                        selection.style.border = '1px dashed #fff';
                        selection.style.outline = '9999px solid rgba(0,0,0,0.5)';
                        selection.style.display = 'none';

                        overlay.appendChild(selection);
                        document.body.appendChild(overlay);

                        let startX, startY;
                        let isDragging = false;

                        function onMouseDown(e) {
                            isDragging = true;
                            startX = e.clientX;
                            startY = e.clientY;
                            overlay.style.backgroundColor = 'transparent';
                            selection.style.display = 'block';
                            selection.style.left = startX + 'px';
                            selection.style.top = startY + 'px';
                            selection.style.width = '0px';
                            selection.style.height = '0px';
                            e.stopPropagation();
                            e.preventDefault();
                        }

                        function onMouseMove(e) {
                            if (!isDragging) return;
                            const currX = e.clientX;
                            const currY = e.clientY;
                            const x = Math.min(startX, currX);
                            const y = Math.min(startY, currY);
                            const w = Math.abs(currX - startX);
                            const h = Math.abs(currY - startY);

                            selection.style.left = x + 'px';
                            selection.style.top = y + 'px';
                            selection.style.width = w + 'px';
                            selection.style.height = h + 'px';
                            e.stopPropagation();
                            e.preventDefault();
                        }

                        function onMouseUp(e) {
                            if (!isDragging) return;
                            isDragging = false;

                            const rect = selection.getBoundingClientRect();
                            document.body.removeChild(overlay);
                            document.removeEventListener('keydown', onKeyDown, true);
                            window.removeEventListener('mouseup', onMouseUp, true);

                            setTimeout(() => {
                                resolve({
                                    x: rect.left,
                                    y: rect.top,
                                    w: rect.width,
                                    h: rect.height,
                                    dpr: window.devicePixelRatio
                                });
                            }, 100);
                            e.stopPropagation();
                            e.preventDefault();
                        }

                        function onKeyDown(e) {
                            if (e.key === 'Escape') {
                                document.body.removeChild(overlay);
                                document.removeEventListener('keydown', onKeyDown, true);
                                window.removeEventListener('mouseup', onMouseUp, true);
                                resolve(null);
                            }
                        }

                        overlay.addEventListener('mousedown', onMouseDown, true);
                        overlay.addEventListener('mousemove', onMouseMove, true);
                        window.addEventListener('mouseup', onMouseUp, true);
                        document.addEventListener('keydown', onKeyDown, true);
                    });
                }
            });

            const rectInfo = results[0]?.result;
            if (!rectInfo) return;

            if (rectInfo.w === 0 || rectInfo.h === 0) {
                showToast('Invalid area');
                return;
            }

            const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });

            const img = new Image();
            img.src = dataUrl;
            await new Promise(r => img.onload = r);

            const canvas = document.createElement('canvas');
            canvas.width = rectInfo.w * rectInfo.dpr;
            canvas.height = rectInfo.h * rectInfo.dpr;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                img,
                rectInfo.x * rectInfo.dpr, rectInfo.y * rectInfo.dpr, canvas.width, canvas.height,
                0, 0, canvas.width, canvas.height
            );

            const croppedDataUrl = canvas.toDataURL('image/png');

            // Write to clipboard from the active tab (which IS focused)
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: async (imgDataUrl) => {
                    const res = await fetch(imgDataUrl);
                    const blob = await res.blob();
                    await navigator.clipboard.write([
                        new ClipboardItem({ [blob.type]: blob })
                    ]);
                },
                args: [croppedDataUrl]
            });

            focusIframe();
            showToast('Cropped — Ctrl+V to paste');

        } catch (err) {
            console.error('Crop failed:', err);
            showToast('Crop Failed');
        }
    }

    const btnUrl = document.getElementById('inject-url');
    const btnCrop = document.getElementById('inject-crop');

    btnUrl.addEventListener('click', injectUrl);
    btnScreenshot.addEventListener('click', captureScreenshot);
    if (btnCrop) btnCrop.addEventListener('click', captureCrop);

    // Microphone Permission Logic
    const btnMic = document.getElementById('enable-mic');

    async function checkMicPermission() {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
            if (permissionStatus.state !== 'granted') {
                btnMic.style.display = 'inline-block';
            } else {
                btnMic.style.display = 'none';
            }

            permissionStatus.onchange = () => {
                if (permissionStatus.state === 'granted') {
                    btnMic.style.display = 'none';
                } else {
                    btnMic.style.display = 'inline-block';
                }
            };
        } catch (err) {
            console.error('Permission check failed:', err);
            btnMic.style.display = 'inline-block';
        }
    }

    btnMic.addEventListener('click', () => {
        chrome.tabs.create({ url: 'permission.html' });
    });

    checkMicPermission();
});
