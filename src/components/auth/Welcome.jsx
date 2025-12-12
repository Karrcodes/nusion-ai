import React from 'react';

const Welcome = ({ user, onContinue }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary p-4 animate-[fadeIn_0.5s]">
            <div className="glass-panel p-10 w-full max-w-md relative overflow-hidden text-center">
                {/* Decorative Background */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-wa/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-jp/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>

                    <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Email Confirmed!</h2>

                    <p className="text-text-secondary mb-8 leading-relaxed">
                        Your account has been successfully verified. You now have full access to the Nusion Generative Engine.
                    </p>

                    <button
                        onClick={onContinue}
                        className="w-full py-3 bg-text-primary text-bg-primary rounded font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                    >
                        Continue to Dashboard
                    </button>

                    {user?.type === 'diner' && (
                        <p className="mt-4 text-xs text-text-secondary">
                            Next step: Set up your palate profile.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Welcome;
