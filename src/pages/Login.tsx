import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'

interface LoginResp {
  code: number;
  data: {
    id: number;
    tel: string;
    email: string;
    username: string;
    company: string;
    position: string;
    token: string;
  }
  message: string
}

async function login(tel: string, password: string) {
  const res = await fetch('https://cas.micoe.com/api/user/v1/passport/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tel, password }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as LoginResp;
}

export default function Login() {
  const nav = useNavigate();
  const { setToken } = useAuth()
  const [form, setForm] = useState({ tel: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(form.tel, form.password);
      console.log('登录成功，设置 token：', data.token)
      setToken(data.token)
      nav('/', { replace: true })
    } catch (err) {
      setError('登录失败，请检查账号或密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <form
          onSubmit={submit}
          className="w-80 space-y-6 rounded-md bg-white p-8 shadow-md"
        >
          <h2 className="text-center text-2xl font-semibold">四季沐歌</h2>
          <input
            required
            className="w-full rounded border px-3 py-2"
            placeholder="账号"
            value={form.tel}
            onChange={e => setForm({ ...form, tel: e.target.value })}
          />
          <input
            required
            type="password"
            className="w-full rounded border px-3 py-2"
            placeholder="密码"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            disabled={loading}
            className="
              w-full rounded bg-blue-600 py-2
            "
          >
            {loading ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
  );
}
