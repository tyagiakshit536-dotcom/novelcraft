import { useState } from 'react';
import { X, Languages, Copy, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh-CN', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ru', label: 'Russian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'sv', label: 'Swedish' },
  { code: 'pl', label: 'Polish' },
  { code: 'tr', label: 'Turkish' },
];

function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function translateText(text: string, targetLang: string): Promise<string> {
  const stripped = stripHtml(text);
  if (!stripped) return '';

  // Split into chunks of ~400 chars to stay within free API limits
  const chunks: string[] = [];
  const sentences = stripped.split(/(?<=[.!?\n])\s+/);
  let current = '';
  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > 400 && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  const translated: string[] = [];
  for (const chunk of chunks) {
    try {
      const encoded = encodeURIComponent(chunk);
      const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|${targetLang}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        translated.push(data.responseData.translatedText);
      } else if (data.matches && data.matches.length > 0) {
        // Use best match
        const best = data.matches.sort((a: { quality: number }, b: { quality: number }) => b.quality - a.quality)[0];
        translated.push(best.translation || chunk);
      } else {
        translated.push(chunk);
      }
    } catch {
      translated.push(chunk);
    }
  }
  return translated.join(' ');
}

interface TranslatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: string; // HTML content of the chapter/editor
}

export default function TranslatePanel({ isOpen, onClose, content }: TranslatePanelProps) {
  const [selectedLang, setSelectedLang] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!selectedLang || !content) return;
    setIsTranslating(true);
    try {
      const result = await translateText(content, selectedLang);
      setTranslatedText(result);
    } catch (err) {
      console.error('Translation error:', err);
      setTranslatedText('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'linear-gradient(180deg, #141414 0%, #1a1a1a 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Languages size={18} className="text-accent" />
            <h3 className="text-white font-semibold text-sm">Translate Content</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Language Selector */}
        <div className="px-5 py-4 border-b border-white/5">
          <label className="text-xs text-gray-400 mb-2 block">Select target language</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setSelectedLang(lang.code); setTranslatedText(''); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedLang === lang.code
                    ? 'bg-accent text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Translate Button */}
        <div className="px-5 py-3 border-b border-white/5">
          <button
            onClick={handleTranslate}
            disabled={!selectedLang || isTranslating}
            className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:bg-white/5 disabled:text-gray-600 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            {isTranslating ? 'Translating...' : selectedLang ? `Translate to ${LANGUAGES.find(l => l.code === selectedLang)?.label}` : 'Select a language first'}
          </button>
        </div>

        {/* Translation Result */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isTranslating ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : translatedText ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">
                  Translated to {LANGUAGES.find(l => l.code === selectedLang)?.label}
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-white/5 rounded-xl p-4 max-h-[40vh] overflow-y-auto">
                {translatedText}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm py-8">
              Select a language and click translate to see the result
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
