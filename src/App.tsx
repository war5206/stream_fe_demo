// src/App.tsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import ContractReview from './pages/ContractReview'
import BidConsult from './pages/BidConsult'
import TechConsult from './pages/TechConsult'
import SalesConsult from './pages/SalesConsult'
import UserProfile from './pages/UserProfile'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'

const App: React.FC = () => {
  const location = useLocation()
  // 如果在查看器页面，隐藏 Sidebar
  const hideSidebar = location.pathname === '/agent/contract/view'

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
