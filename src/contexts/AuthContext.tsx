import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  token: string | null
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)