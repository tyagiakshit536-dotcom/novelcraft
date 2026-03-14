import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useStore } from './store';

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

export default function App() {
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

  // Loading screen while checking auth
  if (authLoading) {
    return (
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
  }

  // Onboarding (first launch) — skip for /about and landing page
  if (!isAuthenticated && showOnboarding && !hasCompletedOnboarding && location.pathname !== '/about' && location.pathname !== '/') {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  // Auth screen — skip for /about and landing page
  if (!isAuthenticated && location.pathname !== '/about' && location.pathname !== '/') {
    return <AuthScreen />;
  }

  // Landing page at root "/" — public, no auth required
  // If user is already logged in, redirect to /home
  if (location.pathname === '/') {
    if (isAuthenticated) {
      return <Navigate to="/home" replace />;
    }
    return <LandingPage />;
  }

  return (
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
