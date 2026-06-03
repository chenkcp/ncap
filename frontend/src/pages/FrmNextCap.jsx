import { useState, useRef, useMemo, useCallback, useEffect, useLayoutEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'react-chartjs-2'
import { 
  Drawer, 
  DefectEditor, 
  Modal, 
  LotQualityStatusEditor, 
  AllContext,
  LotFormatModal,
  PenFormatModal,
  AlertModal
} from '../components'

import { useGlobalStore } from '../store'
import { 
  getThisLot, 
  getMaxVisibleGroups, 
  incrementCountStartValue,
  ProductMonitor,
  VerifyPenId
} from '../utils/lotUtils'
import { syncLotDefectCounts } from '../utils/syncLotDefectCounts'
import { penAdd, penDelete, addPenParam, toLocalIsoString } from '../services/utils'
import './FrmNextCap.css'
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

// 状态颜色映射 (qualityStatus → 圆点颜色)
const statusColors = {
  PASS: '#4CAF50',
  FAIL: '#f44336',
  '100-PERCENT': '#FFC107',
  UNKNOWN: '#333333',
}

// 从 lots 数据生成图表数据
const generateChartDataFromLots = (lots, lotDefectCounts, pens, penDefects) => {
  if (!lots || lots.length === 0) {
    return {
      labels: [],
      statuses: [],
      partQuantity: [],
      abnormalQuantity: [],
      cosmeticData: [],
      functionalData: [],
      riskData: [],
      rawLots: [],
    }
  }

  const labels = []
  const statuses = []
  const partQuantity = []
  const abnormalQuantity = []
  const cosmeticData = []
  const functionalData = []
  const riskData = []



  lots.forEach((lot) => {
    labels.push(lot.lotId)
    statuses.push(lot.qualityStatus || 'unknown')

    // Part Quantity - 统计好的和坏的 pens
    // const pens = lot.pens || []
    let badPens = 0
    let goodPens = 0
    // Failures - 按 className 分组统计
    let cosmetic = 0
    let functional = 0
    let risk = 0


    const _lotDefectCount = lotDefectCounts.filter(obj =>
      obj.lotId === lot.lotId &&
      (lot.birthday == null || obj.birthday == null || obj.birthday === lot.birthday)
    )

    _lotDefectCount.forEach((obj) => {
        // if (["Cosmetic", "Functional", "Risk"].includes(obj.newClassName)) {
        //     // 统计坏的 pens
        //     badPens++
        // }

        if (obj.className === "Cosmetic") {
            badPens += obj.count
            cosmetic += obj.count
        }
        if (obj.className === "Functional") {
            badPens += obj.count
            functional += obj.count
        }
        if (obj.className === "Risk") {
            badPens += obj.count
            risk += obj.count
        }
        if (obj.className === "Good") {
            goodPens += obj.count
        }
    })

    // const goodPens = pens.filter(p => p.disposition === 'G' || p.disposition === 'Good').length
    // const badPens = pens.filter(p => p.disposition !== 'G' && p.disposition !== 'Good').length
    partQuantity.push(goodPens)
    abnormalQuantity.push(badPens)



    // pens.forEach((pen) => {
    //   const defects = penDefects.filter(obj => obj.penId === pen.penId) || []
    //   defects.forEach((defect) => {
    //     const className = (defect.className || '').toLowerCase()
    //     if (className.includes('cosmetic')) {
    //       cosmetic++
    //     } else if (className.includes('functional')) {
    //       functional++
    //     } else if (className.includes('risk')) {
    //       risk++
    //     }
    //   })
    // })

    // 如果没有 pens 数据，使用 defectCounts
    // if (pens.length === 0 && lot.defectCounts) {
    //   lot.defectCounts.forEach((dc) => {
    //     const className = (dc.newClassName || '').toLowerCase()
    //     const count = dc.count || 0
    //     if (className.includes('cosmetic')) {
    //       cosmetic += count
    //     } else if (className.includes('functional')) {
    //       functional += count
    //     } else if (className.includes('risk')) {
    //       risk += count
    //     }
    //   })
    // }

    console.log(goodPens, badPens, cosmetic, functional, risk)

    cosmeticData.push(cosmetic)
    functionalData.push(functional)
    riskData.push(risk)
  })

  console.log("-------------", partQuantity,  abnormalQuantity)

  return {
    labels,
    statuses,
    partQuantity,
    abnormalQuantity,
    cosmeticData,
    functionalData,
    riskData,
    rawLots: lots,
  }
}

function FrmNextCap() {
  const { 
    lots,
    setLots,
    lotComments, 
    lotDefectCounts,
    setLotDefectCounts, 
    pens,
    setPens,
    penDefects,
    setPenDefects, 
    products, 
    productionTypes, 
    runTypes, 
    shifts, 
    stationUsers, 
    lineTypes, 
    accumulators, 
    defectClasses, 
    levelOneDescriptions, 
    levelTwoDescriptions, 
    clientInfo, 
    pcName,
    openLot,
    setOpenLot,
    runtimeValues,
    INIConfig,
    productRefLlks,
    context,
    showToast,
    showLoading,
    hideLoading,
    penParametrics,
    setPenParametrics 
  } = useGlobalStore()

  const [viewMode, setViewMode] = useState('partQuantity')
  const [defectDrawerOpen, setDefectDrawerOpen] = useState(false)
  const [statusEditorOpen, setStatusEditorOpen] = useState(false)
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState('')
  const [selectedLotIndex, setSelectedLotIndex] = useState(-1)
  const [selectedPenId, setSelectedPenId] = useState('')
  const chartContainerRef = useRef(null)

  // Ref for lotData labels - used by chart plugin to always get current data
  const lotDataLabelsRef = useRef([])
  // Ref for rawLots - used by chart plugin to look up birthday by index
  const lotDataRawLotsRef = useRef([])
  // Ref for openSummaryWindow - used by chart plugin to always get current fn
  const openSummaryWindowRef = useRef(null)
  // Ref to track if initial open-lot check has been done (only alert once)
  const initialOpenLotCheckDone = useRef(false)

  // Setting modals state
  const [lotFormatModalOpen, setLotFormatModalOpen] = useState(false)
  const [penFormatModalOpen, setPenFormatModalOpen] = useState(false)

  // External menu modal state
  const [inspectorModalOpen, setInspectorModalOpen] = useState(false)
  const [inkWeightModalOpen, setInkWeightModalOpen] = useState(false)
  const [inkWeightValue, setInkWeightValue] = useState('')
  const [inkWeightLotId, setInkWeightLotId] = useState('')
  const [inkWeightMid, setInkWeightMid] = useState('')
  const [burstStrengthModalOpen, setBurstStrengthModalOpen] = useState(false)
  const [burstStrengthValue, setBurstStrengthValue] = useState('')
  const [burstStrengthLotId, setBurstStrengthLotId] = useState('')
  const [burstStrengthMid, setBurstStrengthMid] = useState('')

  // Open a Lot dialog state
  const [openALotDialogOpen, setOpenALotDialogOpen] = useState(false)
  const [openALotInputValue, setOpenALotInputValue] = useState('')

  // Good Pen / Bad Pen modal state
  const [penInputModalOpen, setPenInputModalOpen] = useState(false)
  const [penInputMode, setPenInputMode] = useState('good') // 'good' | 'bad'
  const [penInputValue, setPenInputValue] = useState('')

  // Edit Pen modal state
  const [editPenModalOpen, setEditPenModalOpen] = useState(false)
  const [editPenInputValue, setEditPenInputValue] = useState('')

  // Delete Pen modal state
  const [deletePenModalOpen, setDeletePenModalOpen] = useState(false)
  const [deletePenInputValue, setDeletePenInputValue] = useState('')

  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertContent, setAlertContent] = useState('')
  const [alertCallback, setAlertCallback] = useState(null)

  // Create lot modal state (no longer used - moved to FrmLotManager)
  // const [createLotModalOpen, setCreateLotModalOpen] = useState(false)
  // const [suggestedLotId, setSuggestedLotId] = useState('')

  // Get ThisLot instance
  const thisLot = useMemo(() => getThisLot(), [openLot])

  // Show alert modal
  const showAlert = useCallback((title, content, callback = null) => {
    setAlertTitle(title)
    setAlertContent(content)
    setAlertCallback(() => callback)
    setAlertOpen(true)
  }, [])

  // Handle alert close
  const handleAlertClose = useCallback(() => {
    setAlertOpen(false)
    if (alertCallback) {
      alertCallback()
    }
  }, [alertCallback])

  // Check for open lots on mount and lots change
  // Also ensures the OPEN lot is always sorted to the front of the lots array
  useEffect(() => {
    if (lots.length === 0) return
    console.log("printer INIConfig", INIConfig)

    const openLots = lots.filter(lot => lot.materialStatus === 'OPEN')
    
    if (openLots.length === 1) {
      const openLot = openLots[0]

      // Set openLot and ThisLot
      setOpenLot(openLot)
      const tl = getThisLot()
      tl.setLot(openLot)

      setInkWeightLotId(openLot.lotId)

      // Sort: OPEN lot first, rest follow in original order
      const isAlreadyFirst = lots[0]?.lotId === openLot.lotId
      if (!isAlreadyFirst) {
        const reordered = [openLot, ...lots.filter(l => l.lotId !== openLot.lotId)]
        setLots(reordered)
      }
    } else if (openLots.length > 1) {
      // Multiple open lots - error (always show)
      showAlert(
        'Error',
        'Multiple Open Lots detected. Only one Open Lot is allowed.',
        () => {
          window.electronAPI?.showErrorAndQuit('Multiple Open Lots detected. Only one Open Lot is allowed.')
        }
      )
    } else {
      // No open lots - only warn once on initial load
      setOpenLot(null)
      if (!initialOpenLotCheckDone.current) {
        initialOpenLotCheckDone.current = true
        showAlert(
          'No Open Lot',
          'No Open Lot found. Please create a new Lot from Lot Manager.',
        )
      }
    }
  }, [lots, setOpenLot, setLots, showAlert])

  // Create new lot (kept for potential future use from parent window)
  const handleCreateLot = useCallback(async (lotId) => {
    const now = new Date().toISOString()
    const newLot = {
      lotId,
      lineType: clientInfo.lineType,
      lineNumber: parseInt(clientInfo.lineNumber) || 1,
      source: clientInfo.source,
      materialStatus: 'OPEN',
      qualityStatus: 'Yellow',
      birthday: now,
      startTime: now,
      endTime: null,
      operator: '',
      shift: '',
    }

    // Add to store
    const updatedLots = [...lots, newLot]
    setLots(updatedLots)
    setOpenLot(newLot)

    // Set ThisLot
    const tl = getThisLot()
    tl.setLot(newLot)

    // Increment count start value
    incrementCountStartValue()

    // Call ProductMonitor
    const monitorResult = await ProductMonitor('LotCreated')
    if (!monitorResult.success) {
      showToast( monitorResult.message || 'Failed to run ProductMonitor.', 'error')
    }

    // TODO: Save to backend
  }, [lots, setLots, setOpenLot, clientInfo])

  // Listen for menu actions
  useEffect(() => {
    if (window.electronAPI?.onMenuAction) {

      let _openLotId = ""
      const openLots = lots.filter(lot => lot.materialStatus === 'OPEN')
      if (openLots.length === 1) {
        _openLotId = openLots[0].lotId
      }

      window.electronAPI.onMenuAction((action) => {
        switch (action) {
          case 'lot-format':
            setLotFormatModalOpen(true)
            break
          case 'pen-format':
            setPenFormatModalOpen(true)
            break
          case 'open-a-lot':
            setOpenALotInputValue('')
            setOpenALotDialogOpen(true)
            break
          case 'external-inspector':
            setInspectorModalOpen(true)
            break
          case 'external-ink-weight':
            setInkWeightLotId(_openLotId)
            setInkWeightValue('')
            setInkWeightMid('')

            setInkWeightModalOpen(true)
            break
          case 'external-burst-strength':
            setBurstStrengthLotId(_openLotId)
            setBurstStrengthValue('')
            setBurstStrengthMid('')
            setBurstStrengthModalOpen(true)
            break
        }
      })
    }

    return () => {
      if (window.electronAPI?.removeListener) {
        window.electronAPI.removeListener('menu-action')
      }
    }
  }, [])

  // Listen for lots update from child window (Lot Manager)
  useEffect(() => {
    if (window.electronAPI?.onLotsUpdated) {
      window.electronAPI.onLotsUpdated((updatedLots) => {
        console.log('✅ Lots updated from child window:', updatedLots)
        setLots(updatedLots)
      })
    }

    return () => {
      if (window.electronAPI?.removeListener) {
        window.electronAPI.removeListener('lots-updated')
      }
    }
  }, [setLots])

  // 子窗口关闭后，重新从 localStorage 读取 store 数据以刷新 charts
  useEffect(() => {
    if (window.electronAPI?.onChildWindowClosed) {
      window.electronAPI.onChildWindowClosed((windowId) => {
        console.log('📊 [FrmNextCap] 子窗口关闭，重新同步 store:', windowId)
        // 从 localStorage 重新加载 persist 数据
        try {
          const raw = localStorage.getItem('next-cap-storage')
          if (raw) {
            const parsed = JSON.parse(raw)
            console.log("📊 [FrmNextCap] 重新加载的 store 数据:", parsed)
            const persisted = parsed.state || parsed
            // 更新关键数据字段以刷新 charts
            if (persisted.lotDefectCounts) {
              useGlobalStore.getState().setLotDefectCounts(persisted.lotDefectCounts)
            }
            if (persisted.penDefects) {
              useGlobalStore.getState().setPenDefects(persisted.penDefects)
            }
            if (persisted.pens) {
              useGlobalStore.getState().setPens(persisted.pens)
            }
            if (persisted.lots) {
              useGlobalStore.getState().setLots(persisted.lots)
            }
          }
        } catch (err) {
          console.error('❌ [FrmNextCap] 重新加载 store 失败:', err)
        }
      })
    }
  }, [])

  // 打开 Summary 新窗口
  const openSummaryWindow = useCallback(async (lotId, birthday = null) => {
    if (window.electronAPI?.openChildWindow) {
      await window.electronAPI.openChildWindow({
        id: `summary-${lotId}`,
        route: '/lot-summary',
        title: `Summary - ${lotId}`,
        width: 1100,
        height: 700,
        params: { lotId, birthday }
      })
    }
  }, [])
  openSummaryWindowRef.current = openSummaryWindow

  // Handle "Open a Lot" dialog confirm
  const handleOpenALotConfirm = useCallback(() => {
    const lotId = openALotInputValue.trim()
    if (!lotId) return
    setOpenALotDialogOpen(false)
    openSummaryWindow(lotId)
  }, [openALotInputValue, openSummaryWindow])

  // 从全局 lots 生成图表数据
  // MaxVisibleGroups 只作为初始最小显示数量，当 lots 数量增长时动态扩展
  const lotData = useMemo(() => {
    const maxVisible = getMaxVisibleGroups()
    // 如果 lots 数量超过 maxVisible，显示全部；否则显示最后 maxVisible 条
    const visibleCount = Math.max(lots.length, maxVisible)
    const visibleLots = lots.slice(-visibleCount)
    return generateChartDataFromLots(visibleLots, lotDefectCounts, pens, penDefects)
  }, [lots, lotDefectCounts, pens, penDefects])

  // Keep refs in sync with lotData for chart plugin
  useLayoutEffect(() => {
    lotDataLabelsRef.current = lotData.labels
    lotDataRawLotsRef.current = lotData.rawLots
  }, [lotData.labels, lotData.rawLots])

  // 从 context.partNumber 查找对应的 product（获取 productType）
  const contextProduct = useMemo(() => {
    if (!context.partNumber) return null
    return products.find(p => p.productNumber === context.partNumber) || null
  }, [context.partNumber, products])

  // 信息栏数据 - RUN TYPE / PRODUCT NAME / PRODUCT NUMBER / PRODUCT TYPE 从 context 读取
  const infoItems = useMemo(() => [
    { name: 'Machine Name', value: clientInfo.clientName || pcName || '-' },
    { name: 'Line Type', value: clientInfo.lineType || '-' },
    { name: 'Line', value: clientInfo.lineNumber ? `#${clientInfo.lineNumber}` : '-' },
    { name: 'Source', value: clientInfo.source || '-' },
    { name: 'OPEN LOT ID', value: openLot?.lotId || '-' },
    { name: 'RUN TYPE', value: context.runType || '-' },
    { name: 'PRODUCT NAME', value: context.partName || '-' },
    { name: 'PRODUCT NUMBER', value: context.partNumber || '-' },
    { name: 'PRODUCT TYPE', value: contextProduct?.productType || '-' }
  ], [clientInfo, pcName, openLot, context, contextProduct])

  // Part Quantity 图表数据
  const partQuantityChartData = {
    labels: lotData.labels,
    datasets: [
      {
        label: 'Good Pens',
        data: lotData.partQuantity,
        backgroundColor: '#4a90d9',
        borderRadius: 2,
      },
      {
        label: 'Bad Pens',
        data: lotData.abnormalQuantity,
        backgroundColor: '#e74c3c',
        borderRadius: 2,
      },
    ],
  }

  // Failures 图表数据 (Cosmetic/Functional/Risk 堆叠)
  const failuresChartData = {
    labels: lotData.labels,
    datasets: [
      {
        label: 'Cosmetic',
        data: lotData.cosmeticData,
        backgroundColor: '#2196F3',
        borderRadius: 0,
      },
      {
        label: 'Functional',
        data: lotData.functionalData,
        backgroundColor: '#795548',
        borderRadius: 0,
      },
      {
        label: 'Risk',
        data: lotData.riskData,
        backgroundColor: '#FFC107',
        borderRadius: 2,
      },
    ],
  }

  const chartData = viewMode === 'partQuantity' ? partQuantityChartData : failuresChartData

  // Chart.js custom plugin: make x-axis tick labels clickable
  // Uses refs to always get current lotData.labels and openSummaryWindow,
  // avoiding stale closure issues when chart re-renders with new data
  const findTickIndex = useCallback((chart, x, y) => {
    const xScale = chart.scales.x
    if (!xScale) return -1
    if (y < chart.chartArea.bottom || x < chart.chartArea.left || x > chart.chartArea.right) return -1

    const ticks = xScale.ticks
    if (!ticks || ticks.length === 0) return -1

    let closestIdx = -1
    let closestDist = Infinity
    for (let i = 0; i < ticks.length; i++) {
      const tickX = xScale.getPixelForTick(i)
      const dist = Math.abs(x - tickX)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = i
      }
    }

    const bandWidth = ticks.length > 1
      ? Math.abs(xScale.getPixelForTick(1) - xScale.getPixelForTick(0))
      : xScale.width
    if (closestDist <= bandWidth / 2) {
      return ticks[closestIdx].value
    }
    return -1
  }, [])

  // Stable plugin - uses refs so it never needs to be re-created
  const xAxisClickPlugin = useMemo(() => ({
    id: 'xAxisClick',
    afterEvent(chart, args) {
      const event = args.event
      if (event.type !== 'click') return

      const { x, y } = event
      const labelIndex = findTickIndex(chart, x, y)
      const labels = lotDataLabelsRef.current

      // console.log("===================== xAxisClickPlugin =====================",labelIndex,  labels, chart, args, lotDataLabelsRef)
      // console.log(labels[labelIndex])

      if (labelIndex >= 0 && labelIndex < labels.length) {
        const lotId = labels[labelIndex]
        if (lotId) {
          const rawLot = lotDataRawLotsRef.current[labelIndex]
          const birthday = rawLot?.birthday || null
          console.log(`🖱️ X-axis label clicked: index=${labelIndex}, lotId=${lotId}, birthday=${birthday}`)
          openSummaryWindowRef.current?.(lotId, birthday)
        }
      }
    },
    afterDraw(chart) {
      const canvas = chart.canvas
      if (!chart.scales.x) return

      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const idx = findTickIndex(chart, x, y)
        canvas.style.cursor = idx >= 0 ? 'pointer' : 'default'
      }

      if (!canvas._xAxisMouseMoveAttached) {
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas._xAxisMouseMoveAttached = true
        const origDestroy = chart.destroy.bind(chart)
        chart.destroy = () => {
          canvas.removeEventListener('mousemove', handleMouseMove)
          canvas._xAxisMouseMoveAttached = false
          origDestroy()
        }
      }
    }
  }), [findTickIndex])
  const maxPartQty = Math.max(...lotData.partQuantity, ...lotData.abnormalQuantity, 1)
  const maxFailures = Math.max(
    ...lotData.cosmeticData.map((c, i) => c + lotData.functionalData[i] + lotData.riskData[i]),
    1
  )

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index
        const lotId = lotData.labels[index]
        const birthday = lotData.rawLots[index]?.birthday || null
        setSelectedLot(lotId)
        setSelectedLotIndex(index)
        // 打开新窗口显示 Summary
        openSummaryWindow(lotId, birthday)
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (items) => {
            if (items.length > 0) {
              return lotData.labels[items[0].dataIndex]
            }
            return ''
          },
        },
      },
      datalabels: {
        color: '#fff',
        anchor: 'center',
        align: 'center',
        font: {
          size: 10,
          weight: 'bold',
        },
        display: function (context) {
          return context.dataset.data[context.dataIndex] > 0
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#555',
          font: {
            size: 9,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        stacked: true,
        display: true,
        beginAtZero: true,
        max: viewMode === 'partQuantity' ? Math.ceil(maxPartQty * 1.2) : Math.ceil(maxFailures * 1.2),
        grid: {
          color: '#eee',
        },
        ticks: {
          color: '#555',
          stepSize: Math.ceil((viewMode === 'partQuantity' ? maxPartQty : maxFailures) / 5) || 1,
        },
      },
    },
  }

  // 打开 Lot Manager 子窗口
  const openLotManagerWindow = useCallback(async () => {
    if (window.electronAPI?.openChildWindow) {
      await window.electronAPI.openChildWindow({
        id: 'lot-manager',
        route: '/lot-manager',
        title: 'Lot Manager',
        width: 900,
        height: 650,
        params: {}
      })
    }
  }, [])

  // Build a pen object from open lot data
  const buildPenObject = useCallback((penId, disposition = 'G') => {
    const lot = openLot
    if (!lot) return null
    const now = new Date().toISOString()

    return {
      lineType: lot.lineType || clientInfo.lineType,
      lineNumber: lot.lineNumber || parseInt(clientInfo.lineNumber) || 1,
      source: lot.source || clientInfo.source,
      lotId: lot.lotId,
      birthday: lot.birthday,
      penId,
      inspectionDate: toLocalIsoString(now),
      numberOfPens: 1,
      userName: context.operator || '',
      shift: context.shift || '',
      disposition,
      testbed: '',
      penNotShipped: 0,
      recoveryStep: '',
      runType: context.runType || '',
      experimentId: context.experimentId || '',
      productName: context.partName || '',
      productNumber: context.partNumber || '',
      productType: contextProduct?.productType || '',
      thinFilmLotId: context.thinFilmLot || '',
    }
  }, [openLot, clientInfo, context])

  // Open the Pen ID input modal
  const handleGoodPenClick = useCallback(() => {
    // Check if open lot exists
    const tl = getThisLot()
    const lot = tl.Lot()
    if (!lot) {
      showAlert('Error', 'No Open Lot available. Please create or open a Lot first.')
      return
    }
    if (lot.materialStatus !== 'OPEN'){
      showAlert('Error', 'Lot is not in OPEN status.')
      return
    }

    const _resp = checkSampleSize()
    if (!_resp.resp) {
      showAlert('Error', _resp.message)
      return
    }

    setPenInputMode('good')
    setPenInputValue('')
    setPenInputModalOpen(true)
  }, [showAlert])

  const handleBadPenClick = useCallback(() => {
    const tl = getThisLot()
    const lot = tl.Lot()
    if (!lot) {
      showAlert('Error', 'No Open Lot available. Please create or open a Lot first.')
      return
    }
    if (lot.materialStatus !== 'OPEN'){
      showAlert('Error', 'Lot is not in OPEN status.')
      return
    }

    // 读取当前 Audit Phase
    const currentPenLength = pens.length
    const qualityMonitorConfig = INIConfig.QualityMonitor

    const _resp = checkSampleSize()
    if (!_resp.resp) {
      showAlert('Error', _resp.message)
      return
    }
    setPenInputMode('bad')
    setPenInputValue('')
    setPenInputModalOpen(true)
  }, [showAlert])

  const checkSampleSize = useCallback(() => {
    const tl = getThisLot()
    const lot = tl.Lot()
    if (!lot) return false

    const currentPens = pens.filter(p => p.lotId === lot.lotId)
    const currentPenLength = currentPens.length
    const currentSource = clientInfo.source
    const qualityMonitorConfig = INIConfig.QualityMonitor.find(obj => obj.source === currentSource)
    if (!qualityMonitorConfig) return { resp: false, message: "source not found in the config"}
    if (tl.auditPhase === 'INITIAL') {
      if (currentPenLength >= qualityMonitorConfig.initialSampleSize) {
        // if (!qualityMonitorConfig.check.repullEnabled) {
          return { resp: false, message: "Current Open Lot has reached the max_lot_sample_size" }
        // }
      }
    }

    if (tl.auditPhase === 'REPULL') {
      const checkSize = qualityMonitorConfig.initialSampleSize + qualityMonitorConfig.check.repullQty
      if (currentPenLength >= checkSize) {
        // if (qualityMonitorConfig.immediateFail) {
          return { resp: false, message: "Current Open Lot has reached the max_lot_sample_size" }
        // }
      }
    }
    return { resp: true }
  }, [getThisLot, pens, showAlert])

  // Confirm Pen ID input (shared by Good Pen & Bad Pen)
  const handlePenInputConfirm = useCallback(async () => {
    const penId = penInputValue.trim()
    if (!penId) return

    // Check for duplicate pen ID in store
    const exists = pens.some(p => p.penId === penId)
    if (exists) {
      showAlert('Warning', 'A Pen with the same Pen ID already exists. Please try a different Pen ID.')
      return
    }

    // Verify pen ID with rules
    const verifyResult = VerifyPenId(penId)
    if (!verifyResult.success) {
      showAlert('Error', verifyResult.error)
      return
    }

    if (penInputMode === 'good') {
      // Good Pen: build pen, add to store, run ProductMonitor
      let newPen = buildPenObject(penId, 'G')
      if (!newPen) return

      // Call api - 添加 pen，只有返回成功无错误的情况下才执行后面的逻辑
      try {
        const productType = products.find(p => p.productNumber === newPen.productNumber)?.productType || ''

        console.log("-----------find product type", products)

        newPen = { ...newPen, productType }

        showLoading('Requesting ...')
        const resp =await penAdd(newPen)
        console.log("resp -----------------", resp)
        if (resp._resp === "success"){
          // Add pen to global store
          const updatedPens = [...pens, newPen]
          setPens(updatedPens)

          // Sync lotDefectCounts for this lot
          // Use setTimeout to ensure pen is added to store first
          setTimeout(() => {
            syncLotDefectCounts(openLot?.lotId)
          }, 0)

          // Run ProductMonitor
          const monitorResult = await ProductMonitor('PenAdded', penId)
          if (!monitorResult.success) {
            // showAlert('Quality Alert', monitorResult.message)
            showToast( monitorResult.message || 'Failed to run ProductMonitor.', 'error')
          }

          // Close modal
          setPenInputModalOpen(false)
        }
        
        hideLoading()
        // showToast('Pen added successfully', 'success')
      } catch (err) {
        hideLoading()
        showToast( err.message || 'Failed to add pen.', 'error')
        return
      }
    } else {
      // Bad Pen: add pen to store first, then open defect editor as child window
      const newPen = buildPenObject(penId, 'B')
      if (!newPen) return

      // Add pen to store so child window can access it via persist
      const updatedPens = [...pens, newPen]
      setPens(updatedPens)

      setPenInputModalOpen(false)

      // Open defect editor as child window (same as Edit Pen / LotSummary)
      if (window.electronAPI?.openChildWindow) {
        await window.electronAPI.openChildWindow({
          id: `defect-editor-${newPen.lotId}-${penId}`,
          route: '/defect-editor',
          title: `Defect Editor - ${penId}`,
          width: 1375,
          height: 750,
          params: { lotId: newPen.lotId, penId, addBadPen: true }
        })
      }
    }
  }, [penInputValue, penInputMode, pens, setPens, buildPenObject, showAlert, openLot])

  // ======== Edit Pen Logic ========
  const handleEditPenClick = useCallback(() => {
    setEditPenInputValue('')
    setEditPenModalOpen(true)
  }, [])

  const handleEditPenConfirm = useCallback(async () => {
    const penId = editPenInputValue.trim()
    if (!penId) return

    // 验证 penId
    const verifyResult = VerifyPenId(penId)
    if (!verifyResult.success) {
      showAlert('Error', verifyResult.error)
      return
    }

    // 查找该 pen
    const pen = pens.find(p => p.penId === penId)
    if (!pen) {
      showAlert('Error', `Pen ID "${penId}" not found.`)
      return
    }
    const _lot = lots.find(l => l.lotId === pen.lotId)
    if (!_lot) {
      showAlert('Error', `Lot ID "${pen.lotId}" not found.`)
      return
    }



    setEditPenModalOpen(false)

    // 打开缺陷编辑器子窗口（与 lot 详情页一致）
    if (window.electronAPI?.openChildWindow) {
      await window.electronAPI.openChildWindow({
        id: `defect-editor-${pen.lotId}-${pen.penId}`,
        route: '/defect-editor',
        title: `Defect Editor - ${pen.penId}`,
        width: 1375,
        height: 750,
        params: { lotId: pen.lotId, penId: pen.penId }
      })
    }
  }, [editPenInputValue, pens, showAlert])

  // ======== Delete Pen Logic ========
  const handleDeletePenClick = useCallback(() => {
    const tl = getThisLot()
    const lot = tl.Lot()
    setDeletePenInputValue('')
    setDeletePenModalOpen(true)
  }, [])

  const handleDeletePenConfirm = useCallback(async () => {
    const penId = deletePenInputValue.trim()
    if (!penId) return

    // 验证 penId
    const verifyResult = VerifyPenId(penId)
    if (!verifyResult.success) {
      showAlert('Error', verifyResult.error)
      return
    }

    // 查找该 pen
    const pen = pens.find(p => p.penId === penId)
    if (!pen) {
      showAlert('Error', `Pen ID "${penId}" not found.`)
      return
    }

    const lotId = pen.lotId
    const _lot = lots.find(l => l.lotId === lotId)
    if (!_lot) {
      showAlert('Error', `Lot ID "${lotId}" not found.`)
      return
    }
    if (_lot.materialStatus === 'CLOSED') {
      showAlert('Error', 'Lot is not in OPEN status or SUSPEND status.')
      return
    }

    // Call API - deletePen
    try {
      showLoading('Requesting ...')
      await penDelete({
        lineType: pen.lineType,
        lineNumber: pen.lineNumber,
        source: pen.source,
        lotId: pen.lotId,
        birthday: pen.birthday,
        penId: pen.penId,
        inspectionDate: pen.inspectionDate
      })
      hideLoading()
      showToast('Pen deleted successfully', 'success')
    } catch (err) {
      hideLoading()
      showAlert('Error', err.message || 'Failed to delete pen.')
      return
    }

    // 1. 删除 pen
    const updatedPens = pens.filter(p => p.penId !== penId)
    setPens(updatedPens)

    // 2. 删除该 pen 的 penDefects
    const updatedPenDefects = penDefects.filter(d => d.penId !== penId)
    setPenDefects(updatedPenDefects)

    // 3. 删除该 pen 的 penParametrics
    const { penParametrics, setPenParametrics } = useGlobalStore.getState()
    const updatedPenParametrics = penParametrics.filter(p => p.pnId !== penId)
    setPenParametrics(updatedPenParametrics)

    // 4. 同步 lotDefectCounts（延迟确保 store 已更新）
    setTimeout(() => {
      syncLotDefectCounts(lotId)
    }, 0)

    // 5. 运行 ProductMonitor
    const monitorResult = ProductMonitor('PenDeleted', penId)
    if (!monitorResult.success && monitorResult.message) {
      showToast(monitorResult.message, "error")
    }

    setDeletePenModalOpen(false)
  }, [deletePenInputValue, pens, penDefects, setPens, setPenDefects, showAlert, showLoading, hideLoading, showToast])

  // 处理墨水重量模态框的
  const handleInkWeight = async () => {
    setInkWeightModalOpen(false)

    // 6331PN0101Demo
    // 6094857685768584

    // Todo: mask 遮罩显示
    const _inkWeight = parseFloat(inkWeightValue)
    const _penId = inkWeightMid
    const _lotId = inkWeightLotId

    const now = (new Date()).getTime()

    console.log("HHHHH", _lotId, _penId, _inkWeight, lots)

    // 从store的lots中查找lot是否为open状态，如果不是则toast警告后return
    const isOpenLot = lots.some(lot => lot.lotId === _lotId && lot.materialStatus === 'OPEN')
    if (!isOpenLot) {
      showToast('The lot is not open', 'error')
      return
    }

    // 从store中的pens通过lotId 和 penId中查找是否存在
    const isExistedPen = pens.find(obj => obj.lotId === _lotId && obj.penId === _penId )
    if (!isExistedPen){
      // toast 显示 
      showToast('The pen you inputed cannot be found', 'error')
      return
    }
    // inspectionDate 转换成 YYYY-MM-DD HH:mm:ss 格式
    const formatInspectionDate = isExistedPen.inspectionDate ? toLocalIsoString(isExistedPen.inspectionDate) : null
    const newPenParametric = {
      pnId: _penId,
      paramlkKy: 2019,
      equiplkKy: 2001,
      dblParamVl: _inkWeight,
      inspectionDate: formatInspectionDate,
      testType: "inkWeight"
    }
    
    // Request Api to save
    const resp = await addPenParam(newPenParametric)
    if (resp._resp === "success"){
      if (resp.lotDefectCounts){
        // const { lotDefectCounts } = useGlobalStore.getState()
        const needToUpdateLotDefectCounts = resp.lotDefectCounts
        // 获取其他 lot 的缺陷（不是当前 lot 的）
        const otherLotDefects = lotDefectCounts.filter(
          d => !(d.lotId === _lotId)
        )
        // 合并并更新到 store
        const allLotDefects = [...otherLotDefects, ...needToUpdateLotDefectCounts]
        setLotDefectCounts(allLotDefects)

      }
      setPenParametrics([...penParametrics, newPenParametric])
    }

    // REMARK: 服务器端计算并添加缺陷
    // // 然后找到 通过 partNumber 和 partName 找到 store.productRefLlks的唯一记录
    // // 最后比对 _inkWeight 是否再该记录的weightLsl 和 weightUsl 数值之间
    // // 如果 _inkWeight 超出范围，则再 store.penDefects 中insert一条如下记录
    // // class_name = ‘Functional’ 
    // // defect_comment = ‘Nextcap Automated Operator’
    // // Code1 = 'FWT'
    // // Code2 = 若高于规格上限则为 'FOW'，若低于规格下限则为 'FLW' 
    // const { partNumber, partName } = context
    // const { lineType, lineNumber, source } = clientInfo
    // const productRef = productRefLlks.find(ref => ref.invItemLkNr === partNumber && ref.productNm === partName)
    // if (productRef) {
    //   const { weightLsl, weightUsl } = productRef
    //   if (_inkWeight < weightLsl || _inkWeight > weightUsl) {

    //     let _code2;
    //     if (_inkWeight < weightLsl) _code2 = 'FLW'
    //     if (_inkWeight > weightUsl) _code2 = 'FOW'

    //     let newPenDefects = {
    //       lineType: lineType,
    //       lineNumber: lineNumber,
    //       source: source,
    //       lotId: _lotId,
    //       birthday: now,
    //       penId: _penId,
    //       inspectionDate: null,
    //       defectNumber: 0,
    //       className: "Functional",
    //       primaryDefect: 0,
    //       defectComment: "Nextcap Automated Operator",
    //       numericComment: 0,
    //       code1: "FWT",
    //       code2: _code2,
    //       cause1: "",
    //       cause2: ""
    //     }
    //     newPenDefects = [...penDefects, newPenDefects]

    //     // checkAndSetPrimary - 检查并设置 primary defect
    //     // 优先级: Risk > Functional > Cosmetic
    //     // 同优先级下选 birthday 最小的
    //     const penRecords = newPenDefects.filter(d => d.lotId === _lotId && d.penId === _penId)
    //     if (penRecords.length > 0) {
    //       const riskRecords = penRecords.filter(r => r.className === 'Risk')
    //       const functionalRecords = penRecords.filter(r => r.className === 'Functional')
    //       const cosmeticRecords = penRecords.filter(r => r.className === 'Cosmetic')

    //       let targetGroup = []
    //       if (riskRecords.length > 0) {
    //         targetGroup = riskRecords
    //       } else if (functionalRecords.length > 0) {
    //         targetGroup = functionalRecords
    //       } else if (cosmeticRecords.length > 0) {
    //         targetGroup = cosmeticRecords
    //       }

    //       let primaryRecord = null
    //       if (targetGroup.length > 0) {
    //         const sorted = [...targetGroup].sort((a, b) => {
    //           const dateA = a.birthday ? new Date(a.birthday) : new Date()
    //           const dateB = b.birthday ? new Date(b.birthday) : new Date()
    //           return dateA - dateB
    //         })
    //         primaryRecord = sorted[0]
    //       }

    //       newPenDefects = newPenDefects.map(d => {
    //         if (d.lotId !== _lotId || d.penId !== _penId) return d
    //         const isPrimary = primaryRecord && d.lotId === primaryRecord.lotId
    //           && d.penId === primaryRecord.penId && d.className === primaryRecord.className
    //           && d.birthday === primaryRecord.birthday && d.defectNumber === primaryRecord.defectNumber
    //         return { ...d, primaryDefect: isPrimary ? 1 : 0 }
    //       })
    //     }
    //     // Todo - Request Api to save
    //     setPenDefects(newPenDefects)
    //   }
    // }
  }

  // 处理爆破强度
  const handleBurstStrength = async () => {
    setBurstStrengthModalOpen(false)

    // Todo: mask 遮罩显示

    // 再 global store 的 penParametrics 中 insert 一条
    // pn_id=mid, paramlk_ky=5003, equiplk_ky=15000, dbl_param_vl=burst strength, insert_dm=日期时间, pouch_id=null)
    // const store = useGlobalStore.getState()
    // const { pens, penParametrics, setPenParametrics, penDefects, setPenDefects, showToast } = store

    const _burstStrengthValue = parseFloat(burstStrengthValue)
    const _penId = burstStrengthMid
    const _lotId = burstStrengthLotId

    const now = (new Date()).getTime()

    // 从store的lots中查找lot是否为open状态，如果不是则toast警告后return
    const isOpenLot = lots.some(lot => lot.lotId === _lotId && (lot.materialStatus === 'OPEN' || lot.materialStatus === 'SUSPENDED'))
    if (!isOpenLot) {
      showToast('The lot is not open or suspended', 'error')
      return
    }

    // 从store中的pens通过lotId 和 penId中查找是否存在
    const isExistedPen = pens.find(obj => obj.lotId === _lotId && obj.penId === _penId )
    if (!isExistedPen){
      // toast 显示 
      showToast('The pen you inputed cannot be found', 'error')
      return
    }
    const formatInspectionDate = isExistedPen.inspectionDate ? toLocalIsoString(isExistedPen.inspectionDate) : null
    const newPenParametric = {
      pnId: _penId,
      paramlkKy: 5003,
      equiplkKy: 15000,
      dblParamVl: _burstStrengthValue,
      inspectionDate: formatInspectionDate,
      testType: "filmBurst"
    }

    // Request Api to save
    const resp = await addPenParam(newPenParametric)
    if (resp._resp === "success"){
      setPenParametrics([...penParametrics, newPenParametric])
    }

    const needToInsertPenParametric = [...penParametrics, newPenParametric]
    setPenParametrics(needToInsertPenParametric)



    // Remark: 服务器端计算并添加缺陷
    // const _penIds = pens.filter(obj => obj.lotId === _lotId).map(obj => obj.penId)
    // const _penParametricParamVls = needToInsertPenParametric.filter(obj => _penIds.includes(obj.pnId)).map(obj => obj.dblParamVl)
    // const n = _penParametricParamVls.length
    // // 对 _penParametricParamVls 里的值求平均值
    // const sum = _penParametricParamVls.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    // const mean = sum / n

    // // 计算标准差
    // const variance_sum = _penParametricParamVls.reduce((accumulator, currentValue) => {
    //   return accumulator + Math.pow(currentValue - mean, 2)
    // }, 0)
    // const variance = variance_sum / (n - 1)
    // const std_dev = Math.sqrt(variance)

    // if (mean < 53 && std_dev < 8) {
    //   const { lineType, lineNumber, source } = clientInfo
    //   let newPenDefects = {
    //     lineType: lineType,
    //     lineNumber: lineNumber,
    //     source: source,
    //     lotId: _lotId,
    //     birthday: now,
    //     penId: _penId,
    //     inspectionDate: null,
    //     defectNumber: 0,
    //     className: "Functional",
    //     primaryDefect: 0,
    //     defectComment: "Nextcap Automated Operato",
    //     numericComment: 0,
    //     code1: "FPP",
    //     code2: "FMB",
    //     cause1: "",
    //     cause2: ""
    //   }
    //   newPenDefects = [...penDefects, newPenDefects]

    //   // checkAndSetPrimary - 检查并设置 primary defect
    //   // 优先级: Risk > Functional > Cosmetic
    //   // 同优先级下选 birthday 最小的
    //   const penRecords = newPenDefects.filter(d => d.lotId === _lotId && d.penId === _penId)
    //   if (penRecords.length > 0) {
    //     const riskRecords = penRecords.filter(r => r.className === 'Risk')
    //     const functionalRecords = penRecords.filter(r => r.className === 'Functional')
    //     const cosmeticRecords = penRecords.filter(r => r.className === 'Cosmetic')

    //     let targetGroup = []
    //     if (riskRecords.length > 0) {
    //       targetGroup = riskRecords
    //     } else if (functionalRecords.length > 0) {
    //       targetGroup = functionalRecords
    //     } else if (cosmeticRecords.length > 0) {
    //       targetGroup = cosmeticRecords
    //     }

    //     let primaryRecord = null
    //     if (targetGroup.length > 0) {
    //       const sorted = [...targetGroup].sort((a, b) => {
    //         const dateA = a.birthday ? new Date(a.birthday) : new Date()
    //         const dateB = b.birthday ? new Date(b.birthday) : new Date()
    //         return dateA - dateB
    //       })
    //       primaryRecord = sorted[0]
    //     }

    //     newPenDefects = newPenDefects.map(d => {
    //       if (d.lotId !== _lotId || d.penId !== _penId) return d
    //       const isPrimary = primaryRecord && d.lotId === primaryRecord.lotId
    //         && d.penId === primaryRecord.penId && d.className === primaryRecord.className
    //         && d.birthday === primaryRecord.birthday && d.defectNumber === primaryRecord.defectNumber
    //       return { ...d, primaryDefect: isPrimary ? 1 : 0 }
    //     })
    //   }
    //   // Todo 先请求数据库
    //   setPenDefects(newPenDefects)
    // }


  }

  // 如果没有数据，显示空状态（但仍显示底部按钮）
  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📊</div>
      <h3>暂无 Lot 数据</h3>
      <p>当前工作站没有可显示的 Lot 数据</p>
    </div>
  )

  return (
    <div className="nextcap-container">
      {/* 顶部信息栏 - 8列 */}
      <div className="info-bar">
        {infoItems.map((item, index) => (
          <div key={index} className="info-item">
            <span className="info-name">{item.name}</span>
            <span className="info-value">{item.value}</span>
          </div>
        ))}
      </div>

      {/* 无数据时显示空状态 */}
      {lotData.labels.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* View Mode 选择器 */}
          <div className="view-mode-bar">
            <span className="view-mode-label">View Mode:</span>
            <label className="radio-option">
              <input
                type="radio"
                name="viewMode"
                checked={viewMode === 'partQuantity'}
                onChange={() => setViewMode('partQuantity')}
              />
              <span>Lot ID vs Part Quantity</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="viewMode"
                checked={viewMode === 'failures'}
                onChange={() => setViewMode('failures')}
              />
              <span>Lot ID vs Failures</span>
            </label>
          </div>

          {/* 图表区域 - 支持横向滚动 */}
          <div className="chart-section">
            <div className="chart-wrapper">
              <div className="chart-scroll-container" ref={chartContainerRef}>
                <div className="chart-inner">
                  {/* 图表 */}
                  <div className="chart-area">
                    <Bar data={chartData} options={chartOptions} plugins={[xAxisClickPlugin]} />
                  </div>
                  {/* 状态指示器行 - 在同一个滚动容器内 */}
                  <div className="status-row">
                    {lotData.statuses.map((status, index) => (
                      <div
                        key={index}
                        className="status-item"
                        onClick={() => {
                          setSelectedLotIndex(index)
                          setSelectedLot(lotData.labels[index])
                          setStatusEditorOpen(true)
                        }}
                      >
                        <div
                          className="status-circle"
                          style={{ backgroundColor: statusColors[status] || '#333' }}
                          title={`${lotData.labels[index]} - ${status}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 底部功能按钮 - 始终显示 */}
      <div className="bottom-buttons">
        <button 
          className="func-btn" 
          onClick={handleGoodPenClick}
        >
          Good Pen
        </button>
        <button 
          className="func-btn" 
          onClick={handleBadPenClick}
        >
          Bad Pen
        </button>
        <button 
          className="func-btn" 
          onClick={handleEditPenClick}
        >
          Edit Pen
        </button>
        <button 
          className="func-btn" 
          onClick={handleDeletePenClick}
        >
          Delete Pen
        </button>
        <button className="func-btn" onClick={() => setContextDrawerOpen(true)}>
          Context
        </button>
        <button className="func-btn" onClick={openLotManagerWindow}>
          Lot Mgt
        </button>
      </div>

      {/* DefectEditor 弹出框 (from Edit Pen) */}
      <Modal
        open={defectDrawerOpen}
        onClose={() => {
          setDefectDrawerOpen(false)
        }}
        title={`Defect Editor - ${selectedLot} / ${selectedPenId}`}
        width={1200}
        height="85vh"
      >
        <DefectEditor
          lotId={selectedLot}
          penId={selectedPenId}
          pens={pens}
          penDefects={penDefects}
          levelOneDescriptions={levelOneDescriptions}
          levelTwoDescriptions={levelTwoDescriptions}
          onOk={() => {
            setDefectDrawerOpen(false)
            console.log('Defect saved')
          }}
          onCancel={() => {
            setDefectDrawerOpen(false)
          }}
        />
      </Modal>

      {/* Lot Quality Status Editor 抽屉 */}
      <Drawer
        open={statusEditorOpen}
        onClose={() => setStatusEditorOpen(false)}
        title="Lot Quality Status Editor"
        width={650}
      >
        <LotQualityStatusEditor
          lotId={selectedLot}
          currentStatus={selectedLotIndex >= 0 ? lotData.statuses[selectedLotIndex] : 'unknown'}
          onOk={() => setStatusEditorOpen(false)}
          onCancel={() => setStatusEditorOpen(false)}
          onDelete={() => console.log('Delete')}
          onEdit={() => console.log('Edit')}
        />
      </Drawer>

      {/* All Context 抽屉 */}
      <Drawer
        open={contextDrawerOpen}
        onClose={() => setContextDrawerOpen(false)}
        title="All Context"
        width={600}
      >
        <AllContext
          onOk={() => setContextDrawerOpen(false)}
          onHelp={() => console.log('Help')}
          onAbort={() => setContextDrawerOpen(false)}
        />
      </Drawer>

      {/* Lot Format Setting Modal */}
      <LotFormatModal
        open={lotFormatModalOpen}
        onClose={() => setLotFormatModalOpen(false)}
      />

      {/* Pen Format Setting Modal */}
      <PenFormatModal
        open={penFormatModalOpen}
        onClose={() => setPenFormatModalOpen(false)}
      />

      {/* External - Inspector Modal */}
      <Modal
        open={inspectorModalOpen}
        onClose={() => setInspectorModalOpen(false)}
        title="Inspector"
        width={420}
        height="auto"
      >
        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 20px', fontSize: 14 }}>Reading Inspector Banks</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="func-btn" style={{ minWidth: 80 }} onClick={() => setInspectorModalOpen(false)}>
              Cancel
            </button>
            <button className="func-btn" style={{ minWidth: 80 }} onClick={() => setInspectorModalOpen(false)}>
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* External - Ink Weight Modal */}
      <Modal
        open={inkWeightModalOpen}
        onClose={() => setInkWeightModalOpen(false)}
        title="Ink Weight"
        width={420}
        height="auto"
      >
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 13 }}>Lot ID</label>
            <input
              type="text"
              value={inkWeightLotId}
              onChange={(e) => setInkWeightLotId(e.target.value)}
              placeholder="Enter Lot ID"
              style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 13 }}>Ink Weight</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={inkWeightValue}
              onChange={(e) => setInkWeightValue(e.target.value)}
              placeholder="Enter weight value"
              style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 13 }}>Mid</label>
            <input
              type="text"
              value={inkWeightMid}
              onChange={(e) => setInkWeightMid(e.target.value)}
              placeholder="Enter text"
              style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="func-btn" style={{ minWidth: 80 }} onClick={() => setInkWeightModalOpen(false)}>
              Cancel
            </button>
            <button className="func-btn" style={{ minWidth: 80 }} onClick={() => handleInkWeight()}>
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* External - Burst Strength Modal */}
      <Modal
        open={burstStrengthModalOpen}
        onClose={() => setBurstStrengthModalOpen(false)}
        title="Burst Strength"
        width={420}
        height="auto"
      >
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 13 }}>Lot ID</label>
            <input
              type="text"
              value={burstStrengthLotId}
              onChange={(e) => setBurstStrengthLotId(e.target.value)}
              placeholder="Enter Lot ID"
              style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 13 }}>Film Burst</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={burstStrengthValue}
              onChange={(e) => setBurstStrengthValue(e.target.value)}
              placeholder="Enter burst strength value"
              style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold', fontSize: 13 }}>Mid</label>
            <input
              type="text"
              value={burstStrengthMid}
              onChange={(e) => setBurstStrengthMid(e.target.value)}
              placeholder="Enter Mid"
              style={{ width: '100%', padding: '8px 12px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="func-btn" style={{ minWidth: 80 }} onClick={() => setBurstStrengthModalOpen(false)}>
              Cancel
            </button>
            <button className="func-btn" style={{ minWidth: 80 }} onClick={() => handleBurstStrength()}>
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Alert Modal */}
      <AlertModal
        open={alertOpen}
        title={alertTitle}
        content={alertContent}
        onOk={handleAlertClose}
      />

      {/* Open a Lot Dialog */}
      <Modal
        open={openALotDialogOpen}
        onClose={() => setOpenALotDialogOpen(false)}
        title="Open a Lot"
        width={420}
        height="auto"
      >
        <div style={{ padding: '20px' }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Lot ID:</label>
          <input
            type="text"
            value={openALotInputValue}
            onChange={(e) => setOpenALotInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleOpenALotConfirm() }}
            placeholder="Enter Lot ID"
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              border: '1px solid #ccc',
              borderRadius: 4,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              className="func-btn"
              onClick={() => setOpenALotDialogOpen(false)}
              style={{ minWidth: 80 }}
            >
              Cancel
            </button>
            <button
              className="func-btn"
              onClick={handleOpenALotConfirm}
              disabled={!openALotInputValue.trim()}
              style={{ minWidth: 80 }}
            >
              Open
            </button>
          </div>
        </div>
      </Modal>

      {/* Pen ID Input Dialog (Good Pen / Bad Pen) */}
      <Modal
        open={penInputModalOpen}
        onClose={() => setPenInputModalOpen(false)}
        title={penInputMode === 'good' ? 'Good Pen - Enter Pen ID' : 'Bad Pen - Enter Pen ID'}
        width={420}
        height="auto"
      >
        <div style={{ padding: '20px' }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Pen ID:</label>
          <input
            type="text"
            value={penInputValue}
            onChange={(e) => setPenInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handlePenInputConfirm() }}
            placeholder="Enter Pen ID"
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              border: '1px solid #ccc',
              borderRadius: 4,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              className="func-btn"
              onClick={() => setPenInputModalOpen(false)}
              style={{ minWidth: 80 }}
            >
              Cancel
            </button>
            <button
              className="func-btn"
              onClick={handlePenInputConfirm}
              disabled={!penInputValue.trim()}
              style={{ minWidth: 80 }}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Pen - Pen ID Input Dialog */}
      <Modal
        open={editPenModalOpen}
        onClose={() => setEditPenModalOpen(false)}
        title="Edit Pen - Enter Pen ID"
        width={420}
        height="auto"
      >
        <div style={{ padding: '20px' }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Pen ID:</label>
          <input
            type="text"
            value={editPenInputValue}
            onChange={(e) => setEditPenInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleEditPenConfirm() }}
            placeholder="Enter Pen ID to edit"
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              border: '1px solid #ccc',
              borderRadius: 4,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              className="func-btn"
              onClick={() => setEditPenModalOpen(false)}
              style={{ minWidth: 80 }}
            >
              Cancel
            </button>
            <button
              className="func-btn"
              onClick={handleEditPenConfirm}
              disabled={!editPenInputValue.trim()}
              style={{ minWidth: 80 }}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Pen - Pen ID Input Dialog */}
      <Modal
        open={deletePenModalOpen}
        onClose={() => setDeletePenModalOpen(false)}
        title="Delete Pen - Enter Pen ID"
        width={420}
        height="auto"
      >
        <div style={{ padding: '20px' }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Pen ID:</label>
          <input
            type="text"
            value={deletePenInputValue}
            onChange={(e) => setDeletePenInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleDeletePenConfirm() }}
            placeholder="Enter Pen ID to delete"
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: 14,
              border: '1px solid #ccc',
              borderRadius: 4,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              className="func-btn"
              onClick={() => setDeletePenModalOpen(false)}
              style={{ minWidth: 80 }}
            >
              Cancel
            </button>
            <button
              className="func-btn"
              onClick={handleDeletePenConfirm}
              disabled={!deletePenInputValue.trim()}
              style={{ minWidth: 80, background: '#d32f2f', color: '#fff' }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default FrmNextCap
