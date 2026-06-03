import { useEffect, useState } from 'react'
import { useGlobalStore } from '../store/index.js'
import {
  setLoadingFunctions,
  setClientCredentials,
  getPcName,
  readUserConfig,
  saveUserConfig,
  showErrorAndQuit,
  requestGet,
  triggerDataSync,
  hasPendingSyncData,
} from '../services/utils.js'
import { readJSONConfigFile } from '../utils/iniUtils.js'
import { enableDataTracking, disableDataTracking } from '../utils/dataSyncUtils.js'
import timerManager from '../utils/timerManager.js'

// 默认 INI 配置
const DEFAULT_INI_CONFIG = {
  LotId: {
    Format: 'Option1',
    RunType: '',
    CountStartValue: '01',
    Option1: 'YMDD[2chars product_code][2 digit running#][2 digit line_number][RunType]',
    Option2: '[2chars product_code]YYMMDD[2 digit running#][2 digit line_number][RunType]'
  },
  PenId: {
    maxLen: 11,
    minLen: 9
  },
  QualityMonitor: {
    nCriticalCount: '("FIT", "%") , ("FWT", "%"),("FPQ", "FDL"), ("FVL", "FVD"), ("FVL", "FVL"),("FVL", "FVM"),("FVL", "FVT")'
  }
}

// 需要批量设置的数据字段列表
const DATA_FIELDS = [
  'clientCustomers', 'lots', 'lotComments', 'lotDefectCounts',
  'pens', 'penDefects', 'products', 'productionTypes',
  'runTypes', 'shifts', 'stations', 'stationUsers',
  'lineTypes', 'accumulators', 'defectClasses',
  'levelOneDescriptions', 'levelTwoDescriptions',
  'physicalLines', 'productRefLlks', 'runtimeValues', 'penParametrics'
]

/**
 * 通用的设置所有数据的函数
 * 根据 DATA_FIELDS 列表，自动调用 store 中对应的 setter
 */
const setAllData = (data, store) => {
  console.log("s0", data)
  for (const field of DATA_FIELDS) {
    const setterName = 'set' + field.charAt(0).toUpperCase() + field.slice(1)
    console.log("s1", setterName)
    console.log("s2", field)
    if (typeof store[setterName] === 'function') {
      store[setterName](data[field] || [])
    }
  }
}

/**
 * 通用的获取数据并设置到 store 的函数
 * 封装了：设置凭证 → 请求数据 → 写入 store 的完整流程
 */
export const fetchAndSetData = async (clientInfo, store) => {
  const { clientName, lineType, lineNumber, source } = clientInfo
  setClientCredentials(`${clientName}|${lineType}|${lineNumber}|${source}`)

  const data = await requestGet('/home/getData')
  console.log('fetchAndSetData response:', data)

  setAllData(data, store)
  return data
}

/**
 * 应用初始化 Hook
 */
export const useAppInit = () => {
  const store = useGlobalStore()
  const {
    initialized, setInitialized,
    setPcName, setClientInfo, setNeedSelectClient,
    setContext, setINIConfig,
    showLoading, hideLoading, showToast,
  } = store

  // 初始化 Loading 和 Toast 函数
  useEffect(() => {
    setLoadingFunctions(
      (msg) => showLoading(msg || '加载中...'),
      hideLoading,
      (message, type) => showToast(message, type)
    )
  }, [showLoading, hideLoading, showToast])

  // 初始化应用
  useEffect(() => {
    if (initialized) return

    const run = async () => {
      try {
        console.log('Starting app initialization...')

        // 1. 获取 PC 名称
        const pcResult = await getPcName()
        if (!pcResult.success) {
          await showErrorAndQuit('无法获取计算机名称，程序将退出')
          return
        }
        const pcName = pcResult.pcName
        console.log('PC Name:', pcName)
        setPcName(pcName)

        // 2. 读取 JSON 配置文件
        const iniResult = await readJSONConfigFile('config.json')
        if (iniResult.success) {
          console.log('INI config loaded:', iniResult.data)
          setINIConfig(iniResult.data)
        } else {
          console.log('No INI config found, using defaults')
          setINIConfig(DEFAULT_INI_CONFIG)
        }

        // 3. 读取 user.cfg 配置
        let clientInfo = { clientName: pcName, lineType: '', lineNumber: '', source: '' }
        let contextData = {}

        const configResult = await readUserConfig()
        if (configResult.success && configResult.config) {
          const { clientName, lineType, lineNumber, source, ...rest } = configResult.config

          if (clientName && lineType && lineNumber && source) {
            clientInfo = { clientName, lineType, lineNumber, source }
            console.log('User config loaded:', `${clientName}|${lineType}|${lineNumber}|${source}`)
          } else {
            console.log('User config incomplete, using PC name')
          }

          contextData = rest
        } else {
          console.log('No user config found, using PC name')
        }

        setClientInfo(clientInfo)
        if (Object.keys(contextData).length > 0) {
          setContext(contextData)
          console.log('Context data loaded:', contextData)
        }

        // REMARK - 暂时不同步数据
        // 4. 检查是否有待同步数据，如果有则先同步一次
        // const hasPending = await hasPendingSyncData()
        // if (hasPending) {
        //   console.log('[DataSync] Pending sync data found, triggering sync before getData...')
        //   try {
        //     await triggerDataSync()
        //   } catch {
        //     console.warn('[DataSync] Pre-getData sync failed, continuing with getData...')
        //   }
        // }

        // 5. 请求数据
        console.log('Fetching getData...')
        let data
        try {
          data = await fetchAndSetData(clientInfo, store)
        } catch (err) {
          console.error('getData failed:', err)
          await showErrorAndQuit('Get Data Failed')
          return
        }

        if (!data) {
          console.error('getData returned empty data')
          await showErrorAndQuit('Get Data Failed')
          return
        }

        // 6. 判断返回结果
        if (data.needToSelectClientCustomers && data.clientCustomers?.length > 0) {
          console.log('Need to select client customer')
          setNeedSelectClient(true)
        } else if (data?.lots) {
          console.log('Lots loaded:', data.lots.length)
          setNeedSelectClient(false)
        } else {
          console.log('No lots or clientCustomers in response')
          setNeedSelectClient(false)
        }

        setInitialized(true)

        // REMARK - 暂时不启用同步功能
        // enableDataTracking()

        // 7. 启动定时数据同步 (DataSyncInterval 单位: 秒)
        // const iniConfig = useGlobalStore.getState().INIConfig
        // const syncIntervalSec = parseInt(iniConfig?.GENERAL?.DataSyncInterval) || 60
        // const syncIntervalMs = syncIntervalSec * 1000
        // console.log(`[DataSync] Registering sync timer: interval=${syncIntervalSec}s`)

        // timerManager.register('data-sync', {
        //   interval: syncIntervalMs,
        //   immediate: false, // 启动时不立即执行，等待第一个 interval 后再触发
        //   handler: async () => {
        //     try {
        //       await triggerDataSync()
        //     } catch {
        //       // triggerDataSync 内部已处理异常，此处静默
        //     }
        //   },
        // })
        // timerManager.start('data-sync')

      } catch (error) {
        console.error('Failed to initialize app:', error)
        showToast('初始化失败: ' + error.message, 'error')
        setInitialized(true)
      }
    }

    run()
  }, [initialized]) // eslint-disable-line react-hooks/exhaustive-deps

  // 组件卸载时停止所有定时器
  useEffect(() => {
    return () => {
      timerManager.stopAll()
    }
  }, [])

  return { initialized }
}

/**
 * 选择客户后重新获取数据
 */
export const useSelectClientCustomer = () => {
  const store = useGlobalStore()
  const { setClientInfo, setNeedSelectClient, showLoading, hideLoading, showToast } = store

  const selectClient = async (clientCustomer) => {
    try {
      showLoading('正在获取数据...')

      const { clientName, lineType, lineNumber, source } = clientCustomer

      // 保存到配置文件
      await saveUserConfig({ clientName, lineType, lineNumber, source })

      // Disable tracking during bulk data load
      disableDataTracking()

      // 获取并设置所有数据
      await fetchAndSetData(clientCustomer, store)

      // Re-enable tracking after bulk data load
      enableDataTracking()

      // 更新 clientInfo 和状态
      setClientInfo({ clientName, lineType, lineNumber, source })
      setNeedSelectClient(false)

      hideLoading()
      showToast('数据加载成功', 'success')
    } catch (error) {
      hideLoading()
      console.error('Failed to select client:', error)
      showToast('选择失败: ' + error.message, 'error')
    }
  }

  return { selectClient }
}

/**
 * 窗口参数 Hook
 */
export const useWindowParams = () => {
  const [params, setParams] = useState({})

  useEffect(() => {
    if (window.electronAPI?.getWindowParams) {
      window.electronAPI.getWindowParams().then(setParams)
    }
    if (window.electronAPI?.onWindowParams) {
      window.electronAPI.onWindowParams(setParams)
    }
    if (window.electronAPI?.onWindowParamsUpdate) {
      window.electronAPI.onWindowParamsUpdate(setParams)
    }

    return () => {
      if (window.electronAPI?.removeListener) {
        window.electronAPI.removeListener('window-params')
        window.electronAPI.removeListener('window-params-update')
      }
    }
  }, [])

  return params
}

/**
 * Physical Line 改变后刷新数据 Hook
 */
export const useRefreshData = () => {
  const store = useGlobalStore()
  const { setClientInfo, showLoading, hideLoading, showToast } = store

  const refreshData = async (newClientInfo) => {
    try {
      showLoading('正在刷新数据...')

      const { clientName, lineType, lineNumber, source } = newClientInfo

      // 更新 clientInfo
      setClientInfo(newClientInfo)

      // 保存到配置文件
      await saveUserConfig({ clientName, lineType, lineNumber, source })

      // 获取并设置所有数据
      await fetchAndSetData(newClientInfo, store)

      hideLoading()
      showToast('数据刷新成功', 'success')
    } catch (error) {
      hideLoading()
      console.error('Failed to refresh data:', error)
      showToast('刷新失败: ' + error.message, 'error')
    }
  }

  return { refreshData }
}

export default useAppInit
