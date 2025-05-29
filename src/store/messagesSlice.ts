import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ChatMessage } from '../types/chat'

interface MessagesState {
  bySession: Record<number, ChatMessage[]>
  loading: boolean
}

const initialState: MessagesState = {
  bySession: {},
  loading: false,
}

// 获取对应会话历史
export const fetchMessages = createAsyncThunk<
  ChatMessage[],
  number
>('messages/fetchBySession', async sessionId => {
  const res = await fetch(`/api/v1/message/session/${sessionId}`)
  if (!res.ok) throw new Error('Fetch messages failed')
  return (await res.json()) as ChatMessage[]
})

// 3) 发送消息
export const sendMessage = createAsyncThunk<
  { type: string; delta: string },
  { file: File, user_prompt: string, user_id: number, agent_id:number }
>('messages/send', async ({ file, user_prompt, user_id, agent_id }) => {
  const res = await fetch(`/api/v1/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, user_prompt, user_id, agent_id }),
  })
  if (!res.ok) throw new Error('Send message failed')
  const data = await res.json()
  return { type: data.type, delta: data.delta } as { type: string; delta: string }
})

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMessages.pending, s => { s.loading = true })
      .addCase(fetchMessages.fulfilled, (s, { payload, meta }) => {
        s.bySession[meta.arg] = payload
        s.loading = false
      })
      .addCase(sendMessage.fulfilled, (s, { payload }) => {
        const arr = s.bySession[payload.sessionId] || []
        arr.push(payload)
        s.bySession[payload.sessionId] = arr
      })
  }
})

export default messagesSlice.reducer
