import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown, PenTool, Library, Bookmark, Trophy, BarChart3, Users, Info, Compass, CheckCheck, Clock3, Menu, X } from 'lucide-react';
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

  useEffect(() => {
    setShowMobileNav(false);
  }, [location.pathname]);

  return (
    <header className="navbar fixed top-0 left-0 right-0 z-30 transition-all duration-300" style={{
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
    }}>
      <div className="flex items-center h-16 px-4 lg:px-12 gap-6">
        {/* Logo */}
        <NovelCraftLogo size="small" onClick={() => navigate('/home')} className="logo" />

        {/* Desktop Nav Links */}
        <nav className="nav-links hidden md:flex items-center gap-1">
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

        <div className="flex-1" />

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-gray-300 hover:text-white transition-colors p-1"
          >
            <Search size={20} />
          </button>

          <div className="nav-desktop-buttons hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate('/editor')}
              className="items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded text-sm font-semibold hover:bg-accent-hover transition-colors inline-flex"
            >
              <PenTool size={14} /> Write
            </button>

            <button
              onClick={() => navigate('/read-later')}
              className="items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-divider text-text-primary rounded text-sm font-semibold hover:border-accent/60 transition-colors inline-flex"
            >
              <Clock3 size={14} /> Read Later
            </button>
          </div>

          <button
            onClick={() => setShowMobileNav(true)}
            className="hamburger-btn hidden items-center justify-center w-10 h-10 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className="nav-mobile-hide relative" ref={notificationRef}>
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
          <div className="nav-mobile-hide relative" ref={profileRef}>
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

      {showMobileNav && (
        <div className="mobile-menu fixed inset-0 z-[60] bg-[rgba(14,14,26,0.98)] backdrop-blur-2xl animate-slide-down" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <NovelCraftLogo size="small" onClick={() => { navigate('/home'); setShowMobileNav(false); }} className="logo" />
            <button
              onClick={() => setShowMobileNav(false)}
              className="w-10 h-10 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <div className="h-[calc(100%-72px)] overflow-y-auto flex flex-col">
            <nav className="flex-1 pt-2">
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setShowMobileNav(false); }}
                  className={`w-full text-left px-6 py-4 text-lg border-b border-white/10 transition-colors ${
                    location.pathname === link.path ? 'text-white font-semibold bg-white/5' : 'text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="p-4 space-y-3 border-t border-white/10">
              <button
                onClick={() => { navigate('/editor'); setShowMobileNav(false); }}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold"
              >
                Write
              </button>
              <button
                onClick={() => { navigate('/read-later'); setShowMobileNav(false); }}
                className="w-full py-3 rounded-xl border border-white/15 bg-white/5 text-white font-semibold"
              >
                Read Later
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
