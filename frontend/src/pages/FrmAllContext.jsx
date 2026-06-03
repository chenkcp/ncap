import { useNavigate } from 'react-router-dom'
import './pages.css'

function FrmAllContext() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
        <h1>All Context</h1>
      </header>
      <main className="page-content">
        <p>这是 All Context 页面</p>
      </main>
    </div>
  )
}

export default FrmAllContext
