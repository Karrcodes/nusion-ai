import React from 'react';
import { Link } from 'react-router-dom';

const AuthSelection = ({ onSelect }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-bg-primary animate-[fadeIn_0.5s]">
            <Link
                to="/"
                className="absolute top-8 left-8 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
            >
                ← Back
            </Link>

            <h2 className="text-4xl font-display font-bold text-text-primary mb-12">Choose your path</h2>

            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">

                {/* Restaurant Card */}
                <div
                    onClick={() => onSelect('restaurant')}
                    className="glass-panel p-12 flex flex-col items-center text-center cursor-pointer hover:-translate-y-2 transition-transform duration-300 group border-2 border-transparent hover:border-accent-jp/30"
                >
                    <div className="w-20 h-20 rounded-full bg-accent-jp/20 flex items-center justify-center mb-6 text-accent-jp group-hover:scale-110 transition-transform">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-text-primary mb-2">Restaurant Partner</h3>
                    <p className="text-text-secondary">
                        Log in to manage your inventory, view real-time insights, and customize your generative profile.
                    </p>
                </div>

                {/* Diner Card */}
                <div
                    onClick={() => onSelect('diner')}
                    className="glass-panel p-12 flex flex-col items-center text-center cursor-pointer hover:-translate-y-2 transition-transform duration-300 group border-2 border-transparent hover:border-accent-wa/30"
                >
                    <div className="w-20 h-20 rounded-full bg-accent-wa/20 flex items-center justify-center mb-6 text-accent-wa group-hover:scale-110 transition-transform">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-text-primary mb-2">Diner</h3>
                    <p className="text-text-secondary">
                        Create your palate profile, view your saved generative meals, and manage bookings.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AuthSelection;
