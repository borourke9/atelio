import { Menu } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { useState } from 'react';

interface ToolbarProps {
  onToggleCatalog?: () => void;
}

export function Toolbar({ onToggleCatalog }: ToolbarProps) {
  const { saveSession, reset, hasPhoto } = useRoom();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="backdrop-blur-md bg-white/70 shadow-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">FS</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Furniture Swap</h1>
                <p className="text-sm text-gray-600">AI-Powered Room Design</p>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Ready</span>
            </div>
          </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Start new room design"
              >
                + New Room
              </button>
              
              <button
                onClick={saveSession}
                disabled={!hasPhoto}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Save current room design"
              >
                Save My Room
              </button>
            </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {onToggleCatalog && (
              <button
                onClick={onToggleCatalog}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle catalog"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/20">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    reset();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  + New Room
                </button>
                
                <button
                  onClick={() => {
                    saveSession();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={!hasPhoto}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save My Room
                </button>
              </div>
            </div>
          )}
      </div>
    </header>
  );
}
