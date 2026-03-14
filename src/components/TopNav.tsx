import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, PenTool, Library, Bookmark, Trophy, BarChart3, Users, Info, Compass, CheckCheck, Clock3 } from 'lucide-react';
import { useStore } from '../store';
import NovelCraftLogo from './NovelCraftLogo';
import { t } from '../lib/i18n';

export default function TopNav() {
  const {
    setSidebarOpen,
    setSearchOpen,
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    appLanguage,
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: t(appLanguage, 'nav.home', 'Home'), path: '/home' },
    { label: t(appLanguage, 'nav.library', 'Library'), path: '/library', icon: Library },
    { label: t(appLanguage, 'nav.write', 'Write'), path: '/editor', icon: PenTool },
    { label: 'Read Later', path: '/read-later', icon: Clock3 },
    { label: t(appLanguage, 'nav.readingList', 'Reading List'), path: '/reading-list', icon: Bookmark },
    { label: t(appLanguage, 'nav.leaderboard', 'Leaderboard'), path: '/leaderboard', icon: Trophy },
    { label: t(appLanguage, 'nav.community', 'Community'), path: '/community', icon: Users },
    { label: t(appLanguage, 'nav.analytics', 'Analytics'), path: '/analytics', icon: BarChart3 },
    { label: t(appLanguage, 'nav.about', 'About'), path: '/about', icon: Info },
    { label: t(appLanguage, 'nav.explore', 'Explore'), path: '/landing', icon: Compass },
  ];

  const handleNotificationClick = (id: string, link: string) => {
    markNotificationRead(id);
    setShowNotifications(false);
    if (link) {
      navigate(link);
    }
  };

  const relativeTime = (iso: string) => new Date(iso).toLocaleDateString();

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showProfile || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile, showNotifications]);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 transition-all duration-300" style={{
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
    }}>
      <div className="flex items-center h-16 px-4 lg:px-12 gap-6">
        {/* Logo */}
        <NovelCraftLogo size="small" onClick={() => navigate('/home')} />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors rounded ${
                location.pathname === link.path
                  ? 'text-white font-bold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Mobile Browse Dropdown */}
        <div className="md:hidden relative">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="flex items-center gap-1 text-sm font-medium text-white"
          >
            Browse <ChevronDown size={14} className={`transition-transform ${showMobileNav ? 'rotate-180' : ''}`} />
          </button>
          {showMobileNav && (
            <div className="absolute top-8 left-0 bg-black/95 border border-white/10 rounded py-2 min-w-[180px] z-50 animate-fade-in">
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setShowMobileNav(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                    location.pathname === link.path ? 'text-white font-bold' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-gray-300 hover:text-white transition-colors p-1"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => navigate('/editor')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded text-sm font-semibold hover:bg-accent-hover transition-colors"
          >
            <PenTool size={14} /> Write
          </button>

          <button
            onClick={() => navigate('/read-later')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-divider text-text-primary rounded text-sm font-semibold hover:border-accent/60 transition-colors"
          >
            <Clock3 size={14} /> Read Later
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-300 hover:text-white transition-colors p-1 relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-[360px] max-w-[92vw] rounded-2xl border border-accent/20 bg-bg-secondary/95 backdrop-blur-2xl shadow-2xl shadow-black/60 animate-fade-in overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Notifications</p>
                    <p className="text-xs text-text-secondary">{unreadCount} unread</p>
                  </div>
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                </div>

                <div className="max-h-[340px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-text-secondary">No notifications yet.</p>
                      <p className="text-xs text-text-secondary/70 mt-1">Updates about reads, comments, and milestones will appear here.</p>
                    </div>
                  )}

                  {notifications.slice(0, 12).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.link)}
                      className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-bg-tertiary/60 transition-colors ${n.isRead ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 w-2 h-2 rounded-full ${n.isRead ? 'bg-text-secondary/40' : 'bg-accent'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text-primary line-clamp-2">{n.message}</p>
                          <p className="text-[11px] text-text-secondary mt-1">{relativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="px-4 py-2.5 border-t border-white/10 bg-bg-primary/40">
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/settings'); }}
                    className="w-full text-center text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Manage notification preferences
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded object-cover border border-white/20"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-gradient-to-br from-accent to-coral flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.displayName?.charAt(0) || '?'}
                </div>
              )}
              <ChevronDown size={14} className={`text-white transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-12 bg-[#1a1a1a] border border-white/10 rounded-xl py-2 min-w-[220px] z-50 animate-fade-in shadow-2xl shadow-black/60">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white font-semibold text-sm">{currentUser?.displayName || 'Writer'}</p>
                  <p className="text-gray-400 text-xs">@{currentUser?.username || 'anonymous'}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">Settings</button>
                  <button onClick={() => { navigate('/about'); setShowProfile(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">About</button>
                  <button onClick={() => { navigate('/help'); setShowProfile(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">Help</button>
                </div>
                <hr className="border-white/10 my-1" />
                <div className="py-1">
                  <button onClick={() => { setSidebarOpen(true); setShowProfile(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">Full Menu</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
