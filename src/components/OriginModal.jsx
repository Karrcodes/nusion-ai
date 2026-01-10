import { useEffect, useState } from 'react';

const OriginModal = ({ isOpen, onClose, course }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-black/90 backdrop-blur-xl opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
                }`}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-4xl h-[80vh] bg-[#0f0f13] border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Map (Abstract Dark World Map) */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Abstract Africa/Europe Shape for West African Focus */}
                        <path d="M40,30 Q45,25 55,25 T65,30 T60,50 T55,65 T45,60 T35,50 Z" fill="#333" />
                        <path d="M45,20 Q50,15 55,20 T45,20 Z" fill="#333" opacity="0.5" />
                        {/* Grid Lines */}
                        <line x1="0" y1="20" x2="100" y2="20" stroke="#ffffff10" strokeWidth="0.1" />
                        <line x1="0" y1="40" x2="100" y2="40" stroke="#ffffff10" strokeWidth="0.1" />
                        <line x1="0" y1="60" x2="100" y2="60" stroke="#ffffff10" strokeWidth="0.1" />
                        <line x1="0" y1="80" x2="100" y2="80" stroke="#ffffff10" strokeWidth="0.1" />
                        <line x1="20" y1="0" x2="20" y2="100" stroke="#ffffff10" strokeWidth="0.1" />
                        <line x1="40" y1="0" x2="40" y2="100" stroke="#ffffff10" strokeWidth="0.1" />
                        <line x1="60" y1="0" x2="60" y2="100" stroke="#ffffff10" strokeWidth="0.1" />
                        <line x1="80" y1="0" x2="80" y2="100" stroke="#ffffff10" strokeWidth="0.1" />
                    </svg>
                </div>

                {/* Animated Scanner Effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-gold)] shadow-[0_0_20px_var(--color-gold)] animate-[scan_4s_ease-in-out_infinite] opacity-50" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-white/50 hover:text-white font-cinzel text-xs tracking-widest z-50 mix-blend-difference"
                >
                    CLOSE [X]
                </button>

                {/* Main Content Layout */}
                <div className="relative z-10 w-full h-full flex flex-col md:flex-row">

                    {/* Left Panel: The Story */}
                    <div className="w-full md:w-1/2 h-full p-12 flex flex-col justify-center bg-gradient-to-r from-black via-black/80 to-transparent">
                        <span className="text-[var(--color-gold)] font-cinzel text-xs tracking-[0.4em] mb-4 block animate-[fadeIn_0.5s_delay-100ms]">
                            ORIGIN JOURNEY
                        </span>

                        <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight animate-[slideUp_0.6s_ease-out]">
                            {course.name}
                        </h2>

                        <div className="space-y-6 animate-[fadeIn_0.8s_delay-300ms]">
                            <div>
                                <h4 className="text-white/40 text-xs uppercase tracking-widest mb-2 font-mono">Ingredient Spotlight</h4>
                                <p className="text-xl text-[var(--color-gold)] font-serif italic">
                                    {course.origin?.ingredient || "Secret Ingredient"}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-white/40 text-xs uppercase tracking-widest mb-2 font-mono">Region</h4>
                                <p className="text-white text-lg">
                                    {course.origin?.region || "Unknown Origin"}
                                </p>
                            </div>

                            <p className="text-white/70 leading-relaxed font-light border-l-2 border-[var(--color-gold)]/30 pl-6 py-2">
                                {course.originStory}
                            </p>

                            <div className="pt-6 mt-6 border-t border-white/10">
                                <h4 className="text-white/40 text-xs uppercase tracking-widest mb-2 font-mono">Sommelier Pairing</h4>
                                <p className="text-white font-cinzel">
                                    {course.pairing}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: The Map Visual */}
                    <div className="w-full md:w-1/2 h-full relative flex items-center justify-center overflow-hidden">

                        {/* The Pulse Point */}
                        {course.origin?.coordinates && (
                            <div
                                className="absolute w-6 h-6 z-20"
                                style={{
                                    left: `${course.origin.coordinates.x}%`,
                                    top: `${course.origin.coordinates.y}%`
                                }}
                            >
                                <div className="absolute inset-0 bg-[var(--color-gold)] rounded-full animate-ping opacity-75" />
                                <div className="absolute inset-2 bg-[var(--color-gold)] rounded-full border-2 border-black shadow-[0_0_20px_var(--color-gold)]" />

                                {/* Connecting Line */}
                                <div className="absolute top-1/2 left-full w-[200px] h-[1px] bg-gradient-to-r from-[var(--color-gold)] to-transparent origin-left rotate-[-15deg] animate-[growLine_1s_ease-out]" />
                            </div>
                        )}

                        {/* Floating Ingredient Image (if available or stylized graphic) */}
                        <div className="text-[10rem] opacity-5 blur-sm select-none pointer-events-none animate-pulse">
                            🌍
                        </div>

                        {/* Coordinates Display */}
                        <div className="absolute bottom-8 right-8 font-mono text-[10px] text-[var(--color-gold)]/50 tracking-widest tabular-nums">
                            LOC: {course.origin?.coordinates?.x || 0}°N / {course.origin?.coordinates?.y || 0}°W
                            <br />
                            ALT: 240m // PRECISION: HIGH
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OriginModal;
