
import { Auth } from '../auth.js';
import { navigateTo } from '../app.js';
import { showToast, setButtonLoading } from '../utils.js';

export function renderLogin(container) {
    container.innerHTML = `
        <div class="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6">
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
                <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div class="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-modal-in">
                <div class="p-8 md:p-12">
                    <div class="flex flex-col items-center mb-10 text-center">
                        <div class="w-16 h-16 bg-white text-slate-900 flex items-center justify-center rounded-2xl text-2xl font-black shadow-float mb-6">D</div>
                        <h1 class="text-3xl font-black text-white tracking-tight mb-2">Deal Architect</h1>
                        <p class="text-slate-400 text-sm font-medium">프리세일즈 의사결정 지원 시스템</p>
                    </div>

                    <form id="login-form" class="space-y-5">
                        <div class="space-y-2">
                            <label class="block text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Nickname</label>
                            <input type="text" id="login-nickname" required 
                                class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                placeholder="사용할 닉네임을 입력하세요">
                        </div>
                        <div class="space-y-2">
                            <label class="block text-xs font-bold text-slate-300 uppercase tracking-widest ml-1">Password</label>
                            <input type="password" id="login-password" required 
                                class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                placeholder="비밀번호를 입력하세요">
                        </div>
                        
                        <div class="pt-4">
                            <button type="submit" id="btn-login-submit" 
                                class="w-full bg-white text-slate-900 font-black py-4 rounded-xl hover:bg-slate-100 transition-all shadow-float active:scale-95 flex items-center justify-center gap-3">
                                <span>Get Started</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </form>

                    <div class="mt-8 text-center">
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise PreSales Decision Support</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('login-form');
    const btn = document.getElementById('btn-login-submit');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nick = document.getElementById('login-nickname').value.trim();
        const pass = document.getElementById('login-password').value.trim();

        if (!nick || !pass) return;

        setButtonLoading(btn, true, "인증 중...");
        try {
            await Auth.login(nick, pass);
            showToast(`${nick}님, 환영합니다!`, "success");
            navigateTo('deals');
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setButtonLoading(btn, false);
        }
    });
}
