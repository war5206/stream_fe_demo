import { useState, FormEvent } from "react";

export default function RagContractReview() {
  const [prompt, setPrompt] = useState<string>("");
  const [responseText, setResponseText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResponseText("");
    setLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/rag_contract_review?user_prompt=${encodeURIComponent(prompt)}`);
      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) throw new Error("No stream reader available");

      let done = false;

      console.log("res: ", res);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        setResponseText((prev) => prev + chunk);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setResponseText(`Error: ${error.message}`);
      } else {
        setResponseText("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">合同审查问答</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          className="w-full border rounded p-2 mb-2 h-32"
          placeholder="请输入合同审查的问题..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "加载中..." : "提交"}
        </button>
      </form>
      <div className="whitespace-pre-wrap border rounded p-4 bg-gray-50 min-h-[150px]">
        {responseText || "返回内容将显示在此处..."}
      </div>
    </div>
  );
}