/**
 * A utility wrapper around the VS Code API that handles messaging between
 * the webview and the extension
 */

interface VSCodeApi {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

declare function acquireVsCodeApi(): VSCodeApi;

class VSCodeAPIWrapper {
  private readonly vsCodeApi: VSCodeApi;

  constructor() {
    this.vsCodeApi = acquireVsCodeApi();
  }

  /**
   * Post a message to the extension
   */
  public postMessage(message: any): void {
    this.vsCodeApi.postMessage(message);
  }

  /**
   * Get the persistent state stored in the webview
   */
  public getState(): any {
    return this.vsCodeApi.getState();
  }

  /**
   * Set the persistent state stored in the webview
   */
  public setState(state: any): void {
    this.vsCodeApi.setState(state);
  }
}

// Export a singleton instance
export const vscode = new VSCodeAPIWrapper();
