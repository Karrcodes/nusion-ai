import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const AuthForms = ({ type, mode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const backLink = location.state?.from || '/auth';
    // mode: 'login' or 'signup'
    // type: 'diner' or 'restaurant' (only relevant for signup usually, but we keep context)

    const [isLogin, setIsLogin] = useState(mode === 'login');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        restaurantName: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { email, password, name, restaurantName } = formData;

        try {
            if (isLogin) {
                // --- LOGIN ---
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                // Explicit navigation on success
                if (data?.user) {
                    const userType = data.user.user_metadata?.type || 'diner';
                    if (userType === 'restaurant') {
                        navigate('/dashboard/restaurant');
                    } else {
                        navigate('/dashboard');
                    }
                }

            } else {
                // --- SIGN UP ---
                // We store the user 'type' and 'name' in metadata so it's persisted in Supabase
                const metadata = {
                    type: type,
                    name: type === 'restaurant' ? restaurantName : name
                };

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: metadata,
                        // Prioritize VITE_SITE_URL for production, fallback to origin for local dev
                        emailRedirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}?welcome=true`,
                    }
                });

                if (error) throw error;
                setShowSuccess(true);
            }
        } catch (err) {
            console.error("Auth Error:", err);
            let errorMessage = err.message;
            if (errorMessage.includes("Error sending confirmation email")) {
                errorMessage = "Rate limit exceeded. Please wait a moment before trying again, or check if you've already received a confirmation email.";
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleResendEmail = async () => {
        if (!formData.email) return;
        setResendLoading(true);
        setError(null);
        setResendSuccess(false);

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: formData.email,
                options: {
                    emailRedirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}?welcome=true`
                }
            });

            if (error) throw error;
            setResendSuccess(true);
            // Hide success message after 5 seconds
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (err) {
            console.error("Resend Error:", err);
            let errorMessage = err.message;
            if (errorMessage.includes("rate_limit")) {
                errorMessage = "Too many requests. Please wait a minute before retrying.";
            }
            setError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-primary p-4 animate-[fadeIn_0.5s]">
            <Link
                to={backLink}
                className="absolute top-8 left-8 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 font-mono text-sm"
            >
                ← Back
            </Link>

            <div className="glass-panel p-6 md:p-10 w-full max-w-md relative overflow-hidden rounded-2xl">
                {/* Decorative Background */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-wa/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-jp/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    {showSuccess ? (
                        <div className="text-center animate-[fadeIn_0.5s]">
                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Welcome to Nusion!</h2>
                            <p className="text-text-secondary mb-8">
                                We've sent a confirmation email to <span className="text-text-primary font-bold">{formData.email}</span>. Please verify your account to continue.
                            </p>
                            <button
                                onClick={() => {
                                    setShowSuccess(false);
                                    setIsLogin(true);
                                }}
                                className="w-full py-3 bg-text-primary text-bg-primary rounded font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                            >
                                Back to Login

                            </button>

                            <div className="mt-4 border-t border-glass-border pt-4">
                                <p className="text-xs text-text-secondary mb-2">Didn't receive the email? Check your spam folder or:</p>
                                <button
                                    onClick={handleResendEmail}
                                    disabled={resendLoading || resendSuccess}
                                    className={`text-sm font-bold underline decoration-dotted transition-colors ${resendSuccess ? 'text-green-500 cursor-default no-underline' : 'text-accent-jp hover:text-text-primary'}`}
                                >
                                    {resendLoading ? 'Sending...' : resendSuccess ? '✓ Email Resent!' : 'Resend Confirmation Email'}
                                </button>
                                {error && (
                                    <p className="text-xs text-red-500 mt-2 bg-red-500/10 p-2 rounded">
                                        ⚠️ {error}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-display font-bold text-text-primary mb-2">
                                    {isLogin ? 'Welcome Back' : 'Join Nusion'}
                                </h2>
                                <p className="text-text-secondary text-sm mb-4">
                                    {type === 'restaurant' ? 'Inventory Management & Generative Engine' : 'Personalized Dining & Real-time Booking'}
                                </p>
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded text-left">
                                        ⚠️ {error}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Google Login for Diners */}
                                {type === 'diner' && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const { error } = await supabase.auth.signInWithOAuth({
                                                        provider: 'google',
                                                        options: {
                                                            redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/dashboard`
                                                        }
                                                    });
                                                    if (error) throw error;
                                                } catch (err) {
                                                    console.error("Google Auth Error:", err);
                                                    setError(err.message);
                                                }
                                            }}
                                            className="w-full py-3 bg-white text-gray-700 border border-gray-300 rounded font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-4"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                            {isLogin ? 'Log in with Google' : 'Sign up with Google'}
                                        </button>
                                        <div className="relative flex items-center justify-center py-2 mb-4">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-glass-border"></div>
                                            </div>
                                            <span className="relative bg-bg-primary px-2 text-xs text-text-secondary uppercase">Or</span>
                                        </div>
                                    </>
                                )}

                                {/* Fields only for SIGN UP */}
                                {!isLogin && type === 'restaurant' && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Restaurant Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Ikoyi London"
                                            className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none transition-colors"
                                            value={formData.restaurantName}
                                            onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                                        />
                                    </div>
                                )}

                                {!isLogin && type === 'diner' && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Aikin Karr"
                                            className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-wa focus:outline-none transition-colors"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                )}

                                {/* Common Fields */}
                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-text-secondary uppercase">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-text-secondary focus:outline-none transition-colors"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-text-secondary uppercase">Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-text-secondary focus:outline-none transition-colors"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 mt-6 bg-text-primary text-bg-primary rounded font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError(null);
                                    }}
                                    className="text-sm text-text-secondary hover:text-text-primary underline decoration-dotted"
                                >
                                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthForms;
