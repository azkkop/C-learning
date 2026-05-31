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

function extractMethodBody(code, methodName) {
    let clean = code.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const signatureRegex = new RegExp(`(?:public|private|static|virtual|override|\\s)+[a-zA-Z0-9_<>\\[\\]]+\\s+${methodName}\\s*\\(([^)]*)\\)\\s*\\{`);
    const match = clean.match(signatureRegex);

    if (!match) {
        const fallbackRegex = new RegExp(`[a-zA-Z0-9_<>\\[\\]]+\\s+${methodName}\\s*\\(([^)]*)\\)\\s*\\{`);
        const fallbackMatch = clean.match(fallbackRegex);
        if (!fallbackMatch) return null;
        return processBraceMatching(clean, fallbackMatch);
    }
    return processBraceMatching(clean, match);
}

function processBraceMatching(cleanText, matchResult) {
    const params = matchResult[1];
    const startIndex = matchResult.index + matchResult[0].length - 1;

    let braceCount = 1;
    let endIndex = -1;

    for (let i = startIndex + 1; i < cleanText.length; i++) {
        if (cleanText[i] === '{') braceCount++;
        else if (cleanText[i] === '}') braceCount--;

        if (braceCount === 0) {
            endIndex = i;
            break;
        }
    }

    if (endIndex === -1) return null;

    return {
        params: params,
        body: cleanText.substring(startIndex + 1, endIndex)
    };
}

function transpileCSharpToJS(code) {
    let js = code;

    js = transpileInterpolatedStrings(js);

    js = js.replace(/using\s+System\s*;/g, '');
    js = js.replace(/using\s+System\.Threading\s*;/g, '');

    js = js.replace(/\bpublic\s+class\s+Program\b/g, 'class Program');
    js = js.replace(/\bclass\s+Program\b/g, 'class Program');

    js = js.replace(/\bpublic\s+static\s+void\s+Main\s*\(\s*string\s*\[\s*\]\s*[a-zA-Z0-9_]+\s*\)/g, 'static Main(args)');
    js = js.replace(/\bstatic\s+void\s+Main\s*\(\s*string\s*\[\s*\]\s*[a-zA-Z0-9_]+\s*\)/g, 'static Main(args)');

    js = js.replace(/\bstatic\s+(?:void|int|float|double|string|bool)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g, (m, name, args) => {
        const cleanedArgs = args.split(',').map(a => a.trim().split(/\s+/).pop()).join(', ');
        return `static ${name}(${cleanedArgs})`;
    });

    const csTypes = ['int', 'float', 'double', 'bool', 'string', 'var'];
    csTypes.forEach(type => {
        const regex = new RegExp(`\\b${type}\\s+([a-zA-Z0-9_]+)\\b`, 'g');
        js = js.replace(regex, (_, name) => `let ${name}`);
    });

    js = js.replace(/(?:int|float|double|string|bool)\[\s*\]\s*([a-zA-Z0-9_]+)\s*=\s*new\s+(?:int|float|double|string|bool)\[\s*\d*\s*\]\s*\{([^}]*)\}/g, (_, name, values) => `let ${name} = [${values}]`);
    js = js.replace(/(?:int|float|double|string|bool)\[\s*\]\s*([a-zA-Z0-9_]+)\s*=\s*new\s+(?:int|float|double|string|bool)\[\s*([^\]]*)\s*\]/g, (m, name, size) => {
        const cleanSize = size.trim();
        return `let ${name} = new Array(${cleanSize || 0}).fill(0)`;
    });

    js = js.replace(/(\w+)\.Length\b/g, (_, name) => `${name}.length`);
    js = js.replace(/(?:int|float|double|Convert)\.Parse\b/g, 'Number');
    js = js.replace(/Convert\.ToInt32\b/g, 'Math.round');
    js = js.replace(/Console\.Clear\(\)/g, 'Console.Clear()');

    js = js.replace(/(\d+(\.\d+)?)[fF]\b/g, (_, num) => num);

    js = js.replace(/Math\.(Max|Min|Abs|Round)/g, (m, p) => `Math.${p.toLowerCase()}`);

    return js;
}
