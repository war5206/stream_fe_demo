// src/components/Sidebar.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  BookmarkIcon,
  Squares2X2Icon,
  ChevronRightIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'

interface HistoryEntry {
  id: number
  agent_id: number
  title: string
  updated_at: string
}

interface Props {
  isCollapsed: boolean
  onToggle: (e: React.PointerEvent) => void
}

// agent_id -> 路由名称
const agentMap: Record<number, string> = {
  1: 'contract',
  2: 'bid',
  3: 'tech',
  4: 'sales'
}

export default function Sidebar({ isCollapsed, onToggle }: Props) {
  const nav = useNavigate()
  const { search } = useLocation()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [menuOpen, setMenuOpen] = useState<number | null>(null)

  // whenever URL search changes (新会话创建或 session 参数变化)，重新拉历史
  useEffect(() => {
    fetch('http://127.0.0.1:9000/api/v1/session/user/1')
      .then(res => res.json())
      .then((data: HistoryEntry[]) => setHistory(data))
      .catch(console.error)
  }, [search])

  const handleRename = (id: number) => {
    const newTitle = prompt('请输入新会话标题')
    if (!newTitle) return
    fetch(`http://127.0.0.1:9000/api/v1/session/${id}/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    })
      .then(res => {
        if (!res.ok) throw new Error()
        setHistory(h =>
          h.map(e => (e.id === id ? { ...e, title: newTitle } : e))
        )
      })
      .catch(console.error)
  }

  const handleDelete = (id: number) => {
    fetch(`http://127.0.0.1:9000/api/v1/session/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error()
        setHistory(h => h.filter(e => e.id !== id))
        nav('/')
      })
      .catch(console.error)
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-10
        transform transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        flex flex-col overflow-hidden
      `}
    >
      {/* 顶部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <span className="text-xl font-bold text-[#009e96]">四季沐歌</span>
        )}
        {!isCollapsed && (
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-500 hover:text-[#009e96] cursor-pointer transition"
            onPointerDown={e => e.stopPropagation()}
          />
        )}
        <div
          onPointerDown={onToggle}
          className="cursor-pointer p-2 text-gray-500 hover:text-[#009e96] transition"
        >
          {isCollapsed ? (
            <Bars3Icon className="h-6 w-6" />
          ) : (
            <XMarkIcon className="h-6 w-6" />
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* 操作入口 */}
          <div className="p-4 space-y-2">
            <button
              onPointerDown={e => {
                e.stopPropagation()
                nav('/')
              }}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-2">
                <PlusIcon className="h-5 w-5 text-[#009e96]" />
                <span className="text-[#009e96]">新建顾问对话</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onPointerDown={e => {
                e.stopPropagation()
                nav('/favorites')
              }}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-2">
                <BookmarkIcon className="h-5 w-5 text-[#009e96]" />
                <span className="text-gray-800">我的收藏</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onPointerDown={e => {
                e.stopPropagation()
                nav('/profile')
              }}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-2">
                <Squares2X2Icon className="h-5 w-5 text-[#009e96]" />
                <span className="text-gray-800">个人信息</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* 历史记录 */}
          <div className="px-4 py-2 text-xs text-gray-500">历史记录</div>
          <div className="flex-1 overflow-auto">
            {history.map(entry => (
              <div
                key={entry.id}
                className="group relative px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                onClick={() => {
                  const route = agentMap[entry.agent_id] || 'contract'
                  nav(`/agent/${route}?session=${entry.id}&title=${entry.title}`)
                }}
                onMouseLeave={() => setMenuOpen(null)}
              >
                <span className="truncate text-sm text-gray-800">
                  {entry.title || '未命名会话'}
                </span>

                {/* “...”按钮 */}
                <button
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(entry.id)
                  }}
                >
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>

                {/* 菜单 */}
                {menuOpen === entry.id && (
                  <div
                    className="absolute z-20 right-2 top-full w-32 bg-white border border-gray-200 rounded-xl shadow-lg text-sm"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleRename(entry.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-xl"
                    >
                      重命名
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-xl text-red-500"
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>


          {/* 底部用户信息 */}
          <div
            className="mt-auto p-4 border-t border-gray-200 flex items-center cursor-pointer hover:bg-gray-100 transition"
            onPointerDown={e => {
              e.stopPropagation()
              nav('/user')
            }}
          >
            <img
              src="/src/assets/user.png"
              alt="User"
              className="h-8 w-8 rounded-full"
            />
            <span className="ml-2 text-gray-800">Username</span>
          </div>
        </>
      )}
    </aside>
  )
}
