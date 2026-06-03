import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalStore } from '../store'
import { DefectEditor } from '../components'
import { syncLotDefectCounts } from '../utils/syncLotDefectCounts'
import './pages.css'

function FrmDefectEditor() {
  const navigate = useNavigate()
  const [lotId, setLotId] = useState('')
  const [penId, setPenId] = useState('')
  const [addBadPen, setAddBadPen] = useState(false)

  // 从全局 store 获取数据
  const { 
    pens,
    penDefects,
    levelOneDescriptions,
    levelTwoDescriptions,
  } = useGlobalStore()

  // 获取窗口参数
  useEffect(() => {
    const getParams = async () => {
      if (window.electronAPI?.getWindowParams) {
        const params = await window.electronAPI.getWindowParams()
        console.log('Defect Editor 收到参数:', params)
        if (params.lotId) {
          setLotId(params.lotId)
        }
        if (params.penId) {
          setPenId(params.penId)
        }
        if (params.addBadPen) {
          setAddBadPen(params.addBadPen)
        }
      }
    }
    getParams()

    // 监听参数更新
    if (window.electronAPI?.onWindowParamsUpdate) {
      window.electronAPI.onWindowParamsUpdate((params) => {
        console.log('Defect Editor 参数更新:', params)
        if (params.lotId) {
          setLotId(params.lotId)
        }
        if (params.penId) {
          setPenId(params.penId)
        }
      })
    }
  }, [])

  // 调试输出
  useEffect(() => {
    console.log('Defect Editor 状态:', {
      lotId,
      penId,
      pensCount: pens.length,
      penDefectsCount: penDefects.length,
      levelOneCount: levelOneDescriptions.length,
      levelTwoCount: levelTwoDescriptions.length,
    })
  }, [lotId, penId, pens, penDefects, levelOneDescriptions, levelTwoDescriptions])

  const handleOk = () => {
    console.log('保存数据', { lotId, penId })
    // syncLotDefectCounts is already called inside DefectEditor's handleOk → saveToStore
    window.close()
  }

  const handleCancel = () => {
    window.close()
  }

  return (
    <div className="defect-editor-page">
      <DefectEditor 
        lotId={lotId}
        penId={penId}
        pens={pens}
        penDefects={penDefects}
        levelOneDescriptions={levelOneDescriptions}
        levelTwoDescriptions={levelTwoDescriptions}
        addBadPen={addBadPen}
        onOk={handleOk} 
        onCancel={handleCancel} 
      />
    </div>
  )
}

export default FrmDefectEditor
