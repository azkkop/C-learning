function normalizeOutputLines(stdout) {
    const joined = Array.isArray(stdout) ? stdout.join('\n') : String(stdout);
    const lines = joined.split('\n').map(line => line.trim());
    while (lines.length && lines[lines.length - 1] === '') {
        lines.pop();
    }
    return lines;
}

function parseLabeledNumber(line) {
    const match = String(line).trim().match(/^(.+?[:\s])(-?\d+(?:\.\d+)?)\s*$/);
    if (!match) return null;
    return { prefix: match[1], value: parseFloat(match[2]) };
}

function linesMatch(actual, expected) {
    const a = String(actual).trim();
    const e = String(expected).trim();
    if (a === e) return true;

    const expNum = parseLabeledNumber(e);
    const actNum = parseLabeledNumber(a);
    if (expNum && actNum && expNum.prefix === actNum.prefix) {
        return Math.abs(expNum.value - actNum.value) < 1e-6;
    }

    return false;
}

function gradeOutput(stdout, tc, options) {
    const opts = options || {};
    const mode = tc.mode || opts.defaultMode || SITE_CONFIG.defaultGradingMode || 'subsequence';
    const lines = normalizeOutputLines(stdout);
    const expected = tc.expected || [];
    const text = lines.join('\n');

    if (mode === 'includes') {
        const missing = expected.filter(keyword => !text.includes(keyword));
        return {
            passed: missing.length === 0,
            missing,
            actualLines: lines,
            mode
        };
    }

    if (mode === 'lines') {
        const missing = [];
        expected.forEach((exp, index) => {
            if (!lines[index] || !linesMatch(lines[index], exp)) {
                missing.push(exp);
            }
        });
        const lengthMismatch = lines.length !== expected.length;
        return {
            passed: missing.length === 0 && !lengthMismatch,
            missing: lengthMismatch && missing.length === 0
                ? [`(출력 ${lines.length}줄, 기대 ${expected.length}줄)`]
                : missing,
            actualLines: lines,
            mode,
            lengthMismatch
        };
    }

    let lineIdx = 0;
    const missing = [];
    for (const exp of expected) {
        let found = false;
        while (lineIdx < lines.length) {
            if (linesMatch(lines[lineIdx], exp)) {
                found = true;
                lineIdx++;
                break;
            }
            lineIdx++;
        }
        if (!found) missing.push(exp);
    }

    return {
        passed: missing.length === 0,
        missing,
        actualLines: lines,
        mode
    };
}

function formatGradingModeLabel(mode) {
    const labels = {
        includes: '키워드 포함',
        subsequence: '순서 일치',
        lines: '줄 단위 정확'
    };
    return labels[mode] || mode;
}
