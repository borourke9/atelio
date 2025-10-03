/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
    </svg>
);

const RedoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface UndoRedoControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border shadow-sm";
  const activeClasses = "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50";
  const disabledClasses = "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed";

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`${baseClasses} ${canUndo ? activeClasses : disabledClasses}`}
        aria-label="Undo last action"
      >
        <UndoIcon />
        Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`${baseClasses} ${canRedo ? activeClasses : disabledClasses}`}
        aria-label="Redo last action"
      >
        Redo
        <RedoIcon />
      </button>
    </div>
  );
};

export default UndoRedoControls;