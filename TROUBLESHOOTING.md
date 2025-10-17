# BECA Extension Troubleshooting Guide

## Current Issues & Fixes

### Issue 1: Commands Not Working ("command 'beca.askBeca' not found")

This means the extension isn't activating properly. Follow these steps:

#### Step 1: Check Extension Logs
1. Open VS Code Command Palette (`Ctrl+Shift+P`)
2. Type "Developer: Toggle Developer Tools"
3. Go to Console tab
4. Look for any BECA-related errors

Common errors:
- Module not found errors
- Syntax errors in extension code
- Missing dependencies

#### Step 2: Reload Window
1. Press `Ctrl+Shift+P`
2. Type "Developer: Reload Window"
3. Try the commands again

#### Step 3: Check Extension Status
1. Go to Extensions view (`Ctrl+Shift+X`)
2. Search for "BECA"
3. Check if it shows any error messages
4. Try disabling and re-enabling

### Issue 2: No BECA Icon in Sidebar

The sidebar icon isn't showing because:
1. The extension might not be activating
2. The viewsContainer requires an icon file (we removed it)

**Quick Fix**: The commands should work even without the sidebar icon. Focus on getting commands working first.

### Issue 3: Module Resolution Errors

If you see errors like "Cannot find module" in the console:

```bash
cd vscode-beca-extension
npm install
```

Then reload VS Code.

## Debugging Steps

### 1. Test in Development Mode

This will show detailed error messages:

```bash
# Open extension folder
cd C:\dev\vscode-beca-extension
code .

# Press F5 to launch Extension Development Host
# This opens a new VS Code window with the extension loaded
# Check the DEBUG CONSOLE for errors
```

### 2. Check if BECA Backend is Running

The extension needs BECA backend running:

```bash
cd C:\dev
.\.venv\Scripts\Activate.ps1
python beca_gui.py
```

Verify it's accessible at: http://localhost:7860

### 3. Simplified Test

Create a test file to verify the extension loads:

**File**: `vscode-beca-extension/test-extension.js`

```javascript
const vscode = require('vscode');

async function activate(context) {
    console.log('BECA TEST: Extension activating...');
    
    const disposable = vscode.commands.registerCommand('beca.test', () => {
        vscode.window.showInformationMessage('BECA Test Command Works!');
    });
    
    context.subscriptions.push(disposable);
    console.log('BECA TEST: Extension activated successfully!');
}

function deactivate() {}

module.exports = { activate, deactivate };
```

## Common Fixes

### Fix 1: Reinstall Extension

```bash
# Uninstall
code --uninstall-extension beca.beca-vscode

# Reinstall
cd C:\dev\vscode-beca-extension
vsce package
code --install-extension beca-vscode-1.0.0.vsix
```

### Fix 2: Clear VS Code Cache

```bash
# Close VS Code completely
# Delete cache
Remove-Item -Recurse -Force "$env:APPDATA\Code\Cache"
Remove-Item -Recurse -Force "$env:APPDATA\Code\CachedData"

# Restart VS Code
```

### Fix 3: Check Node.js Compatibility

```bash
node --version  # Should be v16 or higher
```

## Next Steps After Commands Work

Once commands are working, we'll address:

1. **Restructure BECA Architecture**
   - Make VS Code the primary interface
   - Keep beca_gui.py for monitoring only
   - Direct Ollama communication from VS Code

2. **Add Cline Conversation Logging**
   - Create conversation logger
   - Store in BECA database
   - View in BECA GUI

3. **Fix langchain_ollama Import**
   - Install missing package
   - Update requirements.txt

## Getting Help

If issues persist:
1. Check DEBUG CONSOLE in Extension Development Host
