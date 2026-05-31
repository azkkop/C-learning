const App = {
    currentProblemId: 0,
    solvedProblems: [],
    userCodes: {},
    mobileTab: 'problem',
    hintVisible: false,
    els: {}
};

function init() {
    applySiteBranding();
    cacheElements();
    loadStorage();
    parseStageFromUrl();
    renderTabs();
    loadProblem(App.currentProblemId);
    updateProgress();
    setupEditorEvents();
    setupActionEvents();
    setupMobileTabs();
    setupImportExport();
    registerServiceWorker();
    syncUrlStage();
}

function applySiteBranding() {
    document.title = `${SITE_CONFIG.name} — ${SITE_CONFIG.courses[0].name}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = SITE_CONFIG.description;
    const titleEl = document.getElementById('site-title');
    const taglineEl = document.getElementById('site-tagline');
    if (titleEl) titleEl.textContent = SITE_CONFIG.name;
    if (taglineEl) taglineEl.textContent = SITE_CONFIG.tagline;
}

function loadStorage() {
    const data = migrateLegacyStorage();
    App.solvedProblems = data.solved;
    App.userCodes = data.codes;
}

function cacheElements() {
    App.els = {
        problemTabs: document.getElementById('problem-tabs'),
        codeEditor: document.getElementById('code-editor'),
        lineNumbers: document.getElementById('line-numbers'),
        consoleLogs: document.getElementById('console-logs'),
        consoleIndicator: document.getElementById('console-indicator'),
        btnRun: document.getElementById('btn-run'),
        btnReset: document.getElementById('btn-reset'),
        btnFormat: document.getElementById('btn-format'),
        btnClear: document.getElementById('btn-clear'),
        btnHint: document.getElementById('btn-hint'),
        btnExport: document.getElementById('btn-export'),
        btnImport: document.getElementById('btn-import'),
        hintPanel: document.getElementById('hint-panel'),
        importInput: document.getElementById('import-input'),
        toast: document.getElementById('success-toast'),
        modalContainer: document.getElementById('modal-container'),
        modalTitle: document.getElementById('modal-title'),
        modalBody: document.getElementById('modal-body'),
        modalActions: document.getElementById('modal-actions')
    };
}

function parseStageFromUrl() {
    const stage = parseInt(new URLSearchParams(window.location.search).get('stage'), 10);
    if (!Number.isNaN(stage) && stage >= 1 && stage <= PROBLEMS.length) {
        App.currentProblemId = stage - 1;
    }
}

function syncUrlStage() {
    const url = new URL(window.location.href);
    url.searchParams.set('stage', String(App.currentProblemId + 1));
    window.history.replaceState({}, '', url);
}

function setMobileTab(tab) {
    App.mobileTab = tab;
    document.body.classList.remove('mobile-tab-problem', 'mobile-tab-code', 'mobile-tab-console');
    document.body.classList.add(`mobile-tab-${tab}`);
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
}

function setupMobileTabs() {
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => setMobileTab(btn.dataset.tab));
    });
    setMobileTab('problem');
}

function setupImportExport() {
    App.els.btnExport?.addEventListener('click', exportProgress);
    App.els.btnImport?.addEventListener('click', () => App.els.importInput?.click());
    App.els.importInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) importProgressFromFile(file);
        e.target.value = '';
    });
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
}

function renderTabs() {
    App.els.problemTabs.innerHTML = '';
    PROBLEMS.forEach((prob, index) => {
        const isSolved = App.solvedProblems.includes(prob.id);
        const isActive = index === App.currentProblemId;
        const tab = document.createElement('button');
        tab.className = `p-2 rounded border text-center transition flex flex-col items-center justify-center ${isActive ? 'bg-purple-900/40 border-purple-500 text-white shadow-md shadow-purple-500/10' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-white'}`;
        tab.innerHTML = `<span class="text-[9px] uppercase font-bold block ${isActive ? 'text-purple-300' : 'text-slate-500'}">${prob.num}</span><span class="text-[9px] font-bold ${isSolved ? 'text-emerald-400' : 'text-slate-600'}">${isSolved ? 'PASS' : 'READY'}</span>`;
        tab.addEventListener('click', () => {
            saveCurrentCode();
            App.currentProblemId = index;
            App.hintVisible = false;
            renderTabs();
            loadProblem(index);
            syncUrlStage();
        });
        App.els.problemTabs.appendChild(tab);
    });
}

function loadProblem(id) {
    const prob = PROBLEMS[id];
    document.getElementById('prob-num').textContent = prob.num;
    document.getElementById('prob-title').textContent = prob.title;
    document.getElementById('prob-desc').textContent = prob.desc;
    document.getElementById('prob-signature').textContent = prob.signature;

    const statusLabel = document.getElementById('prob-status');
    if (App.solvedProblems.includes(id)) {
        statusLabel.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400"></span> 검증 통과';
        statusLabel.className = 'text-xs text-emerald-400 flex items-center gap-1 font-semibold';
    } else {
        statusLabel.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span> 진행 대기';
        statusLabel.className = 'text-xs text-amber-400 flex items-center gap-1 font-semibold';
    }

    const paramsContainer = document.getElementById('prob-params');
    paramsContainer.innerHTML = '';
    prob.params.forEach(param => {
        const div = document.createElement('div');
        div.className = 'flex items-start gap-1.5 py-0.5 text-xs text-slate-300';
        div.innerHTML = `<span class="text-purple-400 font-bold">•</span> <span class="leading-normal">${param}</span>`;
        paramsContainer.appendChild(div);
    });

    document.getElementById('prob-rules').innerHTML = prob.rules;

    const testContainer = document.getElementById('prob-testcases');
    testContainer.innerHTML = '';
    prob.testcases.forEach(tc => {
        const item = document.createElement('div');
        item.className = 'bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800/80 text-[11px] text-slate-300 font-mono space-y-0.5';
        item.innerHTML = `<div class="truncate">입력: [ ${tc.inputs.map(i => `"${i}"`).join(', ')} ]</div><div class="text-slate-500">기대: ${tc.expected.map(e => `"${e}"`).join(', ')}</div>`;
        testContainer.appendChild(item);
    });

    const hint = STAGE_HINTS[id] || '';
    if (App.els.hintPanel) {
        App.els.hintPanel.textContent = hint;
        App.els.hintPanel.classList.toggle('hidden', !App.hintVisible || !hint);
    }

    setEditorCode(App.userCodes[id] || prob.boilerplate);
    clearConsole();
    appendLog(`// ${prob.num}: ${prob.title}`, 'text-slate-500');
    appendLog('// [F5] 실행 · [Tab] 들여쓰기 · 힌트 버튼으로 단계별 가이드 확인', 'text-slate-500');
}

function showModal(title, bodyText, actions) {
    App.els.modalTitle.textContent = title;
    App.els.modalBody.textContent = bodyText;
    App.els.modalActions.innerHTML = '';
    actions.forEach(act => {
        const btn = document.createElement('button');
        btn.className = `px-4 py-2 rounded-lg text-xs font-semibold transition ${act.primary ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`;
        btn.textContent = act.text;
        btn.addEventListener('click', () => { act.handler(); closeModal(); });
        App.els.modalActions.appendChild(btn);
    });
    App.els.modalContainer.className = 'fixed inset-0 bg-slate-950/80 flex items-center justify-center opacity-100 pointer-events-auto transition-all duration-200 z-50';
}

function getEditorCode() {
    return App.els.codeEditor.value;
}

function setEditorCode(code) {
    App.els.codeEditor.value = code;
    updateLineNumbers();
}

function updateLineNumbers() {
    const lines = App.els.codeEditor.value.split('\n');
    const count = Math.max(lines.length, 16);
    let numHtml = '';
    for (let i = 1; i <= count; i++) {
        numHtml += `${i}<br>`;
    }
    App.els.lineNumbers.innerHTML = numHtml;
}

function setupEditorEvents() {
    const codeEditor = App.els.codeEditor;

    codeEditor.addEventListener('input', () => {
        updateLineNumbers();
        saveCurrentCode();
    });

    codeEditor.addEventListener('scroll', () => {
        App.els.lineNumbers.scrollTop = codeEditor.scrollTop;
    });

    codeEditor.addEventListener('keydown', function (e) {
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const text = this.value;

        if (e.key === 'Tab') {
            e.preventDefault();
            this.value = text.substring(0, start) + '    ' + text.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
            updateLineNumbers();
            saveCurrentCode();
        }

        if (e.key === 'Enter') {
            const charBefore = text.charAt(start - 1);
            const charAfter = text.charAt(start);

            if (charBefore === '{' && charAfter === '}') {
                e.preventDefault();
                const lineStart = text.lastIndexOf('\n', start - 1) + 1;
                const currentLine = text.substring(lineStart, start);
                const match = currentLine.match(/^\s*/);
                const indent = match ? match[0] : '';
                const insertedText = '\n' + indent + '    \n' + indent;
                this.value = text.substring(0, start) + insertedText + text.substring(end);
                this.selectionStart = this.selectionEnd = start + indent.length + 5;
                updateLineNumbers();
                saveCurrentCode();
                return;
            }

            e.preventDefault();
            const lineStart = text.lastIndexOf('\n', start - 1) + 1;
            const currentLine = text.substring(lineStart, start);
            const match = currentLine.match(/^\s*/);
            const indent = match ? match[0] : '';
            const extraIndent = currentLine.trim().endsWith('{') ? '    ' : '';
            const insertedText = '\n' + indent + extraIndent;
            this.value = text.substring(0, start) + insertedText + text.substring(end);
            this.selectionStart = this.selectionEnd = start + insertedText.length;
            updateLineNumbers();
            saveCurrentCode();
        }

        if (e.key === 'F5') {
            e.preventDefault();
            setMobileTab('console');
            executeCode();
        }
    });
}

function autoFormatCode() {
    const raw = App.els.codeEditor.value;
    const lines = raw.split('\n');
    let formattedLines = [];
    let indentLevel = 0;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('}')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        formattedLines.push(trimmed === '' ? '' : '    '.repeat(indentLevel) + trimmed);
        if (trimmed.endsWith('{')) {
            indentLevel++;
        }
    });

    App.els.codeEditor.value = formattedLines.join('\n');
    updateLineNumbers();
    saveCurrentCode();
}

function closeModal() {
    App.els.modalContainer.className = 'fixed inset-0 bg-slate-950/80 flex items-center justify-center opacity-0 pointer-events-none transition-all duration-200 z-50';
}

function saveCurrentCode() {
    App.userCodes[App.currentProblemId] = getEditorCode();
    saveProgressToStorage();
}

function updateProgress() {
    const percent = Math.round((App.solvedProblems.length / PROBLEMS.length) * 100);
    document.getElementById('progress-text').textContent = `${App.solvedProblems.length} / ${PROBLEMS.length} (${percent}%)`;
    document.getElementById('progress-bar').style.width = `${percent}%`;
}

function setupActionEvents() {
    App.els.btnRun.addEventListener('click', () => { setMobileTab('console'); executeCode(); });
    App.els.btnReset.addEventListener('click', () => {
        showModal('코드 초기화', '보일러플레이트로 되돌리시겠습니까?', [
            { text: '취소', primary: false, handler: () => {} },
            { text: '초기화', primary: true, handler: () => {
                setEditorCode(PROBLEMS[App.currentProblemId].boilerplate);
                saveCurrentCode();
                clearConsole();
                appendLog('// 코드가 초기화되었습니다.', 'text-amber-400');
            }}
        ]);
    });
    App.els.btnFormat.addEventListener('click', () => {
        autoFormatCode();
        appendLog('[알림] 코드 자동 정렬 완료', 'text-emerald-400');
    });
    App.els.btnClear.addEventListener('click', clearConsole);
    App.els.btnHint?.addEventListener('click', () => {
        App.hintVisible = !App.hintVisible;
        if (App.els.hintPanel) {
            App.els.hintPanel.classList.toggle('hidden', !App.hintVisible);
        }
    });
}

function clearConsole() {
    App.els.consoleLogs.innerHTML = '';
    App.els.consoleIndicator.className = 'w-1.5 h-1.5 rounded-full bg-slate-500';
}

function appendLog(text, className = 'text-slate-300') {
    const div = document.createElement('div');
    div.className = className;
    div.innerHTML = text;
    App.els.consoleLogs.appendChild(div);
    App.els.consoleLogs.scrollTop = App.els.consoleLogs.scrollHeight;
}

function showToast() {
    App.els.toast.className = 'fixed bottom-20 lg:bottom-6 right-6 bg-emerald-600 text-white px-6 py-3.5 rounded-xl shadow-2xl shadow-emerald-950/50 flex items-center space-x-3 transform translate-y-0 opacity-100 transition-all duration-300 z-50';
    setTimeout(() => {
        App.els.toast.className = 'fixed bottom-20 lg:bottom-6 right-6 bg-emerald-600 text-white px-6 py-3.5 rounded-xl shadow-2xl shadow-emerald-950/50 flex items-center space-x-3 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none z-50';
    }, 3500);
}

window.addEventListener('load', init);
