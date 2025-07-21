"use client";
import { useSound } from "./SoundContext";

export default function TillHeaderClient({ onShowFilters }: { onShowFilters: () => void }) {
  const { soundEnabled, setSoundEnabled } = useSound();
  return (
    <div className="flex items-center space-x-4 md:ml-auto">
      <button
        onClick={onShowFilters}
        className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-1 rounded-lg text-sm font-medium"
      >
        Show Search & Filters
      </button>
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={`border border-gray-600 px-3 py-1 rounded-lg transition-all duration-200 text-sm font-medium ml-2 ${
          soundEnabled
            ? 'text-green-400 border-green-500/30 bg-green-500/10'
            : 'text-gray-400 border-gray-600 bg-gray-800'
        }`}
      >
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </button>
      <div className="text-right hidden md:block">
        <p className="text-sm text-gray-300">Staff Portal</p>
        <p className="text-sm font-medium text-yellow-400">Till Access</p>
      </div>
    </div>
  );
} 