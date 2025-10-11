const vscode = require('vscode');

/**
 * BECA Hover Provider
 * Shows BECA insights when hovering over code
 */
class BecaHoverProvider {
    constructor(becaClient) {
        this.becaClient = becaClient;
        this.cache = new Map();
    }

    /**
     * Provide hover information
     * @param {vscode.TextDocument} document
     * @param {vscode.Position} position
     * @param {vscode.CancellationToken} token
     * @returns {Promise<vscode.Hover>}
     */
    async provideHover(document, position, token) {
        // Get the word at the cursor position
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return null;
        }

        const word = document.getText(wordRange);
        if (!word || word.length < 3) {
            return null; // Don't query for very short words
        }

        // Check cache first
        const cacheKey = `${document.uri.fsPath}:${word}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
                return cached.hover;
            }
        }

        try {
            // Get surrounding context (5 lines before and after)
            const startLine = Math.max(0, position.line - 5);
            const endLine = Math.min(document.lineCount - 1, position.line + 5);
            const contextRange = new vscode.Range(startLine, 0, endLine, 10000);
            const context = document.getText(contextRange);

            const language = document.languageId;
            
            // Query BECA for information about this symbol
            const result = await this.becaClient.getHoverInfo(context, word, language);

            if (result.success && result.response) {
                const markdown = new vscode.MarkdownString();
                markdown.isTrusted = true;
                markdown.supportHtml = true;
                
                markdown.appendMarkdown(`### 🤖 BECA Insights\n\n`);
                markdown.appendMarkdown(result.response);

                const hover = new vscode.Hover(markdown, wordRange);
                
                // Cache the result
                this.cache.set(cacheKey, {
                    hover,
                    timestamp: Date.now()
                });

                return hover;
            }
        } catch (error) {
            console.error('Hover provider error:', error);
        }

        return null;
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }
}

module.exports = { BecaHoverProvider };
