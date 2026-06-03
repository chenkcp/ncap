import { useState, useRef, useEffect, useMemo } from 'react'
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
import { Drawer, DefectEditor, LotSummary, Modal, LotQualityStatusEditor, AllContext } from '../components'
import { useGlobalStore } from '../store'
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

// 状态颜色映射
const statusColors = {
  Green: '#4CAF50',
  Yellow: '#FFC107',
  Red: '#f44336',
  Blue: '#2196F3',
  good: '#4CAF50',
  suspend: '#FFC107',
  bad: '#f44336',
  unknown: '#333333',
}

// 从 lots 数据生成图表数据
const generateChartDataFromLots = (lots) => {
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
    const pens = lot.pens || []
    const goodPens = pens.filter(p => p.disposition === 'G' || p.disposition === 'Good').length
    const badPens = pens.filter(p => p.disposition !== 'G' && p.disposition !== 'Good').length
    partQuantity.push(goodPens || lot.pensInLot || 0)
    abnormalQuantity.push(badPens)

    // Failures - 按 className 分组统计
    let cosmetic = 0
    let functional = 0
    let risk = 0

    pens.forEach((pen) => {
      const defects = pen.penDefects || []
      defects.forEach((defect) => {
        const className = (defect.newClassName || defect.className || '').toLowerCase()
        if (className.includes('cosmetic')) {
          cosmetic++
        } else if (className.includes('functional')) {
          functional++
        } else if (className.includes('risk')) {
          risk++
        }
      })
    })

    // 如果没有 pens 数据，使用 defectCounts
    if (pens.length === 0 && lot.defectCounts) {
      lot.defectCounts.forEach((dc) => {
        const className = (dc.newClassName || '').toLowerCase()
        const count = dc.count || 0
        if (className.includes('cosmetic')) {
          cosmetic += count
        } else if (className.includes('functional')) {
          functional += count
        } else if (className.includes('risk')) {
          risk += count
        }
      })
    }

    cosmeticData.push(cosmetic)
    functionalData.push(functional)
    riskData.push(risk)
  })

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
  const { lots, clientInfo, pcName } = useGlobalStore()

  const [viewMode, setViewMode] = useState('partQuantity')
  const [summaryDrawerOpen, setSummaryDrawerOpen] = useState(false)
  const [defectDrawerOpen, setDefectDrawerOpen] = useState(false)
  const [statusEditorOpen, setStatusEditorOpen] = useState(false)
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState('')
  const [selectedLotIndex, setSelectedLotIndex] = useState(-1)
  const [selectedPenId, setSelectedPenId] = useState('')
  const chartContainerRef = useRef(null)
  const [chartWidth, setChartWidth] = useState(800)

  // 从全局 lots 生成图表数据
  const lotData = useMemo(() => generateChartDataFromLots(lots), [lots])

  // 信息栏数据
  const infoItems = useMemo(() => [
    { name: 'Machine Name', value: clientInfo.clientName || pcName || '-' },
    { name: 'Line Type', value: clientInfo.lineType || '-' },
    { name: 'Line', value: clientInfo.lineNumber ? `#${clientInfo.lineNumber}` : '-' },
    { name: 'Station', value: clientInfo.source || '-' },
    { name: 'Product', value: lots[0]?.productName || '-' },
    { name: 'Active Lots', value: lots.length || '0' },
    { name: 'Last Sync', value: new Date().toLocaleDateString() },
    { name: 'Site', value: 'CIA2' },
  ], [clientInfo, pcName, lots])

  // 计算图表宽度 (每个柱子固定宽度)
  useEffect(() => {
    const barWidth = 50 // 每个柱子的宽度
    setChartWidth(Math.max(lotData.labels.length * barWidth, 800))
  }, [lotData.labels.length])

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
        backgroundColor: '#f44336',
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

  // 计算 Y 轴最大值
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
        setSelectedLot(lotId)
        setSelectedLotIndex(index)
        setSummaryDrawerOpen(true)
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

  // 处理编辑Pen
  const handleEditPen = (pen) => {
    setSelectedPenId(pen.penId)
    setSummaryDrawerOpen(false)
    setDefectDrawerOpen(true)
  }

  // 处理删除Pen
  const handleDeletePen = (pen) => {
    console.log('Delete pen:', pen.penId)
  }

  // 如果没有数据，显示空状态
  if (lotData.labels.length === 0) {
    return (
      <div className="nextcap-container">
        <div className="info-bar">
          {infoItems.map((item, index) => (
            <div key={index} className="info-item">
              <span className="info-name">{item.name}</span>
              <span className="info-value">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>暂无 Lot 数据</h3>
          <p>当前工作站没有可显示的 Lot 数据</p>
        </div>
      </div>
    )
  }

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
            <div className="chart-inner" style={{ width: chartWidth }}>
              {/* 图表 */}
              <div className="chart-area">
                <Bar data={chartData} options={chartOptions} />
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

      {/* 底部功能按钮 */}
      <div className="bottom-buttons">
        <button className="func-btn">Good Pen</button>
        <button className="func-btn">Bad Pen</button>
        <button className="func-btn">Edit Pen</button>
        <button className="func-btn">Delete Pen</button>
        <button className="func-btn" onClick={() => setContextDrawerOpen(true)}>
          Context
        </button>
        <button className="func-btn">Lot Mgt</button>
      </div>

      {/* Summary 抽屉 */}
      <Drawer
        open={summaryDrawerOpen}
        onClose={() => setSummaryDrawerOpen(false)}
        title={`Summary - ${selectedLot}`}
        width={900}
      >
        <LotSummary
          lotId={selectedLot}
          onEditPen={handleEditPen}
          onDeletePen={handleDeletePen}
          onClose={() => setSummaryDrawerOpen(false)}
        />
      </Drawer>

      {/* DefectEditor 弹出框 */}
      <Modal
        open={defectDrawerOpen}
        onClose={() => {
          setDefectDrawerOpen(false)
          setSummaryDrawerOpen(true)
        }}
        title={`Defect Editor - ${selectedLot} / ${selectedPenId}`}
        width={950}
        height="85vh"
      >
        <DefectEditor
          lotId={selectedLot}
          penId={selectedPenId}
          onOk={() => {
            setDefectDrawerOpen(false)
            setSummaryDrawerOpen(true)
            console.log('保存成功')
          }}
          onCancel={() => {
            setDefectDrawerOpen(false)
            setSummaryDrawerOpen(true)
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
    </div>
  )
}

export default FrmNextCap
