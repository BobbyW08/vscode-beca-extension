const vscode = require('vscode');

/**
 * BECA Diagnostic Provider
 * Provides real-time code analysis and issue detection
 */
class BecaDiagnosticProvider {
    constructor(becaClient) {
        this.becaClient = becaClient;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('beca');
        this.analysisTimeout = null;
        this.pendingDocuments = new Set();

        // Watch for document changes
        this.documentChangeListener = vscode.workspace.onDidChangeTextDocument(
            this.onDocumentChange.bind(this)
        );

        // Watch for document open
        this.documentOpenListener = vscode.workspace.onDidOpenTextDocument(
            this.onDocumentOpen.bind(this)
        );

        // Analyze currently open documents
        vscode.workspace.textDocuments.forEach(doc => {
            this.scheduleAnalysis(doc);
        });
    }

    /**
     * Handle document changes
     */
    onDocumentChange(event) {
        const config = vscode.workspace.getConfiguration('beca');
        if (!config.get('autoReview')) {
            return;
        }

        this.scheduleAnalysis(event.document);
    }

    /**
     * Handle document open
     */
    onDocumentOpen(document) {
        this.scheduleAnalysis(document);
    }

    /**
     * Schedule document analysis with debouncing
     */
    scheduleAnalysis(document) {
        // Skip unsaved documents or non-file schemes
        if (document.uri.scheme !== 'file' || document.isDirty) {
            return;
        }

        // Add to pending documents
        this.pendingDocuments.add(document.uri.toString());

        // Clear existing timeout
        if (this.analysisTimeout) {
            clearTimeout(this.analysisTimeout);
        }

        // Schedule analysis after delay
        this.analysisTimeout = setTimeout(() => {
            this.analyzePendingDocuments();
        }, 3000); // 3 second delay
    }

    /**
     * Analyze all pending documents
     */
    async analyzePendingDocuments() {
        const documents = Array.from(this.pendingDocuments).map(uri => {
            return vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri);
        }).filter(doc => doc !== undefined);

        this.pendingDocuments.clear();

        for (const document of documents) {
            await this.analyzeDocument(document);
        }
    }

    /**
     * Analyze a document and update diagnostics
     */
    async analyzeDocument(document) {
        try {
            const code = document.getText();
            const language = document.languageId;
            const filePath = document.uri.fsPath;

            // Query BECA for diagnostics
            const result = await this.becaClient.getDiagnostics(code, language, filePath);

            if (result.success && result.response) {
                const diagnostics = this.parseDiagnostics(result.response, document);
                this.diagnosticCollection.set(document.uri, diagnostics);
            }
        } catch (error) {
            console.error('Diagnostic analysis error:', error);
        }
    }

    /**
     * Parse diagnostics from BECA response
     */
    parseDiagnostics(response, document) {
        const diagnostics = [];
        
        // Look for issues mentioned in the response
        // Format: "Line X: Issue description" or similar patterns
        const linePattern = /(?:line|Line)\s+(\d+):\s*(.+?)(?:\n|$)/g;
        let match;

        while ((match = linePattern.exec(response)) !== null) {
            const lineNumber = parseInt(match[1]) - 1; // Convert to 0-based
            const message = match[2].trim();

            if (lineNumber >= 0 && lineNumber < document.lineCount) {
                const line = document.lineAt(lineNumber);
                const range = new vscode.Range(
                    lineNumber,
                    0,
                    lineNumber,
                    line.text.length
                );

                // Determine severity based on keywords
                let severity = vscode.DiagnosticSeverity.Warning;
                const lowerMessage = message.toLowerCase();
                
                if (lowerMessage.includes('error') || lowerMessage.includes('bug')) {
                    severity = vscode.DiagnosticSeverity.Error;
                } else if (lowerMessage.includes('info') || lowerMessage.includes('suggestion')) {
                    severity = vscode.DiagnosticSeverity.Information;
                }

                const diagnostic = new vscode.Diagnostic(
                    range,
                    `BECA: ${message}`,
                    severity
                );
                diagnostic.source = 'BECA';
                
                diagnostics.push(diagnostic);
            }
        }

        // If no specific line issues found, create general file-level suggestions
        if (diagnostics.length === 0 && response.includes('improve')) {
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                `BECA: Code quality suggestions available. Right-click and select "BECA: Review File" for details.`,
                vscode.DiagnosticSeverity.Hint
            );
            diagnostic.source = 'BECA';
            diagnostics.push(diagnostic);
        }

        return diagnostics;
    }

    /**
     * Clear diagnostics for a document
     */
    clearDiagnostics(document) {
        this.diagnosticCollection.delete(document.uri);
    }

    /**
     * Clear all diagnostics
     */
    clearAll() {
        this.diagnosticCollection.clear();
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        this.documentChangeListener.dispose();
        this.documentOpenListener.dispose();
        
        if (this.analysisTimeout) {
            clearTimeout(this.analysisTimeout);
        }
    }
}

module.exports = { BecaDiagnosticProvider };
