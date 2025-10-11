const vscode = require('vscode');

/**
 * BECA Completion Provider
 * Provides intelligent code suggestions
 */
class BecaCompletionProvider {
    constructor(becaClient) {
        this.becaClient = becaClient;
        this.lastRequest = 0;
        this.minDelay = 2000; // Minimum 2 seconds between requests
    }

    /**
     * Provide completion items
     * @param {vscode.TextDocument} document
     * @param {vscode.Position} position
     * @param {vscode.CancellationToken} token
     * @param {vscode.CompletionContext} context
     * @returns {Promise<vscode.CompletionItem[]>}
     */
    async provideCompletionItems(document, position, token, context) {
        // Rate limiting - don't query too frequently
        const now = Date.now();
        if (now - this.lastRequest < this.minDelay) {
            return [];
        }
        this.lastRequest = now;

        try {
            const config = vscode.workspace.getConfiguration('beca');
            const maxSuggestions = config.get('maxSuggestions') || 3;

            // Get current line and previous context
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            
            // Don't suggest on empty lines or very short input
            if (linePrefix.trim().length < 3) {
                return [];
            }

            // Get surrounding context
            const startLine = Math.max(0, position.line - 10);
            const endLine = Math.min(document.lineCount - 1, position.line + 5);
            const contextRange = new vscode.Range(startLine, 0, endLine, 10000);
            const code = document.getText(contextRange);

            const language = document.languageId;
            const cursorPosition = position.character;

            // Query BECA for suggestions
            const result = await this.becaClient.getSuggestions(code, language, cursorPosition);

            if (result.success && result.response) {
                // Parse suggestions from response
                const suggestions = this.parseSuggestions(result.response, maxSuggestions);
                
                return suggestions.map((suggestion, index) => {
                    const item = new vscode.CompletionItem(
                        suggestion.label,
                        vscode.CompletionItemKind.Text
                    );
                    
                    item.detail = '🤖 BECA Suggestion';
                    item.documentation = new vscode.MarkdownString(suggestion.documentation);
                    item.insertText = suggestion.insertText;
                    item.sortText = `0${index}`; // Prioritize BECA suggestions
                    
                    return item;
                });
            }
        } catch (error) {
            console.error('Completion provider error:', error);
        }

        return [];
    }

    /**
     * Parse suggestions from BECA response
     * @param {string} response
     * @param {number} maxSuggestions
     * @returns {Array}
     */
    parseSuggestions(response, maxSuggestions) {
        const suggestions = [];
        
        // Try to extract code suggestions from response
        const codeBlockRegex = /```[\w]*\n([\s\S]+?)```/g;
        let match;
        let count = 0;
        
        while ((match = codeBlockRegex.exec(response)) !== null && count < maxSuggestions) {
            const code = match[1].trim();
            suggestions.push({
                label: code.split('\n')[0].substring(0, 50) + '...',
                documentation: 'BECA suggested code snippet',
                insertText: code
            });
            count++;
        }

        // If no code blocks, create generic suggestion
        if (suggestions.length === 0 && response) {
            const lines = response.split('\n').filter(line => line.trim().length > 0);
            const firstLine = lines[0] || response.substring(0, 100);
            
            suggestions.push({
                label: firstLine.substring(0, 50),
                documentation: response,
                insertText: firstLine
            });
        }

        return suggestions;
    }
}

module.exports = { BecaCompletionProvider };
