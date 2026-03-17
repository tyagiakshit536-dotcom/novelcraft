import { useState, useRef } from 'react';
import { Wand2, Plus, Trash2, GripVertical, Dna, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import type { VisualDNA } from '../types';

function deriveSeedFromNovelId(novelId: string): number {
  let hash = 0;
  for (let i = 0; i < novelId.length; i += 1) {
    hash = ((hash << 5) - hash) + novelId.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 900000);
  return normalized + 100000;
}

function nextSeed(current: number): number {
  const normalizedCurrent = Number.isFinite(current) ? Math.max(100000, Math.floor(current)) : 100000;
  return ((normalizedCurrent - 100000 + 7919) % 900000) + 100000;
}

/* ─── Pollinations URL Builder ─── */
function buildPollinationsUrl(
  baseDna: VisualDNA,
  characterDesc: string,
  sceneAction: string,
  width = 768,
  height = 1024,
): string {
  const parts = [baseDna.physicalDescription, characterDesc, sceneAction].filter(Boolean);
  const prompt = parts.join(', ') + ', highly detailed, digital art, cinematic lighting, masterpiece quality';
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${baseDna.seed}&width=${width}&height=${height}&nologo=true`;
}

interface ImageCreatorProps {
  novelId: string;
  onInsertImage: (imageUrl: string) => void;
}

export default function ImageCreator({ novelId, onInsertImage }: ImageCreatorProps) {
  const { userNovels, characters, characterImages, setVisualDNA, addCharacterImage, deleteCharacterImage } = useStore();
  const novel = userNovels.find(n => n.id === novelId);
  const novelChars = characters.filter(c => c.novelId === novelId);
  const novelImages = characterImages.filter(img => img.novelId === novelId);
  const initialSeed = novel?.visualDNA?.seed ?? deriveSeedFromNovelId(novelId);

  const [dnaDesc, setDnaDesc] = useState(novel?.visualDNA?.physicalDescription || '');
  const [dnaSeed, setDnaSeed] = useState(initialSeed);
  const [selectedCharId, setSelectedCharId] = useState('');
  const [scenePrompt, setScenePrompt] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDnaEditor, setShowDnaEditor] = useState(!novel?.visualDNA?.physicalDescription);

  const imgRef = useRef<HTMLImageElement>(null);

  const currentDNA: VisualDNA = { seed: dnaSeed, physicalDescription: dnaDesc };

  const handleSaveDNA = () => {
    setVisualDNA(novelId, currentDNA);
    setShowDnaEditor(false);
  };

  const handleGenerate = () => {
    if (!scenePrompt.trim()) return;
    setIsGenerating(true);

    const selectedChar = novelChars.find(c => c.id === selectedCharId);
    const characterDesc = selectedChar
      ? `${selectedChar.name}, ${selectedChar.physicalDescription || selectedChar.role}`
      : '';

    const dna = novel?.visualDNA || currentDNA;
    const url = buildPollinationsUrl(dna, characterDesc, scenePrompt.trim());
    setGeneratedUrl(url);

    // Save to character images if a character is selected
    if (selectedChar) {
      addCharacterImage({
        novelId,
        characterId: selectedChar.id,
        characterName: selectedChar.name,
        imageUrl: url,
        prompt: scenePrompt.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    // Image loads asynchronously, simulate loading state
    setTimeout(() => setIsGenerating(false), 1500);
  };

  const handleInsert = () => {
    if (generatedUrl) {
      onInsertImage(generatedUrl);
    }
  };

  const handleDragStart = (e: React.DragEvent, url: string) => {
    e.dataTransfer.setData('text/plain', url);
    e.dataTransfer.setData('application/x-image-url', url);
  };

  const handleRegenerate = () => {
    const newSeed = nextSeed(dnaSeed);
    setDnaSeed(newSeed);
    if (novel?.visualDNA) {
      setVisualDNA(novelId, { ...novel.visualDNA, seed: newSeed });
    }
    if (scenePrompt.trim()) {
      const selectedChar = novelChars.find(c => c.id === selectedCharId);
      const characterDesc = selectedChar
        ? `${selectedChar.name}, ${selectedChar.physicalDescription || selectedChar.role}`
        : '';
      const dna: VisualDNA = { seed: newSeed, physicalDescription: dnaDesc };
      setGeneratedUrl(buildPollinationsUrl(dna, characterDesc, scenePrompt.trim()));
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* ─── Visual DNA Section ─── */}
      <div className="rounded-xl border border-white/10 bg-bg-primary/50 overflow-hidden">
        <button
          onClick={() => setShowDnaEditor(!showDnaEditor)}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-accent hover:bg-white/5 transition-colors"
        >
          <Dna size={14} />
          <span>Visual DNA</span>
          <span className="ml-auto text-[10px] text-text-secondary font-normal">
            Seed: {dnaSeed}
          </span>
        </button>

        {showDnaEditor && (
          <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2 animate-scale-in">
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Unique Seed</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={dnaSeed}
                  onChange={e => setDnaSeed(Number(e.target.value))}
                  className="flex-1 px-2 py-1.5 bg-bg-secondary rounded-lg text-xs text-text-primary border border-divider focus:border-accent focus:outline-none"
                />
                <button
                  onClick={() => setDnaSeed((current) => nextSeed(current))}
                  className="px-2 py-1.5 rounded-lg bg-bg-secondary border border-divider hover:border-accent text-text-secondary hover:text-accent transition-colors"
                  title="Randomize seed"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 block mb-1">Physical Description (art style)</label>
              <textarea
                value={dnaDesc}
                onChange={e => setDnaDesc(e.target.value)}
                placeholder="e.g. anime style, dark moody atmosphere, medieval setting, warm color palette..."
                className="w-full px-2 py-1.5 bg-bg-secondary rounded-lg text-xs text-text-primary border border-divider focus:border-accent focus:outline-none resize-none h-16 placeholder:text-text-secondary/40"
              />
            </div>
            <button
              onClick={handleSaveDNA}
              className="w-full py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              Save DNA
            </button>
          </div>
        )}
      </div>

      {/* ─── Character Gallery (Whisk AI-style) ─── */}
      <div>
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1">Characters</h4>
        {novelChars.length === 0 ? (
          <p className="text-text-secondary/50 text-xs text-center py-3">Add characters in the Characters tab first</p>
        ) : (
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
            {novelChars.map(char => {
              const charImgs = novelImages.filter(img => img.characterId === char.id);
              const latestImg = charImgs[charImgs.length - 1];
              const isSelected = selectedCharId === char.id;

              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharId(isSelected ? '' : char.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-accent/15 border border-accent/40'
                      : 'hover:bg-bg-tertiary/30 border border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/10">
                    {latestImg ? (
                      <img src={latestImg.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                        {char.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-medium truncate">{char.name}</p>
                    <p className="text-[10px] text-text-secondary truncate">{char.role}</p>
                  </div>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Scene Prompt & Generate ─── */}
      <div className="space-y-2">
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wider px-1">Generate Illustration</h4>
        <textarea
          value={scenePrompt}
          onChange={e => setScenePrompt(e.target.value)}
          placeholder="Describe the scene... e.g. 'standing on a cliff overlooking a burning city at sunset'"
          className="w-full px-3 py-2 bg-bg-secondary rounded-xl text-xs text-text-primary border border-divider focus:border-accent focus:outline-none resize-none h-16 placeholder:text-text-secondary/40"
        />
        <button
          onClick={handleGenerate}
          disabled={!scenePrompt.trim() || isGenerating}
          className="image-creator-btn w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={14} />
              Generate Image
            </>
          )}
        </button>
      </div>

      {/* ─── Generated Image Preview ─── */}
      {generatedUrl && (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-bg-primary/50 animate-scale-in">
          <div className="relative group">
            <img
              ref={imgRef}
              src={generatedUrl}
              alt="Generated illustration"
              className="w-full aspect-[3/4] object-cover cursor-grab"
              draggable
              onDragStart={e => handleDragStart(e, generatedUrl)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={handleInsert}
                className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors flex items-center gap-1"
              >
                <Plus size={12} /> Insert
              </button>
              <button
                onClick={handleRegenerate}
                className="px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={12} /> Regenerate
              </button>
            </div>
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white/70">
              <GripVertical size={10} /> Drag to insert
            </div>
          </div>
          <div className="px-3 py-2 flex items-center gap-1">
            <button
              onClick={handleInsert}
              className="flex-1 py-1.5 bg-accent/15 text-accent text-[11px] font-semibold rounded-lg hover:bg-accent/25 transition-colors flex items-center justify-center gap-1"
            >
              <ImageIcon size={12} /> Add to Novel
            </button>
          </div>
        </div>
      )}

      {/* ─── Recent Character Images ─── */}
      {novelImages.length > 0 && (
        <div>
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1">Recent Images</h4>
          <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
            {novelImages.slice().reverse().slice(0, 8).map(img => (
              <div
                key={img.id}
                className="relative group rounded-lg overflow-hidden border border-white/5 cursor-grab"
                draggable
                onDragStart={e => handleDragStart(e, img.imageUrl)}
              >
                <img src={img.imageUrl} alt={img.characterName} className="w-full aspect-square object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <p className="text-[9px] text-white font-medium">{img.characterName}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onInsertImage(img.imageUrl)}
                      className="p-1 bg-accent rounded text-white"
                      title="Insert"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      onClick={() => deleteCharacterImage(img.id)}
                      className="p-1 bg-red-600/80 rounded text-white"
                      title="Delete"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
