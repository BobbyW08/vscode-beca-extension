import { useState, useEffect } from 'react';
import { vscode } from './utils/vscode';
import { Message, Task, WebviewMessage } from './types';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    // Listen for messages from the extension
    const handleMessage = (event: MessageEvent) => {
      const message: WebviewMessage = event.data;

      switch (message.type) {
        case 'messageAdded':
          setMessages(prev => [...prev, message.message]);
          break;
        case 'taskCreated':
          setCurrentTask(message.task);
          break;
        case 'taskUpdated':
          setCurrentTask(message.task);
          break;
        case 'thinking':
          setIsThinking(message.value);
          break;
        case 'fullUpdate':
          setMessages(message.state.conversationHistory);
          setCurrentTask(message.state.currentTask);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    vscode.postMessage({
      type: 'sendMessage',
      text: inputValue
    });

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newTask = () => {
    if (confirm('Start a new task? This will clear the current conversation.')) {
      vscode.postMessage({ type: 'newTask' });
    }
  };

  return (
    <div className="beca-container">
      {/* Header */}
      <div className="header">
        <h2>🤖 BECA Assistant</h2>
        <button className="icon-button" onClick={newTask} title="New Task">
          ➕
        </button>
      </div>

      {/* Task Progress */}
      {currentTask && (
        <div className="task-progress">
          <div className="task-title">{currentTask.title}</div>
          <div className="task-steps">
            {currentTask.steps.map(step => (
              <div key={step.id} className="task-step">
                <div className={`step-indicator ${step.status}`}>
                  {step.status === 'completed' && '✓'}
                </div>
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h3>Welcome to BECA! 👋</h3>
            <p>I'm here to help you with your coding tasks. I can:</p>
            <ul>
              <li>✅ Create and manage tasks</li>
              <li>📂 Explore your codebase</li>
              <li>✏️ Make file edits</li>
              <li>📝 Provide summaries and next steps</li>
            </ul>
            <p>Start by describing what you'd like to build or fix!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-header">
                {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'BECA' : msg.role}
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thinking Indicator */}
      {isThinking && (
        <div className="thinking-indicator">
          BECA is thinking...
        </div>
      )}

      {/* Input */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe what you want BECA to do..."
            rows={3}
          />
        </div>
        <button onClick={sendMessage} disabled={!inputValue.trim() || isThinking}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
