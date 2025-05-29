import { useState, useRef } from "react";
import { FileAddOutlined, SendOutlined, FileWordOutlined, FilePdfOutlined, UpOutlined, DownOutlined } from "@ant-design/icons";
import { Button, Input, Upload, message, Spin } from "antd";
import ReactMarkdown from "react-markdown";
import type { RcFile } from "antd/es/upload";

const { TextArea } = Input;

export default function ContractReviewPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ type: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReasoningDone, setIsReasoningDone] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);
  const [file, setFile] = useState<RcFile | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickPrompts = [
    "请进行合同评审",
    "请分析合同的风险点",
    "请简要总结合同的重点条款"
  ];

  const handleFileRemove = () => setFile(null);

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
  
  const typeText = async (
    text: string,
    update: (char: string) => void,
    delay = 20 // 每个字符间隔，单位：ms
  ) => {
    for (const char of text) {
      update(char);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
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
    formData.append("user_id", "1");
    formData.append("agent_id", "1");
  
    setMessages(prev => [...prev, { type: "user", content: input }]);
    setInput("");
    setLoading(true);
    setShowIntro(false);
    setIsReasoningDone(false); // 思考开始
  
    try {
      const res = await fetch("http://127.0.0.1:9000/api/v1/contract/review", {
        method: "POST",
        body: formData,
      });
  
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("响应流不可用");
  
      let buffer = "";
      let reasoning = "";
      let answer = "";
      let done = false;
  
      while (!done) {
        const { value, done: readDone } = await reader.read();
        done = readDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
  
          for (const line of lines) {
            if (!line.trim()) continue;
  
            try {
              const data = JSON.parse(line);
              const delta = data.delta ?? "";
  
              if (data.type === "reasoning") {
                const newPiece = delta.startsWith(reasoning) ? delta.slice(reasoning.length) : delta;
                await typeText(newPiece, (char) => {
                  reasoning += char;
                  setMessages(prev => [
                    ...prev.filter(m => m.type !== "reasoning"),
                    { type: "reasoning", content: reasoning }
                  ]);
                });
              }
  
              else if (data.type === "message") {
                setIsReasoningDone(true); // 思考完成
                const newPiece = delta.startsWith(answer) ? delta.slice(answer.length) : delta;
                await typeText(newPiece, (char) => {
                  answer += char;
                  setMessages(prev => [
                    ...prev.filter(m => m.type !== "message"),
                    { type: "message", content: answer }
                  ]);
                });
              }
  
              else if (data.type === "stop") {
                console.log("AI 回复完成");
              }
  
              else if (data.type === "error") {
                message.error("AI 错误：" + delta);
              }
  
            } catch (err) {
              console.warn("无法解析数据:", line, err);
            }
          }
        }
  
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }
  
    } catch (err) {
      console.error(err);
      message.error("请求失败，请稍后再试。");
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
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            ref={outputRef}
            className="whitespace-pre-wrap bg-white border rounded-lg p-4 shadow-inner w-full max-w-3xl max-h-170 min-h-[200px] overflow-y-auto text-sm text-gray-800 pb-36"
          >
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.type === "user" && (
                  <div className="mb-2 text-sm text-right">
                    <div className="inline-block bg-blue-100 text-blue-800 px-3 py-2 rounded-lg max-w-[70%]">
                      {msg.content}
                    </div>
                  </div>
                )}
                {msg.type === "reasoning" && (
                  <div className="mb-2 text-sm text-left">
                    <div className="border-l-4 border-gray-300 pl-3 pr-2 pt-2 pb-1 bg-gray-50 rounded-md">
                      <div className="flex items-center text-xs font-medium text-gray-500 mb-1 gap-1">
                        <span>{isReasoningDone ? "已深度思考" : "正在思考中..."}</span>
                        <button
                          className="text-gray-400 hover:text-gray-600 transition"
                          onClick={() => setShowReasoning(prev => !prev)}
                          title={showReasoning ? "收起" : "展开"}
                        >
                          {showReasoning ? <UpOutlined /> : <DownOutlined />}
                        </button>
                      </div>

                      {showReasoning && (
                        <div className="text-gray-600 text-sm prose prose-sm whitespace-pre-wrap">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {msg.type === "message" && (
                  <div className="mb-2 text-sm text-left">
                    <div className="inline-block bg-green-100 text-green-800 px-3 py-2 rounded-lg max-w-[100%]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && <Spin tip="评审中，请稍候..." />}
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
