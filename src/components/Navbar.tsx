import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, GitCompare, Store, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../../shared/types';

const adminNav = [
  { path: '/dashboard', label: '运营控制台', icon: LayoutDashboard },
  { path: '/upload', label: '数据上传', icon: Upload },
  { path: '/compare', label: '热区对比', icon: GitCompare },
];

const tenantNav = [
  { path: '/tenant', label: '客流看板', icon: Store },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, role } = useAuthStore();

  const navItems = role === 'admin' ? adminNav : tenantNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass border-b border-primary-700/50">
      <div className="mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={role === 'admin' ? '/dashboard' : '/tenant'} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Store size={22} className="text-primary-900" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-primary-50 text-glow">客流热区分析</div>
            <div className="text-[10px] text-primary-400 tracking-widest">SMART MALL ANALYTICS</div>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${active
                    ? 'bg-primary-500/20 text-primary-400 shadow-inner shadow-primary-500/10'
                    : 'text-slate-300 hover:text-primary-400 hover:bg-primary-500/10'}
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="w-8 h-8 rounded-full bg-primary-700/50 flex items-center justify-center">
              <User size={16} className="text-primary-400" />
            </div>
            <div className="leading-tight">
              <div className="font-medium text-primary-100">{user?.name}</div>
              <div className="text-[10px] text-primary-400">
                {role === 'admin' ? '运营管理员' : '商户租户'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            退出
          </button>
        </div>
      </div>
    </nav>
  );
}
