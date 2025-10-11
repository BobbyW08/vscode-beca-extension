const vscode = require('vscode');

/**
 * BECA Terminal Integration
 * Allows executing BECA commands directly from the terminal
 */
class TerminalIntegration {
    constructor(becaClient) {
        this.becaClient = becaClient;
        this.terminals = new Map();
        
        // Listen for terminal close events
        this.terminalCloseListener = vscode.window.onDidCloseTerminal(
            this.onTerminalClose.bind(this)
        );
    }

    /**
     * Handle terminal close
     */
    onTerminalClose(terminal) {
        this.terminals.delete(terminal.name);
    }

    /**
     * Get or create BECA terminal
     * @returns {vscode.Terminal}
     */
    getBecaTerminal() {
        const terminalName = 'BECA Terminal';
        
        // Check if terminal already exists
        const existingTerminal = vscode.window.terminals.find(
            t => t.name === terminalName
        );
        
        if (existingTerminal) {
            return existingTerminal;
        }

        // Create new terminal
        const terminal = vscode.window.createTerminal({
            name: terminalName,
            iconPath: new vscode.ThemeIcon('robot')
        });

        this.terminals.set(terminalName, terminal);
        
        // Show welcome message
        terminal.show();
        terminal.sendText('echo "🤖 BECA Terminal - Type \'beca help\' for available commands"');
        
        return terminal;
    }

    /**
     * Execute command in BECA terminal
     * @param {string} command
     */
    async executeInTerminal(command) {
        const terminal = this.getBecaTerminal();
        terminal.show();
        terminal.sendText(command);
    }

    /**
     * Run command through BECA and show results
     * @param {string} command
     */
    async runBecaCommand(command) {
        try {
            const terminal = this.getBecaTerminal();
            terminal.show();
            
            // Send command to terminal
            terminal.sendText(`echo "Executing: ${command}"`);
            
            // Get current working directory
            const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
            
            // Execute through BECA
            const result = await this.becaClient.executeCommand(command, cwd);
            
            if (result.success) {
                terminal.sendText(`echo "✅ Command completed successfully"`);
                
                // Show result in output panel too
                const outputChannel = vscode.window.createOutputChannel('BECA Command Output');
                outputChannel.appendLine(`Command: ${command}`);
                outputChannel.appendLine(`Output:\n${result.response}`);
                outputChannel.show(true);
            } else {
                terminal.sendText(`echo "❌ Command failed: ${result.error}"`);
                vscode.window.showErrorMessage(`Command failed: ${result.error}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Terminal error: ${error.message}`);
        }
    }

    /**
     * Show terminal command palette
     */
    async showCommandPalette() {
        const commands = [
            {
                label: '$(terminal) Open BECA Terminal',
                description: 'Open the BECA integrated terminal',
                action: () => this.getBecaTerminal().show()
            },
            {
                label: '$(play) Run Command',
                description: 'Execute a shell command through BECA',
                action: async () => {
                    const command = await vscode.window.showInputBox({
                        prompt: 'Enter command to execute',
                        placeHolder: 'e.g., npm test'
                    });
                    if (command) {
                        await this.runBecaCommand(command);
                    }
                }
            },
            {
                label: '$(package) Install Packages',
                description: 'Install npm/pip packages with BECA assistance',
                action: async () => {
                    const packages = await vscode.window.showInputBox({
                        prompt: 'Enter package names to install (space-separated)',
                        placeHolder: 'e.g., axios express'
                    });
                    if (packages) {
                        await this.installPackages(packages);
                    }
                }
            },
            {
                label: '$(git-commit) Git Commands',
                description: 'Execute git commands through BECA',
                action: async () => {
                    await this.showGitCommands();
                }
            }
        ];

        const selected = await vscode.window.showQuickPick(commands, {
            placeHolder: 'Select a terminal command'
        });

        if (selected) {
            await selected.action();
        }
    }

    /**
     * Install packages with BECA assistance
     */
    async installPackages(packages) {
        const language = await vscode.window.showQuickPick(
            ['JavaScript (npm)', 'Python (pip)', 'Other'],
            { placeHolder: 'Select package manager' }
        );

        if (!language) return;

        let command;
        if (language.includes('npm')) {
            command = `npm install ${packages}`;
        } else if (language.includes('pip')) {
            command = `pip install ${packages}`;
        } else {
            command = await vscode.window.showInputBox({
                prompt: 'Enter full install command',
                value: packages
            });
        }

        if (command) {
            await this.runBecaCommand(command);
        }
    }

    /**
     * Show git commands quick pick
     */
    async showGitCommands() {
        const gitCommands = [
            { label: 'Git Status', command: 'git status' },
            { label: 'Git Add All', command: 'git add .' },
            { label: 'Git Commit', command: 'git commit -m "Update"' },
            { label: 'Git Push', command: 'git push' },
            { label: 'Git Pull', command: 'git pull' },
            { label: 'Git Log', command: 'git log --oneline -10' }
        ];

        const selected = await vscode.window.showQuickPick(gitCommands, {
            placeHolder: 'Select a git command'
        });

        if (selected) {
            if (selected.label === 'Git Commit') {
                const message = await vscode.window.showInputBox({
                    prompt: 'Enter commit message',
                    placeHolder: 'e.g., Added new feature'
                });
                if (message) {
                    await this.runBecaCommand(`git commit -m "${message}"`);
                }
            } else {
                await this.runBecaCommand(selected.command);
            }
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.terminalCloseListener.dispose();
        
        // Close all BECA terminals
        for (const terminal of this.terminals.values()) {
            terminal.dispose();
        }
        this.terminals.clear();
    }
}

module.exports = { TerminalIntegration };
