import { useMemo, useState } from 'react';
import {
  User, Globe2, Bell, BookOpen, Shield, Sparkles, Camera, Check,
} from 'lucide-react';
import { useStore } from '../store';
import { LANGUAGE_OPTIONS, t } from '../lib/i18n';
import type { ProfileMode } from '../types';
import { readImageFileAsDataUrl } from '../lib/imageFiles';

const profileModes: { key: ProfileMode; label: string; note: string }[] = [
  { key: 'reader', label: 'Reader', note: 'Read, track, and review novels.' },
  { key: 'author', label: 'Author', note: 'Publish novels and manage your author profile.' },
  { key: 'reader-author', label: 'Reader & Author', note: 'Write and read with a single profile.' },
];

const readerBackgrounds = [
  { key: 'dark', color: '#1A0E0E', label: 'Dark' },
  { key: 'light', color: '#FAFAF8', label: 'Light' },
  { key: 'sepia', color: '#F4ECD8', label: 'Sepia' },
  { key: 'green', color: '#2A1616', label: 'Warm' },
  { key: 'navy', color: '#301616', label: 'Deep' },
] as const;

export default function SettingsPage() {
  const store = useStore();
  const [displayName, setDisplayName] = useState(store.currentUser?.displayName || '');
  const [bio, setBio] = useState(store.currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(store.currentUser?.avatarUrl || '');
  const [avatarError, setAvatarError] = useState('');
  const [saved, setSaved] = useState(false);

  const title = t(store.appLanguage, 'settings.title', 'Settings Studio');

  const canUploadAvatar = useMemo(
    () => store.profileMode === 'author' || store.profileMode === 'reader-author',
    [store.profileMode],
  );

  const saveProfile = () => {
    store.updateUser({ displayName, bio, avatarUrl: canUploadAvatar ? avatarUrl : store.currentUser?.avatarUrl || '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleAvatarFile = async (file: File | null) => {
    if (!file) return;
    setAvatarError('');
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (err: unknown) {
      setAvatarError(err instanceof Error ? err.message : 'Could not load image file.');
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-bg-secondary via-bg-tertiary to-bg-primary p-6 md:p-8 mb-6">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.22em] text-accent/80 mb-3">Personalization Hub</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">{title}</h1>
          <p className="text-text-secondary max-w-3xl">
            Everything in one place. Personal profile, language, notifications, reading preferences, tutorial controls, and privacy.
          </p>
        </div>
      </section>

      <div className="space-y-5 w-full">
        <section className="glass-card p-5 md:p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <User size={20} className="text-accent" />
            <h2 className="text-xl font-semibold">Profile & Role</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-text-secondary block mb-2">Display Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-divider focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary block mb-2">Username</label>
              <div className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-divider text-text-secondary">
                @{store.currentUser?.username}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm text-text-secondary block mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-28 px-4 py-3 rounded-xl bg-bg-primary border border-divider focus:border-accent focus:outline-none resize-none"
            />
          </div>

          <div className="mt-5">
            <p className="text-sm text-text-secondary mb-3">Profile Type</p>
            <div className="grid md:grid-cols-3 gap-3">
              {profileModes.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => store.setProfileMode(mode.key)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    store.profileMode === mode.key
                      ? 'border-accent bg-accent/10'
                      : 'border-divider hover:border-accent/40 bg-bg-primary'
                  }`}
                >
                  <p className="font-semibold">{mode.label}</p>
                  <p className="text-xs text-text-secondary mt-1">{mode.note}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2 text-sm text-text-secondary">
              <Camera size={14} /> Profile Picture (Author modes)
            </div>
            <div className="flex gap-3 items-center">
              {canUploadAvatar ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleAvatarFile(e.target.files?.[0] || null);
                      e.currentTarget.value = '';
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-bg-primary border border-divider focus:border-accent focus:outline-none file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-accent file:text-white file:text-sm"
                  />
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar preview" className="w-12 h-12 rounded-xl object-cover border border-divider" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-bg-primary border border-divider" />
                  )}
                </>
              ) : (
                <p className="text-sm text-text-secondary">Switch profile type to Author or Reader & Author to add a profile picture.</p>
              )}
            </div>
            {avatarError && <p className="text-sm text-error mt-2">{avatarError}</p>}
          </div>

          <div className="mt-5">
            <button
              onClick={saveProfile}
              className="px-6 py-2.5 rounded-xl btn btn-primary inline-flex items-center gap-2 font-semibold"
            >
              {saved ? <><Check size={16} /> Saved</> : 'Save Profile'}
            </button>
          </div>
        </section>

        <section className="glass-card p-5 md:p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <Globe2 size={20} className="text-gold" />
            <h2 className="text-xl font-semibold">Website Language</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Choose the interface language for buttons, menus, settings, and help. Novel content stays unchanged.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => store.setAppLanguage(lang.code)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  store.appLanguage === lang.code
                    ? 'border-accent bg-accent/10'
                    : 'border-divider hover:border-accent/40 bg-bg-primary'
                }`}
              >
                <p className="font-semibold">{lang.label}</p>
                <p className="text-xs text-text-secondary mt-1">{lang.native}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="glass-card p-5 md:p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles size={20} className="text-accent" />
            <h2 className="text-xl font-semibold">Appearance & Theme</h2>
          </div>

          <div className="flex items-center justify-between rounded-2xl p-4 bg-bg-primary border border-divider">
            <div>
              <p className="font-semibold">Dark / Light</p>
              <p className="text-sm text-text-secondary">Use the medium toggle to switch theme instantly.</p>
            </div>
            <button
              onClick={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${store.theme === 'dark' ? 'bg-accent' : 'bg-gold'}`}
              aria-label="Toggle Theme"
            >
              <span
                className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${
                  store.theme === 'dark' ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        <section className="glass-card p-5 md:p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <Bell size={20} className="text-accent" />
            <h2 className="text-xl font-semibold">Notification Preferences</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { key: 'newChapter', label: 'New chapter from followed author' },
              { key: 'ratingsReviews', label: 'Ratings and reviews' },
              { key: 'chapterComments', label: 'Chapter comments' },
              { key: 'commentReplies', label: 'Comment replies' },
              { key: 'newFollowers', label: 'New followers' },
              { key: 'milestones', label: 'Milestones and achievements' },
            ].map((item) => {
              const prefKey = item.key as keyof typeof store.notificationPrefs;
              const enabled = store.notificationPrefs[prefKey];
              return (
                <button
                  key={item.key}
                  onClick={() => store.setNotificationPref(prefKey, !enabled)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    enabled ? 'border-accent bg-accent/10' : 'border-divider bg-bg-primary hover:border-accent/40'
                  }`}
                >
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-text-secondary mt-1">{enabled ? 'Enabled' : 'Disabled'}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-card p-5 md:p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <BookOpen size={20} className="text-gold" />
            <h2 className="text-xl font-semibold">Editor & Reader</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-text-secondary mb-2 block">Editor Font</label>
              <div className="flex flex-wrap gap-2">
                {['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Inter'].map((f) => (
                  <button
                    key={f}
                    onClick={() => store.setEditorFont(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                      store.editorFont === f ? 'bg-accent text-white border-accent' : 'bg-bg-primary border-divider'
                    }`}
                    style={{ fontFamily: f }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <label className="text-sm text-text-secondary mb-2 block mt-4">Editor Size: {store.editorFontSize}px</label>
              <input
                type="range"
                min={12}
                max={24}
                value={store.editorFontSize}
                onChange={(e) => store.setEditorFontSize(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-2 block">Reader Font</label>
              <div className="flex flex-wrap gap-2">
                {['Lora', 'Merriweather', 'Georgia', 'Inter'].map((f) => (
                  <button
                    key={f}
                    onClick={() => store.setReaderFont(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                      store.readerFont === f ? 'bg-accent text-white border-accent' : 'bg-bg-primary border-divider'
                    }`}
                    style={{ fontFamily: f }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <label className="text-sm text-text-secondary mb-2 block mt-4">Reader Size: {store.readerFontSize}px</label>
              <input
                type="range"
                min={14}
                max={26}
                value={store.readerFontSize}
                onChange={(e) => store.setReaderFontSize(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm text-text-secondary mb-2 block">Reader Background</label>
            <div className="flex flex-wrap gap-3">
              {readerBackgrounds.map((bg) => (
                <button
                  key={bg.key}
                  onClick={() => store.setReaderBackground(bg.key)}
                  className={`w-20 h-20 rounded-2xl border-2 transition-all flex items-end justify-center pb-2 ${
                    store.readerBackground === bg.key ? 'border-accent scale-105' : 'border-divider hover:border-accent/50'
                  }`}
                  style={{ backgroundColor: bg.color }}
                >
                  <span className="text-[11px] text-white/85 bg-black/30 px-2 py-0.5 rounded-full">{bg.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card p-5 md:p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-5">
            <Shield size={20} className="text-accent" />
            <h2 className="text-xl font-semibold">Tutorial & Privacy</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-divider bg-bg-primary">
              <p className="font-semibold">Product Tutorial</p>
              <p className="text-sm text-text-secondary mt-1">One-time tutorial appears at first login. You can relaunch it anytime.</p>
              <button
                onClick={() => store.restartTutorial()}
                className="mt-3 px-4 py-2 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 transition-colors text-sm"
              >
                Restart Tutorial
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-divider bg-bg-primary">
              <p className="font-semibold">Data & Safety</p>
              <p className="text-sm text-text-secondary mt-1">Control account visibility, export your data, and keep your account secure.</p>
              <button className="mt-3 px-4 py-2 rounded-lg border border-divider hover:border-accent/50 text-sm transition-colors">
                Export My Data
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
