
import { db } from './firebase-config.js';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";

const STORAGE_KEY = 'deal_architect_deals';
const COLLECTION_NAME = 'deals';

export const Store = {
    hasLocalData: () => { const data = localStorage.getItem(STORAGE_KEY); return !!data && JSON.parse(data).length > 0; },
    clearLocalData: () => { localStorage.removeItem(STORAGE_KEY); },
    migrateToFirestore: async () => {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (!localData) return 0;
        const deals = JSON.parse(localData);
        let count = 0;
        for (const deal of deals) {
            const dealId = deal.id || Date.now().toString(36);
            const dealDoc = doc(db, COLLECTION_NAME, dealId);
            const snapshot = await getDoc(dealDoc);
            if (!snapshot.exists()) {
                await setDoc(dealDoc, { ...Store.ensureDealStructure(deal), updatedAt: serverTimestamp() });
                count++;
            }
        }
        return count;
    },
    getDeals: async () => {
        const q = query(collection(db, COLLECTION_NAME), orderBy("updatedAt", "desc"));
        const snapshot = await getDocs(q);
        let deals = [];
        snapshot.forEach((doc) => { deals.push({ id: doc.id, ...doc.data() }); });
        return deals.map(deal => Store.ensureDealStructure(deal));
    },
    getDeal: async (id) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? Store.ensureDealStructure({ id: docSnap.id, ...docSnap.data() }) : null;
    },
    saveDeal: async (deal) => {
        if (!deal.id) deal.id = Date.now().toString(36);
        await setDoc(doc(db, COLLECTION_NAME, deal.id), { ...deal, updatedAt: serverTimestamp() }, { merge: true });
    },
    deleteDeal: async (id) => { await deleteDoc(doc(db, COLLECTION_NAME, id)); },
    createEmptyDeal: () => ({
        id: null, currentStage: 'awareness', status: 'active', clientName: '', dealName: '',
        discovery: { awareness: {}, consideration: {}, evaluation: {}, purchase: {} },
        assessment: { awareness: { isCompleted: false }, consideration: { isCompleted: false } },
        competitive: { requirements: [], functionalRequirements: [] },
        solutionMapContent: {}, savedMaps: [], reports: [], updatedAt: new Date().toISOString(),
        decisionRisks: []
    }),
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
