// Electron API 类型定义
export interface ElectronAPI {
  // 获取 PC 名称
  getPcName: () => Promise<string>
  // 保存文件到用户目录
  saveFile: (filename: string, data: string) => Promise<boolean>
  // 从用户目录加载文件
  loadFile: (filename: string) => Promise<string | null>
  // 删除用户目录中的文件
  deleteFile: (filename: string) => Promise<boolean>
  // COM 接口通信
  sendToCom: (port: string, data: string) => Promise<boolean>
  onComData: (callback: (data: string) => void) => void
  removeComListener: () => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
