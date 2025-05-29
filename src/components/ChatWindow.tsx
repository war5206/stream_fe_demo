// src/components/ChatWindow.tsx
import React from 'react'
import AgentCard from './AgentCard'

interface Agent { id: string; title: string; description: string }

const agents: Agent[] = [
  { id: 'contract', title: '合同评审顾问', description: '帮助你审阅合同条款，给出专业建议' },
  { id: 'bid',      title: '招投标顾问',   description: '辅助招标流程，优化投标方案' },
  { id: 'tech',     title: '技术顾问',     description: '解答技术难题，提供开发方案' },
  { id: 'sales',    title: '销售顾问',     description: '助力销售策略，提升转化效果' }
]

interface Props { selected: string | null; onSelect: (id: string | null) => void }

const ChatWindow: React.FC<Props> = ({ selected, onSelect }) => {
  if (selected === 'user') {
    return (
      <div className="p-6">
        <button onClick={() => onSelect(null)} className="mb-4 text-blue-500">
          ← 返回
        </button>
        <div className="space-y-2">
          <p>手机号：123‑4567‑8901</p>
          <p>一级部门：部门A</p>
          <p>二级部门：部门B</p>
          <button className="mt-2 py-2 px-4 bg-red-500 text-white rounded">
            退出登录
          </button>
        </div>
      </div>
    )
  }

  if (selected) {
    const a = agents.find(x => x.id === selected)!
    return (
      <div className="p-6">
        <button onClick={() => onSelect(null)} className="mb-4 text-blue-500">
          ← 返回
        </button>
        <h1 className="text-2xl font-bold mb-2">{a.title}</h1>
        <div className="border rounded p-4 h-[70vh] overflow-auto">
          <p className="text-gray-500">[Chat UI for “{a.title}”]</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex justify-center items-start p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
        {agents.map(a => (
          <div
            key={a.id}
            className="cursor-pointer"
            onClick={() => onSelect(a.id)}
          >
            <AgentCard title={a.title} description={a.description} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatWindow
