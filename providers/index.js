const vscode = require('vscode');
const { BecaHoverProvider } = require('./hoverProvider');
const { BecaCompletionProvider } = require('./completionProvider');
const { BecaDiagnosticProvider } = require('./diagnosticProvider');

/**
 * Register all language feature providers
 * @param {vscode.ExtensionContext} context
 * @param {BecaClient} becaClient
 */
function registerProviders(context, becaClient) {
    const config = vscode.workspace.getConfiguration('beca');

    // Register hover provider if enabled
    if (config.get('enableHoverTooltips')) {
        const hoverProvider = new BecaHoverProvider(becaClient);
        context.subscriptions.push(
            vscode.languages.registerHoverProvider(
                { scheme: 'file', pattern: '**/*' },
                hoverProvider
            )
        );
    }

    // Register completion provider if inline hints enabled
    if (config.get('showInlineHints')) {
        const completionProvider = new BecaCompletionProvider(becaClient);
        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', pattern: '**/*' },
                completionProvider,
                '.',  // Trigger on dot
                '(',  // Trigger on open paren
                ' '   // Trigger on space
            )
        );
    }

    // Register diagnostic provider (always active)
    const diagnosticProvider = new BecaDiagnosticProvider(becaClient);
    context.subscriptions.push(diagnosticProvider);
}

module.exports = { registerProviders };
