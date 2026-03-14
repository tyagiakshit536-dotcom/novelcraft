import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { t } from '../lib/i18n';
import {
  Home, PenTool, Library, Bookmark, Star, Trophy, Clock3,
  MessageCircle, Palette, BarChart3, Settings, HelpCircle,
  LogOut, X, Info,
} from 'lucide-react';

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, currentUser, logout, userNovels, appLanguage } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: t(appLanguage, 'nav.home', 'Home'), path: '/home' },
    { icon: PenTool, label: 'Write Novel', path: '/editor' },
    { icon: Clock3, label: 'Read Later', path: '/read-later' },
    { icon: Library, label: t(appLanguage, 'nav.library', 'Your Library'), path: '/library' },
    { icon: Bookmark, label: t(appLanguage, 'nav.readingList', 'Reading List'), path: '/reading-list' },
    { icon: Star, label: 'Following', path: '/following' },
    { icon: Trophy, label: t(appLanguage, 'nav.leaderboard', 'Leaderboard'), path: '/leaderboard' },
    { icon: MessageCircle, label: t(appLanguage, 'nav.community', 'Community'), path: '/community' },
    { icon: Palette, label: 'Themes', path: '/settings' },
    { icon: BarChart3, label: t(appLanguage, 'nav.analytics', 'Your Analytics'), path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Info, label: t(appLanguage, 'nav.about', 'About Us'), path: '/about' },
    { icon: HelpCircle, label: t(appLanguage, 'nav.help', 'Help & Feedback'), path: '/help' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate('/');
  };

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[280px] z-50 animate-slide-left flex flex-col" style={{
        background: 'rgba(20, 20, 20, 0.92)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderRight: '1px solid rgba(229, 9, 20, 0.15)',
        boxShadow: '4px 0 40px rgba(229, 9, 20, 0.05) inset, 0 16px 48px rgba(0, 0, 0, 0.6)',
      }}>
        {/* Glow edge */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-accent/30 via-transparent to-accent/30" />

        {/* Close */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-bg-secondary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <X size={18} />
        </button>

        {/* User Header */}
        <div className="p-6 pb-4 border-b border-divider">
          <div className="flex items-center gap-3 mb-3">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Profile" className="w-14 h-14 rounded-full object-cover border border-white/20 shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-coral flex items-center justify-center text-white font-bold text-lg shrink-0">
                {currentUser?.displayName?.charAt(0) || '?'}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-text-primary truncate">{currentUser?.displayName || 'Writer'}</p>
              <p className="text-text-secondary text-sm truncate">@{currentUser?.username || 'anonymous'}</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-text-secondary">
            <span><strong className="text-text-primary">{userNovels.length}</strong> Novels</span>
            <span><strong className="text-text-primary">{currentUser?.followerCount || 0}</strong> Followers</span>
            <span><strong className="text-text-primary">{currentUser?.followingCount || 0}</strong> Following</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path.split('?')[0]));
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 btn ${
                  isActive
                    ? 'bg-accent/15 text-accent border-l-[3px] border-accent'
                    : 'text-text-secondary hover:bg-accent/[0.08] hover:text-text-primary'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-divider">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-coral hover:bg-coral/10 transition-all"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
