// src/App.tsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import ContractReview from './pages/ContractReview'
import BidConsult from './pages/BidConsult'
import TechConsult from './pages/TechConsult'
import SalesConsult from './pages/SalesConsult'
import UserProfile from './pages/UserProfile'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Login from './pages/Login'
import { useAuth } from './contexts/AuthContext'

const App: React.FC = () => {
  const location = useLocation()
  const { token } = useAuth()

  const hideSidebar = location.pathname === '/agent/contract/view'
  const isLoginPage = location.pathname === '/login'

  const [isCollapsed, setIsCollapsed] = useState(false)

  
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsCollapsed(!e.matches)
    handler(mql)
    mql.addEventListener
      ? mql.addEventListener('change', handler)
      : mql.addListener(handler)
    return () =>
      mql.removeEventListener
        ? mql.removeEventListener('change', handler)
        : mql.removeListener(handler)
  }, [])
  const toggleCollapse = (e: React.PointerEvent) => {
    e.stopPropagation()
    setIsCollapsed(prev => !prev)
  }

  // 🚫 若未登录并非 login 页面，跳转到 login
  if (!token && !isLoginPage) {
    return <Navigate to="/login" replace />
  }

  // ✅ 若访问 login 页面，渲染 login
  if (!token && isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* 仅当不在 ContractViewer 时显示 Sidebar */}
      {!hideSidebar && (
        <>
          <Sidebar isCollapsed={isCollapsed} onToggle={toggleCollapse} />
          {isCollapsed && (
            <div className="fixed top-4 left-4 z-20">
              <div
                onPointerDown={toggleCollapse}
                className="cursor-pointer p-2 bg-white rounded shadow-md"
              >
                ☰
              </div>
            </div>
          )}
        </>
      )}
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${!hideSidebar && !isCollapsed ? 'md:ml-64' : ''}
          ${!isCollapsed && !hideSidebar ? 'pointer-events-none md:pointer-events-auto' : ''}
        `}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/agent/contract" element={<ContractReview />} />
          <Route path="/agent/bid"      element={<BidConsult />} />
          <Route path="/agent/tech"     element={<TechConsult />} />
          <Route path="/agent/sales"    element={<SalesConsult />} />
          <Route path="/user"           element={<UserProfile />} />
          <Route path="/favorites"      element={<Favorites />} />
          <Route path="/profile"        element={<Profile />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
