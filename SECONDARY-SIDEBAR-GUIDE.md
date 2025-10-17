# BECA Secondary Sidebar Guide

## ✅ Extension Successfully Updated!

Your BECA extension has been updated to support both the primary sidebar and the secondary sidebar (panel), similar to how Cline works!

## 📍 Accessing BECA Chat

### Option 1: Primary Sidebar (Activity Bar)
1. Look for the BECA icon (💬) in the Activity Bar on the left side of VS Code
2. Click it to open the BECA sidebar
3. You'll see three views:
   - **Chat with BECA** - Main chat interface
   - **Conversation History** - Your past conversations
   - **Code Insights** - Tips and information

### Option 2: Secondary Sidebar (Panel) - NEW! 🎉
1. Open the **Panel** at the bottom of VS Code:
   - Press `Ctrl+J` (Windows/Linux) or `Cmd+J` (Mac)
   - Or go to: View → Appearance → Panel
2. Look for the **BECA** tab in the panel (next to Problems, Output, etc.)
3. Click on it to open BECA in the panel
4. Now you can chat with BECA while keeping your primary sidebar free for Explorer, Git, etc.!

### Option 3: Keyboard Shortcut
Press `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (Mac) to quickly open the BECA ask dialog!

## 🚀 Using BECA

### In the Chat View
1. Type your question in the input field
2. Press Enter or click Send
3. BECA will respond in the chat window
4. Continue the conversation naturally!

### Via Keyboard Shortcut (Ctrl+Shift+B)
1. Press the shortcut
2. Type your question in the popup dialog
3. BECA will open a webview panel with the response

### Context-Aware Commands
Right-click on selected code to access:
- **BECA: Analyze This Code** (`Ctrl+Shift+A`)
- **BECA: Explain This Code**
- **BECA: Suggest Refactoring**
- **BECA: Fix This Error**

## 🎯 Benefits of Panel View

Using BECA in the panel (secondary sidebar) allows you to:
- Keep your file explorer visible in the primary sidebar
- Have BECA chat always accessible at the bottom
- Quickly switch between BECA and other panel tabs (Problems, Terminal, etc.)
- Work with code and chat simultaneously without resizing windows

## 🔧 Troubleshooting

### Command Not Found Error
If you still get "command 'beca.askBeca' not found":
1. **Reload VS Code**: Press `Ctrl+Shift+P` → Type "Reload Window" → Press Enter
2. Wait a few seconds for the extension to activate
3. Try the command again

### Extension Not Showing
1. Open Extensions view (`Ctrl+Shift+X`)
2. Search for "BECA"
3. Make sure it's enabled
4. If not, click the Enable button
5. Reload VS Code

### BECA Not Connecting
1. Make sure your BECA backend is running
2. Check the API URL in Settings:
   - Press `Ctrl+,` to open Settings
   - Search for "BECA API URL"
   - Default: `http://127.0.0.1:7862`
3. Verify the backend is accessible at that URL

## 📋 All Available Commands

- `BECA: Ask BECA` - Main chat command
- `BECA: Analyze This Code` - Analyze selected code
- `BECA: Review Current File` - Review entire file
- `BECA: Explain This Code` - Get explanation for selected code
- `BECA: Fix This Error` - Get fix suggestions for errors
- `BECA: Generate Tests` - Generate test cases
- `BECA: Suggest Refactoring` - Get refactoring suggestions
- `BECA: Add Comments` - Add documentation comments
- `BECA: Show Conversation History` - View past conversations
- `BECA: Toggle Auto-Review on Save` - Enable/disable auto-review
- `BECA: Show Status` - Check connection status

## 🎉 You're All Set!

Your BECA extension is now ready to use with full secondary sidebar support. Try opening it in both the Activity Bar and the Panel to see which workflow you prefer!

**Pro Tip:** Many users prefer keeping BECA in the panel so they can have code files, terminal, and AI chat all visible at once.

---

Need help? Check out:
- [README.md](README.md) - Full documentation
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [QUICK-START-GUIDE.md](QUICK-START-GUIDE.md) - Getting started guide
