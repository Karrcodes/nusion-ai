import React from 'react';

const Welcome = ({ user, onContinue }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary p-4 animate-[fadeIn_0.8s]">
            {/* Background Effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-wa/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-jp/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="glass-panel p-12 max-w-lg w-full text-center relative overflow-hidden flex flex-col items-center">

                {/* Success Icon */}
                <div className="w-24 h-24 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-8 animate-[scaleIn_0.5s_ease-out_0.2s] relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75"></div>
                    <svg className="w-12 h-12 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>

                <h1 className="text-4xl font-display font-bold text-text-primary mb-4 animate-[slideUp_0.6s_ease-out_0.3s]">
                    Email Verified!
                </h1>

                <p className="text-lg text-text-secondary leading-relaxed mb-10 animate-[slideUp_0.6s_ease-out_0.4s]">
                    Welcome to <span className="text-text-primary font-bold">Nusion AI</span>.
                    <br />
                    Your account has been successfully confirmed. You are now ready to access the underlying generative engine.
                </p>

                <div className="w-full bg-bg-secondary/30 rounded-xl p-6 mb-10 border border-glass-border animate-[slideUp_0.6s_ease-out_0.5s]">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-accent-wa/20 flex items-center justify-center text-accent-wa font-bold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-text-secondary uppercase tracking-wider font-mono">Logged in as</p>
                            <p className="text-text-primary font-bold">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onContinue}
                    className="w-full py-4 bg-text-primary text-bg-primary rounded-lg font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 animate-[slideUp_0.6s_ease-out_0.6s]"
                >
                    Continue to Dashboard
                </button>

            </div>
        </div>
    );
};

export default Welcome;
