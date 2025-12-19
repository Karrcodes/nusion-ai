import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const AuthForms = ({ type, mode }) => {
    const navigate = useNavigate();
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
                to="/auth"
                className="absolute top-8 left-8 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 font-mono text-sm"
            >
                ← Back
            </Link>

            <div className="glass-panel p-6 md:p-10 w-full max-w-md relative overflow-hidden">
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
