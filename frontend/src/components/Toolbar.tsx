import { Menu } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { useState } from 'react';

interface ToolbarProps {
  onToggleCatalog?: () => void;
  onGeneratePhoto?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function Toolbar({ onToggleCatalog, onGeneratePhoto, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
  const { saveSession, reset, hasPhoto, state } = useRoom();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xs border-b border-sand-200">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sand-200 text-stoneink grid place-items-center shadow-soft">FS</div>
          <div>
            <h1 className="font-display text-xl text-stoneink tracking-tight">Furniture Swap</h1>
            <p className="text-xs text-sand-700 -mt-0.5">AI-Powered Room Design</p>
          </div>
          <span className="ml-3 inline-flex items-center gap-1 pill bg-blush/60 text-sand-800">
            <span className="h-2 w-2 rounded-full bg-green-500"></span> Ready
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary focus-ring" onClick={reset}>+ New Room</button>
          <button 
            className="btn-secondary focus-ring disabled:opacity-50" 
            disabled={!canUndo} 
            onClick={onUndo}
            title="Undo"
          >
            ↶
          </button>
          <button 
            className="btn-secondary focus-ring disabled:opacity-50" 
            disabled={!canRedo} 
            onClick={onRedo}
            title="Redo"
          >
            ↷
          </button>
          <button className="btn-primary focus-ring disabled:opacity-50" disabled={!state.selectedItem} onClick={onGeneratePhoto}>Generate Photo</button>
          <button className="btn-secondary focus-ring disabled:opacity-50" disabled={!hasPhoto} onClick={saveSession}>Save My Room</button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {onToggleCatalog && (
            <button
              onClick={onToggleCatalog}
              className="p-2 bg-sand-100 hover:bg-sand-200 text-sand-700 rounded-xl focus-ring"
              aria-label="Toggle catalog"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-sand-100 hover:bg-sand-200 text-sand-700 rounded-xl focus-ring"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-sand-200">
          <div className="flex flex-col space-y-2">
            <button className="btn-secondary focus-ring" onClick={() => { reset(); setIsMobileMenuOpen(false); }}>+ New Room</button>
            <button className="btn-primary focus-ring disabled:opacity-50" disabled={!state.selectedItem} onClick={() => { onGeneratePhoto?.(); setIsMobileMenuOpen(false); }}>Generate Photo</button>
            <button className="btn-secondary focus-ring disabled:opacity-50" disabled={!hasPhoto} onClick={() => { saveSession(); setIsMobileMenuOpen(false); }}>Save My Room</button>
          </div>
        </div>
      )}
    </header>
  );
}
