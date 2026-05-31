let cmEditor = null;

function initCodeEditor() {
    const textarea = document.getElementById('code-editor');
    cmEditor = CodeMirror.fromTextArea(textarea, {
        mode: 'text/x-csharp',
        theme: 'dracula',
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: false,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        extraKeys: {
            F5: (cm) => {
                cm.triggerSave = true;
                setMobileTab('console');
                executeCode();
                return false;
            },
            Tab: (cm) => {
                if (cm.somethingSelected()) {
                    cm.indentSelection('add');
                } else {
                    cm.replaceSelection('    ', 'end');
                }
            },
            'Ctrl-/': 'toggleComment',
            'Cmd-/': 'toggleComment'
        }
    });

    cmEditor.setSize('100%', '100%');
    cmEditor.on('change', () => saveCurrentCode());
    cmEditor.on('keydown', (cm, e) => {
        if (e.key === 'Enter') {
            const cursor = cm.getCursor();
            const line = cm.getLine(cursor.line);
            const before = line.charAt(cursor.ch - 1);
            const after = line.charAt(cursor.ch);
            if (before === '{' && after === '}') {
                e.preventDefault();
                const indent = line.match(/^\s*/)[0];
                cm.replaceSelection('\n' + indent + '    \n' + indent);
                cm.setCursor(cursor.line + 1, indent.length + 4);
            }
        }
    });

    App.els.codeEditorWrap = document.getElementById('code-editor-wrap');
}

function getEditorCode() {
    return cmEditor ? cmEditor.getValue() : '';
}

function setEditorCode(code) {
    if (cmEditor) {
        cmEditor.setValue(code);
        cmEditor.refresh();
    }
}

function formatEditorCode() {
    const raw = getEditorCode();
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

    setEditorCode(formattedLines.join('\n'));
    saveCurrentCode();
}

function refreshEditorLayout() {
    if (cmEditor) {
        setTimeout(() => cmEditor.refresh(), 50);
    }
}
