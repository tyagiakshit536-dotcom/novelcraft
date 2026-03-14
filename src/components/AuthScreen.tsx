import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { useStore } from '../store';

type AuthMode = 'login' | 'signup' | 'confirm-email';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, completeOnboarding } = useStore();

  React.useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;

      if (e.data?.type === 'auth-login') {
        const { email, password } = e.data.payload;
        if (!email || !password) {
          console.error('Please fill in all fields');
          return;
        }
        setMode('login');
        setLoading(true);
        setError('');
        try {
          await login(email, password);
          completeOnboarding();
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
          setLoading(false);
        }
      } else if (e.data?.type === 'auth-signup') {
        const { email, password, username, displayName } = e.data.payload;
        if (!email || !password || !username || !displayName) {
          console.error('Please fill in all fields');
          return;
        }
        if (password.length < 6) {
          console.error('Password must be at least 6 characters');
          return;
        }
        setMode('signup');
        setEmail(email);
        setLoading(true);
        setError('');
        try {
          await signup(email, password, username, displayName);
          completeOnboarding();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '';
          if (msg === 'CONFIRM_EMAIL') {
            setMode('confirm-email');
          } else {
            setError(msg || 'Signup failed. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login, signup, completeOnboarding]);

  if (mode === 'confirm-email') {
    return (
      <div className="fixed inset-0 bg-bg-primary flex items-center justify-center p-8">
        <div className="app-atmosphere"><div className="atmosphere-orb-3" /></div>
        <div className="app-noise" />
        <div className="max-w-md w-full animate-fade-in text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
            <Mail size={36} className="text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Check Your Email</h1>
          <p className="text-text-secondary mb-6">
            We&apos;ve sent a confirmation link to <strong className="text-text-primary">{email}</strong>. Please click the link to verify your account.
          </p>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className="px-8 py-3 btn btn-primary rounded-full font-semibold"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 min-h-screen bg-bg-primary z-50">
      <iframe
        src="/login.html"
        className="w-full h-full border-none outline-none block"
        title="NovelCraft Sign In"
      />
      {loading && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="glass-card rounded-2xl px-5 py-4 inline-flex items-center gap-3 text-text-primary">
            <Loader2 size={18} className="animate-spin text-accent" />
            <span className="text-sm">Authenticating...</span>
          </div>
        </div>
      )}
      {!!error && (
        <div className="absolute top-4 right-4 max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}
    </div>
  );
}
