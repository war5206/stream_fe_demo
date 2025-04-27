import { useState, DragEvent, ChangeEvent, useRef, useEffect } from 'react'
import MarkdownPreview from '@uiw/react-markdown-preview'

export default function ContractReview() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [showBackToBottom, setShowBackToBottom] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

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
      const res = await fetch('http://127.0.0.1:8000/api/v1/contract/review', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.type === 'message') {
        setSummary(data.delta)
      }
    } catch (err) {
      console.error(err)
      alert('请求失败，请稍后再试')
    } finally {
      setLoading(false)
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight
        }
      }, 0)
    }
  }

  useEffect(() => {
    const div = outputRef.current
    if (!div) return
    const handleScroll = () => {
      const isAtBottom = div.scrollTop + div.clientHeight >= div.scrollHeight - 20
      setShowBackToBottom(!isAtBottom)
    }
    div.addEventListener('scroll', handleScroll)
    return () => div.removeEventListener('scroll', handleScroll)
  }, [summary])

  const truncateName = (name: string) => {
    if (name.length <= 15) return name
    const ext = name.slice(name.lastIndexOf('.'))
    const base = name.slice(0, 15)
    return base + '...'
  }

  return (
    <div className="h-full flex flex-col items-center pt-6 pb-6 space-y-6">
      {/* 顶部标题 */}
      {!summary && !loading && (
        <div className="text-center">
          <h1 className="text-3xl font-bold">合同评审顾问</h1>
          <p className="mt-2 text-gray-600">
            帮助你审阅合同条款，给出专业建议
          </p>
        </div>
      )}

      {/* 上传区域 */}
      {!file && !loading && !summary && (
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

      {/* 加载中 */}
      {loading && (
        <div className="w-full max-w-2xl p-6">
          <p className="text-center text-gray-700">文档分析中，预计需要 1-2 分钟…</p>
          <div className="mt-4 h-2 bg-gray-200 rounded overflow-hidden">
            <div className="h-full bg-[#009e96] animate-progress" />
          </div>
        </div>
      )}

      {/* 分析结果 UI */}
      {!loading && summary && (
      <>
        {/* 主视图左上角标题 */}
        <div className="w-full max-w-7xl text-left text-gray-700 font-semibold text-lg mb-2 self-start md:pl-15 pl-15"        >
          {truncateName(`合同评审 - ${file?.name}`)}
        </div>

        <div className="w-full max-w-6xl flex flex-col items-center">
          {/* 分析结果区域 */}
          <div
            ref={outputRef}
            className={`relative w-full md:w-[90%] max-w-7xl rounded-lg bg-white px-8 py-6
                        max-h-[700px] min-h-[400px] overflow-y-scroll text-[15px] leading-relaxed text-gray-800 no-scrollbar
                        ${showBackToBottom ? 'pb-20' : ''}`}
            onScroll={() => {
              const el = outputRef.current
              if (el) {
                const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40
                setShowBackToBottom(!nearBottom)
              }
            }}
          >
            {/* 分析内容 */}
            <MarkdownPreview source={summary} />

            {/* 更往下的返回按钮 */}
            {showBackToBottom && (
              <div className="sticky bottom-4 ml-auto pr-4 pt-2 w-fit z-10 bg-white bg-opacity-80 rounded">
                <button
                  className="text-[#009e96] border border-gray-300 px-2.5 py-1 text-sm rounded-full shadow-sm hover:bg-gray-50"
                  onClick={() => {
                    outputRef.current?.scrollTo({
                      top: outputRef.current.scrollHeight,
                      behavior: 'smooth',
                    })
                  }}
                >
                  ⬇ 返回
                </button>
              </div>
            )}
          </div>



          {/* 操作按钮 */}
          <div className="flex space-x-4 mt-4">
            <button
              className="px-4 py-2 border border-[#009e96] text-[#009e96] rounded hover:bg-[#009e96]/10 transition"
              onPointerDown={() => {
                setFile(null)
                setSummary('')
              }}
            >
              继续评审
            </button>
            <button
              className="px-4 py-2 bg-[#009e96] text-white rounded hover:bg-[#008a7c] transition"
              onPointerDown={() => {
                const q = window.prompt('请输入您想补充的问题：')
                if (q) {
                  alert(`补充问题已提交：${q}`)
                }
              }}
            >
              评审内容补充
            </button>
          </div>
        </div>
      </>)}
    </div>
  )
}