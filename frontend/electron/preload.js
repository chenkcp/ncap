import { contextBridge, ipcRenderer } from 'electron'

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取 PC 名称
  getPcName: () => ipcRenderer.invoke('get-pc-name'),

  // 读取用户配置
  readUserConfig: () => ipcRenderer.invoke('read-user-config'),
  
  // 保存用户配置
  saveUserConfig: (config) => ipcRenderer.invoke('save-user-config', config),

  // 读取 Context 配置
  readContextConfig: () => ipcRenderer.invoke('read-context-config'),

  // 保存 Context 配置
  saveContextConfig: (config) => ipcRenderer.invoke('save-context-config', config),

  // 读取 INI 配置文件
  readINIFile: (filename) => ipcRenderer.invoke('read-ini-file', filename),

  // 写入 INI 配置文件
  writeINIFile: (filename, content) => ipcRenderer.invoke('write-ini-file', filename, content),

  // 显示错误并退出
  showErrorAndQuit: (message) => ipcRenderer.invoke('show-error-and-quit', message),

  // 文件操作
  saveFile: (filename, data) => ipcRenderer.invoke('save-file', filename, data),
  loadFile: (filename) => ipcRenderer.invoke('load-file', filename),
  appendFile: (filename, data) => ipcRenderer.invoke('append-file', filename, data),
  deleteFile: (filename) => ipcRenderer.invoke('delete-file', filename),

  // 通过 main process 发 HTTP 请求（绕过跨域）
  httpRequest: (options) => ipcRenderer.invoke('http-request', options),

  // 子窗口操作
  openChildWindow: (options) => ipcRenderer.invoke('open-child-window', options),
  closeChildWindow: (windowId) => ipcRenderer.invoke('close-child-window', windowId),
  sendToChildWindow: (windowId, channel, data) => ipcRenderer.invoke('send-to-child-window', windowId, channel, data),
  sendToMainWindow: (channel, data) => ipcRenderer.invoke('send-to-main-window', channel, data),
  getWindowParams: () => ipcRenderer.invoke('get-window-params'),

  // Notify parent window (from child window)
  notifyParent: (channel, data) => ipcRenderer.invoke('notify-parent', channel, data),

  // 监听窗口参数
  onWindowParams: (callback) => {
    ipcRenderer.on('window-params', (event, params) => callback(params))
  },
  onWindowParamsUpdate: (callback) => {
    ipcRenderer.on('window-params-update', (event, params) => callback(params))
  },
  onChildWindowClosed: (callback) => {
    ipcRenderer.on('child-window-closed', (event, windowId) => callback(windowId))
  },

  // Listen for lots update from child window
  onLotsUpdated: (callback) => {
    ipcRenderer.on('lots-updated', (event, lots) => callback(lots))
  },

  // Listen for menu actions
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action))
  },

  // 自定义消息监听
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
  removeListener: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },

  // COM 通信
  sendToCom: (port, data) => ipcRenderer.invoke('com-send', port, data),
  onComData: (callback) => {
    ipcRenderer.on('com-data', (event, data) => callback(data))
  },
  removeComListener: () => {
    ipcRenderer.removeAllListeners('com-data')
  },
})
