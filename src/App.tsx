import { useState, useRef } from "react";
import { FileAddOutlined, SendOutlined, FileWordOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Button, Input, Upload, message, Typography, Spin } from "antd";
import type { RcFile } from "antd/es/upload";

const { TextArea } = Input;
const { Paragraph } = Typography;

export default function ContractReviewPage() {
  const [input, setInput] = useState("");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<RcFile | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickPrompts = [
    "请进行合同评审",
    "请分析合同的风险点",
    "请简要总结合同的重点条款"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleFileRemove = () => {
    setFile(null);
  };

  const handleBeforeUpload = (file: RcFile) => {
    const isSupported = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!isSupported) {
      message.error("只支持上传 PDF、DOC、DOCX 文件");
      return Upload.LIST_IGNORE;
    }
  
    const isLt30MB = file.size / 1024 / 1024 <= 30;
    if (!isLt30MB) {
      message.error("文件不能超过 30MB");
      return Upload.LIST_IGNORE;
    }
  
    setFile(file);
    return false;
  };
  
  
  
  const handleSubmit = async () => {
    if (!input.trim()) return;
    if (!file) {
      message.error("请上传合同文件");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_prompt", input);

    setLoading(true);
    setShowIntro(false);
    setResponseText("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/rag_contract_review_stream", {
        method: "POST",
        body: formData,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) throw new Error("无法读取响应流");

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        setResponseText((prev) => prev + chunk);

        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }
    } catch (err) {
      setResponseText("请求失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-grow flex flex-col items-center justify-start p-6">
        {showIntro ? (
          <div className="text-center space-y-4 mt-40">
            <img src="/src/assets/contractReviewLogo.png" alt="Logo" className="mx-auto w-16 h-16 rounded-full" />
            <h1 className="text-2xl font-semibold text-gray-800">综能合同评审顾问</h1>
            <p className="text-gray-500 text-sm w-70">上传合同文件并提出问题，获取智能评审</p>
            <div className="flex flex-col items-center space-y-2 mt-4">
              {quickPrompts.map((prompt) => (
                <div
                  className="w-70 h-10 leading-10 text-left pl-5 rounded-xl text-gray-800 bg-gray-100 hover:bg-gray-200 text-sm cursor-pointer"
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            ref={outputRef}
            className="whitespace-pre-wrap bg-white border rounded-lg p-4 shadow-inner w-full max-w-3xl min-h-[200px] overflow-y-auto text-sm text-gray-800"
          >
            {loading ? <Spin tip="评审中，请稍候..." /> : <Paragraph>{responseText || "返回内容将显示在此处..."}</Paragraph>}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full p-4 z-50">
        <div className="max-w-3xl mx-auto w-full border rounded-xl bg-white border-t border-gray-200 p-2">
          {file && (
            <div className="relative flex items-center justify-between w-50 px-4 py-3 rounded-xl bg-gray-100 mb-2">
              <div className="flex items-center gap-2 overflow-hidden">
                { file.name.endsWith(".pdf") ? 
                  <span className="text-2xl text-red-500"><FilePdfOutlined /></span> : 
                  <span className="text-2xl text-blue-500"><FileWordOutlined /></span>
                }
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-sm text-gray-900 truncate max-w-[200px]">{file.name.replace(/\.[^/.]+$/, "")}</span>
                  <span className="text-xs text-gray-500 uppercase">
                    {file.name.split(".").pop()} •{" "}
                    {file.size > 1024 * 1024
                      ? (file.size / 1024 / 1024).toFixed(2) + "MB"
                      : (file.size / 1024).toFixed(2) + "KB"}
                  </span>
                </div>
              </div>
              <div
                className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 text-sm text-white cursor-pointer"
                onClick={handleFileRemove}
              >
                ×
              </div>
            </div>
          )}
          <TextArea
            style={{ border: "none", boxShadow: "none", overflowY: "auto" }}
            ref={textareaRef}
            size="large"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="合同问题尽管问，Shift+Enter换行"
            autoSize={{ minRows: 1, maxRows: 6 }}
          />
          <div className="w-full flex justify-between items-center mt-2">
            <div className="w-full flex justify-between items-center">
              <div className="w-1"></div>
              <div className="w-20 flex justify-between">
                <Upload beforeUpload={handleBeforeUpload} showUploadList={false}>
                  <Button icon={
                      <span style={{"fontSize":"1.2rem"}} className=" text-gray-600">
                        <FileAddOutlined />
                      </span>
                    } 
                    type="text"
                    shape="circle"
                  />
                </Upload>
                <Button
                  icon={<SendOutlined />}
                  type="primary"
                  shape="circle"
                  onClick={handleSubmit}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
