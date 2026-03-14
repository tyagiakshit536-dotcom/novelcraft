import { useState } from 'react';
import { BookOpen, PenTool, Settings, Bell, Search, Sparkles } from 'lucide-react';

type TutorialOverlayProps = {
  onFinish: () => void;
  onSkip: () => void;
};

const steps = [
  {
    title: 'Welcome to NovelCraft',
    text: 'This quick tour shows where everything is. You can skip anytime and relaunch from Settings.',
    icon: Sparkles,
  },
  {
    title: 'Write and Publish',
    text: 'Open Write to create novels, then publish with niche and genre tags for category placement.',
    icon: PenTool,
  },
  {
    title: 'Read and Discover',
    text: 'Use Home and Library to discover stories and track your reading journey.',
    icon: BookOpen,
  },
  {
    title: 'Notifications and Search',
    text: 'Use the bell icon for updates and top search to quickly find features or content.',
    icon: Bell,
  },
  {
    title: 'Personalize Settings',
    text: 'Choose language, role, theme toggle, fonts, and profile settings from Settings Studio.',
    icon: Settings,
  },
];

export default function TutorialOverlay({ onFinish, onSkip }: TutorialOverlayProps) {
  const [index, setIndex] = useState(0);
  const isLast = index === steps.length - 1;
  const step = steps[index];

  return (
    <div className="modal-overlay fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="modal-card w-full max-w-2xl rounded-3xl border border-accent/30 bg-bg-secondary/95 p-6 md:p-8 animate-scale-in relative overflow-hidden">
        <div className="modal-handle hidden" />
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-accent/80">Quick Tour</p>
            <button onClick={onSkip} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Skip</button>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mb-4">
            <step.icon size={26} className="text-accent" />
          </div>

          <h2 className="font-display text-3xl font-bold mb-3">{step.title}</h2>
          <p className="text-text-secondary text-base leading-relaxed mb-7">{step.text}</p>

          <div className="flex items-center gap-2 mb-7">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-accent' : 'w-2 bg-text-secondary/40'}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setIndex((v) => Math.max(0, v - 1))}
              disabled={index === 0}
              className="px-4 py-2 rounded-xl border border-divider disabled:opacity-40"
            >
              Back
            </button>

            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Search size={12} />
              Step {index + 1} of {steps.length}
            </div>

            <button
              onClick={() => {
                if (isLast) onFinish();
                else setIndex((v) => v + 1);
              }}
              className="px-5 py-2 rounded-xl btn btn-primary font-semibold"
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
