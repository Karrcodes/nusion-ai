import { useEffect, useState, useRef } from 'react';
import { Globe3D } from './Globe3D';

const OriginModal = ({ isOpen, onClose, course }) => {
    const [isVisible, setIsVisible] = useState(false);
    const scrollRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const velocityValueRef = useRef(0);
    const lastScrollY = useRef(0);
    const scrollTimeout = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.touchAction = 'auto';
            const tm = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(tm);
        }
    }, [isOpen]);

    // Handle Scroll
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;

        // Calculate Velocity for Globe Spin
        const currentScroll = scrollTop;
        const delta = Math.abs(currentScroll - lastScrollY.current);
        // Cap velocity to prevent dizziness, but make it noticeable
        const newVelocity = Math.min(delta, 50);
        velocityValueRef.current = newVelocity; // Update ref directly without re-render

        lastScrollY.current = currentScroll;

        // Reset velocity when scrolling stops
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            velocityValueRef.current = 0;
        }, 50); // Quick reset to detect stop

        if (scrollHeight - clientHeight > 0) {
            const progress = scrollTop / (scrollHeight - clientHeight);
            setScrollProgress(progress);
        }
    };

    // Parallax: Move globe down slightly as we scroll
    const parallaxOffset = scrollProgress * 150;
    const zoomScale = 1 + (scrollProgress * 0.8); // FIXED: Stronger zoom (was 0.2)

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-black/95 backdrop-blur-xl opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
                }`}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-7xl h-[85vh] bg-[#050505] border border-white/10 rounded-none md:rounded-3xl shadow-[0_0_100px_rgba(212,175,55,0.1)] transition-all duration-700 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Scrollable Container Wrapper */}
                <div
                    className="absolute inset-0 overflow-y-auto no-scrollbar scroll-smooth"
                    onScroll={handleScroll}
                >
                    {/* Background Noise used elsewhere */}
                    <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    <div className="fixed inset-0 bg-[radial-gradient(circle_at_right,_#1a1a1a_0%,_#000_100%)] opacity-50 z-0"></div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="fixed top-6 right-6 z-[60] w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all duration-300 group"
                    >
                        <span className="text-xl leading-none mb-1">×</span>
                    </button>

                    <div className="relative z-10 w-full min-h-full flex flex-col md:flex-row">

                        {/* Left Panel: Content */}
                        <div className="w-full md:w-[50%] relative z-20 pointer-events-none pt-10 md:pt-16 pb-20 pl-10 md:pl-16 pr-10 md:pr-24 bg-black/20 backdrop-blur-md border-r border-white/5 rounded-r-3xl">
                            <div className="pointer-events-auto max-w-lg">
                                <span className="text-[var(--color-gold)] font-cinzel text-[10px] tracking-[0.4em] mb-8 block animate-[fadeIn_0.8s_ease-out] border-b border-[var(--color-gold)]/30 pb-4 w-max">
                                    LOG NO. {course.id?.replace(/\D/g, '') || '01'}
                                </span>

                                <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-none animate-[slideUp_0.8s_cubic-bezier(0.16,1,0.3,1)]">
                                    {course.name}
                                </h2>

                                <div className="space-y-20 animate-[fadeIn_1s_delay-200ms]">
                                    {/* Story */}
                                    <div>
                                        <p className="text-white/80 text-lg leading-relaxed font-light">
                                            {course.originStory}
                                        </p>
                                    </div>
                                    {/* The Source */}
                                    <div className="border-l-2 border-[var(--color-gold)] pl-6 transition-all duration-500 hover:pl-8">
                                        <h4 className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-2 font-cinzel">The Source</h4>
                                        <p className="text-3xl text-white font-serif italic mb-1">
                                            {course.origin?.region || "Unknown"}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <p className="text-[var(--color-gold)] text-xs tracking-widest font-mono">
                                                LAT {course.origin?.coordinates?.lat}°
                                            </p>
                                            <p className="text-[var(--color-gold)] text-xs tracking-widest font-mono">
                                                LON {course.origin?.coordinates?.lng}°
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ingredient */}
                                    <div>
                                        <h4 className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-4 font-cinzel">Key botanical</h4>
                                        <div className="w-full h-48 bg-white/5 rounded-lg overflow-hidden relative group border border-white/5">
                                            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition-opacity grayscale hover:grayscale-0 duration-700">
                                                🌿
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full p-4">
                                                <p className="text-xl text-white font-serif">{course.origin?.ingredient}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sommelier */}
                                    <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-gold)] opacity-5 blur-[50px]"></div>
                                        <h4 className="text-[var(--color-gold)] text-[9px] uppercase tracking-[0.2em] mb-4 font-cinzel">Sommelier's Note</h4>
                                        <p className="text-white font-serif text-xl italic mb-2">"{course.pairing}"</p>
                                        <p className="text-white/40 text-xs">Best served in a chilled crystal tulip glass.</p>
                                    </div>
                                    <div className="h-32"></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: CSS TEXTURE GLOBE */}
                        <div className="w-full md:w-[60%] h-[50vh] md:h-auto md:sticky md:top-0 md:self-start z-0 flex items-start justify-center md:-ml-40 mt-10 md:mt-0">
                            <div
                                className="relative flex items-center justify-center md:top-0 mt-12"
                                style={{ transform: `translateY(${parallaxOffset}px) scale(${zoomScale})` }}
                            >
                                {/* THE GLOBE CONTAINER */}
                                <div className="relative w-[500px] h-[500px] rounded-full overflow-hidden shadow-[inset_-60px_-20px_100px_rgba(0,0,0,0.95),_0_0_50px_rgba(0,0,0,0.5)] bg-black group flex items-center justify-center">

                                    <Globe3D
                                        lat={course.origin?.coordinates?.lat || 0}
                                        lng={course.origin?.coordinates?.lng || 0}
                                        velocityRef={velocityValueRef}
                                    />

                                    {/* SCANNER UI: Minimalist Crosshair Overlaid */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-full h-[1px] bg-white/10 absolute top-[50%]"></div>
                                        <div className="h-full w-[1px] bg-white/10 absolute left-[50%]"></div>
                                        <div className="w-[300px] h-[300px] border border-[var(--color-gold)]/30 rounded-full animate-ping-slow opacity-50"></div>
                                    </div>

                                    {/* ATMOSPHERE GLOW */}
                                    <div className="absolute inset-0 rounded-full shadow-[inset_10px_10px_50px_rgba(212,175,55,0.15)] pointer-events-none"></div>
                                </div>
                            </div>

                            {/* Status Overlay */}
                            <div className="absolute bottom-10 right-10 text-right pointer-events-none">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                    <div className="w-1.5 h-1.5 bg-[var(--color-gold)] rounded-full animate-pulse"></div>
                                    <span className="text-[9px] font-mono tracking-widest text-[var(--color-gold)]">LIVE SATELLITE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OriginModal;
