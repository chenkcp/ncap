import { useState, useEffect, useMemo } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import {
  FrmNextCap,
  FrmLotManager,
  FrmAllContext,
  FrmLotSummary,
  FrmDefectEditor,
  FrmLotStatusEditor,
} from './pages'
import { Loading, Toast, ClientCustomerSelector } from './components'
import { useGlobalStore } from './store'
import { useAppInit, useSelectClientCustomer } from './hooks'
import './App.css'

// 子窗口路由列表 - 这些路由需要轻量级初始化（只读配置，不请求数据）
const CHILD_WINDOW_ROUTES = ['/lot-summary', '/defect-editor', '/lot-manager']

// 判断是否是子窗口路由
const useIsChildWindow = () => {
  const location = useLocation()
  return useMemo(() => CHILD_WINDOW_ROUTES.includes(location.pathname), [location.pathname])
}

// 全局组件包装器
function GlobalComponents() {
  const { loading, toasts, removeToast, needSelectClient, clientCustomers } = useGlobalStore()
  const { selectClient } = useSelectClientCustomer()
  
  return (
    <>
      <Loading visible={loading.isLoading} message={loading.message} />
      <Toast toasts={toasts} onRemove={removeToast} />
      {needSelectClient && clientCustomers.length > 0 && (
        <ClientCustomerSelector
          customers={clientCustomers}
          onSelect={selectClient}
        />
      )}
    </>
  )
}

// 主窗口初始化包装器
function MainWindowInitializer({ children }) {
  const { initialized } = useAppInit()
  
  if (!initialized) {
    return (
      <div className="app-initializing">
        <Loading visible={true} message="正在初始化应用..." />
      </div>
    )
  }
  
  return <>{children}</>
}

// 子窗口直接渲染包装器 - 不执行初始化，直接使用 localStorage 中的数据
function ChildWindowWrapper({ children }) {
  return <>{children}</>
}

// 应用初始化包装器 - 根据窗口类型选择不同的初始化策略
function AppInitializer({ children }) {
  const isChildWindow = useIsChildWindow()
  
  // 子窗口直接渲染，不执行初始化（数据来自 Zustand persist localStorage）
  // 主窗口执行完整初始化（包含 HTTP 请求）
  if (isChildWindow) {
    return <ChildWindowWrapper>{children}</ChildWindowWrapper>
  }
  
  return <MainWindowInitializer>{children}</MainWindowInitializer>
}

function App() {
  return (
    <>
      <GlobalComponents />
      <HashRouter>
        <AppInitializer>
          <Routes>
            <Route path="/" element={<Navigate to="/next-cap" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/next-cap" element={<FrmNextCap />} />
            <Route path="/lot-manager" element={<FrmLotManager />} />
            <Route path="/all-context" element={<FrmAllContext />} />
            <Route path="/lot-summary" element={<FrmLotSummary />} />
            <Route path="/defect-editor" element={<FrmDefectEditor />} />
            <Route path="/lot-status-editor" element={<FrmLotStatusEditor />} />
          </Routes>
        </AppInitializer>
      </HashRouter>
    </>
  )
}

export default App
