// src/pages/ContractViewer.tsx
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronLeftIcon,
  QuestionMarkCircleIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

interface State {
  fileUrl: string
  fileName: string
}

const tabs = ['总结', '精读', '脑图'] as const

const ContractViewer: React.FC = () => {
  const { state } = useLocation()
  const { fileUrl, fileName } = (state as State) || {}
  const nav = useNavigate()
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('总结')

  return (
    <div className="relative h-full flex">
      {/* 左侧目录 */}
      <aside className="w-1/6 min-w-[120px] border-r overflow-auto p-2">
        <h2 className="font-semibold mb-2">目录</h2>
        <div className="space-y-2">
          {/* 示例章节列表，可动态生成 */}
          <div className="px-2 py-1 bg-gray-100 rounded cursor-pointer">第1页</div>
          <div className="px-2 py-1 bg-gray-100 rounded cursor-pointer">第2页</div>
          <div className="px-2 py-1 bg-gray-100 rounded cursor-pointer">第3页</div>
        </div>
      </aside>

      {/* 主文档预览 */}
      <main className="flex-1 overflow-auto p-2">
        <object
          data={fileUrl}
          type="application/pdf"
          width="100%"
          height="100%"
        >
          文档预览不支持
        </object>
      </main>

      {/* 右侧 AI 选项卡 */}
      <aside className="w-1/4 min-w-[200px] border-l flex flex-col">
        {/* tab 列表 */}
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab}
              onPointerDown={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-center ${
                activeTab === tab
                  ? 'border-b-2 border-[#009e96] font-medium'
                  : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* tab 内容 */}
        <div className="p-4 overflow-auto flex-1">
          {activeTab === '总结' && (
            <>
              <h3 className="font-semibold mb-2">全文总结</h3>
              <p className="text-sm text-gray-600">
                这里展示 AI 自动生成的全文总结……
              </p>
            </>
          )}
          {activeTab === '精读' && (
            <p className="text-sm text-gray-600">这里展示 AI 深度精读内容……</p>
          )}
          {activeTab === '脑图' && (
            <p className="text-sm text-gray-600">这里展示 AI 生成的脑图……</p>
          )}
        </div>
      </aside>

      {/* 顶部工具栏 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-white shadow">
        <button
          onPointerDown={() => nav(-1)}
          className="flex items-center space-x-1 text-gray-600 hover:text-[#009e96] transition"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          <span>返回</span>
        </button>
        <div className="text-center font-medium">{fileName}</div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 px-3 py-1 bg-[#009e96] text-white rounded hover:bg-[#008a7c] transition">
            <QuestionMarkCircleIcon className="h-5 w-5" />
            <span>提问</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">
            <ShareIcon className="h-5 w-5" />
            <span>分享</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContractViewer
