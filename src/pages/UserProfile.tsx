import React from 'react'
import { useNavigate } from 'react-router-dom'

const UserProfile: React.FC = () => {
  return (
    <div className="h-full flex flex-col justify-center items-center p-6 space-y-4">
      <p>手机号：123-4567-8901</p>
      <p>一级部门：部门A</p>
      <p>二级部门：部门B</p>
      <button className="py-2 px-4 bg-red-500 text-white rounded">
        退出登录
      </button>
    </div>
  )
}

export default UserProfile
