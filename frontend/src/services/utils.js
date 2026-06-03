import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { useGlobalStore } from '../store'

// ============================================
// 加密相关函数
// ============================================

export const md5 = (str) => {
  return CryptoJS.MD5(str).toString()
}

export const sha1 = (str) => {
  return CryptoJS.SHA1(str).toString()
}

export const sha256 = (str) => {
  return CryptoJS.SHA256(str).toString()
}

export const sha512 = (str) => {
  return CryptoJS.SHA512(str).toString()
}

export const sha3 = (str, outputLength = 256) => {
  return CryptoJS.SHA3(str, { outputLength }).toString()
}

export const aesEncrypt = (data, key) => {
  const encrypted = CryptoJS.AES.encrypt(data, key)
  return encrypted.toString()
}

export const aesDecrypt = (encryptedData, key) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key)
  return decrypted.toString(CryptoJS.enc.Utf8)
}

export const aesEncryptJson = (data, key) => {
  const jsonStr = JSON.stringify(data)
  return aesEncrypt(jsonStr, key)
}

export const aesDecryptJson = (encryptedData, key) => {
  const jsonStr = aesDecrypt(encryptedData, key)
  return JSON.parse(jsonStr)
}

// ============================================
// UUID 生成
// ============================================

export const generateUuid = () => {
  return uuidv4()
}

export const generateShortUuid = () => {
  return uuidv4().replace(/-/g, '').substring(0, 8)
}

export const toLocalIsoString = (date) => {
  return new Date(date).toLocaleString('sv-SE', { timeZoneName: 'short' }).slice(0, 19)
}

// ============================================
// 获取系统信息
// ============================================

/**
 * Check if running in Electron environment
 * @returns {boolean}
 */
export const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

export const getPcName = async () => {
  if (!isElectron()) {
    console.warn('⚠️ getPcName: Electron API not available (browser mode)')
    // Return mock data for browser testing
    return { success: true, pcName: 'BROWSER_TEST_PC' }
  }
  return await window.electronAPI.getPcName()
}

export const readUserConfig = async () => {
  if (!isElectron()) {
    console.warn('⚠️ readUserConfig: Electron API not available (browser mode)')
    return { success: false, error: 'Electron API not available (browser mode)' }
  }
  return await window.electronAPI.readUserConfig()
}

export const saveUserConfig = async (config) => {
  if (!isElectron()) {
    console.warn('⚠️ saveUserConfig: Electron API not available (browser mode)')
    return { success: false, error: 'Electron API not available (browser mode)' }
  }
  return await window.electronAPI.saveUserConfig(config)
}

export const readContextConfig = async () => {
  if (!isElectron()) {
    console.warn('⚠️ readContextConfig: Electron API not available (browser mode)')
    return { success: false, error: 'Electron API not available (browser mode)' }
  }
  return await window.electronAPI.readContextConfig()
}

export const saveContextConfig = async (config) => {
  if (!isElectron()) {
    console.warn('⚠️ saveContextConfig: Electron API not available (browser mode)')
    return { success: false, error: 'Electron API not available (browser mode)' }
  }
  return await window.electronAPI.saveContextConfig(config)
}

export const showErrorAndQuit = async (message) => {
  if (!isElectron()) {
    console.warn('⚠️ showErrorAndQuit: Electron API not available (browser mode)')
    alert(message)
    return
  }
  return await window.electronAPI.showErrorAndQuit(message)
}

export const getSystemInfo = async () => {
  const result = await getPcName()
  return {
    pcName: result.success ? result.pcName : 'unknown',
    platform: navigator.platform,
    userAgent: navigator.userAgent,
  }
}

// ============================================
// Axios 封装
// ============================================

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 显示/隐藏 Loading
let showLoadingFn = null
let hideLoadingFn = null
let showToastFn = null

// 当前客户端凭证
let clientCredentials = ''

export const setLoadingFunctions = (showFn, hideFn, toastFn) => {
  showLoadingFn = showFn
  hideLoadingFn = hideFn
  showToastFn = toastFn
}

export const setClientCredentials = (credentials) => {
  clientCredentials = credentials
}

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    showLoadingFn?.()
    // 添加客户端凭证头
    if (clientCredentials) {
      config.headers['x-client-credentials'] = clientCredentials
    }
    return config
  },
  (error) => {
    hideLoadingFn?.()
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    hideLoadingFn?.()
    
    const { data } = response
    
    // 判断业务响应
    if (data.resp === 'error') {
      const errorMsg = data.message || data.data?.message || '请求失败'
      showToastFn?.(errorMsg, 'error')
      return Promise.resolve(data)
    }
    
    if (data.resp === 'success') {
      const successMsg = data.message || data.data?.message || '请求成功'
      showToastFn?.(successMsg, 'success')
      return Promise.resolve(data)
    }

    return response
  },
  (error) => {
    hideLoadingFn?.()
    
    const errorMsg = error.response?.data?.message || error.message || '网络错误'
    showToastFn?.(errorMsg, 'error')
    
    return Promise.resolve(data)
  }
)

export const requestGet = async (url, params, config = {}) => {
  const response = await axiosInstance.get(url, { params, ...config })
  console.log("requestGet response:", response)
  const _data = response.data
  _data._resp = response.resp
  return _data
}

export const requestPost = async (url, data, config = {}) => {
  const response = await axiosInstance.post(url, data, config)
  console.log("requestPost response:", response)
  const _data = response.data
  _data._resp = response.resp
  _data._message = response.message
  return _data
}

export const requestPut = async (url, data, config = {}) => {
  const response = await axiosInstance.put(url, data, config)
  console.log("requestPut response:", response)
  const _data = response.data
  _data._resp = response.resp
  _data._message = response.message
  return _data
}

export const requestDelete = async (url, config = {}) => {
  const response = await axiosInstance.delete(url, config)
  console.log("requestDelete response:", response)
  const _data = response.data
  _data._resp = response.resp
  _data._message = response.message
  return _data
}

// 获取 axios 实例（用于自定义请求）
export const getAxiosInstance = () => axiosInstance

// ============================================
// 文件操作 (通过 Electron IPC)
// ============================================

const DEFAULT_AES_KEY = 'next-cap-secret-key-2024'

export const saveEncryptedData = async (filename, data, key = DEFAULT_AES_KEY) => {
  const encryptedData = aesEncryptJson(data, key)
  
  if (window.electronAPI?.saveFile) {
    return await window.electronAPI.saveFile(filename, encryptedData)
  }
  
  localStorage.setItem(filename, encryptedData)
  return true
}

export const loadEncryptedData = async (filename, key = DEFAULT_AES_KEY) => {
  let encryptedData = null
  
  if (window.electronAPI?.loadFile) {
    encryptedData = await window.electronAPI.loadFile(filename)
  } else {
    encryptedData = localStorage.getItem(filename)
  }
  
  if (!encryptedData) return null
  
  try {
    return aesDecryptJson(encryptedData, key)
  } catch {
    console.error('Failed to decrypt data')
    return null
  }
}

export const deleteLocalData = async (filename) => {
  if (window.electronAPI?.deleteFile) {
    return await window.electronAPI.deleteFile(filename)
  }
  
  localStorage.removeItem(filename)
  return true
}

// ============================================
// 子窗口操作
// ============================================

export const openChildWindow = async (options) => {
  if (window.electronAPI?.openChildWindow) {
    return await window.electronAPI.openChildWindow(options)
  }
  console.warn('electronAPI not available')
  return null
}

export const closeChildWindow = async (windowId) => {
  if (window.electronAPI?.closeChildWindow) {
    return await window.electronAPI.closeChildWindow(windowId)
  }
  return false
}

export const sendToChildWindow = async (windowId, channel, data) => {
  if (window.electronAPI?.sendToChildWindow) {
    return await window.electronAPI.sendToChildWindow(windowId, channel, data)
  }
  return false
}

export const sendToMainWindow = async (channel, data) => {
  if (window.electronAPI?.sendToMainWindow) {
    return await window.electronAPI.sendToMainWindow(channel, data)
  }
  return false
}

export const getWindowParams = async () => {
  if (window.electronAPI?.getWindowParams) {
    return await window.electronAPI.getWindowParams()
  }
  return {}
}

// ============================================
// 其他工具函数
// ============================================

export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const debounce = (fn, wait) => {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

export const throttle = (fn, wait) => {
  let lastTime = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      fn(...args)
      lastTime = now
    }
  }
}

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// ============================================
// Business API
// ============================================

/**
 * 创建 Lot
 * POST /lot/create
 */
export const lotCreate = async ({ lotId, birthday }) => {
  const _clientInfo = useGlobalStore.getState().clientInfo
  const { clientName, lineType, lineNumber, source } = _clientInfo
  setClientCredentials(`${clientName}|${lineType}|${lineNumber}|${source}`)
  return await requestPost('/lot/create', {
    lotId,
    birthday: formatDate(birthday),
  })
}

/**
 * 批量更新 Lot 的 materialStatus
 * POST /lot/updateMaterialStatus
 */
export const lotUpdateMaterialStatus = async (lotList) => {
  const _clientInfo = useGlobalStore.getState().clientInfo
  const { clientName, lineType, lineNumber, source } = _clientInfo
  setClientCredentials(`${clientName}|${lineType}|${lineNumber}|${source}`)
  const body = lotList.map(lot => ({
    lotId: lot.lotId,
    birthday: formatDate(lot.birthday),
    materialStatus: lot.materialStatus,
    lineType: lot.lineType,
    lineNumber: lot.lineNumber,
    source: lot.source,
  }))
  return await requestPost('/lot/updateMaterialStatus', { lotList: body })
}

/**
 * 添加 Pen
 * POST /pen/add
 */
export const penAdd = async (pen) => {
  const _clientInfo = useGlobalStore.getState().clientInfo
  const { clientName, lineType, lineNumber, source } = _clientInfo
  setClientCredentials(`${clientName}|${lineType}|${lineNumber}|${source}`)
  return await requestPost('/pen/add', {
    lineType: pen.lineType,
    lineNumber: pen.lineNumber,
    source: pen.source,
    lotId: pen.lotId,
    birthday: formatDate(pen.birthday),
    penId: pen.penId,
    inspectionDate: formatDate(pen.inspectionDate),
    userName: pen.userName,
    shift: pen.shift,
    disposition: pen.disposition,
    penNotShipped: pen.penNotShipped ?? 0,
    runType: pen.runType,
    productName: pen.productName,
    productNumber: pen.productNumber,
    productType: pen.productType,
  })
}

/**
 * 添加 Bad Pen (携带缺陷信息)
 * POST /pen/add
 */
export const badPenAdd = async (object) => {
  const _clientInfo = useGlobalStore.getState().clientInfo
  const { clientName, lineType, lineNumber, source } = _clientInfo
  setClientCredentials(`${clientName}|${lineType}|${lineNumber}|${source}`)

  return await requestPost('/pen/addBadPen', object)
}

/**
 * 更新pen缺陷（多功能接口）
 * POST /pen/updateDefect
 */
export const updateDefect = async (object) => {
  const _clientInfo = useGlobalStore.getState().clientInfo
  const { clientName, lineType, lineNumber, source } = _clientInfo
  setClientCredentials(`${clientName}|${lineType}|${lineNumber}|${source}`)

  return await requestPost('/pen/updateDefect', object)
}

/**
 * 添加 pen param
 * POST /pen/addParam
 */
export const addPenParam = async (object) => {
  const _clientInfo = useGlobalStore.getState().clientInfo
  const { clientName, lineType, lineNumber, source } = _clientInfo
  setClientCredentials(`${clientName}|${lineType}|${lineNumber}|${source}`)

  return await requestPost('/pen/addParam', object)
}


/**
 * 更新 Lot 状态
 * POST /lot/updateLotStatus
 * 
  {
    "lotid": "9X31PM1066",
    "birthday": "2026-03-31 14:30:00",
    "auditPhase": "FINAL",
    "qualityStatus": "PASS"
  }
 * 
 */
export const updateLotStatus = async (object) => {
  const _clientInfo = useGlobalStore.getState().clientInfo
  const { clientName, lineType, lineNumber, source } = _clientInfo
  setClientCredentials(`${clientName}|${lineType}|${lineNumber}|${source}`)

  return await requestPost('/lot/updateLotStatus', object)
}


/**
 * 删除 Pen
 * POST /pen/delete
 */
export const penDelete = async (pen) => {
  const _clientInfo = useGlobalStore.getState().clientInfo
  const { clientName, lineType, lineNumber, source } = _clientInfo
  setClientCredentials(`${clientName}|${lineType}|${lineNumber}|${source}`)
  return await requestPost('/pen/delete', {
    lineType: pen.lineType,
    lineNumber: pen.lineNumber,
    source: pen.source,
    lotId: pen.lotId,
    birthday: formatDate(pen.birthday),
    penId: pen.penId,
    inspectionDate: formatDate(pen.inspectionDate)
  })
}

export default {
  md5, sha1, sha256, sha512, sha3,
  aesEncrypt, aesDecrypt, aesEncryptJson, aesDecryptJson,
  generateUuid, generateShortUuid,
  getPcName, getSystemInfo, readUserConfig, saveUserConfig, showErrorAndQuit,
  setLoadingFunctions, setClientCredentials, requestGet, requestPost, requestPut, requestDelete, getAxiosInstance,
  saveEncryptedData, loadEncryptedData, deleteLocalData,
  openChildWindow, closeChildWindow, sendToChildWindow, sendToMainWindow, getWindowParams,
  delay, debounce, throttle, deepClone, formatDate,
  triggerDataSync, hasPendingSyncData,
  lotCreate, lotUpdateMaterialStatus, penAdd, penDelete, badPenAdd, updateDefect, addPenParam
}

// ============================================
// Data Sync API
// ============================================

const DATA_SYNC_URL = 'http://localhost:8000/api/sync/trigger'

/**
 * 判断当前是否在 Electron 生产环境（非 Vite dev server）
 * 生产环境通过 IPC 发请求以绕过跨域；开发环境走 Vite proxy。
 */
function isElectronProduction() {
  return (
    typeof window !== 'undefined' &&
    window.electronAPI?.httpRequest &&
    !import.meta.env?.DEV
  )
}

/**
 * 发送 POST 请求到 DATA_SYNC_URL：
 * - 开发环境：走 Vite proxy（/sync-api/api/sync/trigger → localhost:8000）
 * - 生产环境：通过 Electron main process 的 IPC 绕过跨域
 */
async function postSyncTrigger() {
  if (isElectronProduction()) {
    // 生产环境：通过 main process 发请求（无跨域）
    const result = await window.electronAPI.httpRequest({
      url: DATA_SYNC_URL,
      method: 'POST',
      headers: { accept: 'application/json' },
      timeout: 30000,
    })
    return result // { status, data }
  } else {
    // 开发环境：走 Vite proxy 代理，避免跨域
    const proxyUrl = '/sync-api/api/sync/trigger'
    const response = await axios.post(proxyUrl, null, {
      headers: { accept: 'application/json' },
      timeout: 30000,
      validateStatus: (status) => status >= 200 && status < 300,
    })
    return { status: response.data?.code || response.status, data: response.data }
  }
}
const SYNC_FILES = ['new.json', 'update.json', 'delete.json']

/**
 * 读取 JSON 同步文件
 */
async function readSyncFile(filename) {
  try {
    if (!window.electronAPI?.loadFile) return []
    const content = await window.electronAPI.loadFile(filename)
    if (content) return JSON.parse(content)
    return []
  } catch {
    return []
  }
}

/**
 * 写入 JSON 同步文件
 */
async function writeSyncFile(filename, data) {
  try {
    if (!window.electronAPI?.saveFile) return
    await window.electronAPI.saveFile(filename, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error(`[DataSync] Failed to write ${filename}:`, err)
  }
}

/**
 * 清空三个同步文件
 */
async function clearSyncFiles() {
  for (const file of SYNC_FILES) {
    await writeSyncFile(file, [])
  }
  console.log('✅ [DataSync] All sync files cleared')
}

/**
 * 检查三个同步文件是否有待同步数据
 * @returns {Promise<boolean>}
 */
export async function hasPendingSyncData() {
  for (const file of SYNC_FILES) {
    const data = await readSyncFile(file)
    if (Array.isArray(data) && data.length > 0) {
      // 检查是否有实际数据（至少一个 table 有 data 条目）
      const hasRecords = data.some(entry => entry.data && entry.data.length > 0)
      if (hasRecords) return true
    }
  }
  return false
}

/**
 * 处理 206 部分同步：把返回中 sync !== true 的记录保留在文件中，sync === true 的从文件中删除
 * 返回体 data 是数组: [{ file, operate_type, table_name, data: [...records] }]
 * 
 * 逻辑：遍历返回的每个条目，找到对应文件中该表的数据，
 * 把 sync === true 的记录从文件中删除。
 */
async function handlePartialSync(responseData) {
  if (!Array.isArray(responseData)) return

  // 按文件名分组
  const fileGroups = {}
  for (const item of responseData) {
    const fname = item.file
    if (!fname) continue
    if (!fileGroups[fname]) fileGroups[fname] = []
    fileGroups[fname].push(item)
  }

  for (const [filename, items] of Object.entries(fileGroups)) {
    const fileData = await readSyncFile(filename)
    if (!Array.isArray(fileData) || fileData.length === 0) continue

    for (const item of items) {
      const tableName = item.table_name
      if (!tableName || !Array.isArray(item.data)) continue

      // 收集同步成功的记录 key（sync === true）
      const syncedKeys = new Set()
      for (const record of item.data) {
        if (record.sync === true) {
          syncedKeys.add(JSON.stringify(stripExtraFields(record)))
        }
      }

      if (syncedKeys.size === 0) continue

      // 从文件中该表的 data 数组中删除已同步的记录
      const tableEntry = fileData.find(e => e.tableName === tableName)
      if (tableEntry && Array.isArray(tableEntry.data)) {
        tableEntry.data = tableEntry.data.filter(r => {
          const key = JSON.stringify(stripExtraFields(r))
          return !syncedKeys.has(key)
        })
      }
    }

    // 移除空的 table 条目
    const cleaned = fileData.filter(e => e.data && e.data.length > 0)
    await writeSyncFile(filename, cleaned)
  }

  console.log('✅ [DataSync] Partial sync files updated')
}

/**
 * 去掉服务端返回的额外字段，只保留原始记录字段用于比较
 */
function stripExtraFields(record) {
  const { errorMsg, insertTs, modifiedTs, sync, ...rest } = record
  return rest
}

/**
 * 触发数据同步 API
 * @returns {Promise<any>}
 */
export async function triggerDataSync() {
  showLoadingFn?.('Data Syncing ...')
  try {
    const { status: statusCode, data: responseData } = await postSyncTrigger()

    console.log(`✅ [DataSync] Sync response: status=${statusCode}`)

    if (statusCode === 200) {
      // 全部同步成功 → 清空三个文件
      await clearSyncFiles()
      console.log('✅ [DataSync] All data synced, files cleared')
    } else if (statusCode === 206) {
      // 部分同步 → toast 提示 + 更新文件
      showToastFn?.('Partial Data Synced', 'warning')
      await handlePartialSync(responseData?.data)
    }

    return responseData
  } catch (error) {
    console.error('❌ [DataSync] Sync trigger failed:', error.message)
    showToastFn?.(
      `Data Sync Failed: ${error.response?.data?.message || error.message}`,
      'error'
    )
    throw error
  } finally {
    hideLoadingFn?.()
  }
}
