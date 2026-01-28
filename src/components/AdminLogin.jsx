import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'nusion2026';
    const MAX_ATTEMPTS = 3;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLocked) {
            setError('Too many failed attempts. Please refresh the page to try again.');
            return;
        }

        if (passcode === ADMIN_PASSCODE) {
            // Set admin session (expires when browser closes)
            sessionStorage.setItem('nusion_admin_session', 'true');
            sessionStorage.setItem('nusion_admin_timestamp', Date.now().toString());

            // Redirect to Owner Portal
            navigate('/portal/owner');
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                setIsLocked(true);
                setError('Access locked. Please refresh the page to try again.');
            } else {
                setError(`Incorrect passcode. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
            }

            setPasscode('');
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#f5f5f5_0%,_#ffffff_100%)]" />

            {/* Animated Background Orbs */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-accent-jp/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-wa/5 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Login Card */}
            <div className="relative z-10 glass-panel p-8 md:p-12 w-full max-w-md rounded-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <img
                            src="/nusion-logo.png"
                            alt="Nusion"
                            className="h-10 w-auto opacity-90"
                            style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(13%) saturate(928%) hue-rotate(338deg) brightness(96%) contrast(90%)' }}
                        />
                        <span className="font-display font-medium text-2xl text-text-primary tracking-wide opacity-80">AI</span>
                    </div>
                    <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Admin Access</h1>
                    <p className="text-text-secondary text-sm">Enter your passcode to access the Owner Portal</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-text-secondary uppercase tracking-wider">Passcode</label>
                        <input
                            type="password"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-bg-primary/50 border border-glass-border rounded-lg p-4 text-text-primary text-center text-lg tracking-widest focus:border-accent-jp focus:outline-none transition-colors font-mono"
                            disabled={isLocked}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg text-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLocked || !passcode}
                        className="w-full py-4 bg-text-primary text-bg-primary rounded-lg font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                    >
                        {isLocked ? 'Access Locked' : 'Enter Portal'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-glass-border text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs text-text-secondary hover:text-text-primary transition-colors underline decoration-dotted"
                    >
                        ← Back to Home
                    </button>
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-[10px] text-text-secondary/50 uppercase tracking-widest font-mono">
                        🔒 Secure Access • Session Expires on Browser Close
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
