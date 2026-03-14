import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { DESKTOP_LIKE_ON_MOBILE, DESKTOP_WIDTH, DESKTOP_HEIGHT } from './config/desktopMode';

import OnboardingScreen from './components/OnboardingScreen';
import AuthScreen from './components/AuthScreen';
import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import SearchOverlay from './components/SearchOverlay';
import TutorialOverlay from './components/TutorialOverlay';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import NovelDetailPage from './pages/NovelDetailPage';
import LibraryPage from './pages/LibraryPage';
import EditorPage from './pages/EditorPage';
import ReaderPage from './pages/ReaderPage';
import ReadingListPage from './pages/ReadingListPage';
import ReadLaterPage from './pages/ReadLaterPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CommunityPage from './pages/CommunityPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import NovelCraftLogo from './components/NovelCraftLogo';

function useDesktopScale() {
  const [isDesktopLikeActive, setIsDesktopLikeActive] = useState(false);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(DESKTOP_HEIGHT);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!DESKTOP_LIKE_ON_MOBILE) {
      setIsDesktopLikeActive(false);
      return;
    }

    const detectMobileTablet = () => {
      const ua = navigator.userAgent;
      const mobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const smallLandscape = window.matchMedia('(max-width: 1200px)').matches;
      return mobileUa || (coarsePointer && smallLandscape);
    };

    const syncDeviceMode = () => {
      setIsDesktopLikeActive(detectMobileTablet());
    };

    syncDeviceMode();
    window.addEventListener('resize', syncDeviceMode);
    window.addEventListener('orientationchange', syncDeviceMode);

    return () => {
      window.removeEventListener('resize', syncDeviceMode);
      window.removeEventListener('orientationchange', syncDeviceMode);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const rootNode = document.getElementById('root');

    if (!isDesktopLikeActive) {
      root.style.setProperty('--desktop-scale', '1');
      root.style.setProperty('--desktop-width', `${DESKTOP_WIDTH}px`);
      root.style.setProperty('--desktop-height', `${DESKTOP_HEIGHT}px`);
      root.classList.remove('desktop-like-mode');
      body.classList.remove('desktop-like-mode');
      rootNode?.classList.remove('desktop-like-root');
      setScale(1);
      setScaledHeight(DESKTOP_HEIGHT);
      return;
    }

    let frameId = 0;

    const updateScale = () => {
      const vw = window.visualViewport?.width ?? window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const nextScale = Math.min(vw / DESKTOP_WIDTH, vh / DESKTOP_HEIGHT, 1);

      setScale(nextScale);
      root.style.setProperty('--desktop-scale', String(nextScale));
      root.style.setProperty('--desktop-width', `${DESKTOP_WIDTH}px`);
      root.style.setProperty('--desktop-height', `${DESKTOP_HEIGHT}px`);
      root.classList.add('desktop-like-mode');
      body.classList.add('desktop-like-mode');
      rootNode?.classList.add('desktop-like-root');

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const contentHeight = canvasRef.current?.scrollHeight ?? DESKTOP_HEIGHT;
        setScaledHeight(Math.max(DESKTOP_HEIGHT, contentHeight) * nextScale);
      });
    };

    const resizeObserver = new ResizeObserver(() => updateScale());

    updateScale();
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    window.visualViewport?.addEventListener('resize', updateScale);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
      window.visualViewport?.removeEventListener('resize', updateScale);
      root.style.setProperty('--desktop-scale', '1');
      root.classList.remove('desktop-like-mode');
      body.classList.remove('desktop-like-mode');
      rootNode?.classList.remove('desktop-like-root');
    };
  }, [isDesktopLikeActive]);

  return { isDesktopLikeActive, scale, scaledHeight, canvasRef };
}

export default function App() {
  const { isDesktopLikeActive, scale, scaledHeight, canvasRef } = useDesktopScale();
  const {
    isAuthenticated,
    hasCompletedOnboarding,
    theme,
    authLoading,
    initAuth,
    hasSeenTutorial,
    completeTutorial,
    appLanguage,
  } = useStore();
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding);
  const location = useLocation();

  // Initialize Supabase auth session on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Sync theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = appLanguage;
  }, [appLanguage]);

  let appContent: ReactNode;

  // Loading screen while checking auth
  if (authLoading) {
    appContent = (
      <div className="fixed inset-0 bg-bg-primary flex items-center justify-center">
        <div className="app-atmosphere"><div className="atmosphere-orb-3" /></div>
        <div className="app-noise" />
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <NovelCraftLogo size="medium" />
          <div className="w-8 h-8 mt-4">
            <svg className="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
          <p className="text-text-secondary text-sm">Loading NovelCraft...</p>
        </div>
      </div>
    );
  } else if (!isAuthenticated && showOnboarding && !hasCompletedOnboarding && location.pathname !== '/about' && location.pathname !== '/') {
    // Onboarding (first launch) — skip for /about and landing page
    appContent = <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  } else if (!isAuthenticated && location.pathname !== '/about' && location.pathname !== '/') {
    // Auth screen — skip for /about and landing page
    appContent = <AuthScreen />;
  } else if (location.pathname === '/') {
    // Landing page at root "/" — public, no auth required
    // If user is already logged in, redirect to /home
    if (isAuthenticated) {
      appContent = <Navigate to="/home" replace />;
    } else {
      appContent = <LandingPage />;
    }
  } else {
    appContent = (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <div className="app-atmosphere"><div className="atmosphere-orb-3" /></div>
        <div className="app-noise" />
        <Sidebar />
        <SearchOverlay />
        <Routes>
          {/* Reader & Editor get no top nav — immersive */}
          <Route path="/read/:novelId/:chapterId" element={<ReaderPage />} />
          <Route path="/editor" element={<EditorPage />} />

          {/* About page — no auth required */}
          <Route path="/about" element={
            <>
              <TopNav />
              <main className="pt-16"><AboutPage /></main>
            </>
          } />

          {/* Auth route — redirect to /home if already logged in */}
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/home" replace /> : <AuthScreen />} />

          {/* All other pages with top nav */}
          <Route path="*" element={
            <>
              <TopNav />
              <main className="pt-16">
                <Routes>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/novel/:novelId" element={<NovelDetailPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/reading-list" element={<ReadingListPage />} />
                  <Route path="/read-later" element={<ReadLaterPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/following" element={<HomePage />} />
                  <Route path="/help" element={<HelpPage />} />
                </Routes>
              </main>
              {isAuthenticated && !hasSeenTutorial && (
                <TutorialOverlay
                  onFinish={() => completeTutorial()}
                  onSkip={() => completeTutorial()}
                />
              )}
            </>
          } />
        </Routes>
      </div>
    );
  }

  if (!isDesktopLikeActive) {
    return <>{appContent}</>;
  }

  return (
    <div id="desktop-canvas-shell" style={{ height: `${scaledHeight}px` }}>
      <div
        id="desktop-canvas"
        ref={canvasRef}
        style={{
          width: `${DESKTOP_WIDTH}px`,
          minHeight: `${DESKTOP_HEIGHT}px`,
          transform: `scale(${scale})`,
        }}
      >
        {appContent}
      </div>
    </div>
  );
}
