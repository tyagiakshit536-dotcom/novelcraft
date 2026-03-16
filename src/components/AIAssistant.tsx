import { useState, useRef, useEffect } from 'react';
import {
  X, Send, Sparkles, BookOpenCheck, Lightbulb, Wand2,
  FileText, Brain, Eye, Compass, Users, Zap, MessageSquare, Edit3,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EditorVolumeInfo {
  id: string;
  title: string;
  orderIndex: number;
}

interface EditorAssistantApi {
  enabled: boolean;
  novelTitle: string;
  activeChapterTitle: string;
  activeChapterContent: string;
  volumes: EditorVolumeInfo[];
  replaceActiveChapterHtml: (nextHtml: string) => void;
  appendActiveChapterHtml: (appendHtml: string) => void;
  prependActiveChapterHtml: (prependHtml: string) => void;
  renameActiveChapter: (nextTitle: string) => void;
  renameVolumeByIndex: (index1Based: number, nextTitle: string) => boolean;
  renameVolumeByTitle: (currentTitle: string, nextTitle: string) => boolean;
  findReplaceInActiveChapter: (findText: string, replaceText: string) => number;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  editorApi?: EditorAssistantApi;
}

const AI_FEATURES = [
  { icon: Wand2, label: 'Synonyms & Antonyms', prompt: 'Give me poetic and non-poetic synonyms and antonyms for: ' },
  { icon: FileText, label: 'Query Letter & Blurb', prompt: 'Write a compelling query letter and back-cover blurb for my novel about: ' },
  { icon: BookOpenCheck, label: 'Consistency Check', prompt: 'Check my story for consistency issues. Here is the chapter: ' },
  { icon: Brain, label: 'Technical Deep Dive', prompt: 'Give me a detailed technical/research deep-dive on: ' },
  { icon: Eye, label: 'Sensory Expansion', prompt: 'Expand this passage with rich sensory details (sight, sound, smell, taste, touch): ' },
  { icon: Lightbulb, label: 'Blank Page Syndrome', prompt: 'I\'m stuck. Help me brainstorm ideas for a scene where: ' },
  { icon: Compass, label: 'Instant Outline', prompt: 'Create a detailed chapter outline for a story about: ' },
  { icon: Zap, label: 'Rapid Brainstorm', prompt: 'Give me 10 creative ideas for: ' },
  { icon: Users, label: 'Relationship Map', prompt: 'Help me map out character relationships for these characters: ' },
];

const EDITOR_COMMANDS = [
  { label: 'Rewrite Full Chapter', prompt: '/replace The new full chapter text...' },
  { label: 'Append Section', prompt: '/append Add this section at the end...' },
  { label: 'Prepend Section', prompt: '/prepend Add this section at the beginning...' },
  { label: 'Rename Chapter', prompt: '/rename-chapter Chapter 5: New Name' },
  { label: 'Rename Volume', prompt: '/rename-volume 1 => Volume I: Reborn' },
  { label: 'Find & Replace', prompt: '/find-replace old phrase => new phrase' },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function textToHtml(text: string): string {
  const blocks = text
    .trim()
    .split(/\n{2,}/)
    .map(b => b.trim())
    .filter(Boolean)
    .map(b => `<p>${escapeHtml(b).replace(/\n/g, '<br/>')}</p>`);
  return blocks.join('');
}

export default function AIAssistant({ isOpen, onClose, editorApi }: AIAssistantProps) {
  const [mode, setMode] = useState<'general' | 'editor'>('general');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I\'m your AI writing assistant. I can help with synonyms, outlines, brainstorming, consistency checks, and more. What would you like to work on?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const postAssistantMessage = (content: string) => {
    const aiMsg: Message = {
      id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  const handleEditorCommand = (rawText: string): boolean => {
    const cmd = rawText.trim();
    if (!cmd) return false;
    if (!editorApi?.enabled) {
      postAssistantMessage('Editor mode is unavailable right now because no active chapter is selected. Select a chapter and try again.');
      return true;
    }

    const replaceMatch = cmd.match(/^\/replace\s+([\s\S]+)/i);
    if (replaceMatch) {
      const nextHtml = textToHtml(replaceMatch[1]);
      if (!nextHtml) {
        postAssistantMessage('I need replacement text after /replace.');
        return true;
      }
      editorApi.replaceActiveChapterHtml(nextHtml);
      postAssistantMessage(`Applied full chapter rewrite in real time for "${editorApi.activeChapterTitle}".`);
      return true;
    }

    const appendMatch = cmd.match(/^\/append\s+([\s\S]+)/i);
    if (appendMatch) {
      const appendHtml = textToHtml(appendMatch[1]);
      if (!appendHtml) {
        postAssistantMessage('I need text after /append.');
        return true;
      }
      editorApi.appendActiveChapterHtml(appendHtml);
      postAssistantMessage(`Appended new content to "${editorApi.activeChapterTitle}".`);
      return true;
    }

    const prependMatch = cmd.match(/^\/prepend\s+([\s\S]+)/i);
    if (prependMatch) {
      const prependHtml = textToHtml(prependMatch[1]);
      if (!prependHtml) {
        postAssistantMessage('I need text after /prepend.');
        return true;
      }
      editorApi.prependActiveChapterHtml(prependHtml);
      postAssistantMessage(`Prepended new content to "${editorApi.activeChapterTitle}".`);
      return true;
    }

    const renameChapterMatch = cmd.match(/^\/rename-chapter\s+(.+)/i);
    if (renameChapterMatch) {
      const nextTitle = renameChapterMatch[1].trim();
      if (!nextTitle) {
        postAssistantMessage('Please provide a chapter title after /rename-chapter.');
        return true;
      }
      editorApi.renameActiveChapter(nextTitle);
      postAssistantMessage(`Renamed active chapter to "${nextTitle}".`);
      return true;
    }

    const renameVolumeMatch = cmd.match(/^\/rename-volume\s+(.+)\s*=>\s*(.+)$/i);
    if (renameVolumeMatch) {
      const target = renameVolumeMatch[1].trim();
      const nextTitle = renameVolumeMatch[2].trim();
      const asIndex = Number(target);
      let renamed = false;
      if (Number.isFinite(asIndex) && asIndex > 0) {
        renamed = editorApi.renameVolumeByIndex(Math.floor(asIndex), nextTitle);
      } else {
        renamed = editorApi.renameVolumeByTitle(target, nextTitle);
      }
      postAssistantMessage(
        renamed
          ? `Renamed volume "${target}" to "${nextTitle}".`
          : `I could not find volume "${target}". Use /rename-volume 1 => New Title or the exact current title.`
      );
      return true;
    }

    const findReplaceMatch = cmd.match(/^\/find-replace\s+([\s\S]+?)\s*=>\s*([\s\S]+)$/i);
    if (findReplaceMatch) {
      const findText = findReplaceMatch[1].trim();
      const replaceText = findReplaceMatch[2];
      if (!findText) {
        postAssistantMessage('Please provide text to find before => in /find-replace.');
        return true;
      }
      const replacements = editorApi.findReplaceInActiveChapter(findText, replaceText);
      postAssistantMessage(
        replacements > 0
          ? `Applied ${replacements} replacement(s) in "${editorApi.activeChapterTitle}".`
          : `No match found for "${findText}" in the active chapter.`
      );
      return true;
    }

    postAssistantMessage(
      'Editor mode executes direct actions, not generic chat. Use one of these:\n' +
      '/replace <full chapter text>\n' +
      '/append <text>\n' +
      '/prepend <text>\n' +
      '/rename-chapter <new title>\n' +
      '/rename-volume <number or exact title> => <new title>\n' +
      '/find-replace <find> => <replace>'
    );
    return true;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    if (mode === 'editor') {
      handleEditorCommand(text);
      return;
    }

    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'That\'s a great question! Here\'s what I think...\n\nBased on the context you\'ve provided, I\'d suggest focusing on the emotional arc of the scene. Try weaving in sensory details — the creak of floorboards, the scent of old paper, the weight of unspoken words.',
        'Here are some ideas:\n\n1. **Contrast** — Use juxtaposition to highlight the tension\n2. **Pacing** — Short, punchy sentences for action; longer, flowing ones for reflection\n3. **Subtext** — What characters *don\'t* say can be more powerful than dialogue\n4. **Sensory anchors** — Ground each scene in at least two senses\n5. **Callback** — Reference an earlier detail to create narrative cohesion',
        'Let me break this down:\n\n**Structure:** Your scene has a solid foundation. The conflict is clear, but the stakes could be higher.\n\n**Character voice:** Try varying sentence length to match emotional states — choppy when anxious, flowing when at peace.\n\n**Suggestion:** Add a ticking clock element to increase urgency.',
        'Here\'s a creative approach:\n\n*"The words fell like autumn leaves — scattered, golden, and impossible to catch once they\'d left the branch."*\n\nTry using extended metaphors to unify your imagery throughout the chapter.',
      ];
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFeatureClick = (feature: typeof AI_FEATURES[0]) => {
    setInput(feature.prompt);
    inputRef.current?.focus();
  };

  const handleEditorCommandClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl h-[92vh] sm:h-[85vh] flex flex-col rounded-2xl overflow-hidden animate-scale-in" style={{
        background: 'linear-gradient(180deg, #141414 0%, #1a1a1a 100%)',
        border: '1px solid rgba(229, 9, 20, 0.2)',
        boxShadow: '0 0 60px rgba(229, 9, 20, 0.1)',
      }}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="ai-btn-shiny w-9 h-9 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Writing Assistant</h3>
              <p className="text-gray-500 text-[10px]">Powered by intelligence</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-3">
            <div
              className="relative flex items-center bg-white/10 rounded-full p-0.5 cursor-pointer select-none"
              style={{ width: '136px', height: '32px' }}
              onClick={() => setMode(m => m === 'general' ? 'editor' : 'general')}
            >
              {/* Sliding background pill */}
              <div
                className="absolute top-0.5 h-[28px] w-[66px] rounded-full bg-accent transition-transform duration-300 ease-in-out"
                style={{ transform: mode === 'editor' ? 'translateX(66px)' : 'translateX(0)' }}
              />
              <div className="relative z-10 flex items-center justify-center gap-1.5 w-[66px] text-[11px] font-semibold">
                <MessageSquare size={11} className={mode === 'general' ? 'text-white' : 'text-gray-400'} />
                <span className={mode === 'general' ? 'text-white' : 'text-gray-400'}>General</span>
              </div>
              <div className="relative z-10 flex items-center justify-center gap-1.5 w-[66px] text-[11px] font-semibold">
                <Edit3 size={11} className={mode === 'editor' ? 'text-white' : 'text-gray-400'} />
                <span className={mode === 'editor' ? 'text-white' : 'text-gray-400'}>Editor</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Feature Buttons */}
        {mode === 'general' ? (
          <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-b border-white/5" style={{ scrollbarWidth: 'none' }}>
            {AI_FEATURES.map((f, i) => (
              <button
                key={i}
                onClick={() => handleFeatureClick(f)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              >
                <f.icon size={12} /> {f.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-b border-white/5" style={{ scrollbarWidth: 'none' }}>
            {EDITOR_COMMANDS.map((cmd, i) => (
              <button
                key={i}
                onClick={() => handleEditorCommandClick(cmd.prompt)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              >
                <Edit3 size={12} /> {cmd.label}
              </button>
            ))}
          </div>
        )}

        {/* Mode indicator */}
        {mode === 'editor' && (
          <div className="px-4 py-1.5 bg-accent/10 border-b border-accent/20">
            <p className="text-[10px] text-accent flex items-center gap-1.5">
              <Edit3 size={10} /> Editor Mode — commands apply live edits to chapters and volumes immediately
            </p>
            {editorApi?.enabled && (
              <p className="text-[10px] text-accent/80 mt-1">
                Novel: {editorApi.novelTitle} | Active chapter: {editorApi.activeChapterTitle} | Volumes: {editorApi.volumes.length}
              </p>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent/20 text-white rounded-br-sm'
                  : 'bg-white/5 text-gray-300 rounded-bl-sm'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <p className="text-[9px] text-gray-600 mt-1.5">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder={mode === 'editor' ? 'Use editor commands, e.g. /replace, /rename-chapter, /rename-volume...' : 'Ask anything about writing...'}
              className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-accent/50 max-h-24"
              rows={1}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-accent hover:bg-accent/80 disabled:bg-white/5 disabled:text-gray-600 flex items-center justify-center text-white transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
