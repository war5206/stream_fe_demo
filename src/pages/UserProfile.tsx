import React from 'react'
import { useNavigate } from 'react-router-dom'

const UserProfile: React.FC = () => {
  const nav = useNavigate()
  return (
    <div className="p-6">
      <button onClick={() => nav(-1)} className="mb-4 text-blue-500">
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

export default UserProfile
