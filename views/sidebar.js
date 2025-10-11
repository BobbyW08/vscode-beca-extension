const vscode = require('vscode');

/**
 * BECA Sidebar Provider
 * Manages the sidebar views for chat, history, and insights
 */
class SidebarProvider {
    constructor(context, becaClient) {
        this.context = context;
        this.becaClient = becaClient;
    }

    /**
     * Get chat view provider
     */
    getChatProvider() {
        return new ChatViewProvider(this.context, this.becaClient);
    }

    /**
     * Get history view provider
     */
    getHistoryProvider() {
        return new HistoryViewProvider(this.context, this.becaClient);
    }

    /**
     * Get insights view provider
     */
    getInsightsProvider() {
        return new InsightsViewProvider(this.context, this.becaClient);
    }
}

/**
 * Chat View Provider
 */
class ChatViewProvider {
    constructor(context, becaClient) {
        this.context = context;
        this.becaClient = becaClient;
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'sendMessage':
                    await this.handleSendMessage(data.message, webviewView.webview);
                    break;
            }
        });
    }

    async handleSendMessage(message, webview) {
        try {
            webview.postMessage({ type: 'thinking' });
            
            const result = await this.becaClient.sendMessage(message);
            
            webview.postMessage({
                type: 'response',
                message: result.response,
                success: result.success
            });
        } catch (error) {
            webview.postMessage({
                type: 'error',
                message: error.message
            });
        }
    }

    getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 10px;
            color: var(--vscode-foreground);
        }
        #chat-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        #messages {
            flex-grow: 1;
            overflow-y: auto;
            margin-bottom: 10px;
        }
        .message {
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
        }
        .user-message {
            background: var(--vscode-input-background);
            text-align: right;
        }
        .beca-message {
            background: var(--vscode-editor-background);
        }
        #input-container {
            display: flex;
            gap: 5px;
        }
        #message-input {
            flex-grow: 1;
            padding: 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
        }
        button {
            padding: 8px 16px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .thinking {
            font-style: italic;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div id="chat-container">
        <div id="messages"></div>
        <div id="input-container">
            <input type="text" id="message-input" placeholder="Ask BECA anything..." />
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesDiv = document.getElementById('messages');
        const input = document.getElementById('message-input');

        function sendMessage() {
            const message = input.value.trim();
            if (!message) return;

            addMessage('You: ' + message, 'user-message');
            input.value = '';

            vscode.postMessage({
                type: 'sendMessage',
                message: message
            });
        }

        function addMessage(text, className) {
            const div = document.createElement('div');
            div.className = 'message ' + className;
            div.textContent = text;
            messagesDiv.appendChild(div);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        window.addEventListener('message', event => {
            const data = event.data;
            switch (data.type) {
                case 'thinking':
                    addMessage('BECA is thinking...', 'beca-message thinking');
                    break;
                case 'response':
                    // Remove thinking message
                    const lastMessage = messagesDiv.lastChild;
                    if (lastMessage && lastMessage.classList.contains('thinking')) {
                        messagesDiv.removeChild(lastMessage);
                    }
                    addMessage('BECA: ' + data.message, 'beca-message');
                    break;
                case 'error':
                    addMessage('Error: ' + data.message, 'beca-message');
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}

/**
 * History View Provider
 */
class HistoryViewProvider {
    constructor(context, becaClient) {
        this.context = context;
        this.becaClient = becaClient;
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true
        };

        this.updateHistory(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async data => {
            if (data.type === 'refresh') {
                await this.updateHistory(webviewView.webview);
            }
        });
    }

    async updateHistory(webview) {
        const result = await this.becaClient.getHistory(10);
        webview.html = this.getHistoryHtml(result.conversations || []);
    }

    getHistoryHtml(conversations) {
        const items = conversations.map(conv => `
            <div class="history-item">
                <div class="timestamp">${conv.timestamp}</div>
                <div class="message">${this.escapeHtml(conv.user_message.substring(0, 100))}...</div>
            </div>
        `).join('');

        return `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 10px;
            color: var(--vscode-foreground);
        }
        .history-item {
            padding: 10px;
            margin: 5px 0;
            background: var(--vscode-editor-background);
            border-radius: 5px;
            cursor: pointer;
        }
        .history-item:hover {
            background: var(--vscode-list-hoverBackground);
        }
        .timestamp {
            font-size: 0.8em;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
        }
        .message {
            font-size: 0.9em;
        }
        button {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <button onclick="refresh()">🔄 Refresh</button>
    <div id="history">${items}</div>
    <script>
        const vscode = acquireVsCodeApi();
        function refresh() {
            vscode.postMessage({ type: 'refresh' });
        }
    </script>
</body>
</html>`;
    }

    escapeHtml(text) {
        return text.replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[c]);
    }
}

/**
 * Insights View Provider
 */
class InsightsViewProvider {
    constructor(context, becaClient) {
        this.context = context;
        this.becaClient = becaClient;
    }

    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getInsightsHtml();
    }

    getInsightsHtml() {
        return `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 10px;
            color: var(--vscode-foreground);
        }
        .insight-card {
            background: var(--vscode-editor-background);
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 3px solid var(--vscode-button-background);
        }
        .insight-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .insight-description {
            font-size: 0.9em;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <h3>💡 Code Insights</h3>
    <div class="insight-card">
        <div class="insight-title">Quick Tips</div>
        <div class="insight-description">
            • Select code and right-click for BECA actions<br>
            • Use Ctrl+Shift+B to ask BECA anything<br>
            • Hover over code for instant insights
        </div>
    </div>
    <div class="insight-card">
        <div class="insight-title">Features</div>
        <div class="insight-description">
            • Real-time code analysis<br>
            • Intelligent suggestions<br>
            • Error detection & fixes<br>
            • Code review & refactoring
        </div>
    </div>
</body>
</html>`;
    }
}

module.exports = { SidebarProvider };
