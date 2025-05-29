import React from 'react'
import { useNavigate } from 'react-router-dom'

const Profile: React.FC = () => {
  return (
    <div className="h-full flex flex-col justify-center items-center p-6 space-y-4">
      <h1 className="text-xl font-semibold">个人信息</h1>
      <p className="text-center">这里展示用户的个人信息页面。</p>
    </div>
  )
}

export default Profile
