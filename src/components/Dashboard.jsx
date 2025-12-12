
const Dashboard = ({ onSelect, onHome, user, onProfile }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center p-8 animate-[fadeIn_0.5s] relative">

            {/* Top Navigation */}
            <nav className="w-full max-w-7xl flex justify-between items-center mb-12 relative z-50">
                <button
                    onClick={onHome}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors group"
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="text-sm font-mono uppercase tracking-widest hidden md:inline">Back Home</span>
                </button>

                <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={onHome} title="Return to Home">
                    <img src="/nusion-logo.png" alt="Nusion" className="h-10 w-auto opacity-90" style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(13%) saturate(928%) hue-rotate(338deg) brightness(96%) contrast(90%)' }} />
                    <span className="font-display font-medium text-xl text-text-primary tracking-wide opacity-80 pt-1">AI</span>
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <div
                            onClick={onProfile}
                            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md ${(() => {
                                    try {
                                        const stored = localStorage.getItem(`diner_preferences_${user.id}`);
                                        return stored && JSON.parse(stored).photo ? 'border-2 border-accent-wa/50 p-0 overflow-hidden' : 'bg-accent-wa/20 text-accent-wa font-bold hover:bg-accent-wa hover:text-white border border-accent-wa/50';
                                    } catch (e) { return 'bg-accent-wa/20 text-accent-wa font-bold hover:bg-accent-wa hover:text-white border border-accent-wa/50'; }
                                })()
                                }`}
                            title="Go to My Palate"
                        >
                            {(() => {
                                try {
                                    const stored = localStorage.getItem(`diner_preferences_${user.id}`);
                                    const photo = stored ? JSON.parse(stored).photo : null;
                                    return photo ? (
                                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                                    );
                                } catch (e) {
                                    return user.name ? user.name.charAt(0).toUpperCase() : 'U';
                                }
                            })()}
                        </div>
                    )}
                </div>
            </nav>


            <header className="text-center mb-16 animate-[fadeIn_1s] flex flex-col items-center mt-8">
                <p className="text-sm uppercase tracking-[0.3em] text-text-secondary opacity-70">
                    Select Your Muse
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
                                Enter Studio
                            </span>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Card */}
                <div className="relative h-[400px] rounded-3xl overflow-hidden border-2 border-dashed border-text-secondary/20 flex flex-col items-center justify-center bg-bg-secondary/30">
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

export default Dashboard;
