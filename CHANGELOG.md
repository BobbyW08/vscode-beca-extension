# Change Log

All notable changes to the BECA VS Code extension will be documented in this file.

## [1.0.0] - 2025-01-11

### 🎉 Initial Release

#### Core Features
- **Ask BECA Command** (`Ctrl+Shift+B`): Interactive chat with BECA
- **Code Analysis**: Right-click context menu for instant code analysis
- **File Review**: Comprehensive file-level code reviews
- **Code Explanation**: Detailed explanations of selected code
- **Error Fixing**: AI-powered error detection and fix suggestions
- **Test Generation**: Automatic unit test generation
- **Refactoring Suggestions**: Intelligent code improvement recommendations
- **Documentation**: Automatic comment and docstring generation

#### Inline Features
- **Hover Provider**: Instant insights on hover
- **Completion Provider**: Smart code suggestions as you type
- **Diagnostic Provider**: Real-time code analysis and warnings

#### Advanced Features
- **Auto-Review on Save**: Optional automatic file review on save
- **Debug Assistant**: Automatic error analysis during debugging
- **Terminal Integration**: Execute commands through BECA terminal
- **File Watcher**: Monitor file changes for suggestions

#### UI Components
- **Status Bar Integration**: Connection status and activity indicator
- **Sidebar Panel**: Dedicated chat, history, and insights views
- **Context Menus**: Quick access to BECA features
- **Webview Panels**: Rich response display with code highlighting

#### Configuration
- API URL configuration
- Feature toggles for all major features
- Performance tuning options
- Keyboard shortcut customization

### Technical Details
- Built with VS Code Extension API 1.85.0+
- Axios for HTTP communication
- Modular architecture for easy extension
- Comprehensive error handling
- Resource cleanup and disposal

### Known Limitations
- Requires BECA backend to be running
- Network latency may affect response times
- Large files may take longer to analyze

## [Unreleased]

### Planned Features
- Multi-language support
- Workspace-level insights
- Code snippet library
- Custom prompt templates
- Offline mode with caching
- Performance optimizations
- Advanced debugging features
- Git integration enhancements
