import { useNavigate } from 'react-router-dom'
import './pages.css'

function FrmLotStatusEditor() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
        <h1>Lot Status Editor</h1>
      </header>
      <main className="page-content">
        <p>这是 Lot Status Editor 页面</p>
      </main>
    </div>
  )
}

export default FrmLotStatusEditor
