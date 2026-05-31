import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const ctx = { console, SITE_CONFIG: { defaultGradingMode: 'subsequence', runTimeoutMs: 5000 } };

function loadJs(relativePath) {
    let code = fs.readFileSync(path.join(root, relativePath), 'utf8').replace(/^\uFEFF/, '');
    code = code.replace(/^const\s+/gm, 'var ');
    vm.runInNewContext(code, ctx);
}

loadJs('js/config.js');
loadJs('js/problems.js');
loadJs('js/transpiler.js');
loadJs('js/grader.js');

const {
    PROBLEMS,
    SITE_CONFIG,
    gradeOutput,
    transpileCSharpToJS,
    validateTranspiled,
    getRuntimePreamble
} = ctx;

class VirtualConsole {
    constructor(inputs) {
        this.inputs = inputs;
        this.i = 0;
        this.stdout = [];
    }
    ReadLine() {
        return this.i < this.inputs.length ? this.inputs[this.i++] : '';
    }
    WriteLine(msg) {
        this.stdout.push(String(msg));
    }
    Write(msg) {
        if (!this.stdout.length) this.stdout.push(String(msg));
        else this.stdout[this.stdout.length - 1] += String(msg);
    }
    Clear() {
        this.stdout = [];
    }
}

function wrap(body) {
    return `using System;\npublic class Program {\npublic static void Main(string[] args) {\n${body}\n}\n}`;
}

function runCSharp(csharp, inputs) {
    const transpiled = transpileCSharpToJS(csharp);
    const validation = validateTranspiled(transpiled, csharp);
    if (!validation.ok) {
        throw new Error(`Transpile failed: ${validation.message.split('\n')[0]}`);
    }
    const runnerBody = getRuntimePreamble() + transpiled + '\nProgram.Main([]);';
    const console = new VirtualConsole(inputs);
    new Function('Console', runnerBody)(console);
    return console.stdout;
}

const REFERENCE_SOLUTIONS = [
    wrap(`
        for (int i = 0; i < 3; i++) {
            string id = Console.ReadLine();
            string pw = Console.ReadLine();
            if (id == "Taeun" && pw == "dwpw") { Console.WriteLine("로그인 성공"); return; }
        }
        Console.WriteLine("계정 잠금");
    `),
    wrap(`
        int hp = 100;
        while (hp > 0) {
            int dmg = int.Parse(Console.ReadLine());
            hp -= dmg;
            Console.WriteLine("남은 HP: " + hp);
        }
        Console.WriteLine("보스 격파 완료!");
    `),
    wrap(`
        int n = int.Parse(Console.ReadLine());
        int sum = 0;
        for (int i = 0; i < n; i++) sum += int.Parse(Console.ReadLine());
        double avg = (double)sum / n;
        Console.WriteLine("총합: " + sum);
        Console.WriteLine("평균: " + avg);
    `),
    wrap(`
        int stone = int.Parse(Console.ReadLine());
        int level = 1;
        while (true) {
            string cmd = Console.ReadLine();
            if (cmd != "1") continue;
            if (stone < level) { Console.WriteLine("강화석 부족. 최종단계: " + level); break; }
            stone -= level;
            Console.WriteLine(level + "단계 강화 성공");
            level++;
        }
    `),
    wrap(`
        int gold = int.Parse(Console.ReadLine());
        while (true) {
            int choice = int.Parse(Console.ReadLine());
            if (choice == 0) { Console.WriteLine("상점 종료. 최종 잔액: " + gold); break; }
            if (choice == 1) {
                if (gold >= 50) { gold -= 50; Console.WriteLine("남은 골드: " + gold); }
                else Console.WriteLine("골드 부족");
            } else if (choice == 2) {
                if (gold >= 30) { gold -= 30; Console.WriteLine("남은 골드: " + gold); }
                else Console.WriteLine("골드 부족");
            }
        }
    `),
    wrap(`
        int start = int.Parse(Console.ReadLine());
        int end = int.Parse(Console.ReadLine());
        for (int dan = start; dan <= end; dan++) {
            for (int mul = 1; mul <= 9; mul++) {
                Console.WriteLine(dan + " x " + mul + " = " + (dan * mul));
            }
        }
    `),
    wrap(`
        int fail = 0;
        while (fail < 3) {
            string pw = Console.ReadLine();
            if (pw == "dwpw") { Console.WriteLine("접속 승인"); return; }
            fail++;
            if (fail == 1) Console.WriteLine("첫 글자는 d");
            else if (fail == 2) Console.WriteLine("두 번째 글자는 w");
        }
        Console.WriteLine("시스템 경보 발동");
    `),
    wrap(`
        int x = 0, y = 0;
        while (true) {
            string dir = Console.ReadLine();
            if (dir == "Q" || dir == "q") {
                Console.WriteLine("탐색 종료. 최종 좌표: (" + x + ", " + y + ")");
                break;
            }
            if (dir == "W") y++;
            else if (dir == "S") y--;
            else if (dir == "A") x--;
            else if (dir == "D") x++;
            Console.WriteLine("현재 위치: (" + x + ", " + y + ")");
        }
    `),
    wrap(`
        int mana = 100, combo = 0;
        while (true) {
            int menu = int.Parse(Console.ReadLine());
            if (menu == 0) { Console.WriteLine("총 콤보 횟수: " + combo); break; }
            if (menu == 1) {
                if (mana >= 25) { mana -= 25; combo++; Console.WriteLine("콤보 성공. 남은 마나: " + mana); }
                else Console.WriteLine("스킬 시전 불가");
            } else if (menu == 2) {
                mana += 35;
                Console.WriteLine("콤보 성공. 남은 마나: " + mana);
            }
        }
    `),
    wrap(`
        int n = int.Parse(Console.ReadLine());
        for (int i = n; i >= 1; i--) {
            for (int j = 0; j < i; j++) Console.Write("*");
            Console.WriteLine("");
        }
    `),
    wrap(`
        int n = int.Parse(Console.ReadLine());
        int elite = 0;
        for (int i = 0; i < n; i++) {
            int score = int.Parse(Console.ReadLine());
            if (score >= 80) elite++;
        }
        Console.WriteLine("엘리트 몬스터: " + elite + "마리");
    `),
    wrap(`
        int[] inv = new int[4] { 10, 20, 30, 40 };
        while (true) {
            int a = int.Parse(Console.ReadLine());
            if (a == -1) break;
            int b = int.Parse(Console.ReadLine());
            if (a < 0 || a > 3 || b < 0 || b > 3) { Console.WriteLine("잘못된 인덱스"); continue; }
            int tmp = inv[a]; inv[a] = inv[b]; inv[b] = tmp;
            Console.WriteLine("스왑 완료");
        }
    `),
    wrap(`
        int gold = int.Parse(Console.ReadLine());
        int member = int.Parse(Console.ReadLine());
        while (member <= 0) {
            Console.WriteLine("분배 불가능. 다시 입력");
            member = int.Parse(Console.ReadLine());
        }
        Console.WriteLine("인당 분배 골드: " + (gold / member));
        Console.WriteLine("남은 골드: " + (gold % member));
    `),
    wrap(`
        int chances = 3;
        while (true) {
            string cmd = Console.ReadLine();
            if (cmd == "0") { Console.WriteLine("최종 확정"); break; }
            if (cmd == "1") {
                chances--;
                Console.WriteLine("남은 기회: " + chances);
                if (chances == 0) { Console.WriteLine("주사위 전부 소진"); break; }
            }
        }
    `),
    wrap(`
        int hp = int.Parse(Console.ReadLine());
        int heal = int.Parse(Console.ReadLine());
        for (int turn = 1; turn <= 5; turn++) {
            hp += heal + turn * 2;
            if (hp > 200) hp = 200;
            Console.WriteLine(turn + "턴 HP: " + hp);
        }
    `),
    wrap(`
        int remain = 100;
        while (remain > 0) {
            int hunt = int.Parse(Console.ReadLine());
            remain -= hunt;
            if (remain <= 0) { Console.WriteLine("퀘스트 성공!"); break; }
            Console.WriteLine("잔여 목표: " + remain + "/100");
        }
    `),
    wrap(`
        int[] enemyDist = new int[3] { 50, 80, 30 };
        while (true) {
            int idx = int.Parse(Console.ReadLine());
            if (idx == -1) break;
            int dist = int.Parse(Console.ReadLine());
            int minIdx = 0;
            for (int i = 1; i < 3; i++) {
                if (enemyDist[i] < enemyDist[minIdx]) minIdx = i;
            }
            Console.WriteLine("가장 가까운 적: " + minIdx + "번");
            enemyDist[idx] = dist;
        }
    `),
    wrap(`
        while (true) {
            int wood = int.Parse(Console.ReadLine());
            int iron = int.Parse(Console.ReadLine());
            if (wood >= 3 && iron >= 2) { Console.WriteLine("장비 제작 성공!"); break; }
            Console.WriteLine("제작 불가. 재료 부족");
        }
    `),
    wrap(`
        int n = int.Parse(Console.ReadLine());
        int a = 1, b = 1;
        for (int i = 0; i < n; i++) {
            if (i == 0) Console.Write("1");
            else if (i == 1) Console.Write(", 1");
            else {
                int c = a + b;
                Console.Write(", " + c);
                a = b; b = c;
            }
        }
        Console.WriteLine("");
    `),
    wrap(`
        int room = 1, gold = 0;
        while (room < 3) {
            int door = int.Parse(Console.ReadLine());
            if (door == 1) { room++; gold += 10; Console.WriteLine("방 전진 완료"); }
            else if (door == 2) { gold -= 5; Console.WriteLine("함정 발동 패널티"); }
        }
        Console.WriteLine("탈출 성공. 총 골드: " + gold + "G");
    `)
];

let failures = 0;

function assert(name, condition, detail = '') {
    if (condition) {
        console.log(`PASS  ${name}`);
    } else {
        console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
        failures++;
    }
}

// --- Grader unit tests ---
assert('grader subsequence allows extra lines', gradeOutput(
    ['debug', '총합: 155', 'extra', '평균: 77.5'],
    { expected: ['총합: 155', '평균: 77.5'], mode: 'subsequence' }
).passed);

assert('grader lines rejects extra output', !gradeOutput(
    ['****', '***', '**', '*', 'oops'],
    { expected: ['****', '***', '**', '*'], mode: 'lines' }
).passed);

assert('grader numeric tolerance', gradeOutput(
    ['평균: 77.50000000000001'],
    { expected: ['평균: 77.5'], mode: 'subsequence' }
).passed);

assert('grader trim whitespace', gradeOutput(
    ['  로그인 성공  '],
    { expected: ['로그인 성공'], mode: 'subsequence' }
).passed);

// --- Transpiler smoke tests ---
const transpilerCases = [
    ['comment dollar', wrap('// note $" here\nConsole.WriteLine("ok");'), [], 'ok'],
    ['double cast', wrap('Console.WriteLine((double)10/3);'), [], '3.333'],
    ['interpolation', wrap('Console.WriteLine($"x={1+2}");'), [], 'x=3']
];

for (const [name, code, inputs, expect] of transpilerCases) {
    try {
        const out = runCSharp(code, inputs).join('\n');
        assert(`transpiler ${name}`, out.includes(expect), out);
    } catch (err) {
        assert(`transpiler ${name}`, false, err.message);
    }
}

// --- All stage reference solutions ---
PROBLEMS.forEach((problem, index) => {
    const solution = REFERENCE_SOLUTIONS[index];
    if (!solution) {
        assert(`reference solution exists for ${problem.num}`, false);
        return;
    }

    problem.testcases.forEach((tc, tcIndex) => {
        try {
            const stdout = runCSharp(solution, tc.inputs);
            const grade = gradeOutput(stdout, tc, { defaultMode: problem.grading || SITE_CONFIG.defaultGradingMode });
            assert(`${problem.num} testcase ${tcIndex + 1}`, grade.passed, grade.missing.join(', '));
        } catch (err) {
            assert(`${problem.num} testcase ${tcIndex + 1}`, false, err.message);
        }
    });
});

if (failures > 0) {
    console.log(`\n${failures} test(s) failed.`);
    process.exit(1);
}

console.log('\nAll regression tests passed.');
