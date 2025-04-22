// src/components/Sidebar.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  BookmarkIcon,
  Squares2X2Icon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface Props {
  isCollapsed: boolean
  onToggle: (e: React.PointerEvent) => void
}

const Sidebar: React.FC<Props> = ({ isCollapsed, onToggle }) => {
  const nav = useNavigate()

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-10
        transform transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        overflow-hidden flex flex-col
      `}
    >
      {/* 顶部：Logo + 搜索 + 切换 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <span className="text-xl font-bold text-[#009e96]">四季沐歌</span>
        )}
        {!isCollapsed && (
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-500 hover:text-[#009e96] cursor-pointer transition"
            onPointerDown={e => { e.stopPropagation(); /* 搜索逻辑 */ }}
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
            {/* 新建对话 */}
            <button
              onPointerDown={e => { e.stopPropagation(); nav('/') }}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-2">
                <PlusIcon className="h-5 w-5 text-[#009e96]" />
                <span className="text-[#009e96]">新建顾问对话</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>

            {/* 我的收藏 */}
            <button
              onPointerDown={e => { e.stopPropagation(); nav('/favorites') }}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-2">
                <BookmarkIcon className="h-5 w-5 text-[#009e96]" />
                <span className="text-gray-800">我的收藏</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>

            {/* 全部应用（或“个人信息”） */}
            <button
              onPointerDown={e => { e.stopPropagation(); nav('/profile') }}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-2">
                <Squares2X2Icon className="h-5 w-5 text-[#009e96]" />
                <span className="text-gray-800">个人信息</span>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* 底部用户信息 */}
          <div
            className="mt-auto p-4 border-t border-gray-200 flex items-center
                       cursor-pointer hover:bg-gray-100 transition"
            onPointerDown={e => { e.stopPropagation(); nav('/user') }}
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

export default Sidebar
