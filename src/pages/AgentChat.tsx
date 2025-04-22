import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const agentInfo = {
  contract: { title: '合同评审顾问' },
  bid:      { title: '招投标顾问' },
  tech:     { title: '技术顾问' },
  sales:    { title: '销售顾问' }
}

const AgentChat: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const title = agentInfo[id as keyof typeof agentInfo]?.title || '顾问'

  return (
    <div className="p-6">
      <button onClick={() => nav(-1)} className="mb-4 text-blue-500">
        ← 返回
      </button>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <div className="border rounded p-4 h-[70vh] overflow-auto">
        <p className="text-gray-500">[Chat UI for “{title}”]</p>
      </div>
    </div>
  )
}

export default AgentChat
