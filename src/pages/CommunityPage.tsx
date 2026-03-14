import { useState } from 'react';
import { MessageCircle, Lightbulb, Trophy, HelpCircle, ChevronRight, ThumbsUp, MessageSquare } from 'lucide-react';

type Tab = 'prompts' | 'challenges' | 'discussions' | 'qa';

const samplePrompts = [
  { id: '1', text: 'Write a scene where a character discovers they have been living in a simulation.', responses: 42, likes: 128 },
  { id: '2', text: 'Your protagonist finds a letter from their future self. What does it say?', responses: 31, likes: 95 },
  { id: '3', text: 'Describe a city that exists between two parallel dimensions.', responses: 27, likes: 83 },
  { id: '4', text: 'A dragon and a knight sit down for tea. Write their conversation.', responses: 56, likes: 201 },
  { id: '5', text: 'The last human alive discovers they are not alone after all.', responses: 38, likes: 147 },
];

const sampleChallenges = [
  { id: '1', title: 'Flash Fiction February', description: 'Write a complete story in under 1,000 words. Theme: Rebirth.', entries: 234, daysLeft: 12 },
  { id: '2', title: 'Mystery March Madness', description: 'Write a mystery in under 10,000 words. Must include a red herring.', entries: 89, daysLeft: 25 },
  { id: '3', title: 'World-Building Workshop', description: 'Create a unique magic system and write a story showcasing it.', entries: 156, daysLeft: 18 },
];

const sampleDiscussions = [
  { id: '1', title: 'How do you handle writer\'s block?', author: 'Luna Starfall', replies: 47, category: 'General' },
  { id: '2', title: 'Best tips for writing compelling dialogue', author: 'Marcus Blackwood', replies: 32, category: 'Craft' },
  { id: '3', title: 'Anyone else struggling with pacing in epic fantasy?', author: 'Aria Nightshade', replies: 28, category: 'Fantasy Lounge' },
  { id: '4', title: 'Show don\'t tell - when does it apply and when doesn\'t it?', author: 'Thane Grimshire', replies: 51, category: 'Craft' },
  { id: '5', title: 'Seeking beta readers for my sci-fi novel', author: 'Dorian Ashfell', replies: 15, category: 'Sci-Fi Labs' },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('prompts');

  const tabs: { key: Tab; icon: typeof MessageCircle; label: string }[] = [
    { key: 'prompts', icon: Lightbulb, label: 'Writing Prompts' },
    { key: 'challenges', icon: Trophy, label: 'Challenges' },
    { key: 'discussions', icon: MessageCircle, label: 'Discussions' },
    { key: 'qa', icon: HelpCircle, label: 'Author Q&A' },
  ];

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-2">Community</h1>
      <p className="text-text-secondary mb-6">Connect, share, and grow with fellow writers</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === t.key ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary border border-divider hover:border-accent'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Writing Prompts */}
      {activeTab === 'prompts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Daily Prompts</h2>
          </div>
          {samplePrompts.map(prompt => (
            <div key={prompt.id} className="glass-card p-5 glass-card-hover cursor-pointer">
              <p className="text-text-primary leading-relaxed mb-3 font-reader italic">&ldquo;{prompt.text}&rdquo;</p>
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1"><MessageSquare size={14} /> {prompt.responses} responses</span>
                <span className="flex items-center gap-1"><ThumbsUp size={14} /> {prompt.likes}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Challenges */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {sampleChallenges.map(challenge => (
            <div key={challenge.id} className="glass-card p-5 glass-card-hover cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{challenge.title}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-coral/20 text-coral font-medium shrink-0 ml-3">
                  {challenge.daysLeft} days left
                </span>
              </div>
              <p className="text-text-secondary text-sm mb-3">{challenge.description}</p>
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <span>{challenge.entries} entries</span>
                <button className="text-accent font-medium hover:underline flex items-center gap-1">
                  Join Challenge <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discussions */}
      {activeTab === 'discussions' && (
        <div className="space-y-3">
          {sampleDiscussions.map(disc => (
            <div key={disc.id} className="glass-card p-4 glass-card-hover cursor-pointer flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shrink-0">
                {disc.author.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{disc.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-secondary">{disc.author}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary">{disc.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-text-secondary text-xs shrink-0">
                <MessageCircle size={14} /> {disc.replies}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Q&A */}
      {activeTab === 'qa' && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={32} className="text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Author Q&A Sessions</h3>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
            Host live Q&A sessions and connect with your readers directly. Ask questions to your favorite authors.
          </p>
          <p className="text-accent text-sm font-medium">Coming soon!</p>
        </div>
      )}
    </div>
  );
}
