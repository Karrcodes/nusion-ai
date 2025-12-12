import { useState } from 'react';

const ClocheReveal = ({ image, alt }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <div
            className="w-full h-full relative cursor-pointer group overflow-hidden"
            onClick={() => setIsRevealed(true)}
        >
            {/* The Actual Dish Image (Underneath) */}
            <div className={`w-full h-full transition-all duration-1000 ${isRevealed ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                {image ? (
                    <img
                        src={image}
                        alt={alt}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-20 bg-glass-bg">🍽️</div>
                )}
            </div>

            {/* The Cloche (Overlay) */}
            <div
                className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f0ede5] transition-all duration-1000 ease-in-out ${isRevealed ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
                    }`}
            >
                {/* Simple CSS Cloche Graphic */}
                <div className="relative transform transition-transform duration-300 group-hover:scale-105">
                    {/* Handle */}
                    <div className="w-4 h-4 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 mx-auto -mb-1 relative z-20 shadow-md"></div>
                    {/* Dome */}
                    <div className="w-24 h-16 bg-gradient-to-br from-gray-100 to-gray-300 rounded-t-[50px] shadow-xl border-b-4 border-gray-300"></div>
                </div>
                <p className="mt-4 text-accent-jp text-xs uppercase tracking-widest font-bold opacity-60 animate-pulse">
                    Tap to Reveal
                </p>
            </div>

            {/* Steam Animation (Triggers on reveal) */}
            {isRevealed && (
                <div className="absolute inset-0 pointer-events-none flex justify-center items-end opacity-0 animate-[steam_2s_ease-out_forwards]">
                    <div className="w-8 h-8 bg-white/40 blur-xl rounded-full animate-[rise_2s_infinite]"></div>
                    <div className="w-12 h-12 bg-white/30 blur-2xl rounded-full animate-[rise_2.5s_infinite_0.5s]"></div>
                </div>
            )}
        </div>
    );
};

export default ClocheReveal;
