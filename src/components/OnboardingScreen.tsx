import { useState } from 'react';
import { BookOpen, Layers, Share2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useStore } from '../store';

const slides = [
  {
    icon: BookOpen,
    title: 'Write Your World',
    subtitle: 'A powerful distraction-free editor inspired by VS Code, built for novelists.',
    gradient: 'from-red-900/50 via-bg-primary to-bg-primary',
  },
  {
    icon: Layers,
    title: 'Organize Your Universe',
    subtitle: 'Volumes, chapters, character bibles, and world maps — all in one place.',
    gradient: 'from-red-800/50 via-bg-primary to-bg-primary',
  },
  {
    icon: Share2,
    title: 'Share With Readers',
    subtitle: 'Publish to a vibrant community. Get ratings, reviews, and build your audience.',
    gradient: 'from-red-900/50 via-bg-primary to-bg-primary',
  },
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const completeOnboarding = useStore(s => s.completeOnboarding);

  const handleFinish = () => {
    completeOnboarding();
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center overflow-hidden">
      <div className="app-atmosphere"><div className="atmosphere-orb-3" /></div>
      <div className="app-noise" />
      {/* Skip button */}
      <button
        onClick={handleFinish}
        className="absolute top-6 right-6 text-text-secondary hover:text-text-primary text-sm font-medium z-10 transition-colors"
      >
        Skip
      </button>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center w-full max-w-lg px-8">
        <div key={currentSlide} className="animate-fade-in text-center">
          <div className={`w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center border border-accent/20`}>
            {(() => {
              const Icon = slides[currentSlide].icon;
              return <Icon size={48} className="text-accent" />;
            })()}
          </div>
          <h1 className="font-display text-4xl font-bold mb-4 text-text-primary">
            {slides[currentSlide].title}
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-md mx-auto">
            {slides[currentSlide].subtitle}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="pb-12 flex flex-col items-center gap-8">
        {/* Dots */}
        <div className="flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'bg-accent w-8' : 'bg-divider hover:bg-text-secondary'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(c => c - 1)}
              className="w-12 h-12 rounded-full border border-divider flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={() => setCurrentSlide(c => c + 1)}
              className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent-hover transition-all accent-glow"
            >
              <ChevronRight size={20} />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleFinish}
                className="px-8 py-3 btn btn-primary rounded-full font-semibold"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
