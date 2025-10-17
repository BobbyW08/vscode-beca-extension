/**
 * Type definitions for BECA webview
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: string;
  codeBlocks?: CodeBlock[];
  fileOperations?: FileOperation[];
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface FileOperation {
  action: 'create' | 'modify' | 'delete';
  filePath: string;
  content?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Task {
  id: string;
  title: string;
  steps: TaskStep[];
  createdAt: string;
  status: 'active' | 'completed' | 'failed';
}

export interface TaskStep {
  id: number;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface WebviewMessage {
  type: string;
  [key: string]: any;
}

// Messages from webview to extension
export interface SendMessageRequest extends WebviewMessage {
  type: 'sendMessage';
  text: string;
}

export interface ApproveEditRequest extends WebviewMessage {
  type: 'approveEdit';
  filePath: string;
  content: string;
}

export interface RejectEditRequest extends WebviewMessage {
  type: 'rejectEdit';
  filePath: string;
}

export interface NewTaskRequest extends WebviewMessage {
  type: 'newTask';
}

// Messages from extension to webview
export interface MessageAddedResponse extends WebviewMessage {
  type: 'messageAdded';
  message: Message;
}

export interface TaskCreatedResponse extends WebviewMessage {
  type: 'taskCreated';
  task: Task;
}

export interface TaskUpdatedResponse extends WebviewMessage {
  type: 'taskUpdated';
  task: Task;
}

export interface ThinkingResponse extends WebviewMessage {
  type: 'thinking';
  value: boolean;
}

export interface FullUpdateResponse extends WebviewMessage {
  type: 'fullUpdate';
  state: {
    conversationHistory: Message[];
    currentTask: Task | null;
    exploredFiles: string[];
  };
}
