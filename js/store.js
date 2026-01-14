
import { db } from './firebase-config.js';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp, writeBatch } from "firebase/firestore";

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
        solutionMapContent: {}, savedMaps: [], reports: [], updatedAt: new Date().toISOString()
    }),
    ensureDealStructure: (deal) => {
        const template = Store.createEmptyDeal();
        return { ...template, ...deal };
    },
    getMapContent: async (id) => { const deal = await Store.getDeal(id); return deal?.solutionMapContent || {}; },
    saveMapContent: async (id, content) => { const deal = await Store.getDeal(id); if (deal) { deal.solutionMapContent = content; await Store.saveDeal(deal); } },
    addReport: async (id, title, contentHTML, type) => {
        const deal = await Store.getDeal(id);
        if (deal) {
            if (!deal.reports) deal.reports = [];
            deal.reports.push({ id: Date.now().toString(36), title, contentHTML, type, createdAt: Date.now() });
            await Store.saveDeal(deal);
        }
    }
};
