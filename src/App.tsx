import { useState, useRef } from "react";
import { Paperclip, Send } from "lucide-react";

export default function ContractReviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "请进行合同评审",
    "请分析合同的风险点",
    "请给出合同修改建议"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !input) return;
    setLoading(true);
    setSubmitted(true);
    setResponse("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_prompt", input);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/rag_contract_review", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("请求失败");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) throw new Error("无法读取响应流");

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        setResponse((prev) => prev + chunk);
        outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
      }
    } catch (err: any) {
      setResponse("发生错误：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-between px-4 py-8">
      {!submitted && (
        <div className="text-center pt-30">
          <img
            src="/src/assets/react.svg"
            alt="Logo"
            className="w-20 h-20 mx-auto mb-4 rounded-full border"
          />
          <h1 className="text-2xl font-bold text-[#009e96] mb-2">合同评审顾问</h1>
          <p className="text-gray-500 mb-4">上传合同文件并提出问题，获取智能评审</p>
        </div>
      )}

      {!submitted && (
        <div className="gap-2 mb-40">
          {quickPrompts.map((text) => (
            <div className="mb-2">
              <button
                key={text}
                className="w-70 h-12 text-left border rounded-2xl px-4 py-1 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setInput(text)}
              >
                {text}
              </button>
            </div>
            
          ))}
        </div>
      )}

      {submitted && (
        <div
          ref={outputRef}
          className="whitespace-pre-wrap bg-white border rounded-lg p-4 shadow-inner w-full max-w-3xl h-64 overflow-y-auto text-sm text-gray-800 mb-4"
        >
          {loading ? "评审中，请稍候..." : response || "返回内容将显示在此处..."}
        </div>
      )}

      <div className="w-full max-w-3xl">
        <div className="flex items-end w-full bg-white border rounded-2xl shadow px-4 py-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-[#009e96]"
          >
            <Paperclip size={20} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />

          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入合同相关问题..."
            className="flex-1 mx-3 resize-none outline-none text-sm placeholder-gray-400"
          />

          <button
            onClick={handleSubmit}
            className="bg-[#009e96] rounded-full w-8 h-8 flex items-center justify-center hover:opacity-90"
          >
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}