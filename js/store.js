
import { db } from './firebase-config.js';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { Auth } from './auth.js';

const COLLECTION_NAME = 'deals';

export const Store = {
    getDeals: async () => {
        const user = Auth.getCurrentUser();
        if (!user) return [];

        let q;
        if (user.role === 'admin') {
            q = query(collection(db, COLLECTION_NAME));
        } else {
            // orderBy를 제거하여 복합 인덱스 요구사항을 우회합니다.
            q = query(
                collection(db, COLLECTION_NAME), 
                where("owner", "==", user.nickname)
            );
        }
        
        const snapshot = await getDocs(q);
        let deals = [];
        snapshot.forEach((doc) => { 
            deals.push({ id: doc.id, ...doc.data() }); 
        });

        // 클라이언트 사이드 정렬 (updatedAt 기준 내림차순)
        return deals
            .map(deal => Store.ensureDealStructure(deal))
            .sort((a, b) => {
                const dateA = a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : new Date(a.updatedAt || 0).getTime();
                const dateB = b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : new Date(b.updatedAt || 0).getTime();
                return dateB - dateA;
            });
    },

    getDeal: async (id) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        
        const deal = docSnap.data();
        const user = Auth.getCurrentUser();
        
        // Admin or Owner check
        if (user.role !== 'admin' && deal.owner !== user.nickname) {
            return null;
        }

        return Store.ensureDealStructure({ id: docSnap.id, ...deal });
    },

    saveDeal: async (deal) => {
        const user = Auth.getCurrentUser();
        if (!user) throw new Error("Authentication required");

        if (!deal.id) deal.id = Date.now().toString(36);
        if (!deal.owner) deal.owner = user.nickname; // Assign owner on create

        await setDoc(doc(db, COLLECTION_NAME, deal.id), { ...deal, updatedAt: serverTimestamp() }, { merge: true });
    },

    deleteDeal: async (id) => { 
        await deleteDoc(doc(db, COLLECTION_NAME, id)); 
    },

    createEmptyDeal: () => {
        const user = Auth.getCurrentUser();
        return {
            id: null, owner: user?.nickname || '', currentStage: 'awareness', status: 'active', clientName: '', dealName: '',
            discovery: { awareness: {}, consideration: {}, evaluation: {}, purchase: {} },
            assessment: { awareness: { isCompleted: false }, consideration: { isCompleted: false } },
            competitive: { requirements: [], functionalRequirements: [] },
            solutionMapContent: {}, savedMaps: [], reports: [], updatedAt: new Date().toISOString(),
            decisionRisks: []
        };
    },

    ensureDealStructure: (deal) => {
        const template = Store.createEmptyDeal();
        return { ...template, ...deal };
    },
    
    // Solution Map Methods
    getMapContent: async (id) => { const deal = await Store.getDeal(id); return deal?.solutionMapContent || {}; },
    saveMapContent: async (id, content) => { 
        const deal = await Store.getDeal(id); 
        if (deal) { 
            deal.solutionMapContent = content; 
            await Store.saveDeal(deal); 
        } 
    },
    
    addDomain: async (id, domainName) => {
        const deal = await Store.getDeal(id);
        if (!deal || !domainName) return false;
        if (!deal.solutionMapContent) deal.solutionMapContent = {};
        if (deal.solutionMapContent[domainName]) return false;
        deal.solutionMapContent[domainName] = {};
        await Store.saveDeal(deal);
        return true;
    },
    renameDomain: async (id, oldName, newName) => {
        const deal = await Store.getDeal(id);
        if (!deal || !oldName || !newName || oldName === newName) return false;
        const content = deal.solutionMapContent;
        if (!content[oldName] || content[newName]) return false;
        content[newName] = content[oldName];
        delete content[oldName];
        await Store.saveDeal(deal);
        return true;
    },
    deleteDomain: async (id, domainName) => {
        const deal = await Store.getDeal(id);
        if (!deal || !domainName) return false;
        delete deal.solutionMapContent[domainName];
        await Store.saveDeal(deal);
        return true;
    },
    addCategory: async (id, domainName, categoryName) => {
        const deal = await Store.getDeal(id);
        if (!deal || !domainName || !categoryName) return false;
        if (!deal.solutionMapContent[domainName]) return false;
        if (deal.solutionMapContent[domainName][categoryName]) return false;
        deal.solutionMapContent[domainName][categoryName] = [];
        await Store.saveDeal(deal);
        return true;
    },
    renameCategory: async (id, domainName, oldName, newName) => {
        const deal = await Store.getDeal(id);
        if (!deal || !domainName || !oldName || !newName) return false;
        const domain = deal.solutionMapContent[domainName];
        if (!domain || !domain[oldName] || domain[newName]) return false;
        domain[newName] = domain[oldName];
        delete domain[oldName];
        await Store.saveDeal(deal);
        return true;
    },
    deleteCategory: async (id, domainName, categoryName) => {
        const deal = await Store.getDeal(id);
        if (!deal || !domainName || !categoryName) return false;
        delete deal.solutionMapContent[domainName][categoryName];
        await Store.saveDeal(deal);
        return true;
    },
    addSolution: async (id, domain, category, name, share, manufacturer, painPoints, note) => {
        const deal = await Store.getDeal(id);
        if (!deal) return 'ERROR';
        const solutions = deal.solutionMapContent[domain][category];
        const currentTotal = solutions.reduce((sum, s) => sum + s.share, 0);
        if (currentTotal + share > 100) return 'OVERFLOW';
        solutions.push({ name, share, manufacturer, painPoints, note });
        await Store.saveDeal(deal);
        return 'SUCCESS';
    },
    updateSolution: async (id, domain, category, index, name, share, manufacturer, painPoints, note) => {
        const deal = await Store.getDeal(id);
        if (!deal) return 'ERROR';
        const solutions = deal.solutionMapContent[domain][category];
        const currentTotal = solutions.reduce((sum, s, idx) => sum + (idx === index ? 0 : s.share), 0);
        if (currentTotal + share > 100) return 'OVERFLOW';
        solutions[index] = { name, share, manufacturer, painPoints, note };
        await Store.saveDeal(deal);
        return 'SUCCESS';
    },
    deleteSolution: async (id, domain, category, index) => {
        const deal = await Store.getDeal(id);
        if (!deal) return false;
        deal.solutionMapContent[domain][category].splice(index, 1);
        await Store.saveDeal(deal);
        return true;
    },
    addSavedMap: async (id, title, content) => {
        const deal = await Store.getDeal(id);
        if (deal) {
            if (!deal.savedMaps) deal.savedMaps = [];
            deal.savedMaps.push({ id: Date.now().toString(36), title, content, updatedAt: new Date().toISOString() });
            await Store.saveDeal(deal);
        }
    },
    deleteSavedMap: async (dealId, mapId) => {
        const deal = await Store.getDeal(dealId);
        if (deal && deal.savedMaps) {
            deal.savedMaps = deal.savedMaps.filter(m => m.id !== mapId);
            await Store.saveDeal(deal);
        }
    },

    // Reports Methods
    addReport: async (id, title, contentHTML, type) => {
        const deal = await Store.getDeal(id);
        if (deal) {
            if (!deal.reports) deal.reports = [];
            deal.reports.push({ id: Date.now().toString(36), title, contentHTML, type, createdAt: Date.now() });
            await Store.saveDeal(deal);
        }
    },
    deleteReport: async (dealId, reportId) => {
        const deal = await Store.getDeal(dealId);
        if (deal && deal.reports) {
            deal.reports = deal.reports.filter(r => r.id !== reportId);
            await Store.saveDeal(deal);
        }
    }
};
