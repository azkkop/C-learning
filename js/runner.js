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
        return "";
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

function executeCode() {
    clearConsole();
    App.els.consoleIndicator.className = "w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse";
    appendLog(`[에뮬레이터] C# 프로그램 컴파일 및 전처리 진행 중...`, "text-indigo-400 font-bold");

    const rawCode = App.els.codeEditor.value;
    const currentProblem = PROBLEMS[App.currentProblemId];

    try {
        const transpiled = transpileCSharpToJS(rawCode);

        appendLog(`[빌드 성공] 어휘 분석 및 가상 어셈블리 바인딩 완료.`, "text-slate-400");
        appendLog(`[테스트] 총 ${currentProblem.testcases.length}개의 가상 입력 스트림 시나리오 검출. 실행 돌입...\n`, "text-slate-400");

        let allPassed = true;

        currentProblem.testcases.forEach((tc, idx) => {
            const vConsole = new VirtualConsole(tc.inputs);

            try {
                const programRunner = new Function('Console', transpiled + '\nif(typeof Program !== "undefined" && Program.Main) { Program.Main([]); } else { throw new Error("Program 클래스 및 static void Main 진입점을 찾을 수 없습니다."); }');
                programRunner(vConsole);
            } catch (runtimeErr) {
                allPassed = false;
                throw new Error(`런타임 에러 (시나리오 ${idx + 1} 실행 중): ${runtimeErr.message}`);
            }

            const stdoutStr = vConsole.stdout.join("\n");
            let tcPassed = true;

            tc.expected.forEach(keyword => {
                if (!stdoutStr.includes(keyword)) {
                    tcPassed = false;
                }
            });

            if (tcPassed) {
                appendLog(`  <span class="text-emerald-400 font-bold">✔ Pass</span> | 테스트 시나리오 ${idx + 1} 통과`, "text-slate-300");
                appendLog(`     <span class="text-slate-500">➔ 입력 수순: [${tc.inputs.join(", ")}]</span>`, "text-slate-500");
                appendLog(`     <span class="text-slate-400">➔ 모의 콘솔 출력 결과:</span>`, "text-slate-400");
                vConsole.stdout.forEach(line => {
                    appendLog(`        <span class="text-emerald-300/80 font-mono">${line}</span>`, "text-slate-400");
                });
            } else {
                allPassed = false;
                appendLog(`  <span class="text-rose-500 font-bold">✖ Fail</span> | 테스트 시나리오 ${idx + 1} 불합격`, "text-slate-300");
                appendLog(`     <span class="text-rose-300">↳ 요구되는 핵심 키워드: <strong>"${tc.expected.join(", ")}"</strong>가 콘솔 출력 결과에 확인되지 않았습니다.</span>`, "text-slate-300");
                appendLog(`     <span class="text-slate-400">➔ 실제 모의 콘솔 출력 결과:</span>`, "text-slate-400");
                if (vConsole.stdout.length === 0) {
                    appendLog(`        <span class="text-slate-500 font-mono">(출력된 내용이 없습니다)</span>`, "text-slate-400");
                } else {
                    vConsole.stdout.forEach(line => {
                        appendLog(`        <span class="text-rose-400/80 font-mono">${line}</span>`, "text-slate-400");
                    });
                }
            }
            appendLog(`<div class="border-b border-slate-800/50 my-2"></div>`);
        });

        if (allPassed) {
            App.els.consoleIndicator.className = "w-1.5 h-1.5 rounded-full bg-emerald-500";
            appendLog(`\n[인증 성공] 축하합니다! ${currentProblem.num} 단계를 완벽히 클리어했습니다.`, "text-emerald-400 font-bold text-sm animate-bounce");

            if (!App.solvedProblems.includes(currentProblem.id)) {
                App.solvedProblems.push(currentProblem.id);
                localStorage.setItem('taeun_solved_pro', JSON.stringify(App.solvedProblems));
                updateProgress();
                renderTabs();
            }
            showToast();
        } else {
            App.els.consoleIndicator.className = "w-1.5 h-1.5 rounded-full bg-rose-500";
            appendLog(`\n[인증 실패] 오답이 검출되었습니다. 요구 출력 양식이나 조건 분기 처리를 정교하게 다시 점검해 주세요.`, "text-rose-400 font-bold");
        }

    } catch (err) {
        App.els.consoleIndicator.className = "w-1.5 h-1.5 rounded-full bg-red-600";
        appendLog(`\n[빌드 실패] 에러 리포트:`, "text-red-500 font-bold");
        appendLog(`${err.message}`, "text-red-300 bg-red-950/20 border border-red-900/30 p-3 rounded mt-1");
    }
}
