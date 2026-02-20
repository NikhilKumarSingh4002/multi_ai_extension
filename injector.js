// Content script for AI chatbot pages in regular tabs
// This is used when the AI sites are opened in normal browser tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'INJECT_TEXT' && message.text) {
        injectText(message.text);
    }
});

function injectText(text) {
    let target = document.activeElement;

    if (!target || (target.tagName !== 'TEXTAREA' && target.getAttribute('contenteditable') !== 'true' && target.tagName !== 'INPUT')) {
        target = document.querySelector('textarea:not([readonly])') ||
            document.querySelector('div[contenteditable="true"]') ||
            document.querySelector('input[type="text"]');
    }

    if (target) {
        target.focus();

        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            const proto = target.tagName === 'TEXTAREA'
                ? window.HTMLTextAreaElement.prototype
                : window.HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (setter) {
                setter.call(target, text);
            } else {
                target.value = text;
            }
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (target.getAttribute('contenteditable') === 'true') {
            target.innerText = text;
            target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    } else {
        console.warn('Multi-AI: No suitable input field found.');
    }
}
