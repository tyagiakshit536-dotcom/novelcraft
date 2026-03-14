import { useState } from 'react';
import { Pencil, Highlighter, PenTool, X } from 'lucide-react';

const PENCIL_COLORS = ['#E24A4A', '#F06B6B', '#C73636', '#E2B04A', '#FF8A6B', '#B33939', '#FFFFFF', '#888888'];
const HIGHLIGHTER_COLORS = ['rgba(226,74,74,0.3)', 'rgba(240,107,107,0.3)', 'rgba(199,54,54,0.3)', 'rgba(226,176,74,0.3)', 'rgba(255,138,107,0.3)'];

interface DrawingToolbarProps {
  onColorSelect?: (color: string, tool: 'pencil' | 'highlighter' | 'sketch') => void;
}

export default function DrawingToolbar({ onColorSelect }: DrawingToolbarProps) {
  const [activeTool, setActiveTool] = useState<'pencil' | 'highlighter' | 'sketch' | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [activeColor, setActiveColor] = useState(PENCIL_COLORS[0]);

  const tools = [
    { key: 'pencil' as const, icon: Pencil, label: 'Pencil', colors: PENCIL_COLORS },
    { key: 'highlighter' as const, icon: Highlighter, label: 'Highlighter', colors: HIGHLIGHTER_COLORS },
    { key: 'sketch' as const, icon: PenTool, label: 'Sketch', colors: PENCIL_COLORS },
  ];

  const handleToolClick = (tool: typeof tools[0]) => {
    if (activeTool === tool.key) {
      setActiveTool(null);
      setShowPalette(false);
    } else {
      setActiveTool(tool.key);
      setShowPalette(true);
    }
  };

  const handleColorClick = (color: string) => {
    setActiveColor(color);
    if (activeTool) {
      onColorSelect?.(color, activeTool);
    }
  };

  return (
    <div className="relative flex items-center gap-0.5">
      {tools.map(tool => (
        <button
          key={tool.key}
          onClick={() => handleToolClick(tool)}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors relative ${
            activeTool === tool.key
              ? 'bg-accent/15 text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
          }`}
          title={tool.label}
        >
          <tool.icon size={16} />
          {activeTool === tool.key && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: activeColor }} />
          )}
        </button>
      ))}

      {/* Color Palette Popup */}
      {showPalette && activeTool && (
        <div className="absolute top-full mt-2 left-0 glass-card p-2 animate-scale-in z-50 flex items-center gap-1.5">
          {(activeTool === 'highlighter' ? HIGHLIGHTER_COLORS : PENCIL_COLORS).map(color => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                activeColor === color ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ background: color }}
            />
          ))}
          <button
            onClick={() => { setShowPalette(false); setActiveTool(null); }}
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors ml-1"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
