const vscode = require('vscode');

/**
 * Analyze Code command
 * @param {BecaClient} becaClient
 * @param {StatusBarManager} statusBar
 */
async function analyzeCodeCommand(becaClient, statusBar) {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
    }

    const selection = editor.selection;
    const code = editor.document.getText(selection);
    
    if (!code) {
        vscode.window.showWarningMessage('Please select code to analyze');
        return;
    }

    statusBar.setBusy('Analyzing code...');
    const language = editor.document.languageId;
    const filePath = editor.document.uri.fsPath;
    
    try {
        const result = await becaClient.analyzeCode(code, language, filePath);
        statusBar.setReady();

        if (result.success) {
            const panel = vscode.window.createWebviewPanel(
                'becaAnalysis',
                'BECA Code Analysis',
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );
            
            panel.webview.html = getAnalysisHTML(code, result.response, language, filePath);
        } else {
            vscode.window.showErrorMessage(`BECA Error: ${result.error}`);
        }
    } catch (error) {
        statusBar.setReady();
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}

function getAnalysisHTML(code, analysis, language, filePath) {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); }
        h2 { color: var(--vscode-foreground); border-bottom: 2px solid var(--vscode-button-background); padding-bottom: 10px; }
        .file-info { background: var(--vscode-input-background); padding: 10px; border-radius: 5px; margin: 15px 0; }
        .code-section { background: var(--vscode-textCodeBlock-background); padding: 15px; border-radius: 5px; margin: 15px 0; }
        .analysis-section { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 15px 0; line-height: 1.6; }
        pre { white-space: pre-wrap; word-wrap: break-word; margin: 0; }
        code { font-family: var(--vscode-editor-font-family); }
    </style>
</head>
<body>
    <h2>🔍 BECA Code Analysis</h2>
    
    <div class="file-info">
        <strong>File:</strong> ${escapeHtml(filePath)}<br>
        <strong>Language:</strong> ${escapeHtml(language)}<br>
        <strong>Lines:</strong> ${code.split('\n').length}
    </div>

    <h3>Code Under Analysis:</h3>
    <div class="code-section">
        <pre><code>${escapeHtml(code)}</code></pre>
    </div>

    <h3>Analysis Results:</h3>
    <div class="analysis-section">
        ${formatMarkdown(analysis)}
    </div>
</body>
</html>`;
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
}

module.exports = { analyzeCodeCommand };
