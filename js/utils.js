
export function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

export function showLoader(text = "처리 중...") {
    const loader = document.getElementById('global-loader');
    const textEl = document.getElementById('loader-text');
    if (loader && textEl) { textEl.innerText = text; loader.classList.remove('hidden'); }
}

export function hideLoader() { 
    const loader = document.getElementById('global-loader'); 
    if (loader) loader.classList.add('hidden'); 
}

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const colors = {
        success: 'border-emerald-500/50 text-emerald-400',
        error: 'border-rose-500/50 text-rose-400',
        info: 'border-indigo-500/50 text-indigo-400'
    };
    const colorClass = colors[type] || colors.info;
    toast.className = `bg-slate-900/90 border ${colorClass} text-white px-6 py-3.5 rounded-2xl shadow-float text-sm font-bold transform transition-all duration-500 translate-y-10 opacity-0 flex items-center gap-3 backdrop-blur-xl z-[100]`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));
    setTimeout(() => { 
        toast.classList.add('translate-y-10', 'opacity-0'); 
        setTimeout(() => toast.remove(), 500); 
    }, 4000);
}

export function showConfirmModal(message, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirm-modal');
    const msgEl = document.getElementById('confirm-modal-message');
    const okBtn = document.getElementById('confirm-modal-ok');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    const backdrop = document.getElementById('confirm-modal-backdrop');
    const panel = document.getElementById('confirm-modal-panel');

    if (!modal) { if (confirm(message)) onConfirm(); return; }
    
    msgEl.textContent = message;
    modal.classList.remove('hidden');
    
    requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('scale-95', 'opacity-0');
        panel.classList.add('scale-100', 'opacity-100');
    });

    const close = () => {
        backdrop.classList.add('opacity-0');
        panel.classList.remove('scale-100', 'opacity-100');
        panel.classList.add('scale-95', 'opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 200);
    };

    okBtn.onclick = () => { onConfirm(); close(); };
    cancelBtn.onclick = () => { if(onCancel) onCancel(); close(); };
    backdrop.onclick = close;
}

export function showWarningModal(message) {
    const modal = document.getElementById('warning-modal');
    const msgEl = document.getElementById('warning-modal-message');
    const okBtn = document.getElementById('warning-modal-close');
    const backdrop = document.getElementById('warning-modal-backdrop');
    const panel = document.getElementById('warning-modal-panel');

    msgEl.textContent = message;
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('scale-95', 'opacity-0');
    });
    okBtn.onclick = () => {
        backdrop.classList.add('opacity-0');
        panel.classList.add('scale-95', 'opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 200);
    };
}

export function showSolutionDetailModal(sol) {
    if (!sol) return;
    const modal = document.getElementById('solution-detail-modal');
    const backdrop = document.getElementById('detail-modal-backdrop');
    const panel = document.getElementById('detail-modal-panel');

    document.getElementById('detail-manufacturer').textContent = sol.manufacturer || 'Unknown';
    document.getElementById('detail-share').textContent = `${sol.share}%`;
    document.getElementById('detail-name').textContent = sol.name || 'Untitled Solution';
    document.getElementById('detail-note').textContent = sol.note || 'No additional notes provided.';

    const list = document.getElementById('detail-painpoints');
    list.innerHTML = '';
    if (sol.painPoints && sol.painPoints.length > 0) {
        sol.painPoints.forEach(pp => {
            const li = document.createElement('li');
            li.className = "text-sm text-slate-300 flex items-start gap-3 leading-relaxed";
            li.innerHTML = `<i class="fa-solid fa-circle-exclamation text-rose-500 mt-1 text-[10px]"></i><span>${pp}</span>`;
            list.appendChild(li);
        });
    } else {
        list.innerHTML = `<li class="text-xs text-slate-500 italic">No pain points identified.</li>`;
    }

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        panel.classList.remove('opacity-0', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
    });

    const closeBtn = document.getElementById('detail-modal-close');
    const closeModal = () => {
        backdrop.classList.add('opacity-0');
        panel.classList.remove('opacity-100', 'scale-100');
        panel.classList.add('opacity-0', 'scale-95');
        setTimeout(() => modal.classList.add('hidden'), 200);
    };
    closeBtn.onclick = closeModal;
    backdrop.onclick = closeModal;
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
    if (isLoading) { 
        btn.disabled = true; 
        btn.dataset.original = btn.innerHTML; 
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingText}`; 
    } else { 
        btn.disabled = false; 
        btn.innerHTML = btn.dataset.original || btn.innerHTML; 
    }
}
