import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Users, Shield, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import type { UserRole } from '../../shared/types';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [role, setRole] = useState<UserRole>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ username, password, role }) as any;
      login(res.token, res.user);
      navigate(role === 'admin' ? '/dashboard' : '/tenant');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (r: UserRole) => {
    setRole(r);
    if (r === 'admin') {
      setUsername('admin');
    } else {
      setUsername('tenant1');
    }
    setPassword('123456');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-grid relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary-600/20 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-500/15 blur-[100px] translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 animate-float">
          <div className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 items-center justify-center shadow-2xl shadow-primary-500/30 mb-4">
            <Store size={40} className="text-primary-950" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white text-glow">商场客流热区分析</h1>
          <p className="text-primary-300/80 mt-2 text-sm tracking-wide">SMART MALL HEATMAP ANALYTICS PLATFORM</p>
        </div>

        <div className="glass rounded-3xl p-8 glow-border" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
                role === 'admin'
                  ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:border-primary-500/30'
              }`}
            >
              <Shield size={24} />
              <span className="font-medium text-sm">运营管理员</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('tenant')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
                role === 'tenant'
                  ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:border-primary-500/30'
              }`}
            >
              <ShoppingBag size={24} />
              <span className="font-medium text-sm">商户租户</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-primary-300 mb-2 font-medium">账号</label>
              <div className="relative">
                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400/60" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-primary-900/50 border border-primary-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/70 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="请输入账号"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-primary-300 mb-2 font-medium">密码</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-primary-900/50 border border-primary-700/50 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/70 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400/60 hover:text-primary-400"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '进入系统'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-primary-700/30">
            <div className="text-xs text-slate-400 mb-2">演示账号：</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <div className="text-primary-400 font-medium">运营</div>
                <div className="text-slate-400 font-mono">admin / 123456</div>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <div className="text-primary-400 font-medium">租户</div>
                <div className="text-slate-400 font-mono">tenant1 / 123456</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          所有数据均为匿名汇总统计 · 严格遵守隐私保护规范
        </p>
      </div>
    </div>
  );
}
