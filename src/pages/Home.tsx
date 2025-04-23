import React from 'react'
import { useNavigate } from 'react-router-dom'
import AgentCard from '../components/AgentCard'

const agents = [
  { id: 'contract', title: '合同评审顾问', description: '帮助你审阅合同条款，给出专业建议' },
  { id: 'bid',      title: '招投标顾问',   description: '辅助招标流程，优化投标方案' },
  { id: 'tech',     title: '技术顾问',     description: '解答技术难题，提供开发方案' },
  { id: 'sales',    title: '销售顾问',     description: '助力销售策略，提升转化效果' }
]

const Home: React.FC = () => {
  const nav = useNavigate()

  return (
    <div className="h-full flex justify-center items-center p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
      {agents.map(a => (
        <div
          key={a.id}
          className="cursor-pointer"
          onPointerDown={() => nav(`/agent/${a.id}`)}
        >
            <AgentCard title={a.title} description={a.description} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
