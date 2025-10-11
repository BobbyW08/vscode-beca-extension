# BECA VS Code Extension - Installation Guide

Complete guide to installing and configuring the BECA VS Code extension.

## Prerequisites

### 1. BECA Backend
Ensure BECA is installed and running:

```bash
# Navigate to BECA directory
cd C:\dev

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start BECA GUI
python beca_gui.py
```

BECA should be accessible at `http://localhost:7860`

### 2. VS Code
- Version 1.85.0 or higher required
- Download from: https://code.visualstudio.com/

## Installation Methods

### Method 1: From Marketplace (Recommended)
1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for "BECA"
4. Click **Install**
5. Reload VS Code when prompted

### Method 2: From VSIX File
1. Download `beca-vscode-1.0.0.vsix`
2. Open VS Code
3. Press `Ctrl+Shift+P` to open Command Palette
4. Type "Extensions: Install from VSIX"
5. Select the downloaded VSIX file
6. Reload VS Code

### Method 3: Manual Installation
```bash
# Clone or copy extension to VS Code extensions folder
cd %USERPROFILE%\.vscode\extensions
# Copy vscode-beca-extension folder here

# Install dependencies
cd vscode-beca-extension
npm install

# Reload VS Code
```

## Initial Configuration

### 1. Basic Setup
After installation, configure the API URL:

1. Open Settings (`Ctrl+,`)
2. Search for "BECA"
3. Set `beca.apiUrl` to your BECA instance URL
   - Default: `http://localhost:7860`
   - For remote: `http://your-server-ip:7860`

### 2. Feature Configuration
Enable/disable features based on your needs:

```json
{
  "beca.apiUrl": "http://localhost:7860",
  "beca.autoReview": false,           // Auto-review on save
  "beca.showInlineHints": true,       // Code suggestions
  "beca.enableHoverTooltips": true,   // Hover insights
  "beca.debugAssistant": true,        // Debug help
  "beca.terminalIntegration": true,   // Terminal features
  "beca.suggestionDelay": 2000,       // Delay in ms
  "beca.maxSuggestions": 3            // Max suggestions
}
```

### 3. Keyboard Shortcuts (Optional)
Customize shortcuts in `File > Preferences > Keyboard Shortcuts`:

- Search for "BECA"
- Click pencil icon to edit
- Set your preferred shortcuts

## Verification

### Test Connection
1. Look for BECA icon in status bar (bottom-right)
2. Should show "BECA Ready" with green status
3. Click icon to see detailed status

If disconnected:
- Verify BECA backend is running
- Check API URL in settings
- Check network/firewall

### Test Basic Features
1. **Ask BECA**: Press `Ctrl+Shift+B`
   - Should open input dialog
   - Type a question and press Enter
   
2. **Code Analysis**: 
   - Select some code
   - Right-click → "BECA: Analyze This Code"
   - Should show analysis panel

3. **Sidebar**: 
   - Click BECA icon in Activity Bar (left side)
   - Should show Chat, History, and Insights views

## Troubleshooting

### Extension Not Loading
```bash
# Check extension is installed
code --list-extensions | findstr beca

# Reinstall if needed
code --uninstall-extension beca.beca-vscode
code --install-extension beca-vscode-1.0.0.vsix
```

### Connection Errors
1. **Check BECA is running**:
   ```bash
   curl http://localhost:7860
   ```

2. **Verify firewall rules**:
   - Allow port 7860
   - Check Windows Firewall settings

3. **Check API URL**:
   - Settings → BECA → API URL
   - Must be correct protocol (http://)

### Performance Issues
If extension is slow:

1. **Increase delays**:
   ```json
   {
     "beca.suggestionDelay": 3000
   }
   ```

2. **Reduce suggestions**:
   ```json
   {
     "beca.maxSuggestions": 2
   }
   ```

3. **Disable features**:
   ```json
   {
     "beca.showInlineHints": false,
     "beca.enableHoverTooltips": false
   }
   ```

## Updating

### From Marketplace
1. VS Code will notify of updates
2. Click "Update" button
3. Reload when prompted

### From VSIX
1. Download new version
2. Uninstall old version
3. Install new VSIX file
4. Reload VS Code

## Uninstallation

### Complete Removal
1. Open Extensions (`Ctrl+Shift+X`)
2. Find "BECA"
3. Click gear icon → Uninstall
4. Reload VS Code

Settings are preserved. To remove settings:
- Delete from `settings.json`
- Or reset in Settings UI

## Next Steps

After successful installation:

1. **Read README**: Review features and commands
2. **Try Examples**: Test basic workflows
3. **Configure**: Adjust settings for your workflow
4. **Explore**: Try all features to find what works best

## Support

For installation issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Verify BECA backend is running
3. Review extension logs:
   - View → Output → BECA
4. Report issues with:
   - VS Code version
   - Extension version
   - Error messages
   - Steps to reproduce

## Additional Resources

- **README**: Full feature documentation
- **CHANGELOG**: Version history
- **BECA Docs**: Main BECA documentation
- **VS Code Docs**: https://code.visualstudio.com/docs

---

**Installation complete! Start coding with BECA! 🚀**
