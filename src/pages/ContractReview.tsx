// src/pages/ContractReview.tsx
import React, {
  useState,
  DragEvent,
  ChangeEvent,
  useRef,
  useEffect
} from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import MarkdownPreview from '@uiw/react-markdown-preview'

export default function ContractReview() {
  const navigate  = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [showBackToBottom, setShowBackToBottom] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  // 取 ?session=xxx&title=xxx
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')
  const title = searchParams.get('title')

  // 如果有 sessionId，就拉历史消息
  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    fetch(`http://127.0.0.1:9000/api/v1/message/session/${sessionId}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((msgs: { role: string; content: string }[]) => {
        // console.log("msgs: ", msgs)
        const assistantText = msgs
          .filter(m => m.role === 'assistant')
          .map(m => m.content)
          .join('\n\n')
        // console.log("assistantText: ", assistantText)
        // console.log("assistantText Obj: ", JSON.parse(assistantText))
        setSummary(JSON.parse(assistantText).delta)
      })
      .catch(err => {
        console.error(err)
        alert('历史加载失败')
      })
      .finally(() => {
        setLoading(false)
        setTimeout(() => {
          outputRef.current?.scrollTo({
            top: outputRef.current.scrollHeight
          })
        }, 0)
      })
  }, [sessionId])

  const truncateName = (name: string) => {
    if (name.length <= 15) return name
    // const ext = name.slice(name.lastIndexOf('.'))
    const base = name.slice(0, 15)
    return base + '...'
  }

  const handleFile = (f: File) => {
    if (!/\.(pdf|docx)$/i.test(f.name)) {
      alert('只支持 PDF 或 DOCX 格式')
      return
    }
    setFile(f)
    startReview(f)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const startReview = async (f: File) => {
    const formData = new FormData()
    formData.append('file', f)
    formData.append('user_prompt', '请进行合同评审')
    formData.append('user_id', '1')
    formData.append('agent_id', '1')
    
    setLoading(true)
    setSummary('')
    
    try {
      console.log("rag contract formData: ", formData)
      const res = await fetch(
        'http://127.0.0.1:9000/api/v1/contract/review',
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      console.log("rag contract data: ", data)
      if (data.type === 'message') {
        setSummary(data.delta)
        navigate(`/agent/contract?session=${data.session_id}`, { replace: true })
      }
    } catch (err) {
      console.error(err)
      alert('请求失败，请稍后再试')
    } finally {
      setLoading(false)
      setTimeout(() => {
        outputRef.current?.scrollTo({
          top: outputRef.current.scrollHeight
        })
      }, 0)
    }
  }

  const multiReview = async () => {
    if (!sessionId) {
      alert('会话未初始化，无法继续评审')
      return
    }
    const formData = new FormData()
    formData.append('user_prompt', '请继续补充合同评审内容')
    formData.append('user_id', '1')
    formData.append('agent_id', '1')
    formData.append('session_id', sessionId)
    
    setLoading(true)
    
    try {
      console.log("rag contract formData: ", formData)
      const res = await fetch(
        'http://127.0.0.1:9000/api/v1/contract/multi-review',
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      console.log("rag contract data: ", data)
      if (data.type === 'message') {
        setSummary(prev => prev + '\n\n' + data.delta)
      }
    } catch (err) {
      console.error(err)
      alert('请求失败，请稍后再试')
    } finally {
      setLoading(false)
      setTimeout(() => {
        outputRef.current?.scrollTo({
          top: outputRef.current.scrollHeight
        })
      }, 0)
    }
  }

  // const keepReview = async() 

  // 滚动控制回到底部按钮
  useEffect(() => {
    const div = outputRef.current
    if (!div) return
    const onScroll = () => {
      const atBottom =
        div.scrollTop + div.clientHeight >= div.scrollHeight - 20
      setShowBackToBottom(!atBottom)
    }
    div.addEventListener('scroll', onScroll)
    return () => div.removeEventListener('scroll', onScroll)
  }, [summary])

  return (
    <div className="h-full flex flex-col items-center pt-6 pb-6 space-y-6">
      {/* 上传 & 说明：只有首次非历史时显示 */}
      {!sessionId && !summary && !loading && (
        <>
          <div className="text-center">
            <h1 className="text-3xl font-bold">合同评审顾问</h1>
            <p className="mt-2 text-gray-600">
              帮助你审阅合同条款，给出专业建议
            </p>
          </div>
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
        </>
      )}

      {/* 加载中 */}
      {loading && (
        <div className="w-full max-w-2xl p-6">
          <p className="text-center text-gray-700">
            文档分析中，预计需要 1-2 分钟…
          </p>
          <div className="mt-4 h-2 bg-gray-200 rounded overflow-hidden">
            <div className="h-full bg-[#009e96] animate-progress" />
          </div>
        </div>
      )}

      {/* 展示结果 */}
      {!loading && summary && (
        <>
          <div className="w-full max-w-7xl text-left text-gray-700 font-semibold text-lg mb-2 self-start pl-12">
            { title ? truncateName(title) : `合同评审 - ${truncateName(file?.name || '')}` }
          </div>
          <div className="w-full max-w-6xl flex flex-col items-center">
            <div
              ref={outputRef}
              className={`relative w-full max-w-full md:w-[90%] max-w-7xl
                          rounded-lg bg-white px-8 py-6 max-h-[700px] min-h-[400px]
                          overflow-y-scroll text-[15px] leading-relaxed text-gray-800
                          no-scrollbar ${showBackToBottom ? 'pb-20' : ''}`}
            >
              <MarkdownPreview source={summary} />
              {showBackToBottom && (
                <div className="sticky bottom-4 ml-auto pr-4 pb-2 w-fit z-10 bg-white bg-opacity-80 rounded">
                  <button
                    className="text-[#009e96] border border-gray-300 px-2.5 py-1 text-sm rounded-full shadow-sm hover:bg-gray-50"
                    onClick={() =>
                      outputRef.current?.scrollTo({
                        top: outputRef.current.scrollHeight,
                        behavior: 'smooth'
                      })
                    }
                  >
                    ⬇ 返回
                  </button>
                </div>
              )}
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                className="px-4 py-2 border border-[#009e96] text-[#009e96] rounded hover:bg-[#009e96]/10 transition"
                onPointerDown={() => {
                    // 清空状态，并用 navigate 返回上传页
                    setFile(null)
                    setSummary('')
                    navigate('/agent/contract', { replace: true })
                  }}
              >
                继续评审
              </button>
              <button
                className="px-4 py-2 bg-[#009e96] text-white rounded hover:bg-[#008a7c] transition"
                onPointerDown={() => {
                  multiReview()
                }}
              >
                评审内容补充
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
