# BECA VS Code Extension - Quick Start Guide

This guide will help you get started with the BECA VS Code extension in 5 minutes.

## Step 1: Installation

The extension should already be installed. Verify by checking the Extensions panel in VS Code.

### Verify Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for "BECA"
4. You should see "BECA - AI Coding Assistant" installed

## Step 2: Check BECA Backend Connection

BECA must be running on your Google Cloud Compute Engine instance at `http://127.0.0.1:7862`.

### Test Connection

1. Open a terminal
2. Run: `curl http://127.0.0.1:7862`
3. You should get a response from the BECA server

### If Connection Fails

- Ensure BECA is running on your GCP instance
- Check your SSH tunnel or port forwarding is active
- Verify firewall rules allow connection to port 7862

## Step 3: Reload VS Code

After installation, reload VS Code to activate the extension:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Reload Window"
3. Press Enter

## Step 4: Verify Extension is Active

Check if BECA is running:

1. Press `Ctrl+Shift+P`
2. Type "BECA: Show Status"
3. Press Enter

You should see a status message indicating whether BECA is connected.

## Step 5: Try Your First Command

Let's test BECA with a simple command:

### Method 1: Ask BECA Anything

1. Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac)
2. Type your question (e.g., "What can you do?")
3. Wait for BECA's response

### Method 2: Analyze Code

1. Open any code file (Python, JavaScript, etc.)
2. Select a few lines of code
3. Right-click on the selection
4. Choose "BECA: Analyze This Code"
5. Review BECA's analysis

### Method 3: Use the Sidebar

1. Click the BECA icon in the Activity Bar (left sidebar)
2. Open the "Chat with BECA" view
3. Start chatting with BECA

## Common Commands

### Keyboard Shortcuts

- `Ctrl+Shift+B` - Ask BECA anything
- `Ctrl+Shift+A` - Analyze selected code

### Command Palette Commands

Open Command Palette with `Ctrl+Shift+P` and type:

- **BECA: Ask BECA** - Start a conversation
- **BECA: Review Current File** - Get file review
- **BECA: Show Status** - Check connection status
- **BECA: Show Conversation History** - View past chats

### Context Menu Commands

Right-click in editor to access:

- **BECA: Analyze This Code** (when text selected)
- **BECA: Explain This Code** (when text selected)
- **BECA: Suggest Refactoring** (when text selected)
- **BECA: Fix This Error** (anywhere in file)

## Usage Scenarios

### Scenario 1: Understanding Complex Code

1. Open a file with complex code
2. Select the confusing part
3. Right-click → "BECA: Explain This Code"
4. Read BECA's explanation

### Scenario 2: Fixing Errors

1. Notice an error in your code
2. Place cursor on the error line
3. Press `Ctrl+Shift+P`
4. Type "BECA: Fix This Error"
5. Review and apply BECA's suggestions

### Scenario 3: Code Review

1. Open a file you want reviewed
2. Press `Ctrl+Shift+P`
3. Type "BECA: Review Current File"
4. Review BECA's feedback and suggestions

### Scenario 4: Generating Tests

1. Select a function or class
2. Right-click → "BECA: Generate Tests"
3. Copy the generated tests to your test file

### Scenario 5: Adding Comments

1. Select code that needs comments
2. Right-click → "BECA: Add Comments"
3. BECA will add meaningful comments

## Troubleshooting

### Commands Not Working?

**Problem**: "Command 'beca.askBeca' not found"

**Solution**:
1. Reload VS Code window (`Ctrl+Shift+P` → "Reload Window")
2. Check Output panel for errors (View → Output → Select "BECA")
3. Verify extension is installed in Extensions panel

### No Response from BECA?

**Problem**: Commands execute but no response

**Solution**:
1. Check BECA backend is running: `curl http://127.0.0.1:7862`
2. Verify API URL in settings matches your setup
3. Check Output panel for connection errors

### Extension Not Activating?

**Problem**: BECA icon not in sidebar

**Solution**:
1. Check Extensions panel - is BECA enabled?
2. Look for error messages in Output panel
3. Try uninstalling and reinstalling the extension
4. Restart VS Code

## Configuration

### Basic Settings

1. Open Settings: `File > Preferences > Settings`
2. Search for "BECA"
3. Configure:
   - **API URL**: Set to `http://127.0.0.1:7862`
   - **Auto Review**: Enable/disable automatic reviews on save
   - **Hover Tooltips**: Show/hide hover insights
   - **Debug Assistant**: Enable/disable debug features

### Recommended Settings for Beginners

```json
{
  "beca.apiUrl": "http://127.0.0.1:7862",
  "beca.autoReview": false,
  "beca.showInlineHints": true,
  "beca.enableHoverTooltips": true,
  "beca.debugAssistant": true,
  "beca.suggestionDelay": 2000
}
```

## Tips for Best Results

### 1. Be Specific
When asking BECA questions, be specific about what you need:
- ✅ "Explain how this sorting algorithm works"
- ❌ "What does this do?"

### 2. Provide Context
Select relevant code when using analysis commands:
- Select the entire function, not just one line
- Include related code for better understanding

### 3. Use the Right Command
Choose the appropriate command for your task:
- Use "Explain" for understanding code
- Use "Analyze" for code quality insights
- Use "Refactor" for improvement suggestions
- Use "Fix Error" when you have specific errors

### 4. Review Suggestions Carefully
BECA provides intelligent suggestions, but always:
- Review generated code before using it
- Test changes thoroughly
- Understand the reasoning behind suggestions

### 5. Build Conversation Context
Use "Show Conversation History" to:
- Review past interactions
- Build on previous discussions
- Track BECA's suggestions over time

## Next Steps

Now that you're set up, explore these advanced features:

1. **Enable Auto-Review**: Turn on automatic file reviews on save
2. **Explore Hover Tooltips**: Hover over code to see BECA insights
3. **Try Debug Assistant**: Use BECA to help debug errors
4. **Check History**: Review past conversations for learning

## Getting Help

- **Documentation**: See [README.md](./README.md) for full documentation
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions
- **Issues**: Report bugs at https://github.com/BobbyW08/BECA-clone/issues

## Feedback

We'd love to hear about your experience with BECA! Share:
- What works well
- What could be improved
- Feature requests
- Bug reports

---

**Happy coding with BECA! 🚀**
