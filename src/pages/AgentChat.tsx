// src/pages/AgentChat.tsx
import React from 'react'
import { useParams } from 'react-router-dom'
import {
  ArrowUpTrayIcon,
  LinkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const agentInfo = {
  contract: { title: '合同评审顾问', subtitle: '支持深度合同解析，一键生成要点' },
  bid:      { title: '招投标顾问' },
  tech:     { title: '技术顾问' },
  sales:    { title: '销售顾问' }
}

const AgentChat: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const info = agentInfo[id as keyof typeof agentInfo]

  // 合同评审专属界面
  if (id === 'contract') {
    return (
      <div className="h-full flex flex-col items-center p-6 space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">{info.title}</h1>
          <p className="mt-2 text-gray-600">{info.subtitle}</p>
        </div>

        {/* 拖拽区域 */}
        <div className="w-full max-w-3xl p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-lg font-semibold">拖拽文件至此处</h2>
            <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">
              支持格式：pdf、doc、txt、ppt、excel<br/>
              文件大小：每个不超过100MB，最多50个
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="mt-4 flex justify-center space-x-4">
            <button
              type="button"
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#009e96] rounded-lg shadow hover:bg-[#009e96]/10 transition"
            >
              <ArrowUpTrayIcon className="h-5 w-5 text-[#009e96]" />
              <span className="text-[#009e96]">本地文件</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#009e96] rounded-lg shadow hover:bg-[#009e96]/10 transition"
            >
              <LinkIcon className="h-5 w-5 text-[#009e96]" />
              <span className="text-[#009e96]">网页链接</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#009e96] rounded-lg shadow hover:bg-[#009e96]/10 transition"
            >
              <ClockIcon className="h-5 w-5 text-[#009e96]" />
              <span className="text-[#009e96]">历史文件</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 其他顾问聊天占位
  const title = info?.title || '顾问'
  return (
    <div className="h-full flex flex-col justify-center items-center p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div className="border rounded p-4 w-full max-w-3xl h-[60vh] overflow-auto">
        <p className="text-gray-500 text-center">[Chat UI for “{title}”]</p>
      </div>
    </div>
  )
}

export default AgentChat
