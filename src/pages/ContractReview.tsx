// 完整文件示例
import React, { DragEvent, ChangeEvent } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const ContractReview: React.FC = () => {
  const navigate = useNavigate()

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && /\.(pdf|docx)$/i.test(f.name)) {
      const url = URL.createObjectURL(f)
      navigate('/agent/contract/view', { state: { fileUrl: url, fileName: f.name } })
    } else {
      alert('只支持 PDF 或 DOCX 格式')
    }
  }

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && /\.(pdf|docx)$/i.test(f.name)) {
      const url = URL.createObjectURL(f)
      navigate('/agent/contract/view', { state: { fileUrl: url, fileName: f.name } })
    } else {
      alert('只支持 PDF 或 DOCX 格式')
    }
  }

  return (
    <div className="h-full flex flex-col justify-center items-center p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">合同评审顾问</h1>
        <p className="mt-2 text-gray-600">支持深度合同解析，一键生成要点</p>
      </div>

      <div
        className="w-full max-w-3xl p-6 border-2 border-dashed border-gray-300 rounded-lg"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-lg font-semibold">拖拽文件至此处</h2>
          <p className="mt-2 text-sm text-gray-500 text-center">
            支持 PDF、DOCX；单次仅选一个文件
          </p>

          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            id="file-input"
            onChange={handleSelect}
          />
          <label
            htmlFor="file-input"
            className="mt-4 px-4 py-2 bg-[#009e96] text-white rounded-lg cursor-pointer"
          >
            从本地选择
          </label>
        </div>
      </div>
    </div>
  )
}

export default ContractReview
