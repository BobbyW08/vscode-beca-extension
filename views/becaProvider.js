const vscode = require('vscode');

/**
 * Provider for the BECA chat webview
 */
class BecaProvider {
    constructor(context, becaClient) {
        this.context = context;
        this.becaClient = becaClient;
        this._view = null;
        this.conversationHistory = [];
        this.currentTask = null;
    }

    resolveWebviewView(webviewView) {
        this._view = webviewView;
        
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'webview-ui', 'dist')
            ]
        };

        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this.handleMessage(message);
        });

        // Send initial state
        this.updateWebview();
    }

    async handleMessage(message) {
        switch (message.type) {
            case 'sendMessage':
                await this.handleUserMessage(message.text);
                break;
            case 'newTask':
                await this.startNewTask();
                break;
            case 'approveEdit':
                await this.applyFileEdit(message.filePath, message.content);
                break;
            case 'rejectEdit':
                vscode.window.showInformationMessage('Edit rejected');
                break;
        }
    }

    async handleUserMessage(userMessage) {
        if (!userMessage || userMessage.trim().length === 0) return;

        // Add user message to UI
        this.addMessage({
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        });

        // Show thinking indicator
        this.sendToWebview({ type: 'thinking', value: true });

        try {
            // Create task if this is the first message
            if (!this.currentTask) {
                await this.createTask(userMessage);
            }

            // Get workspace context
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            const context = {
                workspacePath: workspaceFolder?.uri.fsPath,
                workspaceName: workspaceFolder?.name,
                taskContext: this.currentTask
            };

            // Send message to BECA backend
            const response = await this.becaClient.sendMessage(userMessage, context);

            // Hide thinking indicator
            this.sendToWebview({ type: 'thinking', value: false });

            if (response.success) {
                // Add BECA's response
                this.addMessage({
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: response.response || 'No response from BECA',
                    timestamp: new Date().toISOString()
                });

                // Update task progress if applicable
                if (this.currentTask) {
                    this.updateTaskProgress(response.response);
                }
            } else {
                this.addMessage({
                    id: Date.now().toString(),
                    role: 'error',
                    content: `Error: ${response.error || 'Unknown error occurred'}`,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            this.sendToWebview({ type: 'thinking', value: false });
            this.addMessage({
                id: Date.now().toString(),
                role: 'error',
                content: `Error communicating with BECA: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            console.error('BECA error:', error);
        }
    }

    async createTask(userRequest) {
        this.currentTask = {
            id: Date.now().toString(),
            title: userRequest.substring(0, 100),
            steps: [
                { id: 1, title: 'Analyze requirements', status: 'in-progress' },
                { id: 2, title: 'Explore codebase', status: 'pending' },
                { id: 3, title: 'Make necessary changes', status: 'pending' },
                { id: 4, title: 'Test changes', status: 'pending' },
                { id: 5, title: 'Summarize and provide next steps', status: 'pending' }
            ],
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        this.sendToWebview({
            type: 'taskCreated',
            task: this.currentTask
        });
    }

    updateTaskProgress(responseContent) {
        if (!this.currentTask) return;

        const content = responseContent.toLowerCase();
        
        // Simple heuristic to update task progress
        if (content.includes('analyzing') || content.includes('understanding')) {
            this.updateTaskStep(1, 'completed');
            this.updateTaskStep(2, 'in-progress');
        }
        
        if (content.includes('exploring') || content.includes('found')) {
            this.updateTaskStep(2, 'completed');
            this.updateTaskStep(3, 'in-progress');
        }
        
        if (content.includes('creating') || content.includes('modifying') || content.includes('editing')) {
            this.updateTaskStep(3, 'completed');
            this.updateTaskStep(4, 'in-progress');
        }
        
        if (content.includes('testing') || content.includes('verified')) {
            this.updateTaskStep(4, 'completed');
            this.updateTaskStep(5, 'in-progress');
        }
        
        if (content.includes('summary') || content.includes('next steps') || content.includes('completed')) {
            this.updateTaskStep(5, 'completed');
        }
    }

    updateTaskStep(stepId, status) {
        if (!this.currentTask) return;
        
        const step = this.currentTask.steps.find(s => s.id === stepId);
        if (step && step.status !== status) {
            step.status = status;
            this.sendToWebview({
                type: 'taskUpdated',
                task: this.currentTask
            });
        }
    }

    async applyFileEdit(filePath, content) {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder open');
            }

            const fullPath = vscode.Uri.joinPath(workspaceFolder.uri, filePath);
            
            // Write the file
            await vscode.workspace.fs.writeFile(fullPath, Buffer.from(content, 'utf8'));

            vscode.window.showInformationMessage(`✅ Successfully wrote ${filePath}`);
            
            this.addMessage({
                id: Date.now().toString(),
                role: 'system',
                content: `✅ Applied changes to ${filePath}`,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to write ${filePath}: ${error.message}`);
            this.addMessage({
                id: Date.now().toString(),
                role: 'error',
                content: `❌ Failed to apply changes to ${filePath}: ${error.message}`,
                timestamp: new Date().toISOString()
            });
        }
    }

    addMessage(message) {
        this.conversationHistory.push(message);
        this.sendToWebview({
            type: 'messageAdded',
            message: message
        });
    }

    sendToWebview(message) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    updateWebview() {
        this.sendToWebview({
            type: 'fullUpdate',
            state: {
                conversationHistory: this.conversationHistory,
                currentTask: this.currentTask,
                exploredFiles: []
            }
        });
    }

    getHtmlContent(webview) {
        // Get URIs for the built assets
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'webview-ui', 'dist', 'assets', 'index.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'webview-ui', 'dist', 'assets', 'index.css')
        );

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
            <link href="${styleUri}" rel="stylesheet">
            <title>BECA Assistant</title>
        </head>
        <body>
            <div id="root"></div>
            <script type="module" src="${scriptUri}"></script>
        </body>
        </html>`;
    }

    async startNewTask() {
        if (this.conversationHistory.length > 0) {
            const answer = await vscode.window.showWarningMessage(
                'Start a new task? This will clear the current conversation.',
                'Yes', 'No'
            );
            if (answer !== 'Yes') return;
        }

        this.currentTask = null;
        this.conversationHistory = [];
        this.updateWebview();
        
        vscode.window.showInformationMessage('Started new task');
    }
}

module.exports = { BecaProvider };
