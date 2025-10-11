const axios = require('axios');

/**
 * BECA API Client
 * Handles communication with BECA Gradio backend
 */
class BecaClient {
    /**
     * @param {string} apiUrl - Base URL of BECA Gradio API (e.g., http://localhost:7860)
     */
    constructor(apiUrl = 'http://localhost:7860') {
        this.apiUrl = apiUrl;
        this.axiosInstance = axios.create({
            baseURL: apiUrl,
            timeout: 60000, // 60 second timeout for AI responses
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Update the API URL
     * @param {string} newUrl 
     */
    updateApiUrl(newUrl) {
        this.apiUrl = newUrl;
        this.axiosInstance = axios.create({
            baseURL: newUrl,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Test connection to BECA
     * @returns {Promise<boolean>}
     */
    async testConnection() {
        try {
            const response = await this.axiosInstance.get('/');
            return response.status === 200;
        } catch (error) {
            console.error('BECA connection test failed:', error.message);
            return false;
        }
    }

    /**
     * Send a message to BECA and get a response
     * @param {string} message - User message
     * @param {object} context - Optional context (file path, code snippet, etc.)
     * @returns {Promise<object>} Response from BECA
     */
    async sendMessage(message, context = {}) {
        try {
            // Gradio API endpoint for chat
            const response = await this.axiosInstance.post('/api/predict', {
                fn_index: 0, // Chat function index
                data: [
                    message,
                    context.filePath || '',
                    context.code || '',
                    context.language || '',
                    JSON.stringify(context.metadata || {})
                ]
            });

            return {
                success: true,
                response: response.data.data[0],
                toolsUsed: response.data.data[1] || [],
                metadata: response.data.data[2] || {}
            };
        } catch (error) {
            console.error('BECA API error:', error.message);
            return {
                success: false,
                error: error.message,
                response: `Error communicating with BECA: ${error.message}`
            };
        }
    }

    /**
     * Analyze code with BECA
     * @param {string} code - Code to analyze
     * @param {string} language - Programming language
     * @param {string} filePath - File path
     * @returns {Promise<object>}
     */
    async analyzeCode(code, language, filePath) {
        const message = `Please analyze this ${language} code and provide insights on quality, potential issues, and improvements:\n\n${code}`;
        return await this.sendMessage(message, { code, language, filePath });
    }

    /**
     * Explain code with BECA
     * @param {string} code - Code to explain
     * @param {string} language - Programming language
     * @returns {Promise<object>}
     */
    async explainCode(code, language) {
        const message = `Please explain what this ${language} code does:\n\n${code}`;
        return await this.sendMessage(message, { code, language });
    }

    /**
     * Get refactoring suggestions
     * @param {string} code - Code to refactor
     * @param {string} language - Programming language
     * @returns {Promise<object>}
     */
    async suggestRefactoring(code, language) {
        const message = `Please suggest refactoring improvements for this ${language} code:\n\n${code}`;
        return await this.sendMessage(message, { code, language });
    }

    /**
     * Fix errors in code
     * @param {string} code - Code with errors
     * @param {string} error - Error message
     * @param {string} language - Programming language
     * @returns {Promise<object>}
     */
    async fixError(code, error, language) {
        const message = `Please help fix this error in ${language} code:\n\nError: ${error}\n\nCode:\n${code}`;
        return await this.sendMessage(message, { code, language, metadata: { error } });
    }

    /**
     * Generate tests for code
     * @param {string} code - Code to test
     * @param {string} language - Programming language
     * @param {string} framework - Test framework (e.g., 'pytest', 'jest')
     * @returns {Promise<object>}
     */
    async generateTests(code, language, framework = 'auto') {
        const message = `Please generate unit tests for this ${language} code using ${framework} framework:\n\n${code}`;
        return await this.sendMessage(message, { code, language, metadata: { framework } });
    }

    /**
     * Add comments to code
     * @param {string} code - Code to comment
     * @param {string} language - Programming language
     * @returns {Promise<object>}
     */
    async addComments(code, language) {
        const message = `Please add comprehensive comments and docstrings to this ${language} code:\n\n${code}`;
        return await this.sendMessage(message, { code, language });
    }

    /**
     * Review entire file
     * @param {string} filePath - Path to file
     * @param {string} content - File content
     * @param {string} language - Programming language
     * @returns {Promise<object>}
     */
    async reviewFile(filePath, content, language) {
        const message = `Please review this ${language} file and provide feedback on code quality, best practices, and potential improvements:\n\nFile: ${filePath}\n\n${content}`;
        return await this.sendMessage(message, { code: content, language, filePath });
    }

    /**
     * Get conversation history
     * @param {number} limit - Number of recent conversations
     * @returns {Promise<object>}
     */
    async getHistory(limit = 10) {
        try {
            const response = await this.axiosInstance.post('/api/predict', {
                fn_index: 1, // History function index
                data: [limit]
            });

            return {
                success: true,
                conversations: response.data.data[0] || []
            };
        } catch (error) {
            console.error('Error fetching history:', error.message);
            return {
                success: false,
                error: error.message,
                conversations: []
            };
        }
    }

    /**
     * Get code insights for workspace
     * @param {string} workspacePath - Path to workspace
     * @returns {Promise<object>}
     */
    async getWorkspaceInsights(workspacePath) {
        const message = `Please analyze the codebase at ${workspacePath} and provide insights on architecture, patterns, and areas for improvement.`;
        return await this.sendMessage(message, { metadata: { workspacePath } });
    }

    /**
     * Analyze stack trace for debugging
     * @param {string} stackTrace - Error stack trace
     * @param {string} code - Related code
     * @param {string} language - Programming language
     * @returns {Promise<object>}
     */
    async analyzeStackTrace(stackTrace, code, language) {
        const message = `Please analyze this error stack trace and suggest fixes:\n\nStack Trace:\n${stackTrace}\n\nRelated Code:\n${code}`;
        return await this.sendMessage(message, { code, language, metadata: { stackTrace } });
    }

    /**
     * Get real-time suggestions for current code
     * @param {string} code - Current code
     * @param {string} language - Programming language
     * @param {number} cursorPosition - Cursor position in code
     * @returns {Promise<object>}
     */
    async getSuggestions(code, language, cursorPosition) {
        const message = `Please provide coding suggestions for this ${language} code at cursor position ${cursorPosition}:\n\n${code}`;
        return await this.sendMessage(message, { code, language, metadata: { cursorPosition } });
    }

    /**
     * Get hover information for code element
     * @param {string} code - Code context
     * @param {string} symbol - Symbol to get info about
     * @param {string} language - Programming language
     * @returns {Promise<object>}
     */
    async getHoverInfo(code, symbol, language) {
        const message = `Please provide detailed information about the symbol '${symbol}' in this ${language} code:\n\n${code}`;
        return await this.sendMessage(message, { code, language, metadata: { symbol } });
    }

    /**
     * Get diagnostic information for code
     * @param {string} code - Code to diagnose
     * @param {string} language - Programming language
     * @param {string} filePath - File path
     * @returns {Promise<object>}
     */
    async getDiagnostics(code, language, filePath) {
        const message = `Please analyze this ${language} code for potential issues, bugs, and code smells:\n\n${code}`;
        return await this.sendMessage(message, { code, language, filePath });
    }

    /**
     * Execute terminal command through BECA
     * @param {string} command - Command to execute
     * @param {string} cwd - Working directory
     * @returns {Promise<object>}
     */
    async executeCommand(command, cwd) {
        const message = `Please execute this command: ${command}`;
        return await this.sendMessage(message, { metadata: { command, cwd } });
    }
}

module.exports = BecaClient;
