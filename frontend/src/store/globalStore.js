import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { processDataChanges, setStoreRef } from '../utils/dataSyncUtils'

// 初始状态
const initialState = {
  initialized: false,
  homeData: null,
  loading: {
    isLoading: false,
    message: undefined,
  },
  toasts: [],
  currentUser: null,
  appConfig: {
    theme: 'light',
    language: 'zh-CN',
    apiBaseUrl: 'http://localhost:3000',
  },
  // PC 名称
  pcName: '',

  // INI 配置 (从 config.ini 读取)
  INIConfig: null,

  // 当前 Open Lot
  openLot: null,

  // 客户端信息
  clientInfo: {
    clientName: '',
    lineType: '',
    lineNumber: '',
    source: '',
  },

  // 后端数据
  clientCustomers: [],
  lots: [],
  lotComments: [],
  lotDefectCounts: [],
  pens: [],
  penDefects: [],
  products: [],
  productionTypes: [],
  runTypes: [],
  shifts: [],
  stations: [],
  stationUsers: [],
  lineTypes: [],
  accumulators: [],
  defectClasses: [],
  levelOneDescriptions: [],
  levelTwoDescriptions: [],
  physicalLines: [],
  runtimeValues: [],
  csbs: [],
  productRefLlks: [],
  penParametrics: [],

  // Context 配置 (来自 user.cfg，除 clientInfo 字段外)
  context: {
    // User tab
    operator: '',
    shift: '',
    // Material tab
    runType: '',
    experimentId: '',
    partNumber: '',
    partName: '',
    thinFilmLot: '',
    // Physical Line tab (只有 accumulator 和 productionDate)
    accumulator: '',
    productionDate: '',
    // UI state
    activeTab: 'user',
  },

  // 是否需要选择客户
  needSelectClient: false
}

// 创建 Store
export const useGlobalStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // 初始化状态
      setInitialized: (value) => set({ initialized: value }),

      // PC 名称
      setPcName: (pcName) => set({ pcName }),

      // INI 配置
      setINIConfig: (INIConfig) => set({ INIConfig }),

      // 当前 Open Lot
      setOpenLot: (openLot) => set({ openLot }),

      // 客户端信息
      setClientInfo: (clientInfo) => set({ clientInfo }),

      // Lots 数据 - 带变更追踪的 setters
      setLots: (newLots) => {
        const oldLots = get().lots
        set({ lots: newLots })
        // 异步处理变更追踪 - 加日志确保被调用
        console.log(`📝 [DataSync] setLots called, old: ${oldLots.length}, new: ${newLots.length}`)
        processDataChanges('lots', oldLots, newLots).catch(err => {
          console.error('❌ [DataSync] processDataChanges lots failed:', err)
        })
      },
      setLotComments: (newLotComments) => {
        const oldLotComments = get().lotComments
        set({ lotComments: newLotComments })
        processDataChanges('lotComments', oldLotComments, newLotComments).catch(err => {
          console.error('❌ [DataSync] processDataChanges lotComments failed:', err)
        })
      },
      setLotDefectCounts: (newLotDefectCounts) => {
        const oldLotDefectCounts = get().lotDefectCounts
        set({ lotDefectCounts: newLotDefectCounts })
        processDataChanges('lotDefectCounts', oldLotDefectCounts, newLotDefectCounts).catch(err => {
          console.error('❌ [DataSync] processDataChanges lotDefectCounts failed:', err)
        })
      },
      setPens: (newPens) => {
        const oldPens = get().pens
        set({ pens: newPens })
        processDataChanges('pens', oldPens, newPens).catch(err => {
          console.error('❌ [DataSync] processDataChanges pens failed:', err)
        })
      },
      setPenDefects: (newPenDefects) => {
        const oldPenDefects = get().penDefects
        set({ penDefects: newPenDefects })
        processDataChanges('penDefects', oldPenDefects, newPenDefects).catch(err => {
          console.error('❌ [DataSync] processDataChanges penDefects failed:', err)
        })
      },
      setProducts: (products) => set({ products }),
      setProductionTypes: (productionTypes) => set({ productionTypes }),
      setRunTypes: (runTypes) => set({ runTypes }),
      setShifts: (shifts) => set({ shifts }),
      setStations: (stations) => set({ stations }),
      setStationUsers: (stationUsers) => set({ stationUsers }),
      setLineTypes: (lineTypes) => set({ lineTypes }),
      setAccumulators: (accumulators) => set({ accumulators }),
      setDefectClasses: (defectClasses) => set({ defectClasses }),
      setLevelOneDescriptions: (levelOneDescriptions) => set({ levelOneDescriptions }),
      setLevelTwoDescriptions: (levelTwoDescriptions) => set({ levelTwoDescriptions }),
      setPhysicalLines: (physicalLines) => set({ physicalLines }),
      setRuntimeValues: (runtimeValues) => set({ runtimeValues }),
      setCsbs: (csbs) => set({ csbs }),
      setProductRefLlks: (productRefLlks) => set({ productRefLlks }),
      setPenParametrics: (penParametrics) => set({ penParametrics }),

      // Context 配置
      setContext: (context) => set({ context }),
      updateContext: (updates) => set((state) => ({ 
        context: { ...state.context, ...updates } 
      })),

      // 客户选择
      setNeedSelectClient: (needSelectClient) => set({ needSelectClient }),
      setClientCustomers: (clientCustomers) => set({ clientCustomers }),

      // Home 数据
      setHomeData: (data) => set({ homeData: data }),

      // Loading
      showLoading: (message) =>
        set({
          loading: {
            isLoading: true,
            message,
          },
        }),

      hideLoading: () =>
        set({
          loading: {
            isLoading: false,
            message: undefined,
          },
        }),

      // Toast
      showToast: (message, type = 'info', duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const toast = { id, type, message, duration }

        set((state) => ({
          toasts: [...state.toasts, toast],
        }))

        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, duration)
        }
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      clearToasts: () => set({ toasts: [] }),

      // 用户
      setCurrentUser: (user) => set({ currentUser: user }),

      // 配置
      setAppConfig: (config) =>
        set((state) => ({
          appConfig: { ...state.appConfig, ...config },
        })),

      // 重置
      resetState: () => set(initialState),
    }),
    {
      name: 'next-cap-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        appConfig: state.appConfig,
        pcName: state.pcName,
        INIConfig: state.INIConfig,
        openLot: state.openLot,
        clientInfo: state.clientInfo,
        context: state.context,
        // 持久化所有后端数据，这样子窗口可以直接使用
        lots: state.lots,
        lotComments: state.lotComments,
        lotDefectCounts: state.lotDefectCounts,
        pens: state.pens,
        penDefects: state.penDefects,
        products: state.products,
        productionTypes: state.productionTypes,
        runTypes: state.runTypes,
        shifts: state.shifts,
        stations: state.stations,
        stationUsers: state.stationUsers,
        lineTypes: state.lineTypes,
        accumulators: state.accumulators,
        defectClasses: state.defectClasses,
        levelOneDescriptions: state.levelOneDescriptions,
        levelTwoDescriptions: state.levelTwoDescriptions,
        physicalLines: state.physicalLines,
        runtimeValues: state.runtimeValues,
        csbs: state.csbs,
        productRefLlks: state.productRefLlks,
        penParametrics: state.penParametrics
      }),
    }
  )
)

// 便捷 Hooks
export const useLoading = () => useGlobalStore((state) => state.loading)

// Set store reference for dataSyncUtils (avoids circular dependency)
setStoreRef(useGlobalStore)
export const useToasts = () => useGlobalStore((state) => state.toasts)
export const useHomeData = () => useGlobalStore((state) => state.homeData)
export const useCurrentUser = () => useGlobalStore((state) => state.currentUser)
export const useAppConfig = () => useGlobalStore((state) => state.appConfig)
export const usePcName = () => useGlobalStore((state) => state.pcName)
export const useINIConfig = () => useGlobalStore((state) => state.INIConfig)
export const useOpenLot = () => useGlobalStore((state) => state.openLot)
export const useClientInfo = () => useGlobalStore((state) => state.clientInfo)
export const useLots = () => useGlobalStore((state) => state.lots)
export const useClientCustomers = () => useGlobalStore((state) => state.clientCustomers)
export const useNeedSelectClient = () => useGlobalStore((state) => state.needSelectClient)
export const useContext = () => useGlobalStore((state) => state.context)

export const useLoadingActions = () => {
  const showLoading = useGlobalStore((state) => state.showLoading)
  const hideLoading = useGlobalStore((state) => state.hideLoading)
  return { showLoading, hideLoading }
}

export const useToastActions = () => {
  const showToast = useGlobalStore((state) => state.showToast)
  const removeToast = useGlobalStore((state) => state.removeToast)
  const clearToasts = useGlobalStore((state) => state.clearToasts)
  return { showToast, removeToast, clearToasts }
}

export default useGlobalStore

// 暴露全局 store 到 window，方便调试
if (typeof window !== 'undefined') {
  window.__getStore = () => useGlobalStore.getState()
  window.__store = useGlobalStore
}
