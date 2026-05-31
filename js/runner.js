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

function buildRunnerBody(transpiled) {
    return getRuntimePreamble() + transpiled + '\nif(typeof Program !== "undefined" && Program.Main) { Program.Main([]); } else { throw new Error("Program 클래스 및 static void Main 진입점을 찾을 수 없습니다."); }';
}

function runProgramSync(runnerBody, inputs) {
    const vConsole = new VirtualConsole(inputs);
    const programRunner = new Function('Console', runnerBody);
    programRunner(vConsole);
    return { ok: true, stdout: vConsole.stdout };
}

function runProgramWithTimeout(runnerBody, inputs, timeoutMs) {
    if (typeof Worker === 'undefined') {
        return Promise.resolve(runProgramSync(runnerBody, inputs));
    }

    return new Promise((resolve, reject) => {
        let settled = false;
        let worker;

        const finish = (handler) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (worker) worker.terminate();
            handler();
        };

        const timer = setTimeout(() => {
            finish(() => {
                reject(new Error(`실행 시간 초과 (${Math.round(timeoutMs / 1000)}초). 무한 루프·break 누락·ReadLine 대기를 확인하세요.`));
            });
        }, timeoutMs);

        try {
            worker = new Worker('/js/exec-worker.js');
        } catch (err) {
            finish(() => resolve(runProgramSync(runnerBody, inputs)));
            return;
        }

        worker.onmessage = (event) => {
            const data = event.data;
            finish(() => {
                if (data.ok) {
                    resolve({ ok: true, stdout: data.stdout });
                } else {
                    reject(new Error(data.error || '런타임 에러'));
                }
            });
        };

        worker.onerror = (event) => {
            finish(() => reject(new Error(event.message || 'Worker 실행 오류')));
        };

        worker.postMessage({ runnerBody, inputs });
    });
}

function setRunLoading(isLoading, message) {
    const overlay = document.getElementById('run-overlay');
    const btnRun = App.els.btnRun;
    const btnRunOnly = App.els.btnRunOnly;
    const overlayText = overlay?.querySelector('span');

    if (overlayText && message) {
        overlayText.textContent = message;
    } else if (overlayText) {
        overlayText.textContent = '컴파일 및 테스트 실행 중...';
    }

    if (!overlay) return;
    overlay.classList.toggle('hidden', !isLoading);
    overlay.classList.toggle('flex', isLoading);

    [btnRun, btnRunOnly].forEach(btn => {
        if (!btn) return;
        btn.disabled = isLoading;
        btn.classList.toggle('opacity-60', isLoading);
        btn.classList.toggle('cursor-wait', isLoading);
    });
}

function prepareExecution(rawCode) {
    const transpiled = transpileCSharpToJS(rawCode);
    const validation = validateTranspiled(transpiled, rawCode);
    if (!validation.ok) {
        throw new Error(`문법 변환 오류: ${validation.message}\n\n💡 C# 문자열 보간($"...")은 지원됩니다. foreach, switch, Random도 사용 가능합니다.`);
    }
    return {
        transpiled,
        runnerBody: buildRunnerBody(transpiled)
    };
}

function getRunOnlyInputs() {
    const raw = App.els.runOnlyInput?.value ?? '';
    if (raw.trim() === '') return [];
    return raw.split(/\r?\n/);
}

function executeCode() {
    clearConsole();
    setRunLoading(true, '채점 테스트 실행 중...');
    App.els.consoleIndicator.className = 'w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse';
    appendLog('[에뮬레이터] C# 프로그램 컴파일 및 전처리 진행 중...', 'text-indigo-400 font-bold');

    setTimeout(() => {
        runAllTests().finally(() => setRunLoading(false));
    }, 80);
}

function executeRunOnly() {
    clearConsole();
    setRunLoading(true, '사용자 입력으로 실행 중...');
    App.els.consoleIndicator.className = 'w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse';
    appendLog('[실행만] 테스트 채점 없이 프로그램을 실행합니다.', 'text-indigo-400 font-bold');

    setTimeout(() => {
        runOnlyProgram().finally(() => setRunLoading(false));
    }, 80);
}

async function runOnlyProgram() {
    const rawCode = getEditorCode();
    const inputs = getRunOnlyInputs();

    try {
        const { runnerBody } = prepareExecution(rawCode);
        appendLog('[빌드 성공] 사용자 입력 스트림으로 실행합니다.', 'text-slate-400');
        appendLog(`[입력] ${inputs.length ? `[ ${inputs.map(v => `"${v}"`).join(', ')} ]` : '(입력 없음 — ReadLine()은 빈 문자열 반환)'}`, 'text-slate-500');

        const result = await runProgramWithTimeout(runnerBody, inputs, SITE_CONFIG.runTimeoutMs);
        App.els.consoleIndicator.className = 'w-1.5 h-1.5 rounded-full bg-emerald-500';
        appendLog('\n[출력]', 'text-emerald-400 font-bold');

        if (!result.stdout.length) {
            appendLog('        <span class="text-slate-500 font-mono">(출력 없음)</span>', 'text-slate-400');
        } else {
            result.stdout.forEach(line => {
                appendLog(`        <span class="text-emerald-300/90 font-mono">${escapeHtml(line)}</span>`, 'text-slate-400');
            });
        }
    } catch (err) {
        App.els.consoleIndicator.className = 'w-1.5 h-1.5 rounded-full bg-red-600';
        appendLog('\n[실행 실패]', 'text-red-500 font-bold');
        appendLog(`<pre class="whitespace-pre-wrap text-xs">${escapeHtml(err.message)}</pre>`, 'text-red-300 bg-red-950/20 border border-red-900/30 p-3 rounded mt-1');
    }
}

async function runAllTests() {
    const rawCode = getEditorCode();
    const currentProblem = PROBLEMS[App.currentProblemId];
    const gradingMode = currentProblem.grading || SITE_CONFIG.defaultGradingMode;

    try {
        const { runnerBody } = prepareExecution(rawCode);

        appendLog('[빌드 성공] 어휘 분석 및 가상 어셈블리 바인딩 완료.', 'text-slate-400');
        appendLog(`[채점] ${formatGradingModeLabel(gradingMode)} · ${currentProblem.testcases.length}개 시나리오\n`, 'text-slate-400');

        let allPassed = true;

        for (let idx = 0; idx < currentProblem.testcases.length; idx++) {
            const tc = currentProblem.testcases[idx];
            let result;

            try {
                result = await runProgramWithTimeout(runnerBody, tc.inputs, SITE_CONFIG.runTimeoutMs);
            } catch (runtimeErr) {
                allPassed = false;
                appendLog(`  <span class="text-rose-500 font-bold">✖ Error</span> | 테스트 시나리오 ${idx + 1}`, 'text-slate-300');
                appendLog(`     <span class="text-rose-300">${escapeHtml(runtimeErr.message)}</span>`, 'text-slate-300');
                appendLog('<div class="border-b border-slate-800/50 my-2"></div>');
                continue;
            }

            const grade = gradeOutput(result.stdout, tc, { defaultMode: gradingMode });

            if (grade.passed) {
                appendLog(`  <span class="text-emerald-400 font-bold">✔ Pass</span> | 테스트 시나리오 ${idx + 1} 통과`, 'text-slate-300');
                appendLog(`     <span class="text-slate-500">➔ 입력: [${tc.inputs.join(', ')}]</span>`, 'text-slate-500');
                grade.actualLines.forEach(line => {
                    appendLog(`        <span class="text-emerald-300/80 font-mono">${escapeHtml(line)}</span>`, 'text-slate-400');
                });
            } else {
                allPassed = false;
                appendLog(`  <span class="text-rose-500 font-bold">✖ Fail</span> | 테스트 시나리오 ${idx + 1} 불합격`, 'text-slate-300');
                appendLog(`     <span class="text-rose-300">↳ 누락: ${grade.missing.map(k => `"${escapeHtml(k)}"`).join(', ')}</span>`, 'text-slate-300');
                if (grade.actualLines.length === 0) {
                    appendLog('        <span class="text-slate-500 font-mono">(출력 없음)</span>', 'text-slate-400');
                } else {
                    grade.actualLines.forEach(line => {
                        appendLog(`        <span class="text-rose-400/80 font-mono">${escapeHtml(line)}</span>`, 'text-slate-400');
                    });
                }
            }
            appendLog('<div class="border-b border-slate-800/50 my-2"></div>');
        }

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
