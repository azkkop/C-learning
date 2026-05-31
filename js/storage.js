function migrateLegacyStorage() {
    const keys = SITE_CONFIG.storageKeys;
    const legacy = SITE_CONFIG.legacyKeys;

    let solved = JSON.parse(localStorage.getItem(keys.solved) || 'null');
    let codes = JSON.parse(localStorage.getItem(keys.codes) || 'null');

    if (solved === null) {
        const oldSolved = JSON.parse(localStorage.getItem(legacy.solved) || '[]');
        if (oldSolved.length > 0) {
            localStorage.setItem(keys.solved, JSON.stringify(oldSolved));
            solved = oldSolved;
        } else {
            solved = [];
        }
    }

    if (codes === null) {
        const oldCodes = JSON.parse(localStorage.getItem(legacy.codes) || 'null');
        if (oldCodes && Object.keys(oldCodes).length > 0) {
            localStorage.setItem(keys.codes, JSON.stringify(oldCodes));
            codes = oldCodes;
        } else {
            codes = {};
        }
    }

    return { solved, codes };
}

function saveProgressToStorage() {
    localStorage.setItem(SITE_CONFIG.storageKeys.solved, JSON.stringify(App.solvedProblems));
    localStorage.setItem(SITE_CONFIG.storageKeys.codes, JSON.stringify(App.userCodes));
}

function exportProgress() {
    const payload = {
        app: SITE_CONFIG.name,
        version: SITE_CONFIG.version,
        exportedAt: new Date().toISOString(),
        course: SITE_CONFIG.courses[0].id,
        solved: App.solvedProblems,
        codes: App.userCodes
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codexam-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    appendLog('[백업] 학습 진행 데이터를 JSON 파일로 내보냈습니다.', 'text-emerald-400');
}

function importProgressFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data.solved) || typeof data.codes !== 'object') {
                throw new Error('올바른 CodeExam 백업 파일이 아닙니다.');
            }
            App.solvedProblems = data.solved.filter(id => id >= 0 && id < PROBLEMS.length);
            App.userCodes = data.codes;
            saveProgressToStorage();
            renderTabs();
            loadProblem(App.currentProblemId);
            updateProgress();
            appendLog(`[복원] ${data.exportedAt || '백업'} 데이터를 불러왔습니다.`, 'text-emerald-400');
            showToast();
        } catch (err) {
            showModal('가져오기 실패', err.message, [{ text: '확인', primary: true, handler: () => {} }]);
        }
    };
    reader.readAsText(file);
}
