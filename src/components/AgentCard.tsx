import React from 'react'

interface Props {
  title: string
  description: string
}

const AgentCard: React.FC<Props> = ({ title, description }) => (
  <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition">
    <h2 className="text-sm font-semibold">{title}</h2>
    <p className="mt-1 text-xs text-gray-600">{description}</p>
  </div>
)

export default AgentCard
