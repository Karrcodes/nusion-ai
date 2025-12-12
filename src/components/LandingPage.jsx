
const LandingPage = ({ onSelect }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-8">
            <header className="text-center mb-16 animate-[fadeIn_1s] flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <img
                        src="/nusion-logo.png"
                        alt="Nusion Logo"
                        className="h-16 w-auto"
                        style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(13%) saturate(928%) hue-rotate(338deg) brightness(96%) contrast(90%)' }}
                    />
                    <span className="text-4xl font-bold text-text-primary tracking-tighter">AI</span>
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-text-secondary opacity-70">
                    Generative Gastronomy
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Ikoyi Card (Active) */}
                <div
                    onClick={() => onSelect('ikoyi')}
                    className="group cursor-pointer relative h-[400px] rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                >
                    <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-black/40 transition-colors duration-500"></div>
                    <img
                        src="/ikoyi-interior.png"
                        alt="Ikoyi Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                    />

                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-10">
                        <div className="absolute top-10 left-10 right-10 h-1 bg-gradient-to-r from-accent-wa to-accent-jp opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="text-center transform transition-transform duration-500 group-hover:-translate-y-4 flex flex-col items-center mt-10">
                            <img src="/logo.png" alt="IKOYI" className="h-16 w-auto brightness-0 invert mb-4" />
                            <p className="text-white/70 uppercase tracking-widest text-xs">London • Hyper-Seasonal Spice</p>
                        </div>

                        <div className="absolute bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 text-center">
                            <span className="inline-block px-6 py-2 border border-white/30 rounded-full text-white text-sm uppercase tracking-wider backdrop-blur-md">
                                Enter Experience
                            </span>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Card */}
                <div className="relative h-[400px] rounded-3xl overflow-hidden border-2 border-dashed border-black/10 flex flex-col items-center justify-center bg-black/5 opacity-50">
                    <h3 className="text-2xl font-display font-bold text-text-secondary mb-2">Coming Soon</h3>
                    <p className="text-xs uppercase tracking-widest text-text-secondary/50">New Brand</p>
                </div>
            </div>

            <footer className="absolute bottom-8 text-xs text-text-secondary/40 font-mono">
                Studio AikinKarr 2026 copyright
            </footer>
        </div>
    );
};

export default LandingPage;
