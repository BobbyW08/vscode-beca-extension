# BECA VS Code Extension

**Badass Expert Coding Agent** - Your AI-powered coding assistant directly in VS Code.

## Features

BECA integrates seamlessly with VS Code to provide intelligent code assistance, analysis, and generation capabilities powered by AI.

### Core Features

- 🤖 **Interactive Chat**: Chat with BECA directly in the sidebar
- 🔍 **Code Analysis**: Analyze selected code with context-aware insights
- 📝 **Code Review**: Automated file review with suggestions
- 💡 **Code Explanation**: Get detailed explanations of complex code
- 🐛 **Error Fixing**: AI-powered error detection and fixes
- ✅ **Test Generation**: Automatically generate unit tests
- 🔄 **Refactoring**: Smart refactoring suggestions
- 💬 **Auto Comments**: Generate meaningful code comments
- 📚 **Conversation History**: Track all interactions with BECA
- 🎯 **Hover Tooltips**: Get insights by hovering over code
- ⚡ **Real-time Suggestions**: Inline code suggestions as you type
- 🔧 **Debug Assistant**: Stack trace analysis and fix suggestions

## Installation

1. **Install the Extension**:
   ```bash
   code --install-extension beca-vscode-1.0.0.vsix
   ```

2. **Ensure BECA Backend is Running**:
   - BECA must be running at `http://127.0.0.1:7862`
   - Default configuration connects to Google Cloud Compute Engine instance

3. **Reload VS Code**:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Reload Window" and press Enter

## Quick Start

### Keyboard Shortcuts

- `Ctrl+Shift+B` (Mac: `Cmd+Shift+B`) - Ask BECA anything
- `Ctrl+Shift+A` (Mac: `Cmd+Shift+A`) - Analyze selected code

### Commands

Access all BECA commands via the Command Palette (`Ctrl+Shift+P`):

- **BECA: Ask BECA** - Start a conversation with BECA
- **BECA: Analyze This Code** - Analyze selected code
- **BECA: Review Current File** - Get a comprehensive file review
- **BECA: Explain This Code** - Get detailed code explanation
- **BECA: Fix This Error** - Get help fixing errors
- **BECA: Generate Tests** - Generate unit tests for selected code
- **BECA: Suggest Refactoring** - Get refactoring suggestions
- **BECA: Add Comments** - Automatically add meaningful comments
- **BECA: Show Conversation History** - View past interactions
- **BECA: Toggle Auto-Review on Save** - Enable/disable automatic reviews
- **BECA: Show Status** - Check BECA connection status

### Context Menu

Right-click in the editor to access BECA commands:
- **BECA: Analyze This Code** (when text is selected)
- **BECA: Explain This Code** (when text is selected)
- **BECA: Suggest Refactoring** (when text is selected)
- **BECA: Fix This Error** (in any file)

### Sidebar

Click the BECA icon in the Activity Bar to access:
- **Chat with BECA** - Interactive chat interface
- **Conversation History** - Browse past conversations
- **Code Insights** - View accumulated insights from BECA

## Configuration

Access settings via `File > Preferences > Settings` and search for "BECA":

### Available Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `beca.apiUrl` | string | `http://127.0.0.1:7862` | URL of the BECA backend API |
| `beca.autoReview` | boolean | `false` | Automatically review files on save |
| `beca.showInlineHints` | boolean | `true` | Show inline code hints and suggestions |
| `beca.enableHoverTooltips` | boolean | `true` | Show BECA insights on hover |
| `beca.debugAssistant` | boolean | `true` | Enable debug assistant for error analysis |
| `beca.terminalIntegration` | boolean | `true` | Enable terminal integration |
| `beca.suggestionDelay` | number | `2000` | Delay (ms) before showing suggestions |
| `beca.maxSuggestions` | number | `3` | Maximum number of suggestions to show |

### Example Configuration

```json
{
  "beca.apiUrl": "http://127.0.0.1:7862",
  "beca.autoReview": true,
  "beca.showInlineHints": true,
  "beca.enableHoverTooltips": true,
  "beca.debugAssistant": true,
  "beca.suggestionDelay": 1500,
  "beca.maxSuggestions": 5
}
```

## Usage Examples

### Example 1: Analyzing Code

1. Select a block of code
2. Right-click and choose "BECA: Analyze This Code"
3. Review BECA's analysis in the output panel

### Example 2: Getting Help with Errors

1. When you encounter an error, place cursor on the error line
2. Press `Ctrl+Shift+P` and type "BECA: Fix This Error"
3. BECA will analyze the error and suggest fixes

### Example 3: Generating Tests

1. Select a function or class
2. Right-click and choose "BECA: Generate Tests"
3. BECA will generate comprehensive unit tests

### Example 4: Code Review

1. Open a file you want reviewed
2. Press `Ctrl+Shift+P` and type "BECA: Review Current File"
3. BECA will provide a detailed review with suggestions

## Troubleshooting

### Extension Not Activating

1. Check if BECA backend is running: `curl http://127.0.0.1:7862`
2. Verify the API URL in settings matches your BECA instance
3. Check the Output panel (View > Output) and select "BECA" from dropdown
4. Reload VS Code: `Ctrl+Shift+P` > "Reload Window"

### Commands Not Found

1. Ensure the extension is installed: Check Extensions panel
2. Reload VS Code window
3. Check if there are any error messages in the Output panel

### Connection Errors

1. Verify BECA is accessible: `curl http://127.0.0.1:7862`
2. Check firewall settings
3. Ensure correct API URL in settings
4. Try running: `BECA: Show Status` to check connection

For detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Architecture

```
┌─────────────────┐
│   VS Code       │
│   Extension     │
└────────┬────────┘
         │
         │ HTTP API
         ▼
┌─────────────────┐
│  BECA Backend   │
│  (Gradio API)   │
└────────┬────────┘
         │
         │ Ollama API
         ▼
┌─────────────────┐
│  Ollama LLM     │
│  (deepseek)     │
└─────────────────┘
```

## Development

### Building from Source

```bash
# Navigate to extension directory
cd vscode-beca-extension

# Install dependencies
npm install

# Package the extension
vsce package

# Install the packaged extension
code --install-extension beca-vscode-1.0.0.vsix --force
```

### Project Structure

```
vscode-beca-extension/
├── package.json              # Extension manifest
├── extension.js              # Main activation code
├── beca-client.js           # BECA API client
├── commands/
│   ├── index.js             # Command implementations
│   ├── askBeca.js
│   ├── analyzeCode.js
│   └── reviewFile.js
├── providers/
│   ├── hoverProvider.js     # Hover tooltip provider
│   ├── completionProvider.js # Code completion provider
│   ├── diagnosticProvider.js # Error diagnostics
│   └── fileWatcher.js       # File change monitoring
└── views/
    ├── statusBar.js         # Status bar integration
    ├── sidebar.js           # Sidebar view provider
    └── chatPanel.js         # Chat webview panel
```

## Future Architecture (Planned)

Direct communication with Ollama for improved performance:

```
┌─────────────────┐
│   VS Code       │
│   Extension     │
└────────┬────────┘
         │
         │ Direct Ollama API
         ▼
┌─────────────────┐
│  Ollama LLM     │
│  (deepseek)     │
└─────────────────┘

BECA GUI → Monitoring & Learning Logs Only
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

- **Repository**: https://github.com/BobbyW08/BECA-clone
- **Issues**: https://github.com/BobbyW08/BECA-clone/issues
- **Documentation**: See `docs/` directory in main repository

## License

See LICENSE file in the main repository.

## Acknowledgments

- Built with the VS Code Extension API
- Powered by Ollama and deepseek-coder
- Inspired by Cline and other AI coding assistants

---

**Made with ❤️ by the BECA team**
