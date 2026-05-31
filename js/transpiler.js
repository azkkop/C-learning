function transpileInterpolatedStrings(code) {
    let out = '';
    let i = 0;

    while (i < code.length) {
        const isInterp = code[i] === '$' && code[i + 1] === '"';
        const isVerbatimInterp = code[i] === '$' && code[i + 1] === '@' && code[i + 2] === '"';
        const isAltVerbatimInterp = code[i] === '@' && code[i + 1] === '$' && code[i + 2] === '"';

        if (isInterp || isVerbatimInterp || isAltVerbatimInterp) {
            const verbatim = isVerbatimInterp || isAltVerbatimInterp;
            i += verbatim ? 3 : 2;
            out += '`';

            while (i < code.length) {
                if (verbatim && code[i] === '"' && code[i + 1] === '"') {
                    i += 2;
                    out += '`';
                    break;
                }
                if (!verbatim && code[i] === '\\' && i + 1 < code.length) {
                    out += code[i] + code[i + 1];
                    i += 2;
                    continue;
                }
                if (!verbatim && code[i] === '"') {
                    i++;
                    out += '`';
                    break;
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

    js = js.replace(/\bnamespace\s+\w+\s*\{/g, '');
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

    js = js.replace(/\(\s*int\s*\)\s*(\([^)]+\)|[\w.]+)/g, 'Math.trunc($1)');

    const csTypes = ['int', 'float', 'double', 'bool', 'string', 'var'];
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
    js = js.replace(/Convert\.ToInt32\b/g, 'Math.round');
    js = js.replace(/Convert\.ToDouble\b/g, 'Number');
    js = js.replace(/Console\.Clear\(\)/g, 'Console.Clear()');
    js = js.replace(/Console\.ReadLine\s*\(\s*\)/g, 'Console.ReadLine()');
    js = js.replace(/Console\.WriteLine\s*\(/g, 'Console.WriteLine(');
    js = js.replace(/Console\.Write\s*\(/g, 'Console.Write(');

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

function validateTranspiled(transpiled) {
    const preamble = `
        class Random {
            Next(min, max) {
                if (max !== undefined) return Math.floor(Math.random() * (max - min)) + min;
                return Math.floor(Math.random() * min);
            }
        }
    `;
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
            lineHint = `\n\n📍 변환된 코드 미리보기 (상위 5줄):\n${lines.slice(0, 5).map((l, i) => `${i + 1}| ${l}`).join('\n')}`;
        }
        return {
            ok: false,
            message: `${err.message}${lineHint}`,
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
