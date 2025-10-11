const vscode = require('vscode');

/**
 * Ask BECA command - Main chat interface
 * @param {BecaClient} becaClient
 * @param {StatusBarManager} statusBar
 */
async function askBecaCommand(becaClient, statusBar) {
    // Get current editor context
    const editor = vscode.window.activeTextEditor;
    const context = {};
    
    if (editor) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (selectedText) {
            context.code = selectedText;
            context.language = editor.document.languageId;
            context.filePath = editor.document.uri.fsPath;
        }
    }

    // Show input box for user question
    const question = await vscode.window.showInputBox({
        prompt: 'Ask BECA anything...',
        placeHolder: 'e.g., How do I implement authentication?',
        ignoreFocusOut: true
    });

    if (!question) {
        return;
    }

    // Show progress
    statusBar.setBusy('Thinking...');
    
    try {
        const result = await becaClient.sendMessage(question, context);
        statusBar.setReady();

        if (result.success) {
            // Create webview panel to show response
            const panel = vscode.window.createWebviewPanel(
                'becaResponse',
                'BECA Response',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            panel.webview.html = getResponseHTML(question, result.response, result.toolsUsed, context);

            // Handle messages from webview
            panel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'applyCode':
                            if (editor && message.code) {
                                const success = await applyCode(editor, message.code, context);
                                panel.webview.postMessage({
                                    command: 'appliedCode',
                                    success
                                });
                            }
                            break;
                        case 'copyCode':
                            if (message.code) {
                                await vscode.env.clipboard.writeText(message.code);
                                vscode.window.showInformationMessage('Code copied to clipboard');
                            }
                            break;
                        case 'followUp':
                            // Start a follow-up question
                            await askBecaCommand(becaClient, statusBar);
                            break;
                    }
                }
            );
        } else {
            vscode.window.showErrorMessage(`BECA Error: ${result.error}`);
        }
    } catch (error) {
        statusBar.setReady();
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}

/**
 * Apply code to editor
 */
async function applyCode(editor, code, context) {
    try {
        if (context.code) {
            // Replace selected code
            const selection = editor.selection;
            await editor.edit(editBuilder => {
                editBuilder.replace(selection, code);
            });
        } else {
            // Insert at cursor
            await editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, code);
            });
        }
        vscode.window.showInformationMessage('✅ Code applied successfully!');
        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to apply code: ${error.message}`);
        return false;
    }
}

/**
 * Generate HTML for response webview
 */
function getResponseHTML(question, response, toolsUsed, context) {
    const hasContext = context.code ? 'Yes' : 'No';
    const toolsList = toolsUsed && toolsUsed.length > 0 
        ? toolsUsed.map(t => `<li>${escapeHtml(t)}</li>`).join('') 
        : '<li>None</li>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BECA Response</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            line-height: 1.6;
        }
        h1, h2, h3 {
            color: var(--vscode-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        .question {
            background: var(--vscode-input-background);
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid var(--vscode-button-background);
            margin: 20px 0;
        }
        .response {
            background: var(--vscode-editor-background);
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .metadata {
            background: var(--vscode-textBlockQuote-background);
            padding: 10px;
            border-radius: 5px;
            font-size: 0.9em;
            margin: 20px 0;
        }
        .code-block {
            background: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            position: relative;
            overflow-x: auto;
        }
        .code-actions {
            position: absolute;
            top: 10px;
            right: 10px;
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 3px;
            cursor: pointer;
            margin: 0 5px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
        }
        code {
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
        }
        .tools-used {
            margin-top: 20px;
        }
        ul {
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <h1>🤖 BECA Response</h1>
    
    <div class="question">
        <h3>Your Question:</h3>
        <p>${escapeHtml(question)}</p>
    </div>

    <div class="response">
        <h3>BECA's Answer:</h3>
        <div>${formatResponse(response)}</div>
    </div>

    <div class="metadata">
        <strong>Context Used:</strong> ${hasContext}<br>
        <strong>Language:</strong> ${context.language || 'N/A'}
    </div>

    <div class="tools-used">
        <h3>Tools Used:</h3>
        <ul>${toolsList}</ul>
    </div>

    <div style="margin-top: 30px;">
        <button onclick="followUp()">Ask Follow-up Question</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function applyCode(code) {
            vscode.postMessage({
                command: 'applyCode',
                code: code
            });
        }

        function copyCode(code) {
            vscode.postMessage({
                command: 'copyCode',
                code: code
            });
        }

        function followUp() {
            vscode.postMessage({
                command: 'followUp'
            });
        }

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'appliedCode' && message.success) {
                alert('Code applied successfully!');
            }
        });
    </script>
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

function formatResponse(text) {
    if (!text) return '';
    
    // Convert markdown-style code blocks
    text = text.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, lang, code) => {
        const language = lang || '';
        const escapedCode = escapeHtml(code);
        return `
            <div class="code-block">
                <div class="code-actions">
                    <button onclick="copyCode(\`${code.replace(/`/g, '\\`')}\`)">Copy</button>
                    <button onclick="applyCode(\`${code.replace(/`/g, '\\`')}\`)">Apply</button>
                </div>
                <pre><code>${escapedCode}</code></pre>
            </div>
        `;
    });

    // Convert inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convert newlines
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

module.exports = { askBecaCommand };
