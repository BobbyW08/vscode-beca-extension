# BECA VS Code Extension

🤖 **Badass Expert Coding Agent** - Your AI-powered coding companion directly in VS Code!

BECA is an intelligent VS Code extension that brings the power of AI-assisted development directly into your editor. Powered by Ollama and running on your infrastructure, BECA provides context-aware code suggestions, analysis, debugging assistance, and more.

## ✨ Features

### 🎯 Core Capabilities

- **Ask BECA Anything** (`Ctrl+Shift+B`): Chat with BECA about code, get explanations, or request help with any programming task
- **Intelligent Code Analysis**: Right-click on any code selection to get instant analysis and insights
- **File Review**: Get comprehensive code quality reviews for entire files
- **Smart Refactoring**: Receive AI-powered suggestions for improving your code
- **Error Detection & Fixes**: Automatic error detection with fix suggestions
- **Test Generation**: Generate unit tests for your code automatically
- **Code Documentation**: Add comprehensive comments and docstrings

### 🔍 Inline Features

- **Hover Tooltips**: Hover over code to get instant BECA insights
- **Code Completion**: Intelligent code suggestions as you type
- **Real-time Diagnostics**: Continuous code analysis with inline warnings and suggestions
- **Context-Aware Help**: BECA understands your project context

### 🛠️ Advanced Features

- **Auto-Review on Save**: Optionally review files automatically when you save
- **Debug Assistant**: Automatic error analysis during debugging sessions
- **Terminal Integration**: Execute commands through BECA's intelligent terminal
- **Conversation History**: Access previous conversations with BECA
- **Sidebar Chat**: Dedicated chat panel for ongoing conversations

## 📦 Installation

### Prerequisites

1. **BECA Backend Running**: Ensure BECA is running (typically at `http://localhost:7860`)
2. **VS Code**: Version 1.85.0 or higher

### Install Extension

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "BECA"
4. Click Install

Or install from VSIX:
```bash
code --install-extension beca-vscode-1.0.0.vsix
```

## ⚙️ Configuration

Access settings via `File > Preferences > Settings` and search for "BECA":

### Essential Settings

- **`beca.apiUrl`**: BECA Gradio API URL (default: `http://localhost:7860`)
  ```json
  "beca.apiUrl": "http://localhost:7860"
  ```

### Feature Toggles

- **`beca.autoReview`**: Automatically review files on save (default: `false`)
- **`beca.showInlineHints`**: Show inline code suggestions (default: `true`)
- **`beca.enableHoverTooltips`**: Show BECA insights on hover (default: `true`)
- **`beca.debugAssistant`**: Enable debug assistant (default: `true`)
- **`beca.terminalIntegration`**: Enable terminal integration (default: `true`)

### Performance Settings

- **`beca.suggestionDelay`**: Delay before showing suggestions in ms (default: `2000`)
- **`beca.maxSuggestions`**: Maximum suggestions to show (default: `3`)

## 🚀 Usage

### Quick Start

1. **Start BECA Backend**:
   ```bash
   cd C:\dev
   .\.venv\Scripts\Activate.ps1
   python beca_gui.py
   ```

2. **Open VS Code** and the extension will auto-connect

3. **Try These Commands**:
   - Press `Ctrl+Shift+B` to ask BECA anything
   - Right-click code → "BECA: Analyze This Code"
   - Click BECA icon in sidebar for chat interface

### Common Workflows

#### 1. Code Review
```
1. Open a file
2. Click the checklist icon in title bar
3. View BECA's comprehensive review
```

#### 2. Debug Assistance
```
1. Start debugging session
2. When error occurs, BECA offers to analyze
3. View detailed error analysis and fixes
```

#### 3. Quick Code Help
```
1. Select code snippet
2. Right-click → "BECA: Explain This Code"
3. Get instant explanation
```

#### 4. Generate Tests
```
1. Select function/class
2. Command Palette → "BECA: Generate Tests"
3. Review and save generated tests
```

## 🎨 Interface

### Status Bar
- Shows BECA connection status
- Click for detailed status information
- Animates when BECA is working

### Sidebar Panel
Three views:
- **Chat**: Interactive conversation with BECA
- **History**: Previous conversations
- **Insights**: Code tips and suggestions

### Context Menu
Right-click on code for:
- Analyze Code
- Explain Code  
- Suggest Refactoring
- Fix Error

## 🔧 Commands

Access via Command Palette (`Ctrl+Shift+P`):

| Command | Shortcut | Description |
|---------|----------|-------------|
| BECA: Ask BECA | `Ctrl+Shift+B` | Open chat dialog |
| BECA: Analyze This Code | `Ctrl+Shift+A` | Analyze selected code |
| BECA: Review Current File | - | Full file review |
| BECA: Explain This Code | - | Get code explanation |
| BECA: Fix This Error | - | Get error fix suggestions |
| BECA: Generate Tests | - | Create unit tests |
| BECA: Suggest Refactoring | - | Get refactoring ideas |
| BECA: Add Comments | - | Add documentation |
| BECA: Show History | - | View conversation history |
| BECA: Toggle Auto-Review | - | Enable/disable auto-review |
| BECA: Show Status | - | Display connection status |

## 🏗️ Architecture

```
Extension Structure:
├── extension.js          # Main activation
├── beca-client.js        # API communication
├── commands/             # Command handlers
│   ├── askBeca.js
│   ├── analyzeCode.js
│   └── reviewFile.js
├── providers/            # Language features
│   ├── hoverProvider.js
│   ├── completionProvider.js
│   └── diagnosticProvider.js
├── views/                # UI components
│   ├── statusBar.js
│   └── sidebar.js
├── watchers/             # File monitoring
│   └── fileWatcher.js
├── assistants/           # Smart features
│   └── debugAssistant.js
└── terminal/             # Terminal integration
    └── terminalIntegration.js
```

## 🔒 Privacy & Security

- **Local-First**: All processing happens through your BECA instance
- **No External APIs**: No data sent to third parties
- **Your Infrastructure**: Runs on your Google Cloud GPU
- **Code Privacy**: Your code stays on your machine

## 🐛 Troubleshooting

### Connection Issues

**Problem**: "Cannot connect to BECA"
```
Solutions:
1. Check BECA is running: http://localhost:7860
2. Verify API URL in settings
3. Check firewall/network settings
```

### Performance Issues

**Problem**: Slow suggestions
```
Solutions:
1. Increase suggestionDelay in settings
2. Reduce maxSuggestions
3. Disable hover tooltips if not needed
```

### Auto-Review Not Working

**Problem**: Files not auto-reviewed on save
```
Solutions:
1. Check beca.autoReview is enabled
2. Ensure file is a supported code language
3. Check BECA backend is responsive
```

## 💡 Tips & Tricks

1. **Select Context**: Select relevant code before asking questions for better context
2. **Use Keyboard Shortcuts**: `Ctrl+Shift+B` for quick access
3. **Review History**: Check conversation history for past solutions
4. **Customize Keybindings**: Modify shortcuts in Keyboard Shortcuts settings
5. **Disable Features**: Turn off unused features for better performance

## 🤝 Contributing

BECA is part of a larger ecosystem. Issues and suggestions welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Related

- **BECA Core**: Main BECA application
- **BECA Documentation**: Full docs at project README
- **Ollama**: https://ollama.ai

## 📊 System Requirements

- **VS Code**: 1.85.0 or higher
- **BECA Backend**: Running instance required
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Network**: Connection to BECA API endpoint

## 🆘 Support

For issues:
1. Check troubleshooting section
2. Verify BECA backend is running
3. Check extension logs: View → Output → BECA
4. Report bugs via issue tracker

## 🎉 Acknowledgments

Built with:
- VS Code Extension API
- Axios for HTTP requests
- Love for coding ❤️

---

**Made with 🤖 by BECA Team**

Enjoy coding with your AI companion! 🚀
