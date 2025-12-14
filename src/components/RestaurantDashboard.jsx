
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';


const RestaurantDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory'); // 'dashboard', 'inventory', 'insights'

    // Load initial inventory from localStorage (keyed by User ID) or default
    const [inventory, setInventory] = useState(() => {
        const storageKey = `restaurant_inventory_${user?.id} `;
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });

    // Load profile from localStorage
    const [profile, setProfile] = useState(() => {
        const storageKey = `restaurant_preferences_${user?.id} `;
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : {
                name: user?.user_metadata?.name || '',
                location: 'London', // Default
                description: '',
                cuisine: 'Modern West African',
                philosophy: '',
                logoUrl: null,
                coverUrl: null,
                hours: '',
                priceTier: '$$',
                contactEmail: '',
                dietaryTags: '',
            };
        } catch (e) {
            return { name: '', location: '', description: '', cuisine: '', philosophy: '', logoUrl: null, coverUrl: null, hours: '', priceTier: '$$', contactEmail: '', dietaryTags: '' };
        }
    });

    // Save to localStorage whenever inventory changes
    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`restaurant_inventory_${user.id} `, JSON.stringify(inventory));
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

    // Load Menu Items (Meals)
    const [menuItems, setMenuItems] = useState(() => {
        const storageKey = `restaurant_menu_${user?.id} `;
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        if (user?.id) {
            localStorage.setItem(`restaurant_menu_${user.id} `, JSON.stringify(menuItems));
        }
    }, [menuItems, user]);

    const [inventoryView, setInventoryView] = useState('meals'); // 'meals' | 'pantry'
    const [analyzingMenu, setAnalyzingMenu] = useState(false);

    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const height = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Return Base64 string directly (without data:image/... prefix for Gemini)
                    const dataUrl = canvas.toDataURL(file.type);
                    resolve(dataUrl.split(',')[1]);
                };
            };
        });
    };

    const handleMenuUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzingMenu(true);

        try {
            // Resize image to max 1024px width to ensure fast upload and avoid Vercel 4.5MB limit
            const base64Data = await resizeImage(file);

            // Call our secure Backend API
            const response = await fetch('/api/analyze-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64Data,
                    mimeType: file.type
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.meals) setMenuItems(prev => [...prev, ...data.meals.map(m => ({ ...m, id: Date.now() + Math.random() }))]);
            if (data.pantry) setInventory(prev => [...prev, ...data.pantry.map(i => ({ ...i, id: Date.now() + Math.random() }))]);

            setInventoryView('meals');
            alert(`✨ Analysis Complete!\n\nExtracted:\n- ${data.meals?.length || 0} Meals\n- ${data.pantry?.length || 0} Ingredients`);

        } catch (error) {
            console.error("Analysis Error:", error);
            alert(`Analysis Failed!\n\nDetails: ${error.message}\n\nPlease try again or report this error.`);
        } finally {
            setAnalyzingMenu(false);
        }
    };

    const [showAddItem, setShowAddItem] = useState(false);

    const [uploading, setUploading] = useState(null); // 'logoUrl' | 'coverUrl' | null

    const handleImageUpload = async (file, field) => {
        if (!file) return;
        setUploading(field);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('restaurant-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('restaurant-assets')
                .getPublicUrl(filePath);

            setProfile(prev => ({ ...prev, [field]: data.publicUrl }));
        } catch (error) {
            console.error('Error uploading image: ', error);
            alert('Error uploading image!');
        } finally {
            setUploading(null);
        }
    };

    const clearData = (type) => {
        if (!window.confirm(`Are you sure you want to clear ${type}? This cannot be undone.`)) return;

        if (type === 'Menu') setMenuItems([]);
        if (type === 'Pantry') setInventory([]);
        if (type === 'All Data') {
            setMenuItems([]);
            setInventory([]);
        }
    };

    const [showClearMenu, setShowClearMenu] = useState(false);

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
                            <span className="text-xs font-mono font-bold text-text-primary">System Online v2.9 (Route Fix)</span>
                        </div>
                    </div>
                </header>

                {/* --- INVENTORY VIEW --- */}
                {activeTab === 'inventory' && (
                    <div className="animate-[fadeIn_0.3s]">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-text-primary mb-1">Kitchen Operations</h2>
                                <p className="text-xs text-text-secondary">Manage your menu offerings and raw ingredient stock.</p>
                            </div>

                            {/* Inventory Sub-Nav */}
                            <div className="flex bg-glass-border/30 p-1 rounded-lg">
                                <button
                                    onClick={() => setInventoryView('meals')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${inventoryView === 'meals' ? 'bg-bg-primary shadow text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    Menu Meals
                                </button>
                                <button
                                    onClick={() => setInventoryView('pantry')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${inventoryView === 'pantry' ? 'bg-bg-primary shadow text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    Pantry Stock
                                </button>
                            </div>

                            <div className="flex gap-2 items-center relative">
                                {/* Clear Data Options */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowClearMenu(!showClearMenu)}
                                        className="px-4 py-2 border border-red-200 text-red-400 rounded-lg text-sm font-bold hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-1"
                                    >
                                        <span>🗑️</span> Clear
                                    </button>

                                    {showClearMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-40 glass-panel border border-glass-border shadow-2xl overflow-hidden z-50 flex flex-col p-1 animate-[fadeIn_0.1s]">
                                            <button
                                                onClick={() => { clearData('Menu'); setShowClearMenu(false); }}
                                                className="text-left px-3 py-2 text-xs text-text-secondary hover:bg-glass-border/50 hover:text-text-primary rounded transition-colors"
                                            >
                                                Clear Menu
                                            </button>
                                            <button
                                                onClick={() => { clearData('Pantry'); setShowClearMenu(false); }}
                                                className="text-left px-3 py-2 text-xs text-text-secondary hover:bg-glass-border/50 hover:text-text-primary rounded transition-colors"
                                            >
                                                Clear Pantry
                                            </button>
                                            <div className="h-px bg-glass-border my-1"></div>
                                            <button
                                                onClick={() => { clearData('All Data'); setShowClearMenu(false); }}
                                                className="text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 rounded font-bold transition-colors"
                                            >
                                                Clear All Data
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="w-px h-8 bg-glass-border mx-2"></div>

                                <button
                                    onClick={() => document.getElementById('menu-upload').click()}
                                    className="px-4 py-2 border border-accent-jp/50 text-accent-jp rounded-lg text-sm font-bold hover:bg-accent-jp/10 transition-colors flex items-center gap-2"
                                >
                                    <span>📄</span> {analyzingMenu ? 'Analyzing...' : 'Auto-Scan Menu'}
                                </button>
                                <input
                                    type="file"
                                    id="menu-upload"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleMenuUpload(e)}
                                />
                                <button
                                    onClick={() => setShowAddItem(true)}
                                    className="px-4 py-2 bg-text-primary text-bg-primary rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                                >
                                    + Add Item
                                </button>
                            </div>
                        </div>

                        {/* Analysis Loading State */}
                        {analyzingMenu && (
                            <div className="glass-panel p-6 mb-8 flex items-center gap-6 animate-pulse border-accent-jp/30 border">
                                <div className="w-12 h-12 rounded-full border-4 border-accent-jp border-t-transparent animate-spin"></div>
                                <div>
                                    <h4 className="text-lg font-bold text-text-primary">AI Agent Analyzing Menu...</h4>
                                    <p className="text-sm text-text-secondary">Extracting dishes, identifying ingredients, and mapping flavor profiles.</p>
                                </div>
                            </div>
                        )}

                        {/* Empty State Hero - Only if BOTH empty */}
                        {!analyzingMenu && inventory.length === 0 && menuItems.length === 0 && (
                            <div className="glass-panel p-12 text-center border border-dashed border-glass-border mb-8">
                                <div className="text-6xl mb-4">🍽️</div>
                                <h3 className="2xl font-bold text-text-primary mb-2">Start Your Kitchen</h3>
                                <p className="text-text-secondary max-w-md mx-auto mb-8">
                                    The Generative Engine needs to know what you serve. Upload your existing menu to instantly populate your Meals and Pantry.
                                </p>
                                <button
                                    onClick={() => document.getElementById('menu-upload').click()}
                                    className="px-8 py-4 bg-accent-jp text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all animate-[pulse_3s_infinite]"
                                >
                                    Upload Menu PDF / Image
                                </button>
                            </div>
                        )}


                        {/* MEALS TABLE */}
                        {inventoryView === 'meals' && menuItems.length > 0 && (
                            <div className="glass-panel overflow-x-auto animate-[fadeIn_0.3s]">
                                <table className="w-full text-left">
                                    <thead className="bg-glass-border/20 text-xs uppercase text-text-secondary font-mono">
                                        <tr>
                                            <th className="p-4">Dish Name</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Key Ingredients</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-glass-border">
                                        {menuItems.map((meal) => (
                                            <tr key={meal.id} className="hover:bg-glass-border/10 transition-colors">
                                                <td className="p-4 font-bold text-text-primary">{meal.name}</td>
                                                <td className="p-4 font-mono text-text-secondary">{meal.price}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${meal.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {meal.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-text-secondary">
                                                    {meal.ingredients.join(', ')}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button className="text-accent-jp hover:underline text-sm font-mono">Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* PANTRY TABLE */}
                        {inventoryView === 'pantry' && inventory.length > 0 && (
                            <div className="glass-panel overflow-x-auto animate-[fadeIn_0.3s]">
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
                        )}
                    </div>
                )}

                {/* Add Item Modal */}
                {showAddItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s]">
                        <div className="bg-bg-primary border border-glass-border p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
                            <button
                                onClick={() => setShowAddItem(false)}
                                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
                            >✕</button>

                            <h3 className="text-xl font-bold text-text-primary mb-6">Add Inventory Item</h3>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const newItem = {
                                    id: Date.now(),
                                    item: formData.get('item'),
                                    category: formData.get('category'),
                                    stock: formData.get('stock'),
                                    status: 'Active'
                                };
                                setInventory([...inventory, newItem]);
                                setShowAddItem(false);
                            }} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-text-secondary uppercase">Ingredient Name</label>
                                    <input name="item" required className="w-full bg-bg-secondary border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp outline-none" placeholder="e.g. Black Truffle" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-text-secondary uppercase">Category</label>
                                    <select name="category" className="w-full bg-bg-secondary border border-glass-border rounded p-3 text-text-primary outline-none">
                                        <option>Produce</option>
                                        <option>Protein</option>
                                        <option>Spices</option>
                                        <option>Pantry</option>
                                        <option>Dry Goods</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-mono text-text-secondary uppercase">Stock Level</label>
                                    <select name="stock" className="w-full bg-bg-secondary border border-glass-border rounded p-3 text-text-primary outline-none">
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-3 bg-text-primary text-bg-primary rounded-lg font-bold mt-4 hover:opacity-90">
                                    Add to Inventory
                                </button>
                            </form>
                        </div>
                    </div>
                )}


                {/* --- PROFILE VIEW --- */}
                {
                    activeTab === 'profile' && (
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

                                {/* Operations & Context */}
                                <section className="glass-panel p-8">
                                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                                        <span>⚙️</span> Operations & Context
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-secondary uppercase">Operating Hours</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Tue-Sun, 18:00 - 23:00"
                                                value={profile.hours}
                                                onChange={(e) => setProfile({ ...profile, hours: e.target.value })}
                                                className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-secondary uppercase">Price Tier</label>
                                            <select
                                                value={profile.priceTier}
                                                onChange={(e) => setProfile({ ...profile, priceTier: e.target.value })}
                                                className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none"
                                            >
                                                <option value="$">Low ($)</option>
                                                <option value="$$">Medium ($$)</option>
                                                <option value="$$$">High ($$$)</option>
                                                <option value="$$$$">Ultra-Premium ($$$$)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-secondary uppercase">Contact Email</label>
                                            <input
                                                type="email"
                                                placeholder="chef@example.com"
                                                value={profile.contactEmail}
                                                onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                                                className="w-full bg-bg-primary/50 border border-glass-border rounded p-3 text-text-primary focus:border-accent-jp focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-secondary uppercase">Dietary Accommodations (comma sep.)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Vegan, Halal, Gluten-Free"
                                                value={profile.dietaryTags}
                                                onChange={(e) => setProfile({ ...profile, dietaryTags: e.target.value })}
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
                                        {/* Logo Upload */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-secondary uppercase">Logo</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full border border-glass-border overflow-hidden bg-bg-primary/50 flex items-center justify-center">
                                                    {profile.logoUrl ? (
                                                        <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-2xl opacity-20">🖼️</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e.target.files[0], 'logoUrl')}
                                                        className="w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-jp/10 file:text-accent-jp hover:file:bg-accent-jp/20"
                                                    />
                                                    {uploading === 'logoUrl' && <span className="text-xs text-accent-jp animate-pulse ml-2">Uploading...</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cover Upload */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-text-secondary uppercase">Cover Image</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-16 rounded border border-glass-border overflow-hidden bg-bg-primary/50 flex items-center justify-center">
                                                    {profile.coverUrl ? (
                                                        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-2xl opacity-20">🌄</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e.target.files[0], 'coverUrl')}
                                                        className="w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-jp/10 file:text-accent-jp hover:file:bg-accent-jp/20"
                                                    />
                                                    {uploading === 'coverUrl' && <span className="text-xs text-accent-jp animate-pulse ml-2">Uploading...</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )
                }

                {/* --- INSIGHTS VIEW --- */}
                {
                    activeTab === 'insights' && (
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
                    )
                }
            </main >
        </div >
    );
};

export default RestaurantDashboard;
