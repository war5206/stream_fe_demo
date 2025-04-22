import React from 'react'
import { useNavigate } from 'react-router-dom'

const Profile: React.FC = () => {
  const nav = useNavigate()
  return (
    <div className="p-6">
      <button onClick={() => nav(-1)} className="mb-4 text-blue-500">
        ← 返回
      </button>
      <h1 className="text-xl font-semibold mb-4">个人信息</h1>
      <p>这里展示用户的个人信息页面。</p>
    </div>
  )
}

export default Profile
