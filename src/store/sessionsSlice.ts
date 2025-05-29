import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ChatSession } from '../types/chat'

interface SessionsState {
  list: ChatSession[]
  loading: boolean
}

const initialState: SessionsState = {
  list: [],
  loading: false,
}

// 获取所有 session
export const fetchSessions = createAsyncThunk<
  ChatSession[],
  number
>('sessions/fetchAll', async (userId) => {
  const res = await fetch(`/api/v1/session/${userId}`, { method: 'GET' })
  if (!res.ok) {
    throw new Error('Failed to fetch sessions')
  }
  const data = await res.json()
  return data as ChatSession[]
})

// 会话由后端在分析接口中创建，前端同步插入
export const addSession = createAsyncThunk<
  ChatSession,
  ChatSession
>('sessions/add', async (session) => {
  // session 已由后端创建并返回
  return session
})

// 重命名 session
export const renameSession = createAsyncThunk<
  { session_id: number; user_id: number; title: string },
  { session_id: number; user_id: number; title: string }
>('sessions/rename', async ({ session_id, user_id, title }) => {
  const res = await fetch(`/api/v1/session/${session_id}/${user_id}`, { 
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
  if (!res.ok) throw new Error('Rename failed')
  return { session_id, user_id, title }
})

// 删除 session
export const deleteSession = createAsyncThunk<number, number>(
  'sessions/delete',
  async (id) => {
    const res = await fetch(`/api/v1/session/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    return id
  }
)


const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    bumpSession: (state, action: PayloadAction<number>) => {
      // 将指定 session 移到列表顶部
      const idx = state.list.findIndex(s => s.id === action.payload)
      if (idx > 0) {
        const [sess] = state.list.splice(idx, 1)
        state.list.unshift(sess)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (s) => {s.loading = true})
      .addCase(fetchSessions.fulfilled, (s, {payload}) => {
        s.list = payload
          .filter(x => !x.isDeleted)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        s.loading = false
      })
      .addCase(addSession.fulfilled, (s, { payload }) => {
        s.list.unshift(payload)
      })
      .addCase(renameSession.fulfilled, (s, { payload }) => {
        const ses = s.list.find(x => x.id === payload.id)
        if (ses) ses.title = payload.title
      })
      .addCase(deleteSession.fulfilled, (s, { payload }) => {
        s.list = s.list.filter(x => x.id !== payload)
      })
  }
})

export const { bumpSession } = sessionsSlice.actions
export default sessionsSlice.reducer