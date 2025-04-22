import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import AgentChat from './pages/AgentChat'
import UserProfile from './pages/UserProfile'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'

const App: React.FC = () => {
  // <768px 默认折叠，>=768px 默认展开
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  // 同步窗口尺寸变化
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
      {/* 侧边栏 */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={toggleCollapse}
      />

      {/* 收起后的图标 */}
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

      {/* 主视图区 */}
      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isCollapsed ? '' : 'md:ml-64'}
          ${!isCollapsed ? 'pointer-events-none md:pointer-events-auto' : ''}
        `}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/agent/:id" element={<AgentChat />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
