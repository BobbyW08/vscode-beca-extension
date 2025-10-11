const vscode = require('vscode');

/**
 * Review File command
 * @param {BecaClient} becaClient
 * @param {StatusBarManager} statusBar
 */
async function reviewFileCommand(becaClient, statusBar) {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
    }

    statusBar.setBusy('Reviewing file...');
    const content = editor.document.getText();
    const language = editor.document.languageId;
    const filePath = editor.document.uri.fsPath;
    
    try {
        const result = await becaClient.reviewFile(filePath, content, language);
        statusBar.setReady();

        if (result.success) {
            const panel = vscode.window.createWebviewPanel(
                'becaReview',
                'BECA File Review',
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );
            
            panel.webview.html = getReviewHTML(filePath, content, result.response, language);
        } else {
            vscode.window.showErrorMessage(`BECA Error: ${result.error}`);
        }
    } catch (error) {
        statusBar.setReady();
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}

function getReviewHTML(filePath, content, review, language) {
    const lineCount = content.split('\n').length;
    const charCount = content.length;
    
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); }
        h2 { color: var(--vscode-foreground); border-bottom: 2px solid var(--vscode-button-background); padding-bottom: 10px; }
        .file-stats { background: var(--vscode-input-background); padding: 15px; border-radius: 5px; margin: 15px 0; }
        .stat-item { margin: 5px 0; }
        .review-section { background: var(--vscode-editor-background); padding: 20px; border-radius: 5px; margin: 15px 0; line-height: 1.8; }
        .review-section h3 { color: var(--vscode-foreground); margin-top: 20px; }
        .review-section ul { padding-left: 25px; }
        .review-section li { margin: 8px 0; }
        code { background: var(--vscode-textCodeBlock-background); padding: 2px 6px; border-radius: 3px; font-family: var(--vscode-editor-font-family); }
    </style>
</head>
<body>
    <h2>📋 BECA File Review</h2>
    
    <div class="file-stats">
        <div class="stat-item"><strong>File:</strong> ${escapeHtml(filePath)}</div>
        <div class="stat-item"><strong>Language:</strong> ${escapeHtml(language)}</div>
        <div class="stat-item"><strong>Lines:</strong> ${lineCount}</div>
        <div class="stat-item"><strong>Characters:</strong> ${charCount}</div>
    </div>

    <div class="review-section">
        <h3>📝 Review Feedback:</h3>
        ${formatMarkdown(review)}
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

module.exports = { reviewFileCommand };
