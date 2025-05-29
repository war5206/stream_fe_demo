// src/components/RequireAuth.tsx
import { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    // 未登录，跳转到 login，并记录当前路径以备登录后跳转回来（可选）
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
