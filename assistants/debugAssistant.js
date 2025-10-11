const vscode = require('vscode');

/**
 * BECA Debug Assistant
 * Provides intelligent debugging assistance and error analysis
 */
class DebugAssistant {
    constructor(becaClient) {
        this.becaClient = becaClient;
        
        // Listen for debug session start
        this.debugStartListener = vscode.debug.onDidStartDebugSession(
            this.onDebugSessionStart.bind(this)
        );

        // Listen for debug console messages
        this.debugConsoleListener = vscode.debug.onDidReceiveDebugSessionCustomEvent(
            this.onDebugEvent.bind(this)
        );
    }

    /**
     * Handle debug session start
     */
    onDebugSessionStart(session) {
        vscode.window.showInformationMessage(
            '🔍 BECA Debug Assistant is active. Errors will be automatically analyzed.',
            'Got it'
        );
    }

    /**
     * Handle debug events
     */
    async onDebugEvent(event) {
        // Listen for exception/error events
        if (event.event === 'stopped' && event.body.reason === 'exception') {
            await this.analyzeException(event);
        }
    }

    /**
     * Analyze exception and provide fix suggestions
     */
    async analyzeException(event) {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            // Get current file content
            const code = editor.document.getText();
            const language = editor.document.languageId;
            
            // Get stack trace (if available)
            const stackTrace = event.body.description || 'No stack trace available';

            const action = await vscode.window.showErrorMessage(
                '❌ Exception occurred. Would you like BECA to analyze it?',
                'Analyze',
                'Ignore'
            );

            if (action !== 'Analyze') return;

            // Show progress
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'BECA is analyzing the error...',
                cancellable: false
            }, async () => {
                const result = await this.becaClient.analyzeStackTrace(
                    stackTrace,
                    code,
                    language
                );

                if (result.success) {
                    this.showAnalysisResults(stackTrace, result.response);
                }
            });
        } catch (error) {
            console.error('Debug assistant error:', error);
        }
    }

    /**
     * Show analysis results in webview
     */
    showAnalysisResults(stackTrace, analysis) {
        const panel = vscode.window.createWebviewPanel(
            'becaDebugAnalysis',
            'BECA Debug Analysis',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getDebugAnalysisHTML(stackTrace, analysis);
    }

    /**
     * Get HTML for debug analysis
     */
    getDebugAnalysisHTML(stackTrace, analysis) {
        return `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
        }
        h2 {
            color: var(--vscode-foreground);
            border-bottom: 2px solid var(--vscode-button-background);
            padding-bottom: 10px;
        }
        .error-section {
            background: var(--vscode-inputValidation-errorBackground);
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #f48771;
        }
        .analysis-section {
            background: var(--vscode-editor-background);
            padding: 20px;
            border-radius: 5px;
            margin: 15px 0;
            line-height: 1.6;
        }
        .stack-trace {
            background: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
            font-size: 0.9em;
            overflow-x: auto;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
        }
        h3 {
            color: var(--vscode-foreground);
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h2>🐛 BECA Debug Analysis</h2>
    
    <h3>Error Details:</h3>
    <div class="error-section">
        <div class="stack-trace">
            <pre>${this.escapeHtml(stackTrace)}</pre>
        </div>
    </div>

    <h3>BECA's Analysis & Suggestions:</h3>
    <div class="analysis-section">
        ${this.formatMarkdown(analysis)}
    </div>
</body>
</html>`;
    }

    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    formatMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>');
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.debugStartListener.dispose();
        this.debugConsoleListener.dispose();
    }
}

module.exports = { DebugAssistant };
