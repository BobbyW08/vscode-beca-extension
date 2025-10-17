const vscode = require('vscode');
const BecaClient = require('./beca-client');
const { registerCommands } = require('./commands');
const { registerProviders } = require('./providers');
const { StatusBarManager } = require('./views/statusBar');
const { BecaProvider } = require('./views/becaProvider');
const { FileWatcher } = require('./watchers/fileWatcher');
const { DebugAssistant } = require('./assistants/debugAssistant');
const { TerminalIntegration } = require('./terminal/terminalIntegration');

/**
 * Extension activation
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    console.log('BECA extension is now active!');

    // Initialize BECA client
    const config = vscode.workspace.getConfiguration('beca');
    const apiUrl = config.get('apiUrl');
    const becaClient = new BecaClient(apiUrl);

    // Test connection to BECA
    try {
        const isConnected = await becaClient.testConnection();
        if (isConnected) {
            vscode.window.showInformationMessage('✅ BECA is connected and ready!');
        } else {
            vscode.window.showWarningMessage('⚠️ Cannot connect to BECA. Please check the API URL in settings.');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`❌ BECA connection error: ${error.message}`);
    }

    // Initialize status bar
    const statusBar = new StatusBarManager(becaClient);
    context.subscriptions.push(statusBar);

    // Initialize BECA chat provider with Cline-style UI
    const becaProvider = new BecaProvider(context, becaClient);
    
    // Register for both sidebar and panel (secondary sidebar)
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('beca.chatView', becaProvider, {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        }),
        vscode.window.registerWebviewViewProvider('beca.chatViewPanel', becaProvider, {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        })
    );

    // Register all commands
    registerCommands(context, becaClient, statusBar);

    // Register providers (hover, completion, diagnostics)
    registerProviders(context, becaClient);

    // Initialize file watcher if auto-review is enabled
    if (config.get('autoReview')) {
        const fileWatcher = new FileWatcher(becaClient);
        context.subscriptions.push(fileWatcher);
    }

    // Initialize debug assistant if enabled
    if (config.get('debugAssistant')) {
        const debugAssistant = new DebugAssistant(becaClient);
        context.subscriptions.push(debugAssistant);
    }

    // Initialize terminal integration if enabled
    if (config.get('terminalIntegration')) {
        const terminalIntegration = new TerminalIntegration(becaClient);
        context.subscriptions.push(terminalIntegration);
    }

    // Watch for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('beca')) {
                const newConfig = vscode.workspace.getConfiguration('beca');
                const newApiUrl = newConfig.get('apiUrl');
                
                if (newApiUrl !== apiUrl) {
                    becaClient.updateApiUrl(newApiUrl);
                    vscode.window.showInformationMessage('BECA API URL updated. Reconnecting...');
                }
            }
        })
    );

    // Store BECA client in global state for use by other modules
    context.globalState.update('becaClient', becaClient);
}

/**
 * Extension deactivation
 */
function deactivate() {
    console.log('BECA extension is now deactivated.');
}

module.exports = {
    activate,
    deactivate
};
