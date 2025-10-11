const vscode = require('vscode');

/**
 * BECA Status Bar Manager
 * Shows BECA connection status and activity in the status bar
 */
class StatusBarManager {
    constructor(becaClient) {
        this.becaClient = becaClient;
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        
        this.statusBarItem.command = 'beca.showStatus';
        this.setReady();
        this.statusBarItem.show();

        // Check connection periodically
        this.connectionCheckInterval = setInterval(() => {
            this.checkConnection();
        }, 60000); // Every minute
    }

    /**
     * Set status to ready
     */
    setReady() {
        this.statusBarItem.text = '$(comment-discussion) BECA Ready';
        this.statusBarItem.tooltip = 'BECA is ready. Click for details.';
        this.statusBarItem.backgroundColor = undefined;
    }

    /**
     * Set status to busy
     * @param {string} message
     */
    setBusy(message = 'Working...') {
        this.statusBarItem.text = `$(sync~spin) BECA ${message}`;
        this.statusBarItem.tooltip = `BECA is ${message.toLowerCase()}`;
        this.statusBarItem.backgroundColor = undefined;
    }

    /**
     * Set status to disconnected
     */
    setDisconnected() {
        this.statusBarItem.text = '$(error) BECA Disconnected';
        this.statusBarItem.tooltip = 'Cannot connect to BECA. Click to check settings.';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    }

    /**
     * Set custom status
     * @param {string} text
     * @param {string} tooltip
     */
    setCustom(text, tooltip) {
        this.statusBarItem.text = text;
        this.statusBarItem.tooltip = tooltip;
    }

    /**
     * Check connection to BECA
     */
    async checkConnection() {
        try {
            const isConnected = await this.becaClient.testConnection();
            if (!isConnected) {
                this.setDisconnected();
            } else if (this.statusBarItem.text.includes('Disconnected')) {
                this.setReady();
                vscode.window.showInformationMessage('✅ BECA connection restored!');
            }
        } catch (error) {
            this.setDisconnected();
        }
    }

    /**
     * Show activity indicator
     * @param {string} activity
     * @param {number} duration
     */
    async showActivity(activity, duration = 2000) {
        this.setBusy(activity);
        await new Promise(resolve => setTimeout(resolve, duration));
        this.setReady();
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
        }
        this.statusBarItem.dispose();
    }
}

module.exports = { StatusBarManager };
