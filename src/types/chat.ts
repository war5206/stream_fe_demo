export interface ChatSession {
  id: string
  userId: string
  agentId: string
  documentIds: string
  title: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

export interface ChatMessage {
  id: number
  sessionId: number
  messageIndex: number
  role: 'user' | 'assistant'
  type: 'message' | 'reasoning' | 'system'
  content: string
  createdAt: string
  isDeleted: boolean
}