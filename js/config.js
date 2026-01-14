
export const STAGE_DEFINITIONS = {
    awareness: { id: 'awareness', label: '1. 인식 (Awareness)', keyQuestion: '이 딜을 더 볼 가치가 있는가?', nextStage: 'consideration' },
    consideration: { id: 'consideration', label: '2. 고려 (Consideration)', keyQuestion: '리소스를 써도 되는가?', nextStage: 'evaluation' },
    evaluation: { id: 'evaluation', label: '3. 평가 (Evaluation)', keyQuestion: '왜 우리가 이길 수 있는가?', nextStage: 'purchase' },
    purchase: { id: 'purchase', label: '4. 구매 (Purchase)', keyQuestion: '어떻게 이길 것인가?', nextStage: null }
};

export const FUNCTION_ACCESS_MATRIX = {
    dashboard: { awareness: 'view', consideration: 'view', evaluation: 'view', purchase: 'view' },
    discovery: { awareness: 'edit', consideration: 'edit', evaluation: 'edit', purchase: 'edit' },
    assessment: { awareness: 'hide', consideration: 'edit', evaluation: 'view', purchase: 'hide' },
    solutionMap: { awareness: 'hide', consideration: 'edit', evaluation: 'edit', purchase: 'view' },
    competitive: { awareness: 'hide', consideration: 'hide', evaluation: 'edit', purchase: 'view' },
    strategy: { awareness: 'hide', consideration: 'hide', evaluation: 'edit', purchase: 'edit' },
    reports: { awareness: 'view', consideration: 'view', evaluation: 'edit', purchase: 'view' }
};

export const MENU_ITEMS = [
    { id: 'dashboard', label: 'Stage Focus', icon: 'fa-solid fa-bullseye' },
    { id: 'discovery', label: 'Discovery', icon: 'fa-regular fa-compass' },
    { id: 'assessment', label: 'Deal Qualification', icon: 'fa-solid fa-chart-pie' },
    { id: 'solutionMap', label: 'Solution Map', icon: 'fa-solid fa-map-location-dot' },
    { id: 'competitive', label: 'Competitive Fit', icon: 'fa-solid fa-trophy' },
    { id: 'strategy', label: 'Win Strategy', icon: 'fa-solid fa-chess-queen' },
    { id: 'reports', label: 'Reports', icon: 'fa-solid fa-folder-open' }
];

export const ASSESSMENT_CONFIG = {
    biz: {
        categories: [
            { id: 'budget', label: '예산', items: ['예산 존재 여부', '예산 적합성'], defaultWeight: 20 },
            { id: 'authority', label: '권한', items: ['의사결정권자 접근성', '내부 지지자 파워'], defaultWeight: 25 },
            { id: 'need', label: '니즈', items: ['문제 적합성', '도입 필요성'], defaultWeight: 35 },
            { id: 'timeline', label: '일정', items: ['의사결정 타임라인 명확성', '도입 용이성'], defaultWeight: 20 }
        ]
    },
    tech: {
        categories: [
            { id: 'req', label: '요구사항 적합성', items: ['필수 요구사항 충족도', '유스케이스 적합성'], defaultWeight: 30 },
            { id: 'arch', label: '아키텍처', items: ['호환성', '보안 준수'], defaultWeight: 25 },
            { id: 'ops', label: '운영 가능성', items: ['구현 난이도', '유지보수'], defaultWeight: 20 }
        ]
    }
};
export const DISCOVERY_STAGES = Object.values(STAGE_DEFINITIONS).map(s => ({ id: s.id, label: s.label, iconStyle: 'bg-slate-50 text-slate-600' }));
