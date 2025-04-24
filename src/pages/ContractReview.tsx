// src/pages/ContractReview.tsx
import React, { useState, useRef, DragEvent, ChangeEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'

interface StreamData {
  type: 'reasoning' | 'message' | 'error'
  delta?: string
}

export default function ContractReview() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<
    { type: 'reasoning' | 'message'; content: string }[]
  >([])
  const outputRef = useRef<HTMLDivElement>(null)

  // 通用上传处理，触发评审
  const handleFile = (f: File) => {
    if (!/\.(pdf|docx)$/i.test(f.name)) {
      alert('只支持 PDF 或 DOCX 格式')
      return
    }
    setFile(f)
    startReview(f)
  }

  // 拖拽
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  // 选择文件
  const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  // 调用后端并处理流式返回
  const startReview = async (f: File) => {
    const formData = new FormData()
    formData.append('file', f)
    formData.append('user_prompt', '请进行合同评审')
    formData.append('user_id', '1')
    formData.append('agent_id', '1')

    setLoading(true)
    setMessages([])

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/contract/review', {
        method: 'POST',
        body: formData,
      })
      if (!res.body) throw new Error('响应流不可用')
      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let reasoning = ''
      let answer = ''
      let done = false

      while (!done) {
        const { value, done: readDone } = await reader.read()
        done = readDone
        if (value) {
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            if (!line.trim()) continue
            let data: StreamData
            try {
              data = JSON.parse(line)
            } catch {
              continue
            }
            if (data.type === 'reasoning') {
              const delta = data.delta || ''
              reasoning += delta
              setMessages(prev => [
                ...prev.filter(m => m.type !== 'reasoning'),
                { type: 'reasoning', content: reasoning },
              ])
            } else if (data.type === 'message') {
              const delta = data.delta || ''
              answer += delta
              setMessages(prev => [
                ...prev.filter(m => m.type !== 'message'),
                { type: 'message', content: answer },
              ])
            } else if (data.type === 'error') {
              console.error('后端错误：', data.delta)
            }
          }
          if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight
          }
        }
      }
    } catch (err) {
      console.error(err)
      alert('请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col items-center p-6 space-y-6">
      {/* 标题区 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">合同评审顾问</h1>
        <p className="mt-2 text-gray-600">
          帮助你审阅合同条款，给出专业建议
        </p>
      </div>

      {/* 未上传时：拖拽/选择上传 */}
      {!file && (
        <div
          className="w-full max-w-2xl p-6 border-2 border-dashed border-gray-300 rounded-lg
                     flex flex-col items-center justify-center min-h-[300px]"
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
        >
          <h2 className="text-lg font-semibold">拖拽文件至此处</h2>
          <p className="mt-2 text-sm text-gray-500 text-center">
            支持 PDF、DOCX；单次仅选一个文件
          </p>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={onSelect}
          />
          <label
            htmlFor="file-input"
            className="mt-4 px-4 py-2 bg-[#009e96] text-white rounded-lg cursor-pointer"
          >
            从本地选择
          </label>
        </div>
      )}

      {/* 已上传时：消息流 */}
      {file && (
        <div className="w-full max-w-2xl flex flex-col">
          <div
            ref={outputRef}
            className="whitespace-pre-wrap bg-white border rounded-lg p-4 shadow-inner
                       max-h-[400px] overflow-y-auto text-sm text-gray-800"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-3">
                {msg.type === 'reasoning' && (
                  <div className="border-l-4 border-gray-300 pl-3 text-gray-600">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
                {msg.type === 'message' && (
                  <div className="bg-gray-100 p-3 rounded">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="text-center text-gray-600">评审中，请稍候…</div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 border border-[#009e96] text-[#009e96] rounded
                         hover:bg-[#009e96]/10 transition"
              onPointerDown={() => {
                setFile(null)
                setMessages([])
              }}
            >
              重新上传
            </button>
            <button
              className="px-4 py-2 bg-[#009e96] text-white rounded
                         hover:bg-[#008a7c] transition"
              onPointerDown={() => {
                const q = window.prompt('请输入您的问题：')
                if (q) {
                  // 可接入后端提问接口
                  alert(`您的问题已提交：${q}`)
                }
              }}
            >
              提问
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
