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
        js = js.replace(regex, 'let $1');
    });

    js = js.replace(/(?:int|float|double|string|bool)\[\s*\]\s*([a-zA-Z0-9_]+)\s*=\s*new\s+(?:int|float|double|string|bool)\[\s*\d*\s*\]\s*\{([^}]*)\}/g, 'let $1 = [$2]');
    js = js.replace(/(?:int|float|double|string|bool)\[\s*\]\s*([a-zA-Z0-9_]+)\s*=\s*new\s+(?:int|float|double|string|bool)\[\s*([^\]]*)\s*\]/g, (m, name, size) => {
        const cleanSize = size.trim();
        return `let ${name} = new Array(${cleanSize || 0}).fill(0)`;
    });

    js = js.replace(/(\w+)\.Length\b/g, '$1.length');
    js = js.replace(/(?:int|float|double|Convert)\.Parse\b/g, 'Number');
    js = js.replace(/Convert\.ToInt32\b/g, 'Math.round');
    js = js.replace(/Console\.Clear\(\)/g, 'Console.Clear()');

    js = js.replace(/(\d+(\.\d+)?)[fF]\b/g, '$1');

    js = js.replace(/Math\.(Max|Min|Abs|Round)/g, (m, p) => `Math.${p.toLowerCase()}`);

    return js;
}
