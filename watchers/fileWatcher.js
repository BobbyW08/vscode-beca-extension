const vscode = require('vscode');

/**
 * BECA File Watcher
 * Monitors file changes and provides real-time suggestions
 */
class FileWatcher {
    constructor(becaClient) {
        this.becaClient = becaClient;
        this.config = vscode.workspace.getConfiguration('beca');
        
        // Watch for file saves
        this.saveListener = vscode.workspace.onDidSaveTextDocument(
            this.onFileSave.bind(this)
        );
    }

    /**
     * Handle file save event
     * @param {vscode.TextDocument} document
     */
    async onFileSave(document) {
        if (!this.config.get('autoReview')) {
            return;
        }

        // Skip non-code files
        if (!this.isCodeFile(document)) {
            return;
        }

        try {
            // Quick analysis on save
            const content = document.getText();
            const language = document.languageId;
            const filePath = document.uri.fsPath;

            // Show notification
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `BECA is reviewing ${document.fileName}...`,
                cancellable: false
            }, async () => {
                const result = await this.becaClient.reviewFile(filePath, content, language);
                
                if (result.success) {
                    // Extract key insights from review
                    const insights = this.extractKeyInsights(result.response);
                    
                    if (insights.length > 0) {
                        const action = await vscode.window.showInformationMessage(
                            `BECA found ${insights.length} suggestion(s) for ${document.fileName}`,
                            'View Details',
                            'Dismiss'
                        );

                        if (action === 'View Details') {
                            const panel = vscode.window.createWebviewPanel(
                                'becaAutoReview',
                                `BECA Auto-Review: ${document.fileName}`,
                                vscode.ViewColumn.Two,
                                { enableScripts: true }
                            );
                            
                            panel.webview.html = this.getReviewHTML(insights, filePath);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('File watcher error:', error);
        }
    }

    /**
     * Check if file is a code file
     * @param {vscode.TextDocument} document
     * @returns {boolean}
     */
    isCodeFile(document) {
        const codeLanguages = [
            'javascript', 'typescript', 'python', 'java', 'csharp', 
            'cpp', 'c', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'
        ];
        return codeLanguages.includes(document.languageId);
    }

    /**
     * Extract key insights from review response
     * @param {string} response
     * @returns {Array}
     */
    extractKeyInsights(response) {
        const insights = [];
        const lines = response.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                insights.push(trimmed.substring(1).trim());
            }
        }

        return insights.slice(0, 5); // Top 5 insights
    }

    /**
     * Get HTML for review display
     */
    getReviewHTML(insights, filePath) {
        const items = insights.map(i => `<li>${this.escapeHtml(i)}</li>`).join('');
        
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
        .file-path {
            background: var(--vscode-input-background);
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
            font-family: monospace;
        }
        ul {
            line-height: 1.8;
        }
        li {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <h2>🔍 BECA Auto-Review Suggestions</h2>
    <div class="file-path">${this.escapeHtml(filePath)}</div>
    <ul>${items}</ul>
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

    /**
     * Dispose of resources
     */
    dispose() {
        this.saveListener.dispose();
    }
}

module.exports = { FileWatcher };
