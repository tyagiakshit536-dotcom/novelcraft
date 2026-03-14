import { useMemo, useState } from 'react';
import { Bot, Search, HelpCircle, Sparkles, Send, BookOpen, Compass, Settings as SettingsIcon } from 'lucide-react';
import { useStore } from '../store';
import { t } from '../lib/i18n';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const faqs = [
  {
    q: 'How do I start writing my first novel?',
    a: 'Go to Write, create a new novel draft, then add volumes and chapters. Use the Publish button when your metadata is complete.',
  },
  {
    q: 'How can I publish by niche like Fantasy or Sci-Fi?',
    a: 'In the publish flow, choose your niche and genre tags. Your novel appears in matching categories across discovery and home sections.',
  },
  {
    q: 'Where can I manage reader appearance and fonts?',
    a: 'Open Settings Studio. You can set reader font, size, and background style in one place.',
  },
  {
    q: 'How do notifications work?',
    a: 'Click the bell icon in the top navigation to see recent updates. You can mark one or all notifications as read and tune preferences in Settings.',
  },
  {
    q: 'Can I change website language without changing novel text?',
    a: 'Yes. Website Language in Settings changes interface text only. Novel content remains in its original language.',
  },
  {
    q: 'How do I add or edit my profile picture?',
    a: 'In Settings, choose profile type Author or Reader & Author, then upload an image directly from your device in the profile section.',
  },
  {
    q: 'Where is the tutorial and can I skip it?',
    a: 'First login shows a quick tutorial overlay. You can skip at any time, and relaunch it from Settings.',
  },
  {
    q: 'How do I quickly find features?',
    a: 'Use Search in top navigation, or ask Helping Assistant with a plain sentence like “Where is publish settings?”.',
  },
  {
    q: 'Why does the AI helper not write novels here?',
    a: 'Helping Assistant is focused on product guidance only. It helps with navigation, settings, and feature discovery inside the website.',
  },
  {
    q: 'How can I manage my reading list and progress?',
    a: 'Use Reading List for shelves and Reader view for progress updates. The app auto-saves reading position per chapter.',
  },
];

const helperKnowledge = [
  { key: ['publish', 'niche', 'genre'], reply: 'Open Editor and click Publish. In step 1 select niche and genres, then continue to visibility and final publish.' },
  { key: ['settings', 'theme', 'dark', 'light'], reply: 'Settings Studio has a medium-size theme toggle under Appearance & Theme.' },
  { key: ['language', 'translate', 'website'], reply: 'Use Website Language in Settings. It changes app interface text only, not novel content.' },
  { key: ['notification', 'bell'], reply: 'Click the bell icon in the top bar. You can open items, mark read, and manage preferences from Settings.' },
  { key: ['profile', 'avatar', 'picture'], reply: 'In Settings > Profile & Role, select Author or Reader & Author to enable profile picture input.' },
  { key: ['tutorial', 'guide', 'onboarding'], reply: 'Tutorial shows on first login and can be skipped. You can relaunch it from Settings > Tutorial & Privacy.' },
  { key: ['find', 'where', 'locate'], reply: 'Use top navigation, sidebar, search, and this assistant. Tell me the feature name and I will route you.' },
  { key: ['novel writing', 'write story', 'generate chapter'], reply: 'Helping Assistant is product-support only. It does not write novels, but can guide you to writing tools.' },
];

function answerFromAssistant(input: string): string {
  const q = input.toLowerCase();
  const hit = helperKnowledge.find((item) => item.key.some((k) => q.includes(k)));
  if (hit) return hit.reply;
  return 'I can help with website features like Settings, Publish flow, notifications, profile, tutorial, and navigation. Ask about a specific feature and I will guide you.';
}

export default function HelpPage() {
  const { appLanguage } = useStore();
  const [query, setQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello, I am Helping Assistant. I can guide you through website features, settings, notifications, and finding tools quickly.',
    },
  ]);

  const filteredFaqs = useMemo(() => {
    if (!query.trim()) return faqs;
    const q = query.toLowerCase();
    return faqs.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [query]);

  const title = t(appLanguage, 'help.title', 'Help Center');
  const assistantName = t(appLanguage, 'help.assistant', 'Helping Assistant');

  const sendMessage = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    const response = answerFromAssistant(msg);
    setMessages((m) => [...m, { role: 'user', content: msg }, { role: 'assistant', content: response }]);
    setChatInput('');
  };

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-bg-secondary via-bg-tertiary to-bg-primary p-6 md:p-8 mb-6">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.22em] text-accent/80 mb-3">Support Hub</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">{title}</h1>
          <p className="text-text-secondary max-w-3xl">
            Find features faster, learn workflows, and get guided help from our product-focused assistant.
          </p>
        </div>
      </section>

      <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-5 w-full">
        <section className="glass-card rounded-3xl p-5 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle size={20} className="text-gold" />
            <h2 className="text-xl font-semibold">FAQs</h2>
          </div>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-3.5 text-text-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help topics..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg-primary border border-divider focus:border-accent focus:outline-none"
            />
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredFaqs.map((item, idx) => (
              <details key={idx} className="rounded-2xl border border-divider bg-bg-primary group open:border-accent/40">
                <summary className="list-none cursor-pointer px-4 py-3 font-medium text-sm flex items-center justify-between">
                  <span>{item.q}</span>
                  <span className="text-text-secondary group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-3xl p-5 md:p-6 flex flex-col min-h-[640px]">
          <div className="flex items-center gap-3 mb-4">
            <Bot size={20} className="text-accent" />
            <h2 className="text-xl font-semibold">{assistantName}</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
            <div className="rounded-xl p-2 bg-bg-primary border border-divider text-center">
              <BookOpen size={14} className="mx-auto mb-1 text-gold" />
              Reading
            </div>
            <div className="rounded-xl p-2 bg-bg-primary border border-divider text-center">
              <SettingsIcon size={14} className="mx-auto mb-1 text-accent" />
              Settings
            </div>
            <div className="rounded-xl p-2 bg-bg-primary border border-divider text-center">
              <Compass size={14} className="mx-auto mb-1 text-[#FF8A6B]" />
              Navigation
            </div>
          </div>

          <div className="flex-1 rounded-2xl bg-bg-primary border border-divider p-3 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] px-3 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-accent text-white' : 'bg-bg-secondary text-text-primary border border-divider'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 rounded-2xl bg-bg-primary border border-divider">
            <p className="text-xs text-text-secondary mb-2 inline-flex items-center gap-1">
              <Sparkles size={12} className="text-gold" />
              Assistant scope: Website features only. No novel-writing generation.
            </p>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="Ask where to find a feature..."
                className="flex-1 px-3 py-2 rounded-xl bg-bg-secondary border border-divider focus:border-accent focus:outline-none text-sm"
              />
              <button onClick={sendMessage} className="px-3 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors">
                <Send size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
