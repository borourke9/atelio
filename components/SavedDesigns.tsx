/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { SavedDesign } from '../types';

interface SavedDesignsProps {
  designs: SavedDesign[];
  onLoad: (id: number) => void;
  onDelete: (id: number) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const SavedDesigns: React.FC<SavedDesignsProps> = ({ designs, onLoad, onDelete }) => {
  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-extrabold text-center mb-8 text-zinc-800">Load a Saved Design</h2>
      {designs.length === 0 ? (
        <p className="text-center text-zinc-500">You have no saved designs yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-zinc-200 flex flex-col group transition-shadow hover:shadow-xl">
              <div className="aspect-video w-full bg-zinc-100 relative">
                <img src={design.sceneImage} alt="Saved scene" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(design.id);
                        }}
                        className="p-1.5 bg-white/70 hover:bg-red-500 hover:text-white rounded-full text-zinc-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Delete design"
                    >
                        <TrashIcon />
                    </button>
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <p className="text-sm font-semibold text-zinc-800 truncate" title={design.productName}>
                        Using: {design.productName}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                        Saved: {new Date(design.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <button
                  onClick={() => onLoad(design.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors mt-4"
                >
                  Load
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedDesigns;
