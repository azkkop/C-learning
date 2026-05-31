function skipStringLiteral(code, i, quote) {
    i++;
    while (i < code.length) {
        if (code[i] === '\\' && i + 1 < code.length) {
            i += 2;
            continue;
        }
        if (code[i] === quote) return i + 1;
        i++;
    }
    return code.length;
}

function convertInterpolatedBody(code, start, verbatim) {
    let out = '`';
    let i = start;

    while (i < code.length) {
        if (verbatim && code[i] === '"' && code[i + 1] === '"') {
            i += 2;
            out += '`';
            return { out, end: i };
        }
        if (!verbatim && code[i] === '\\' && i + 1 < code.length) {
            out += code[i] + code[i + 1];
            i += 2;
            continue;
        }
        if (!verbatim && code[i] === '"') {
            i++;
            out += '`';
            return { out, end: i };
        }

        if (code[i] === '{' && code[i + 1] === '{') {
            out += '{';
            i += 2;
            continue;
        }
        if (code[i] === '}' && code[i + 1] === '}') {
            out += '}';
            i += 2;
            continue;
        }
        if (code[i] === '{') {
            let j = i + 1;
            let depth = 1;
            while (j < code.length && depth > 0) {
                if (code[j] === '{') depth++;
                else if (code[j] === '}') depth--;
                j++;
            }
            if (depth === 0) {
                const inner = code.substring(i + 1, j - 1);
                const expr = inner.split(':')[0].split(',')[0].trim();
                out += '${' + expr + '}';
                i = j;
                continue;
            }
        }

        out += code[i];
        i++;
    }

    out += '`';
    return { out, end: i };
}

function transpileInterpolatedStrings(code) {
    let out = '';
    let i = 0;

    while (i < code.length) {
        if (code[i] === '/' && code[i + 1] === '/') {
            const start = i;
            i += 2;
            while (i < code.length && code[i] !== '\n') i++;
            out += code.substring(start, i);
            continue;
        }

        if (code[i] === '/' && code[i + 1] === '*') {
            const start = i;
            i += 2;
            while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) i++;
            i = Math.min(i + 2, code.length);
            out += code.substring(start, i);
            continue;
        }

        if (code[i] === '"' || code[i] === "'") {
            const start = i;
            i = skipStringLiteral(code, i, code[start]);
            out += code.substring(start, i);
            continue;
        }

        const isVerbatimInterp = (code[i] === '$' && code[i + 1] === '@' && code[i + 2] === '"') ||
            (code[i] === '@' && code[i + 1] === '$' && code[i + 2] === '"');
        const isInterp = code[i] === '$' && code[i + 1] === '"';

        if (isInterp || isVerbatimInterp) {
            const verbatim = isVerbatimInterp;
            i += verbatim ? 3 : 2;
            const converted = convertInterpolatedBody(code, i, verbatim);
            out += converted.out;
            i = converted.end;
            continue;
        }

        out += code[i];
        i++;
    }

    return out;
}

function transpileCSharpToJS(code) {
    let js = code;

    js = transpileInterpolatedStrings(js);

    js = js.replace(/^\s*using\s+[^;]+;\s*$/gm, '');

    js = js.replace(/\bnamespace\s+[\w.]+\s*\{/g, '');
    js = js.replace(/\bpublic\s+class\s+Program\b/g, 'class Program');
    js = js.replace(/\bclass\s+Program\b/g, 'class Program');

    js = js.replace(/\bpublic\s+static\s+void\s+Main\s*\(\s*string\s*\[\s*\]\s*[a-zA-Z0-9_]+\s*\)/g, 'static Main(args)');
    js = js.replace(/\bstatic\s+void\s+Main\s*\(\s*string\s*\[\s*\]\s*[a-zA-Z0-9_]+\s*\)/g, 'static Main(args)');

    js = js.replace(/\bforeach\s*\(\s*(?:var|int|float|double|string|bool)\s+(\w+)\s+in\s+(\w+)\s*\)/g, 'for (const $1 of $2)');

    js = js.replace(/\bRandom\s+(\w+)\s*=/g, 'let $1 =');

    js = js.replace(/\bstatic\s+(?:void|int|float|double|string|bool)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g, (_, name, args) => {
        const cleanedArgs = args.split(',').map(a => a.trim().split(/\s+/).pop()).filter(Boolean).join(', ');
        return `static ${name}(${cleanedArgs})`;
    });

    js = js.replace(/\(\s*(?:float|double|decimal)\s*\)/g, '');

    js = js.replace(/\(\s*int\s*\)\s*(\([^)]+\)|[\w.]+)/g, 'Math.trunc($1)');

    const csTypes = ['int', 'float', 'double', 'bool', 'string', 'var', 'decimal'];
    csTypes.forEach(type => {
        const regex = new RegExp(`\\b${type}\\s+([a-zA-Z0-9_]+)\\b`, 'g');
        js = js.replace(regex, (_, name) => `let ${name}`);
    });

    js = js.replace(/(?:int|float|double|string|bool)\[\s*\]\s*([a-zA-Z0-9_]+)\s*=\s*new\s+(?:int|float|double|string|bool)\[\s*\d*\s*\]\s*\{([^}]*)\}/g, (_, name, values) => `let ${name} = [${values}]`);
    js = js.replace(/(?:int|float|double|string|bool)\[\s*\]\s*([a-zA-Z0-9_]+)\s*=\s*new\s+(?:int|float|double|string|bool)\[\s*([^\]]*)\s*\]/g, (_, name, size) => {
        return `let ${name} = new Array(${size.trim() || 0}).fill(0)`;
    });

    js = js.replace(/(\w+)\.Length\b/g, (_, name) => `${name}.length`);
    js = js.replace(/(?:int|float|double|Convert)\.Parse\b/g, 'Number');
    js = js.replace(/Convert\.ToInt32\b/g, 'Math.trunc');
    js = js.replace(/Convert\.ToDouble\b/g, 'Number');
    js = js.replace(/Console\.Clear\(\)/g, 'Console.Clear()');

    js = js.replace(/(\d+(\.\d+)?)[fF]\b/g, (_, num) => num);
    js = js.replace(/(\d+(\.\d+)?)[dD]\b/g, (_, num) => num);

    js = js.replace(/Math\.(Max|Min|Abs|Round|Floor|Ceiling)\b/g, (_, fn) => {
        const map = { Ceiling: 'ceil' };
        return `Math.${map[fn] || fn.toLowerCase()}`;
    });

    js = js.replace(/\bpublic\b/g, '');
    js = js.replace(/\bprivate\b/g, '');

    return js.trim();
}

function getTranspileHints(rawCode, errMessage) {
    const hints = [];
    if (/\(\s*float\s*\)|\(\s*double\s*\)/.test(rawCode) && /Unexpected identifier/.test(errMessage)) {
        hints.push('(float), (double) 캐스팅은 자동 변환됩니다. 그래도 오류면 나눗셈식을 확인하세요.');
    }
    if (/switch\s*\(\s*Console\.ReadLine/.test(rawCode) && /case\s+\d+\s*:/.test(rawCode)) {
        hints.push('switch에 ReadLine()을 쓸 때 case 1: 대신 int.Parse 후 switch 하거나 case "1": 을 사용하세요.');
    }
    if (/\$"/.test(rawCode) && /Unexpected/.test(errMessage)) {
        hints.push('주석 안의 $" 는 무시됩니다. 문자열 보간은 코드에서만 $"...") 형태로 사용하세요.');
    }
    return hints;
}

function validateTranspiled(transpiled, rawCode) {
    const preamble = getRuntimePreamble();
    try {
        new Function('Console', preamble + transpiled);
        return { ok: true };
    } catch (err) {
        const lines = transpiled.split('\n');
        let lineHint = '';
        const match = err.message.match(/line\s+(\d+)|:(\d+):|position\s+(\d+)/i);
        if (match) {
            const lineNum = parseInt(match[1] || match[2], 10);
            if (!Number.isNaN(lineNum) && lineNum > 0 && lineNum <= lines.length) {
                lineHint = `\n\n📍 변환 코드 ${lineNum}번째 줄 근처:\n${lines[Math.max(0, lineNum - 2)]}\n${lines[lineNum - 1]}\n${lines[Math.min(lines.length - 1, lineNum)] || ''}`;
            }
        }
        if (!lineHint && lines.length) {
            lineHint = `\n\n📍 변환된 코드 미리보기 (상위 5줄):\n${lines.slice(0, 5).map((l, idx) => `${idx + 1}| ${l}`).join('\n')}`;
        }
        const extraHints = rawCode ? getTranspileHints(rawCode, err.message) : [];
        const hintBlock = extraHints.length ? '\n\n💡 ' + extraHints.join('\n💡 ') : '';
        return {
            ok: false,
            message: `${err.message}${lineHint}${hintBlock}`,
            lines
        };
    }
}

function getRuntimePreamble() {
    return `
        class Random {
            Next(min, max) {
                if (max !== undefined) return Math.floor(Math.random() * (max - min)) + min;
                return Math.floor(Math.random() * min);
            }
        }
    `;
}
