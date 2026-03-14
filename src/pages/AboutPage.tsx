import { useEffect, useRef, useState } from 'react';
import { MapPin, Linkedin, Github, Mail } from 'lucide-react';
import NovelCraftLogo from '../components/NovelCraftLogo';

/* ─── Intersection Observer hook for scroll animations ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Count-up number component ─── */
function CountUp({ value, suffix = '' }: { value: string; suffix?: string }) {
  const { ref, visible } = useScrollReveal();
  const num = parseInt(value);
  const isNumeric = !isNaN(num) && value !== '∞';
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (!visible || !isNumeric) return;
    let start = 0;
    const duration = 1200;
    const step = Math.max(1, Math.floor(num / 60));
    const interval = duration / (num / step);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setDisplay(String(num)); clearInterval(timer); }
      else setDisplay(String(start));
    }, interval);
    return () => clearInterval(timer);
  }, [visible, num, isNumeric]);
  return (
    <span ref={ref} className="font-display text-4xl font-bold text-accent">
      {display}{suffix}
    </span>
  );
}

/* ─── X (Twitter) icon — not in lucide-react ─── */
function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.5L20 4h-2l-5.2 6.4L8 4H4z" />
    </svg>
  );
}

/* ─── Team card ─── */
function TeamCard({ name, avatar, alt, roles, bio, social, glowColor }: {
  name: string;
  avatar: string;
  alt: string;
  roles: { label: string; color: string }[];
  bio: string;
  social: { label: string; url: string; icon: React.ReactNode }[];
  glowColor: string;
}) {
  return (
    <div className="glass-card p-8 flex flex-col items-center text-center">
      <img
        src={avatar}
        alt={alt}
        loading="lazy"
        className="w-[120px] h-[120px] rounded-full object-cover mb-5"
        style={{ border: `2px solid ${glowColor}`, boxShadow: `0 0 24px ${glowColor}40` }}
      />
      <h3 className="font-display text-xl font-bold text-text-primary mb-3">{name}</h3>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {roles.map((r, i) => (
          <span key={i} className="text-xs px-3 py-1 rounded-full font-medium" style={{
            background: i === 0 ? `${r.color}25` : 'rgba(255,255,255,0.06)',
            color: i === 0 ? r.color : '#B09090',
            border: `1px solid ${i === 0 ? r.color + '40' : 'rgba(255,255,255,0.08)'}`,
          }}>
            {r.label}
          </span>
        ))}
      </div>
      <p className="text-text-secondary text-sm leading-relaxed mb-5">{bio}</p>
      <div className="flex gap-3">
        {social.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
            className="w-10 h-10 rounded-xl btn-ghost btn flex items-center justify-center text-text-secondary hover:text-accent transition-colors"
          >
            {s.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-16 animate-fade-in">
      {/* ─── HERO BANNER ─── */}
      <section className="relative overflow-hidden py-14 md:py-20 px-4 sm:px-6 text-center" style={{
        background: 'radial-gradient(ellipse at 50% 20%, rgba(226,74,74,0.12) 0%, #231313 50%, #1A0E0E 100%)',
      }}>
        <Section>
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <NovelCraftLogo size="large" showWordmark={false} />
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-text-primary mb-4">
              About <span className="text-accent">NovelCraft</span>
            </h1>
            <p className="text-gold text-lg font-semibold mb-3" style={{ fontFamily: '"Inter", sans-serif' }}>
              A Product by Detha
            </p>
            <p className="text-text-secondary text-lg mb-6">
              Write Worlds. Share Stories. Built for Creators.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-xs px-4 py-1.5 rounded-full border border-accent/30 text-accent font-medium tracking-wider">
                Est. 2026
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary text-sm">
                <MapPin size={14} /> Muzaffarnagar, Uttar Pradesh, India 🇮🇳
              </span>
            </div>
          </div>
        </Section>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* ─── OUR MISSION ─── */}
        <Section className="py-16">
          <h2 className="font-display text-3xl font-bold text-text-primary mb-6 text-center">Our Mission</h2>
          <div className="glass-card p-8 md:p-10 max-w-3xl mx-auto">
            <p className="text-text-secondary leading-relaxed text-[15px]">
              At Detha, we believe that powerful technology should be accessible to everyone.
              NovelCraft is our first step toward that vision — a next-generation creative
              writing platform built to empower storytellers, authors, and dreamers worldwide.
            </p>
            <p className="text-text-secondary leading-relaxed text-[15px] mt-4">
              We are dedicated to building AI-driven tools that bridge the gap between complex
              technology and intuitive human experiences. Every feature we ship, every line we
              write, is in service of one goal: to help creators bring their worlds to life —
              simply, beautifully, and without limits.
            </p>
          </div>
        </Section>

        {/* ─── OUR VISION ─── */}
        <Section className="pb-16">
          <h2 className="font-display text-3xl font-bold text-text-primary mb-6 text-center">Our Vision</h2>
          <div className="glass-card p-8 md:p-10 max-w-3xl mx-auto" style={{ borderLeft: '3px solid #E2B04A' }}>
            <p className="text-text-secondary leading-relaxed text-[15px]">
              By 2031, Detha aims to be a globally recognized technology company valued at $100 million,
              built not on shortcuts, but on trust, innovation, and impact.
            </p>
            <p className="text-text-secondary leading-relaxed text-[15px] mt-4">
              We envision a platform ecosystem where every creator — from a first-time writer in a
              small town to a bestselling author — has access to world-class tools, completely free
              or at a fair price.
            </p>
            <p className="text-text-secondary leading-relaxed text-[15px] mt-4">
              For our Premium users, we provide end-to-end encrypted, long-term secure data storage
              at highly protected facilities — because your creative work deserves the highest level
              of protection. For our Free users, data is stored securely and retained for up to 3
              months, with permanent deletion available at any time upon request — because privacy
              is not a privilege, it is a right.
            </p>
            <p className="text-text-secondary leading-relaxed text-[15px] mt-4">
              Our goal is not just growth. It is a community of genuinely happy creators — limited
              premium customers who get the best experience money can buy, and unlimited free users
              who never feel like second-class citizens.
            </p>
          </div>
        </Section>

        {/* ─── STATS ROW ─── */}
        <section className="pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🚀', value: '1', label: 'Product Launched' },
              { emoji: '✍️', value: '∞', label: 'Words Written by Our Community' },
              { emoji: '🌍', value: '1', label: 'Country & Growing' },
              { emoji: '💡', value: '2026', label: 'Year We Started Dreaming' },
            ].map((stat, i) => (
              <Section key={i} delay={i * 80}>
                <div className="glass-card p-6 text-center shimmer">
                  <div className="text-3xl mb-3">{stat.emoji}</div>
                  <CountUp value={stat.value} />
                  <p className="text-text-secondary text-xs mt-2 leading-snug">{stat.label}</p>
                </div>
              </Section>
            ))}
          </div>
        </section>

        {/* ─── MEET THE TEAM ─── */}
        <Section className="pb-16">
          <h2 className="font-display text-3xl font-bold text-text-primary mb-2 text-center">Meet the Team</h2>
          <p className="text-text-secondary text-center mb-10">A small team with a big vision.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Section delay={0}>
              <TeamCard
                name="Akshit Tyagi"
                avatar="https://res.cloudinary.com/dpc2r6ere/image/upload/v1772988237/CEO_IMAGE_xxscwh.jpg"
                alt="Akshit Tyagi - Founder & CEO"
                glowColor="#e50914"
                roles={[
                  { label: 'Founder & CEO', color: '#e50914' },
                  { label: 'Lead Developer', color: '#e50914' },
                  { label: 'Designer', color: '#e50914' },
                ]}
                bio="Akshit is a self-taught developer and founder dedicated to building the next generation of AI-driven tools. He focuses on bridging the gap between complex technology and intuitive user experiences — one product at a time."
                social={[
                  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/akshit-tyagi-b300ab3b6', icon: <Linkedin size={18} /> },
                  { label: 'Twitter/X', url: 'https://x.com/AkshitTyagi2009', icon: <XIcon size={18} /> },
                  { label: 'GitHub', url: 'https://github.com/tyagiakshit536-dotcom', icon: <Github size={18} /> },
                ]}
              />
            </Section>
            <Section delay={80}>
              <TeamCard
                name="Deepanshu Tomer"
                avatar="https://res.cloudinary.com/dpc2r6ere/image/upload/v1772990913/CO_FOUNDER_zbmfdl.jpg"
                alt="Deepanshu Tomer - Co-Founder"
                glowColor="#E2B04A"
                roles={[
                  { label: 'Co-Founder', color: '#E2B04A' },
                ]}
                bio="Deepanshu is the driving force behind the scenes at Detha. With a sharp instinct for turning bold ideas into reality, he partners closely with Akshit to bring AI-driven tools to the masses — focused on crafting seamless user experiences and pushing technology boundaries, one innovative solution at a time."
                social={[
                  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/deepanshu-tomer-3219623b5', icon: <Linkedin size={18} /> },
                  { label: 'Twitter/X', url: 'https://x.com/ideepanshu95', icon: <XIcon size={18} /> },
                  { label: 'GitHub', url: 'https://github.com/ideepanshu-dotcom', icon: <Github size={18} /> },
                ]}
              />
            </Section>
          </div>
        </Section>

        {/* ─── CONTACT ─── */}
        <Section className="pb-16">
          <h2 className="font-display text-3xl font-bold text-text-primary mb-2 text-center">Get In Touch</h2>
          <p className="text-text-secondary text-center mb-8">We'd love to hear from you.</p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {[
              'novelcraft.detha@gmail.com',
              'novelcraft.detha@outlook.com',
            ].map(email => (
              <a
                key={email}
                href={`mailto:${email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card glass-card-hover p-5 flex items-center gap-3 text-text-secondary hover:text-accent transition-colors"
              >
                <Mail size={20} className="shrink-0" />
                <span className="text-sm font-medium truncate">{email}</span>
              </a>
            ))}
          </div>
          <p className="text-text-secondary/60 text-xs text-center mt-6 max-w-md mx-auto">
            Whether you have feedback, a partnership idea, or just want to say hello — our inbox is always open.
          </p>
        </Section>
      </div>

      {/* ─── FOOTER ─── */}
      <Section>
        <div className="border-t border-divider mt-8 py-8 text-center">
          <p className="text-text-secondary/50 text-xs">
            © 2026 Detha. All rights reserved. · NovelCraft is a product of Detha · Made with Passion and Hardwork
          </p>
        </div>
      </Section>
    </div>
  );
}
