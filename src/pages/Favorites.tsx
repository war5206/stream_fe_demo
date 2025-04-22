import React from 'react'
import { useNavigate } from 'react-router-dom'

const Favorites: React.FC = () => {
  const nav = useNavigate()
  return (
    <div className="p-6">
      <button onClick={() => nav(-1)} className="mb-4 text-blue-500">
        ← 返回
      </button>
      <h1 className="text-xl font-semibold mb-4">我的收藏</h1>
      <p>这里展示收藏的对话或内容。</p>
    </div>
  )
}

export default Favorites
