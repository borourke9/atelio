import React from 'react';

interface StepGuideProps {
  currentStep: number;
}

export function StepGuide({ currentStep }: StepGuideProps) {
  const steps = [
    {
      number: 1,
      title: 'Upload Room',
      description: 'Upload a clear photo of your room',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      number: 2,
      title: 'Choose Furniture',
      description: 'Select a product from the catalog',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      number: 3,
      title: 'Place in Scene',
      description: 'Click where you want to place the furniture',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    {
      number: 4,
      title: 'Create Composite',
      description: 'AI creates your new room design',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative max-w-7xl mx-auto px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">Follow these simple steps to create your perfect room design</p>
        </div>
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center group">
                  <div className={`
                    w-20 h-20 rounded-3xl flex items-center justify-center text-lg font-bold transition-all duration-500 shadow-2xl relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-white scale-110 shadow-emerald-500/50' 
                      : isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-105 shadow-green-500/50' 
                        : 'bg-white/10 backdrop-blur-sm text-white/60 border border-white/20 hover:bg-white/20'
                    }
                  `}>
                    {/* Animated background for active step */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 animate-pulse"></div>
                    )}
                    
                    <div className="relative z-10">
                      {isCompleted ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="scale-110 group-hover:scale-125 transition-transform duration-300">
                          {step.icon}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                      isActive 
                        ? 'text-emerald-400' 
                        : isCompleted 
                          ? 'text-green-400' 
                          : 'text-white/70 group-hover:text-white'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-sm max-w-32 leading-relaxed transition-colors duration-300 ${
                      isActive 
                        ? 'text-emerald-300' 
                        : isCompleted 
                          ? 'text-green-300' 
                          : 'text-white/50 group-hover:text-white/70'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="relative mx-8">
                    <div className={`w-32 h-1 rounded-full transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                        : 'bg-white/20'
                    }`} />
                    {/* Animated progress indicator */}
                    {isCompleted && (
                      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full animate-pulse"></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
