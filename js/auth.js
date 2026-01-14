
import { db } from './firebase-config.js';
import { doc, getDoc, setDoc } from "firebase/firestore";

const AUTH_KEY = 'deal_architect_session';
const COLLECTION_USERS = 'users';

export const Auth = {
    async login(nickname, password) {
        if (!nickname || !password) throw new Error("닉네임과 비밀번호를 입력해주세요.");
        
        const userRef = doc(db, COLLECTION_USERS, nickname.toLowerCase());
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.password !== password) {
                throw new Error("비밀번호가 일치하지 않습니다.");
            }
            this._setSession(userData);
            return userData;
        } else {
            // New User Registration
            const newUser = {
                nickname: nickname,
                password: password,
                role: nickname.toLowerCase() === 'admin' ? 'admin' : 'user',
                createdAt: new Date().toISOString()
            };
            await setDoc(userRef, newUser);
            this._setSession(newUser);
            return newUser;
        }
    },

    logout() {
        localStorage.removeItem(AUTH_KEY);
    },

    getCurrentUser() {
        const session = localStorage.getItem(AUTH_KEY);
        return session ? JSON.parse(session) : null;
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    _setSession(user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
};
