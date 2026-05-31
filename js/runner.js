class VirtualConsole {
    constructor(inputs) {
        this.inputs = inputs;
        this.inputIdx = 0;
        this.stdout = [];
    }
    ReadLine() {
        if (this.inputIdx < this.inputs.length) {
            return this.inputs[this.inputIdx++];
        }
        return '';
    }
    WriteLine(msg) {
        this.stdout.push(String(msg));
    }
    Write(msg) {
        if (this.stdout.length === 0) {
            this.stdout.push(String(msg));
        } else {
            this.stdout[this.stdout.length - 1] += String(msg);
        }
    }
    Clear() {
        this.stdout = [];
    }
}

function setRunLoading(isLoading) {
    const overlay = document.getElementById('run-overlay');
    const btn = App.els.btnRun;
    if (!overlay) return;
    overlay.classList.toggle('hidden', !isLoading);
    overlay.classList.toggle('flex', isLoading);
    if (btn) {
        btn.disabled = isLoading;
        btn.classList.toggle('opacity-60', isLoading);
        btn.classList.toggle('cursor-wait', isLoading);
    }
}

function executeCode() {
    clearConsole();
    setRunLoading(true);
    App.els.consoleIndicator.className = 'w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse';
    appendLog('[에뮬레이터] C# 프로그램 컴파일 및 전처리 진행 중...', 'text-indigo-400 font-bold');

    setTimeout(() => {
        try {
            runAllTests();
        } finally {
            setRunLoading(false);
        }
    }, 120);
}

function runAllTests() {
    const rawCode = getEditorCode();
    const currentProblem = PROBLEMS[App.currentProblemId];

    try {
        const transpiled = transpileCSharpToJS(rawCode);
        const validation = validateTranspiled(transpiled, rawCode);

        if (!validation.ok) {
            throw new Error(`문법 변환 오류: ${validation.message}\n\n💡 C# 문자열 보간($"...")은 지원됩니다. foreach, switch, Random도 사용 가능합니다.`);
        }

        appendLog('[빌드 성공] 어휘 분석 및 가상 어셈블리 바인딩 완료.', 'text-slate-400');
        appendLog(`[테스트] 총 ${currentProblem.testcases.length}개의 가상 입력 스트림 시나리오 검출. 실행 돌입...\n`, 'text-slate-400');

        let allPassed = true;
        const runnerBody = getRuntimePreamble() + transpiled + '\nif(typeof Program !== "undefined" && Program.Main) { Program.Main([]); } else { throw new Error("Program 클래스 및 static void Main 진입점을 찾을 수 없습니다."); }';

        currentProblem.testcases.forEach((tc, idx) => {
            const vConsole = new VirtualConsole(tc.inputs);

            try {
                const programRunner = new Function('Console', runnerBody);
                programRunner(vConsole);
            } catch (runtimeErr) {
                allPassed = false;
                const hint = runtimeErr.stack ? `\n${runtimeErr.stack.split('\n').slice(0, 3).join('\n')}` : '';
                throw new Error(`런타임 에러 (시나리오 ${idx + 1}): ${runtimeErr.message}${hint}`);
            }

            const stdoutStr = vConsole.stdout.join('\n');
            let tcPassed = true;
            const missing = [];

            tc.expected.forEach(keyword => {
                if (!stdoutStr.includes(keyword)) {
                    tcPassed = false;
                    missing.push(keyword);
                }
            });

            if (tcPassed) {
                appendLog(`  <span class="text-emerald-400 font-bold">✔ Pass</span> | 테스트 시나리오 ${idx + 1} 통과`, 'text-slate-300');
                appendLog(`     <span class="text-slate-500">➔ 입력: [${tc.inputs.join(', ')}]</span>`, 'text-slate-500');
                vConsole.stdout.forEach(line => {
                    appendLog(`        <span class="text-emerald-300/80 font-mono">${escapeHtml(line)}</span>`, 'text-slate-400');
                });
            } else {
                allPassed = false;
                appendLog(`  <span class="text-rose-500 font-bold">✖ Fail</span> | 테스트 시나리오 ${idx + 1} 불합격`, 'text-slate-300');
                appendLog(`     <span class="text-rose-300">↳ 누락된 키워드: ${missing.map(k => `"${escapeHtml(k)}"`).join(', ')}</span>`, 'text-slate-300');
                if (vConsole.stdout.length === 0) {
                    appendLog('        <span class="text-slate-500 font-mono">(출력 없음)</span>', 'text-slate-400');
                } else {
                    vConsole.stdout.forEach(line => {
                        appendLog(`        <span class="text-rose-400/80 font-mono">${escapeHtml(line)}</span>`, 'text-slate-400');
                    });
                }
            }
            appendLog('<div class="border-b border-slate-800/50 my-2"></div>');
        });

        if (allPassed) {
            App.els.consoleIndicator.className = 'w-1.5 h-1.5 rounded-full bg-emerald-500';
            appendLog(`\n[인증 성공] ${currentProblem.num} 클리어!`, 'text-emerald-400 font-bold text-sm');

            if (!App.solvedProblems.includes(currentProblem.id)) {
                App.solvedProblems.push(currentProblem.id);
                saveProgressToStorage();
                updateProgress();
                renderTabs();
            }
            showToast();
        } else {
            App.els.consoleIndicator.className = 'w-1.5 h-1.5 rounded-full bg-rose-500';
            appendLog('\n[인증 실패] 출력 형식 또는 조건 분기를 다시 확인하세요.', 'text-rose-400 font-bold');
        }
    } catch (err) {
        App.els.consoleIndicator.className = 'w-1.5 h-1.5 rounded-full bg-red-600';
        appendLog('\n[빌드/실행 실패]', 'text-red-500 font-bold');
        appendLog(`<pre class="whitespace-pre-wrap text-xs">${escapeHtml(err.message)}</pre>`, 'text-red-300 bg-red-950/20 border border-red-900/30 p-3 rounded mt-1');
    }
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
