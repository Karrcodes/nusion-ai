import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const RestaurantDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory'); // 'dashboard', 'inventory', 'insights'

    // Load initial inventory from localStorage (keyed by User ID) or default
    const [inventory, setInventory] = useState(() => {
        const storageKey = `restaurant_inventory_${user?.id}`;
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [
            { id: 1, item: 'Scotch Bonnet', category: 'Produce', stock: 'High', status: 'Active' },
            { id: 2, item: 'Plantain (Ripe)', category: 'Produce', stock: 'Medium', status: 'Active' },
            { id: 3, item: 'Wagyu Beef A5', category: 'Protein', stock: 'Low', status: 'Reserved' },
            { id: 4, item: 'Egusi Seeds', category: 'Dry Goods', stock: 'High', status: 'Active' },
            { id: 5, item: 'Palm Oil', category: 'Pantry', stock: 'High', status: 'Active' },
        ];
    });

    // Load profile from localStorage
    const [profile, setProfile] = useState(() => {
        const storageKey = `restaurant_preferences_${user?.id}`;
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : {
                name: user?.user_metadata?.name || '',
                location: 'London', // Default
                description: '',
                cuisine: 'Modern West African',
                philosophy: '',
                logoUrl: '',
                coverUrl: ''
            };
        } catch (e) {
            return { name: '', location: '', description: '', cuisine: '', philosophy: '', logoUrl: '', coverUrl: '' };
        }
    });

    // Save to localStorage whenever inventory changes
    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`restaurant_inventory_${user.id}`, JSON.stringify(inventory));
        }
    }, [inventory, user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const handleStockChange = (id) => {
        setInventory(prev => prev.map(item => {
            if (item.id === id) {
                // Cycle stock status: High -> Medium -> Low -> High
                const nextStock = item.stock === 'High' ? 'Medium' : item.stock === 'Medium' ? 'Low' : 'High';
                return { ...item, stock: nextStock };
            }
            return item;
        }));
    };

    return (
        <div className="min-h-screen w-full bg-bg-primary flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-glass-border p-4 md:p-6 flex flex-col md:pt-8 bg-white/50 backdrop-blur-md md:bg-transparent">
                <div className="flex justify-between items-center md:block mb-4 md:mb-12">
                    <Link to="/" className="flex items-center gap-2 md:px-2 cursor-pointer hover:opacity-80 transition-opacity" title="Back to Home">
                        <img src="/nusion-logo.png" alt="Logo" className="h-6 md:h-8 w-auto opacity-80" style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(13%) saturate(928%) hue-rotate(338deg) brightness(96%) contrast(90%)' }} />
                        <span className="font-display font-medium text-lg md:text-xl text-text-primary tracking-wide opacity-80 pt-1">AI</span>
                    </Link>
                    <button onClick={handleLogout} className="md:hidden text-xs text-text-secondary border border-glass-border px-3 py-1 rounded">Log Out</button>
                </div>

                <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`md:w-full text-left px-4 py-2 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${activeTab === 'inventory' ? 'bg-accent-jp/10 text-accent-jp' : 'text-text-secondary hover:bg-glass-border/30'}`}
                    >
                        Live Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`md:w-full text-left px-4 py-2 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${activeTab === 'insights' ? 'bg-accent-jp/10 text-accent-jp' : 'text-text-secondary hover:bg-glass-border/30'}`}
                    >
                        Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`md:w-full text-left px-4 py-2 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${activeTab === 'profile' ? 'bg-accent-jp/10 text-accent-jp' : 'text-text-secondary hover:bg-glass-border/30'}`}
                    >
                        Profile
                    </button>
                </nav>

                <div className="mt-auto pt-8 border-t border-glass-border hidden md:block">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary px-4">
                        <span>←</span> Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-12 bg-bg-secondary/30">
                <header className="mb-6 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-text-primary mb-1">Welcome back, Ikoyi</h1>
                        <p className="text-text-secondary text-sm">Manage your real-time generative parameters.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass-panel px-4 py-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-mono font-bold text-text-primary">System Online</span>
                        </div>
                    </div>
                </header>

                {/* --- INVENTORY VIEW --- */}
                {activeTab === 'inventory' && (
                    <div className="animate-[fadeIn_0.3s]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-text-primary">Current Stock</h2>
                            <button className="px-4 py-2 bg-text-primary text-bg-primary rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                                + Add Item
                            </button>
                        </div>

                        <div className="glass-panel overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-glass-border/20 text-xs uppercase text-text-secondary font-mono">
                                    <tr>
                                        <th className="p-4">Ingredient</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Stock Level</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {inventory.map((item) => (
                                        <tr key={item.id} className="hover:bg-glass-border/10 transition-colors">
                                            <td className="p-4 font-bold text-text-primary">{item.item}</td>
                                            <td className="p-4 text-text-secondary text-sm">{item.category}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock === 'High' ? 'bg-green-100 text-green-700' :
                                                    item.stock === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.stock}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-text-secondary">{item.status}</td>
                                            <td className="p-4 text-right">
                                                <button className="text-accent-jp hover:underline text-sm font-mono">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- PROFILE VIEW --- */}
                {activeTab === 'profile' && (
                    <div className="animate-[fadeIn_0.3s] max-w-3xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-text-primary">Restaurant Profile</h2>
                            <button
                                onClick={() => {
                                    localStorage.setItem(`restaurant_preferences_${user.id}`, JSON.stringify(profile));
                                    alert('Profile saved!');
                                }}
                                className="px-6 py-2 bg-text-primary text-bg-primary rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                            >
                                Save Changes
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Basic Info */}
                            <section className="glass-panel p-8">
                                <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <span>📍</span> General Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Restaurant Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Location City</label>
                                        <input
                                            type="text"
                                            value={profile.location}
                                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                            className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Description</label>
                                        <textarea
                                            value={profile.description}
                                            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                            rows={3}
                                            className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Culinary Identity */}
                            <section className="glass-panel p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-jp/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2 relative z-10">
                                    <span>🍳</span> Culinary Identity
                                </h3>
                                <p className="text-sm text-text-secondary mb-6 relative z-10">These settings guide the Generative Engine's creativity.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Cuisine Type</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Modern West African"
                                            value={profile.cuisine}
                                            onChange={(e) => setProfile({ ...profile, cuisine: e.target.value })}
                                            className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Philosophy</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Hyper-seasonal, Fermentation"
                                            value={profile.philosophy}
                                            onChange={(e) => setProfile({ ...profile, philosophy: e.target.value })}
                                            className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Visuals */}
                            <section className="glass-panel p-8">
                                <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                                    <span>📸</span> Brand Visuals
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Logo URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={profile.logoUrl}
                                            onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                                            className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-text-secondary uppercase">Cover Image URL</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            value={profile.coverUrl}
                                            onChange={(e) => setProfile({ ...profile, coverUrl: e.target.value })}
                                            className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {/* --- INSIGHTS VIEW --- */}
                {activeTab === 'insights' && (
                    <div className="animate-[fadeIn_0.3s] grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Stat Card 1 */}
                        <div className="glass-panel p-8">
                            <span className="text-sm text-text-secondary uppercase tracking-wider block mb-4">Total Generations</span>
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-5xl font-mono text-text-primary">1,204</span>
                                <span className="text-accent-jp text-sm font-bold bg-accent-jp/10 px-2 py-1 rounded">+12.5%</span>
                            </div>
                            <div className="w-full bg-glass-border h-2 rounded-full overflow-hidden">
                                <div className="bg-accent-jp h-full w-[75%]"></div>
                            </div>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="glass-panel p-8">
                            <span className="text-sm text-text-secondary uppercase tracking-wider block mb-4">Top Request</span>
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-3xl font-display font-bold text-text-primary">Spicy Plantain</span>
                                <span className="text-text-secondary text-sm">42% of orders</span>
                            </div>
                            <p className="text-xs text-text-secondary">Most requested flavor profile this week.</p>
                        </div>

                        {/* Inventory Usage */}
                        <div className="glass-panel p-8 md:col-span-2">
                            <h3 className="text-lg font-bold text-text-primary mb-6">Ingredient Utilization</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Scotch Bonnet</span>
                                    <span className="font-mono">89%</span>
                                </div>
                                <div className="w-full bg-glass-border h-2 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full w-[89%]"></div>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span>Wagyu Beef</span>
                                    <span className="font-mono">94%</span>
                                </div>
                                <div className="w-full bg-glass-border h-2 rounded-full overflow-hidden">
                                    <div className="bg-accent-jp h-full w-[94%]"></div>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span>Palm Oil</span>
                                    <span className="font-mono">45%</span>
                                </div>
                                <div className="w-full bg-glass-border h-2 rounded-full overflow-hidden">
                                    <div className="bg-yellow-500 h-full w-[45%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default RestaurantDashboard;
