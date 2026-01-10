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
                className={`relative w-full max-w-5xl h-[85vh] bg-[#050505] border border-white/10 rounded-none md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-700 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Texture (Noise/Grain) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Background Map (Abstract Dark World Map) - Holographic Feel */}
                <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-screen">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Abstract Africa/Europe Shape for West African Focus */}
                        <path d="M40,30 Q45,25 55,25 T65,30 T60,50 T55,65 T45,60 T35,50 Z" fill="#1a1a1a" stroke="#333" strokeWidth="0.2" />
                        <path d="M45,20 Q50,15 55,20 T45,20 Z" fill="#1a1a1a" opacity="0.5" />
                        {/* Grid Lines - Cyan/Teal tint for tech luxury */}
                        <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                        <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                        <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                        <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                        <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                        <line x1="40" y1="0" x2="40" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                        <line x1="60" y1="0" x2="60" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                        <line x1="80" y1="0" x2="80" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.1" />
                    </svg>
                </div>

                {/* Animated Scanner Effect - Vertical Scan */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent shadow-[0_0_20px_var(--color-gold)] animate-[scan_4s_linear_infinite] opacity-30 pointer-events-none" />

                {/* Close Button - Minimalist */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 md:top-8 md:right-8 group flex items-center gap-2 z-50 transition-all hover:opacity-100 opacity-60"
                >
                    <span className="text-[10px] text-white font-cinzel tracking-[0.3em] group-hover:text-[var(--color-gold)] transition-colors">CLOSE</span>
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[var(--color-gold)] transition-colors">
                        <span className="text-white text-xs group-hover:text-[var(--color-gold)]">×</span>
                    </div>
                </button>

                {/* Main Content Layout */}
                <div className="relative z-10 w-full h-full flex flex-col md:flex-row">

                    {/* Left Panel: The Story - SCROLLABLE & FROSTED */}
                    <div className="w-full md:w-[45%] h-full relative border-r border-white/5 bg-black/40 backdrop-blur-md">
                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8 md:p-12">
                            <div className="min-h-full flex flex-col justify-center">
                                <span className="text-[var(--color-gold)] font-cinzel text-[9px] tracking-[0.4em] mb-6 block animate-[fadeIn_0.5s_delay-100ms] uppercase opacity-80 border-b border-[var(--color-gold)]/20 pb-2 w-max">
                                    Origin Authenticated
                                </span>

                                <h2 className="text-3xl md:text-5xl font-serif text-white mb-2 leading-[1.1] animate-[slideUp_0.6s_ease-out]">
                                    {course.name}
                                </h2>
                                <p className="text-white/40 font-mono text-[10px] tracking-widest mb-10">
                                    REF: {course.id?.toUpperCase() || 'CX-00'} // BATCH: {new Date().getFullYear()}
                                </p>

                                <div className="space-y-10 animate-[fadeIn_0.8s_delay-300ms]">
                                    {/* Ingredient Spotlight */}
                                    <div className="group">
                                        <h4 className="text-white/30 text-[9px] uppercase tracking-[0.2em] mb-3 font-cinzel flex items-center gap-2">
                                            <span className="w-1 h-1 bg-[var(--color-gold)] rounded-full"></span>
                                            Key Ingredient
                                        </h4>
                                        <p className="text-2xl text-white font-serif italic border-l-2 border-[var(--color-gold)] pl-4 py-1">
                                            {course.origin?.ingredient || "Secret Composition"}
                                        </p>
                                    </div>

                                    {/* Region */}
                                    <div>
                                        <h4 className="text-white/30 text-[9px] uppercase tracking-[0.2em] mb-3 font-cinzel flex items-center gap-2">
                                            <span className="w-1 h-1 bg-[var(--color-gold)] rounded-full"></span>
                                            Sourcing Region
                                        </h4>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-2xl md:text-3xl text-white font-cinzel tracking-wide">
                                                {course.origin?.region?.split(',')[0]}
                                            </span>
                                            <span className="text-white/40 font-light text-sm uppercase tracking-widest">
                                                {course.origin?.region?.split(',')[1] || ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Narrative */}
                                    <div className="bg-white/5 p-6 rounded-sm border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-gold)] opacity-50"></div>
                                        <p className="text-white/70 leading-relaxed font-light text-sm md:text-base">
                                            {course.originStory}
                                        </p>
                                    </div>

                                    {/* Pairing */}
                                    <div className="pt-6 border-t border-white/10">
                                        <h4 className="text-white/30 text-[9px] uppercase tracking-[0.2em] mb-2 font-cinzel">Sommelier Pairing</h4>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[var(--color-gold)] font-cinzel tracking-widest text-sm">
                                                {course.pairing}
                                            </p>
                                            <span className="text-white/20 text-xs">Recommended 12°C</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: The Map Visual - Clean & Tech */}
                    <div className="w-full md:w-[55%] h-[300px] md:h-full relative flex items-center justify-center overflow-hidden bg-[#0a0a0c]">

                        {/* The Pulse Point */}
                        {course.origin?.coordinates && (
                            <div
                                className="absolute w-4 h-4 z-20 transition-all duration-1000 ease-out"
                                style={{
                                    left: `${course.origin.coordinates.x}%`,
                                    top: `${course.origin.coordinates.y}%`
                                }}
                            >
                                {/* Concentric Rings */}
                                <div className="absolute inset-0 bg-[var(--color-gold)] rounded-full animate-ping opacity-50" />
                                <div className="absolute -inset-4 border border-[var(--color-gold)] rounded-full animate-[ping_2s_infinite] opacity-20" />
                                <div className="absolute -inset-8 border border-[var(--color-gold)] rounded-full animate-[ping_3s_infinite] opacity-10" />

                                <div className="absolute inset-0 bg-[var(--color-gold)] rounded-full shadow-[0_0_30px_var(--color-gold)]" />

                                {/* Connecting Line & Label */}
                                <div className="absolute top-1/2 left-6 w-[1px] h-[60px] bg-gradient-to-b from-[var(--color-gold)] to-transparent origin-top rotate-[30deg]" />
                                <div className="absolute top-[60px] left-[40px] text-[9px] text-[var(--color-gold)] font-mono tracking-widest whitespace-nowrap opacity-0 animate-[fadeIn_0.5s_delay-500ms_forwards]">
                                    TARGET: {course.origin?.region?.toUpperCase()}
                                </div>
                            </div>
                        )}

                        {/* Floating Ingredient Image (if available or stylized graphic) */}
                        <div className="text-[12rem] opacity-[0.02] blur-sm select-none pointer-events-none animate-pulse grayscale">
                            🌍
                        </div>

                        {/* Coordinates Display - HUD Style */}
                        <div className="absolute bottom-10 right-10 font-mono text-[9px] text-[var(--color-gold)]/40 tracking-[0.2em] text-right leading-loose">
                            LOC: {course.origin?.coordinates?.x || 0}°N <br />
                            LON: {course.origin?.coordinates?.y || 0}°W <br />
                            PRECISION: HIGH_RES <br />
                            SOURCE: {course.origin?.region?.toUpperCase().slice(0, 10)}...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OriginModal;
