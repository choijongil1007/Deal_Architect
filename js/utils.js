
export function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
export function showLoader(text = "처리 중...") {
    const loader = document.getElementById('global-loader');
    const textEl = document.getElementById('loader-text');
    if (loader && textEl) { textEl.innerText = text; loader.classList.remove('hidden'); }
}
export function hideLoader() { const loader = document.getElementById('global-loader'); if (loader) loader.classList.add('hidden'); }
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `bg-gray-900 border border-gray-800 text-white px-5 py-3 rounded-full shadow-2xl text-sm font-medium transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 backdrop-blur-md`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));
    setTimeout(() => { toast.classList.add('translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
}
export function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const msgEl = document.getElementById('confirm-modal-message');
    const okBtn = document.getElementById('confirm-modal-ok');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    if (!modal) { if (confirm(message)) onConfirm(); return; }
    msgEl.textContent = message;
    modal.classList.remove('hidden');
    okBtn.onclick = () => { onConfirm(); modal.classList.add('hidden'); };
    cancelBtn.onclick = () => modal.classList.add('hidden');
}
export function cleanJSONString(str) {
    let cleaned = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    const startIdx = Math.min(cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{'), cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('['));
    return startIdx !== Infinity ? cleaned.substring(startIdx).trim() : cleaned.trim();
}
export function tryRepairJSON(jsonStr) { try { return JSON.parse(jsonStr); } catch (e) { return null; } }
export function formatDate(date) { return date ? new Date(date).toLocaleDateString() : '-'; }
export function setButtonLoading(btn, isLoading, loadingText = "Analyzing...") {
    if (!btn) return;
    if (isLoading) { btn.disabled = true; btn.dataset.original = btn.innerHTML; btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingText}`; }
    else { btn.disabled = false; btn.innerHTML = btn.dataset.original || btn.innerHTML; }
}
