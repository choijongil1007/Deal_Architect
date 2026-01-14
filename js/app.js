
import { renderDeals } from './views/deals.js';
import { renderDealDetails } from './views/details.js';
import { renderLogin } from './views/login.js';
import { Auth } from './auth.js';
import { showToast, showConfirmModal, showLoader, hideLoader } from './utils.js';

const appContainer = document.getElementById('app');
const mainNav = document.getElementById('main-nav');
const backBtn = document.getElementById('nav-back-btn');
const logoutBtn = document.getElementById('btn-logout');
const profileNickname = document.getElementById('display-nickname');
const adminIndicator = document.getElementById('admin-indicator');

window.app = window.app || {};
window.app.navigateTo = navigateTo;

export async function navigateTo(view, params = {}) {
    if (!appContainer) return;
    
    // Auth Check
    if (view !== 'login' && !Auth.isLoggedIn()) {
        return navigateTo('login');
    }

    showLoader("로딩 중...");

    if (view === 'login') {
        mainNav.classList.add('hidden');
        appContainer.innerHTML = '';
        renderLogin(appContainer);
    } else {
        mainNav.classList.remove('hidden');
        updateUserUI();
        
        if (view === 'deals') {
            backBtn.classList.add('hidden');
            appContainer.innerHTML = '';
            await renderDeals(appContainer);
        } else if (view === 'details') {
            backBtn.classList.remove('hidden');
            appContainer.innerHTML = '';
            await renderDealDetails(appContainer, params.id, params.tab);
        }
    }

    window.scrollTo(0, 0);
    hideLoader();
}

function updateUserUI() {
    const user = Auth.getCurrentUser();
    if (user && profileNickname) {
        profileNickname.textContent = user.nickname;
        if (user.role === 'admin') {
            adminIndicator.classList.remove('hidden');
        } else {
            adminIndicator.classList.add('hidden');
        }
    }
}

async function init() {
    if (backBtn) backBtn.addEventListener('click', () => navigateTo('deals'));
    const navLogo = document.getElementById('nav-logo');
    if (navLogo) navLogo.addEventListener('click', () => navigateTo('deals'));
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showConfirmModal("로그아웃 하시겠습니까?", () => {
                Auth.logout();
                navigateTo('login');
                showToast("로그아웃 되었습니다.", "info");
            });
        });
    }

    await navigateTo(Auth.isLoggedIn() ? 'deals' : 'login');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else { init(); }
