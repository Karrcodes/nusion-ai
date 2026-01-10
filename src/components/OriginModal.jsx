import { useEffect, useState, useRef } from 'react';
import createGlobe from 'cobe';

const OriginModal = ({ isOpen, onClose, course }) => {
    const [isVisible, setIsVisible] = useState(false);
    const canvasRef = useRef();
    const scrollRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Derived Coordinates (Mapping 0-100% to approximate Lat/Lon for visual effect)
    // x (0-100) -> phi (Longitude) - roughly mapping 0 to -PI and 100 to PI
    // y (0-100) -> theta (Latitude) - roughly mapping 0 to 0 (North) and 100 to PI (South)
    const targetX = course.origin?.coordinates?.x || 50;
    const targetY = course.origin?.coordinates?.y || 50;

    // Convert to Radians for Cobe
    const basePhi = (targetX / 100) * Math.PI * 2;
    const baseTheta = (targetY / 100) * Math.PI;

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    // Initialize Globe
    useEffect(() => {
        let phi = 0;
        let width = 0;

        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
        window.addEventListener('resize', onResize);
        onResize();

        // Cobe Config
        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: basePhi + 0.5, // Start offset
            theta: 0.3, // Start viewing from slight angle
            dark: 1, // Dark Mode
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.05, 0.05, 0.05], // Very dark grey/black
            markerColor: [0.83, 0.68, 0.21], // #d4af37 Gold
            glowColor: [0.1, 0.1, 0.1],
            markers: [
                { location: [baseTheta * (180 / Math.PI) - 90, basePhi * (180 / Math.PI)], size: 0.1 } // Convert back to deg for markers? Cobe uses lat/lon in degrees for markers
                // Wait, Cobe docs says markers are [lat, lon] in degrees.
                // Our baseTheta is 0-PI (0 is North Pole, PI is South). Lat is 90 to -90.
                // Lat = 90 - (targetY / 100 * 180).
                // Lon = (targetX / 100 * 360) - 180.
            ],
            onRender: (state) => {
                // Interactive Rotation based on Scroll
                // We want the globe to rotate towards the target as user scrolls down

                // Current State
                state.phi = (basePhi + 1) - (scrollProgress * 1); // Rotate 1 radian over scroll
                state.theta = 0.3 + (scrollProgress * (baseTheta - 0.3)); // Tilt towards target latitude

                // Continuous slow spin
                state.phi += 0.001;
                state.width = width * 2;
                state.height = width * 2;
            }
        });

        setTimeout(() => globe.resize(), 10);

        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
        };
    }, [scrollProgress, basePhi, baseTheta]);

    // Handle Scroll Parallax
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const progress = scrollTop / (scrollHeight - clientHeight);
            setScrollProgress(progress);
        }
    };

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-black/95 backdrop-blur-xl opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
                }`}
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-5xl h-[85vh] bg-[#050505] border border-white/10 rounded-none md:rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.1)] transition-all duration-700 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background Noise with Radial Gradient */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_#1a1a1a_0%,_#000_100%)] opacity-50 z-0"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all duration-300 group"
                >
                    <span className="text-xl leading-none mb-1">×</span>
                </button>

                <div className="relative z-10 w-full h-full flex flex-col md:flex-row">

                    {/* Left Panel: Scrollable Content */}
                    <div className="w-full md:w-[45%] h-full relative z-20 pointer-events-none">
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="absolute inset-0 overflow-y-auto no-scrollbar pointer-events-auto p-10 md:p-16"
                        >
                            <div className="min-h-[120%] pb-20">
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
                                                LAT {course.origin?.coordinates?.x}°
                                            </p>
                                            <p className="text-[var(--color-gold)] text-xs tracking-widest font-mono">
                                                LON {course.origin?.coordinates?.y}°
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
                                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
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
                    </div>

                    {/* Right Panel: COBE Globe */}
                    <div className="w-full md:w-[55%] h-[40vh] md:h-full absolute md:relative top-0 right-0 z-0 flex items-center justify-center overflow-hidden">
                        <div className="relative w-full h-full max-w-[600px] max-h-[600px] flex items-center justify-center">
                            <canvas
                                ref={canvasRef}
                                style={{ width: 600, height: 600, maxWidth: '100%', aspectRatio: '1' }}
                                className="opacity-80 mix-blend-screen transition-opacity duration-1000 ease-in"
                            />

                            {/* Overlay Gradient for Fade effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none md:hidden"></div>
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
    );
};

export default OriginModal;
