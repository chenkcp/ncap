import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import https from 'node:https'
import http from 'node:http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Check if running in development mode
const isDev = process.env.NODE_ENV === 'development' || !!process.env['VITE_DEV_SERVER_URL']

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// 项目根目录 (config.ini 所在位置)
const PROJECT_ROOT = path.join(process.env.APP_ROOT, '..')

// 用户数据目录 - 使用 AppData/Roaming/nextcap
const NEXTCAP_DIR = path.join(app.getPath('appData'), 'nextcap')
const USER_DATA_DIR = path.join(app.getPath('userData'), 'data')

// 确保数据目录存在
// if (!fs.existsSync(USER_DATA_DIR)) {
//   fs.mkdirSync(USER_DATA_DIR, { recursive: true })
// }

// 确保 nextcap 目录存在
// if (!fs.existsSync(NEXTCAP_DIR)) {
//   fs.mkdirSync(NEXTCAP_DIR, { recursive: true })
// }

let mainWindow = null
const childWindows = new Map() // 存储所有子窗口

// 创建应用菜单
function createMenu() {
  const menuTemplate = [
    {
      label: 'Setting',
      submenu: [
        {
          label: 'Lot Format',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'lot-format')
            }
          }
        },
        {
          label: 'Pen Format',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'pen-format')
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Open a Lot',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'open-a-lot')
            }
          }
        }
      ]
    },
    {
      label: 'External',
      submenu: [
        {
          label: 'Inspector',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'external-inspector')
            }
          }
        },
        {
          label: 'Ink Weight',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'external-ink-weight')
            }
          }
        },
        {
          label: 'Burst Strength',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-action', 'external-burst-strength')
            }
          }
        }
      ]
    }
  ]

  // Only show View menu in development mode
  if (isDev) {
    menuTemplate.push({
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    // 直接打开 NextCap 页面
    mainWindow.loadURL(VITE_DEV_SERVER_URL + '#/next-cap')
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: '/next-cap' })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    // 关闭所有子窗口
    childWindows.forEach(win => win.close())
    childWindows.clear()
  })
}

// 创建子窗口
function createChildWindow(options, parentWindow = null) {
  const { id, route, title, width = 800, height = 600, params = {} } = options

  console.log('[createChildWindow] 请求创建窗口:', { id, route, title })
  console.log('[createChildWindow] 当前已有窗口:', [...childWindows.keys()])

  // 如果已存在同 ID 的窗口，聚焦它
  if (childWindows.has(id)) {
    console.log('[createChildWindow] 窗口已存在，聚焦:', id)
    const existingWin = childWindows.get(id)
    existingWin.focus()
    // 发送更新参数
    existingWin.webContents.send('window-params-update', params)
    return existingWin
  }

  console.log('[createChildWindow] 创建新窗口:', id)

  // 使用发送请求的窗口作为父窗口，如果没有则使用主窗口
  const actualParent = parentWindow || mainWindow

  const childWin = new BrowserWindow({
    width,
    height,
    title: title || 'Child Window',
    parent: actualParent,
    modal: true, // 模态窗口，父窗口不可操作
    autoHideMenuBar: false, // 暂时显示菜单栏，用于调试
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 暂时不移除菜单，用于调试开发者模式
  // childWin.setMenu(null)

  // 子窗口只显示 View 菜单
  const childMenuTemplate = [
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]
  const childMenu = Menu.buildFromTemplate(childMenuTemplate)
  childWin.setMenu(childMenu)

  // 存储窗口参数
  childWin.windowParams = params
  childWin.windowId = id

  if (VITE_DEV_SERVER_URL) {
    childWin.loadURL(VITE_DEV_SERVER_URL + '#' + route)
  } else {
    childWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: route })
  }

  // 窗口加载完成后发送参数
  childWin.webContents.on('did-finish-load', () => {
    childWin.webContents.send('window-params', params)
  })

  childWin.on('closed', () => {
    console.log('[createChildWindow] 窗口已关闭:', id)
    childWindows.delete(id)
    console.log('[createChildWindow] 删除后剩余窗口:', [...childWindows.keys()])
    // 通知主窗口子窗口已关闭
    if (mainWindow) {
      mainWindow.webContents.send('child-window-closed', id)
    }
  })

  childWindows.set(id, childWin)
  console.log('[createChildWindow] 窗口创建成功:', id)
  return childWin
}

// ============================================
// IPC Handlers
// ============================================

// 获取 PC 名称
ipcMain.handle('get-pc-name', () => {
  try {
    // const hostname = os.hostname()
    const hostname = "RCSCLOUDTST01"
    if (!hostname) {
      return { success: false, error: '无法获取计算机名称' }
    }
    return { success: true, pcName: hostname }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 读取 user.cfg 文件
ipcMain.handle('read-user-config', async () => {
  try {
    // const configPath = path.join(NEXTCAP_DIR, 'user.cfg')
    const configPath = path.join(PROJECT_ROOT, 'user.cfg')
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(content)
      return { success: true, config }
    }
    return { success: false, error: '配置文件不存在' }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 保存 user.cfg 文件
ipcMain.handle('save-user-config', async (event, config) => {
  try {
    // const configPath = path.join(NEXTCAP_DIR, 'user.cfg')
    const configPath = path.join(PROJECT_ROOT, 'user.cfg')
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 读取 Context.cfg 文件
ipcMain.handle('read-context-config', async () => {
  try {
    // const configPath = path.join(NEXTCAP_DIR, 'Context.cfg')
    const configPath = path.join(PROJECT_ROOT, 'user.cfg')
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(content)
      return { success: true, config }
    }
    // 文件不存在，创建空文件
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2), 'utf8')
    return { success: true, config: {} }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 保存 Context.cfg 文件
ipcMain.handle('save-context-config', async (event, config) => {
  try {
    // const configPath = path.join(NEXTCAP_DIR, 'Context.cfg')
    const configPath = path.join(PROJECT_ROOT, 'user.cfg')
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 读取 INI 配置文件 (从项目根目录读取)
ipcMain.handle('read-ini-file', async (event, filename) => {
  try {
    const configPath = path.join(PROJECT_ROOT, filename)
    console.log('[read-ini-file] Reading:', configPath)
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8')
      return { success: true, content }
    }
    return { success: false, error: `INI file not found: ${configPath}` }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 写入 INI 配置文件 (写入到项目根目录)
ipcMain.handle('write-ini-file', async (event, filename, content) => {
  try {
    const configPath = path.join(PROJECT_ROOT, filename)
    console.log('[write-ini-file] Writing:', configPath)
    fs.writeFileSync(configPath, content, 'utf8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 显示错误对话框并退出应用
ipcMain.handle('show-error-and-quit', async (event, message) => {
  dialog.showErrorBox('Error', message)
  app.quit()
})

// 保存文件到项目根目录
ipcMain.handle('save-file', async (event, filename, data) => {
  try {
    const filePath = path.join(PROJECT_ROOT, filename)
    fs.writeFileSync(filePath, data, 'utf8')
    return true
  } catch (error) {
    console.error('Failed to save file:', error)
    return false
  }
})

// 从项目根目录加载文件
ipcMain.handle('load-file', async (event, filename) => {
  try {
    const filePath = path.join(PROJECT_ROOT, filename)
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8')
    }
    return null
  } catch (error) {
    console.error('Failed to load file:', error)
    return null
  }
})

// 追加内容到项目根目录的文件
ipcMain.handle('append-file', async (event, filename, data) => {
  try {
    const filePath = path.join(PROJECT_ROOT, filename)
    fs.appendFileSync(filePath, data, 'utf8')
    return true
  } catch (error) {
    console.error('Failed to append file:', error)
    return false
  }
})

// 删除项目根目录中的文件
ipcMain.handle('delete-file', async (event, filename) => {
  try {
    const filePath = path.join(PROJECT_ROOT, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return true
  } catch (error) {
    console.error('Failed to delete file:', error)
    return false
  }
})

// 打开子窗口
ipcMain.handle('open-child-window', async (event, options) => {
  // 获取发送请求的窗口作为父窗口
  const senderWindow = BrowserWindow.fromWebContents(event.sender)
  const childWin = createChildWindow(options, senderWindow)
  return childWin.windowId
})

// 关闭子窗口
ipcMain.handle('close-child-window', async (event, windowId) => {
  const childWin = childWindows.get(windowId)
  if (childWin) {
    childWin.close()
    return true
  }
  return false
})

// 发送消息到子窗口
ipcMain.handle('send-to-child-window', async (event, windowId, channel, data) => {
  const childWin = childWindows.get(windowId)
  if (childWin) {
    childWin.webContents.send(channel, data)
    return true
  }
  return false
})

// 发送消息到主窗口
ipcMain.handle('send-to-main-window', async (event, channel, data) => {
  if (mainWindow) {
    mainWindow.webContents.send(channel, data)
    return true
  }
  return false
})

// 获取窗口参数
ipcMain.handle('get-window-params', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  return win?.windowParams || {}
})

// Notify parent window from child window
ipcMain.handle('notify-parent', async (event, channel, data) => {
  if (mainWindow) {
    mainWindow.webContents.send(channel, data)
    return true
  }
  return false
})

// 通过 main process 发送 HTTP 请求（绕过渲染进程的跨域限制）
ipcMain.handle('http-request', async (event, options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', headers = {}, body = null, timeout = 30000 } = options
    const parsedUrl = new URL(url)
    const isHttps = parsedUrl.protocol === 'https:'
    const lib = isHttps ? https : http

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers,
    }

    const req = lib.request(reqOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch {
          resolve({ status: res.statusCode, data })
        }
      })
    })

    req.setTimeout(timeout, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    req.on('error', (err) => reject(err))

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body))
    }
    req.end()
  })
})

// COM 通信 (示例)
ipcMain.handle('com-send', async (event, port, data) => {
  console.log(`[COM ${port}] Sending:`, data)
  return true
})

// ============================================
// App Events
// ============================================

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createMenu()
  createWindow()
})
