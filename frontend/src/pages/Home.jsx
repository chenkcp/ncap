import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const pages = [
    { path: '/next-cap', name: 'NextCap', description: 'NextCap 功能模块' },
    { path: '/lot-manager', name: 'Lot Manager', description: 'Lot 管理器' },
    { path: '/all-context', name: 'All Context', description: '所有上下文' },
    { path: '/lot-summary', name: 'Lot Summary', description: 'Lot 摘要' },
    { path: '/defect-editor', name: 'Defect Editor', description: '缺陷编辑器' },
    { path: '/lot-status-editor', name: 'Lot Status Editor', description: 'Lot 状态编辑器' },
  ]

  return (
    <div className="home-container">
      <h1>NextCap</h1>
      
      <div className="nav-grid">
        {pages.map((page) => (
          <Link key={page.path} to={page.path} className="nav-card">
            <h2>{page.name}</h2>
            <p>{page.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
