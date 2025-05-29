import React from 'react'
import { useNavigate } from 'react-router-dom'

const Favorites: React.FC = () => {
  return (
    <div className="h-full flex flex-col justify-center items-center p-6 space-y-4">
      <h1 className="text-xl font-semibold">我的收藏</h1>
      <p className="text-center">这里展示收藏的对话或内容。</p>
    </div>
  )
}

export default Favorites
