const vscode = require('vscode');
const { askBecaCommand } = require('./askBeca');
const { analyzeCodeCommand } = require('./analyzeCode');
const { reviewFileCommand } = require('./reviewFile');

/**
 * Register all BECA commands
 * @param {vscode.ExtensionContext} context
 * @param {BecaClient} becaClient
 * @param {StatusBarManager} statusBar
 */
function registerCommands(context, becaClient, statusBar) {
    // Ask BECA - Main chat command
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.askBeca', async () => {
            await askBecaCommand(becaClient, statusBar);
        })
    );

    // Analyze Code - Right-click on selection
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.analyzeCode', async () => {
            await analyzeCodeCommand(becaClient, statusBar);
        })
    );

    // Review File - Analyze entire file
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.reviewFile', async () => {
            await reviewFileCommand(becaClient, statusBar);
        })
    );

    // Explain Code
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.explainCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor');
                return;
            }

            const selection = editor.selection;
            const code = editor.document.getText(selection);
            
            if (!code) {
                vscode.window.showWarningMessage('Please select code to explain');
                return;
            }

            statusBar.setBusy('Explaining code...');
            const language = editor.document.languageId;
            const result = await becaClient.explainCode(code, language);
            statusBar.setReady();

            if (result.success) {
                const panel = vscode.window.createWebviewPanel(
                    'becaExplanation',
                    'BECA Code Explanation',
                    vscode.ViewColumn.Two,
                    { enableScripts: true }
                );
                
                panel.webview.html = getExplanationHTML(code, result.response, language);
            } else {
                vscode.window.showErrorMessage(`BECA Error: ${result.error}`);
            }
        })
    );

    // Fix Error
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.fixError', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor');
                return;
            }

            const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
            if (diagnostics.length === 0) {
                vscode.window.showInformationMessage('No errors found in current file');
                return;
            }

            // Get error at cursor position
            const position = editor.selection.active;
            const error = diagnostics.find(d => d.range.contains(position));
            
            if (!error) {
                vscode.window.showInformationMessage('No error at cursor position');
                return;
            }

            statusBar.setBusy('Fixing error...');
            const code = editor.document.getText();
            const language = editor.document.languageId;
            const result = await becaClient.fixError(code, error.message, language);
            statusBar.setReady();

            if (result.success) {
                const panel = vscode.window.createWebviewPanel(
                    'becaFix',
                    'BECA Error Fix',
                    vscode.ViewColumn.Two,
                    { enableScripts: true }
                );
                
                panel.webview.html = getFixHTML(error.message, result.response);
            } else {
                vscode.window.showErrorMessage(`BECA Error: ${result.error}`);
            }
        })
    );

    // Generate Tests
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.generateTests', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor');
                return;
            }

            const selection = editor.selection;
            const code = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);
            
            statusBar.setBusy('Generating tests...');
            const language = editor.document.languageId;
            const result = await becaClient.generateTests(code, language);
            statusBar.setReady();

            if (result.success) {
                const panel = vscode.window.createWebviewPanel(
                    'becaTests',
                    'BECA Generated Tests',
                    vscode.ViewColumn.Two,
                    { enableScripts: true }
                );
                
                panel.webview.html = getTestsHTML(result.response, language);
            } else {
                vscode.window.showErrorMessage(`BECA Error: ${result.error}`);
            }
        })
    );

    // Refactor
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.refactor', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor');
                return;
            }

            const selection = editor.selection;
            const code = editor.document.getText(selection);
            
            if (!code) {
                vscode.window.showWarningMessage('Please select code to refactor');
                return;
            }

            statusBar.setBusy('Analyzing for refactoring...');
            const language = editor.document.languageId;
            const result = await becaClient.suggestRefactoring(code, language);
            statusBar.setReady();

            if (result.success) {
                const panel = vscode.window.createWebviewPanel(
                    'becaRefactor',
                    'BECA Refactoring Suggestions',
                    vscode.ViewColumn.Two,
                    { enableScripts: true }
                );
                
                panel.webview.html = getRefactorHTML(code, result.response, language);
            } else {
                vscode.window.showErrorMessage(`BECA Error: ${result.error}`);
            }
        })
    );

    // Add Comments
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.addComments', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor');
                return;
            }

            const selection = editor.selection;
            const code = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);
            
            statusBar.setBusy('Adding comments...');
            const language = editor.document.languageId;
            const result = await becaClient.addComments(code, language);
            statusBar.setReady();

            if (result.success) {
                const answer = await vscode.window.showInformationMessage(
                    'BECA has generated commented code. Would you like to apply it?',
                    'Apply', 'View', 'Cancel'
                );

                if (answer === 'Apply') {
                    const range = selection.isEmpty ? 
                        new vscode.Range(0, 0, editor.document.lineCount, 0) : 
                        selection;
                    editor.edit(editBuilder => {
                        editBuilder.replace(range, result.response);
                    });
                    vscode.window.showInformationMessage('✅ Comments added successfully!');
                } else if (answer === 'View') {
                    const panel = vscode.window.createWebviewPanel(
                        'becaComments',
                        'BECA Commented Code',
                        vscode.ViewColumn.Two,
                        { enableScripts: true }
                    );
                    panel.webview.html = getCommentsHTML(result.response, language);
                }
            } else {
                vscode.window.showErrorMessage(`BECA Error: ${result.error}`);
            }
        })
    );

    // Show History
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.showHistory', async () => {
            statusBar.setBusy('Loading history...');
            const result = await becaClient.getHistory(20);
            statusBar.setReady();

            if (result.success) {
                const panel = vscode.window.createWebviewPanel(
                    'becaHistory',
                    'BECA Conversation History',
                    vscode.ViewColumn.Two,
                    { enableScripts: true }
                );
                
                panel.webview.html = getHistoryHTML(result.conversations);
            } else {
                vscode.window.showErrorMessage(`BECA Error: ${result.error}`);
            }
        })
    );

    // Toggle Auto-Review
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.toggleAutoReview', async () => {
            const config = vscode.workspace.getConfiguration('beca');
            const currentValue = config.get('autoReview');
            await config.update('autoReview', !currentValue, vscode.ConfigurationTarget.Global);
            
            const status = !currentValue ? 'enabled' : 'disabled';
            vscode.window.showInformationMessage(`Auto-review on save ${status}`);
        })
    );

    // Show Status
    context.subscriptions.push(
        vscode.commands.registerCommand('beca.showStatus', async () => {
            const isConnected = await becaClient.testConnection();
            const config = vscode.workspace.getConfiguration('beca');
            
            const info = `
BECA Status:
• Connection: ${isConnected ? '✅ Connected' : '❌ Disconnected'}
• API URL: ${config.get('apiUrl')}
• Auto-review: ${config.get('autoReview') ? 'Enabled' : 'Disabled'}
• Inline hints: ${config.get('showInlineHints') ? 'Enabled' : 'Disabled'}
• Hover tooltips: ${config.get('enableHoverTooltips') ? 'Enabled' : 'Disabled'}
• Debug assistant: ${config.get('debugAssistant') ? 'Enabled' : 'Disabled'}
• Terminal integration: ${config.get('terminalIntegration') ? 'Enabled' : 'Disabled'}
            `.trim();
            
            vscode.window.showInformationMessage(info, { modal: true });
        })
    );
}

// HTML templates for webview panels
function getExplanationHTML(code, explanation, language) {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        h2 { color: var(--vscode-foreground); }
        .code-block { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; }
        .explanation { line-height: 1.6; color: var(--vscode-foreground); }
        pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <h2>🤖 BECA Code Explanation</h2>
    <h3>Original Code (${language}):</h3>
    <div class="code-block"><pre>${escapeHtml(code)}</pre></div>
    <h3>Explanation:</h3>
    <div class="explanation">${formatMarkdown(explanation)}</div>
</body>
</html>`;
}

function getFixHTML(error, fix) {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        h2 { color: var(--vscode-foreground); }
        .error { background: var(--vscode-inputValidation-errorBackground); padding: 10px; border-radius: 5px; margin: 10px 0; }
        .fix { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; line-height: 1.6; }
    </style>
</head>
<body>
    <h2>🔧 BECA Error Fix</h2>
    <h3>Error:</h3>
    <div class="error">${escapeHtml(error)}</div>
    <h3>Suggested Fix:</h3>
    <div class="fix">${formatMarkdown(fix)}</div>
</body>
</html>`;
}

function getTestsHTML(tests, language) {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        h2 { color: var(--vscode-foreground); }
        .tests { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <h2>✅ BECA Generated Tests (${language})</h2>
    <div class="tests"><pre>${escapeHtml(tests)}</pre></div>
</body>
</html>`;
}

function getRefactorHTML(original, suggestions, language) {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        h2 { color: var(--vscode-foreground); }
        .code-block { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; }
        .suggestions { line-height: 1.6; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <h2>♻️ BECA Refactoring Suggestions</h2>
    <h3>Original Code (${language}):</h3>
    <div class="code-block"><pre>${escapeHtml(original)}</pre></div>
    <h3>Suggestions:</h3>
    <div class="suggestions">${formatMarkdown(suggestions)}</div>
</body>
</html>`;
}

function getCommentsHTML(commentedCode, language) {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        h2 { color: var(--vscode-foreground); }
        .code-block { background: var(--vscode-editor-background); padding: 15px; border-radius: 5px; margin: 10px 0; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <h2>💬 BECA Commented Code (${language})</h2>
    <div class="code-block"><pre>${escapeHtml(commentedCode)}</pre></div>
</body>
</html>`;
}

function getHistoryHTML(conversations) {
    const items = conversations.map(conv => `
        <div class="conversation">
            <div class="timestamp">${conv.timestamp}</div>
            <div class="user-message"><strong>You:</strong> ${escapeHtml(conv.user_message)}</div>
            <div class="agent-response"><strong>BECA:</strong> ${formatMarkdown(conv.agent_response)}</div>
        </div>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        h2 { color: var(--vscode-foreground); }
        .conversation { border-left: 3px solid var(--vscode-button-background); padding-left: 15px; margin: 20px 0; }
        .timestamp { color: var(--vscode-descriptionForeground); font-size: 0.9em; margin-bottom: 5px; }
        .user-message { margin: 10px 0; }
        .agent-response { margin: 10px 0; color: var(--vscode-foreground); }
    </style>
</head>
<body>
    <h2>📚 Conversation History</h2>
    ${items}
</body>
</html>`;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMarkdown(text) {
    // Simple markdown formatting
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
}

module.exports = { registerCommands };
