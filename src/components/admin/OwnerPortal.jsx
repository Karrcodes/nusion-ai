
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const OwnerPortal = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            // Note: RLS must allow this user to SELECT * from profiles
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRestaurants(data || []);
        } catch (err) {
            console.error("Error fetching restaurants:", err);
            alert("Failed to load data. Ensure RLS policies allow admin access.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus, currentName) => {
        if (!window.confirm(`Are you sure you want to ${newStatus.toUpperCase()} ${currentName}?`)) return;

        try {
            // 1. Update DB
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // 2. Optimistic UI Update
            setRestaurants(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

            // 3. Send Email Notification (Mock/Real)
            // In a real app, call /api/send-email here to notify the user.
            console.log(`[Notification] Sent ${newStatus} email to restaurant ${id}`);
            alert(`Updated ${currentName} to ${newStatus}`);

        } catch (err) {
            console.error("Update failed:", err);
            alert("Update failed.");
        }
    };

    const filteredList = restaurants.filter(r => {
        if (filter === 'all') return true;
        return (r.status || 'pending') === filter; // Handle undefined as pending
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'pending':
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        }
    };

    if (loading) return <div className="p-10 text-center text-text-primary">Loading Shadow Portal...</div>;

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            Shadow Portal
                        </h1>
                        <p className="text-text-secondary text-sm">God Mode • {restaurants.length} Total Entities</p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/dashboard" className="px-4 py-2 border border-glass-border hover:bg-glass-border/20 rounded-lg text-sm text-text-secondary transition">
                            Exit God Mode
                        </Link>
                        <button onClick={fetchRestaurants} className="px-4 py-2 bg-glass-border hover:bg-glass-border/50 rounded-lg text-sm transition">
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['all', 'pending', 'approved', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${filter === f
                                    ? 'bg-text-primary text-bg-primary border-text-primary'
                                    : 'bg-transparent text-text-secondary border-glass-border hover:border-text-secondary'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-bg-secondary border border-glass-border rounded-xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-glass-border/30 text-xs uppercase text-text-secondary font-mono">
                                <th className="p-4 border-b border-glass-border">Entity</th>
                                <th className="p-4 border-b border-glass-border">Location</th>
                                <th className="p-4 border-b border-glass-border">Status</th>
                                <th className="p-4 border-b border-glass-border">Joined</th>
                                <th className="p-4 border-b border-glass-border text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map(r => (
                                <tr key={r.id} className="hover:bg-glass-border/10 transition-colors border-b border-glass-border last:border-0 relative group">
                                    <td className="p-4">
                                        <div className="font-bold text-lg">{r.name || 'Unnamed'}</div>
                                        <div className="text-xs text-text-secondary font-mono">{r.email}</div>
                                        <div className="text-xs text-text-secondary font-mono opacity-50">{r.id}</div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {r.city || 'Unknown'}, {r.currency}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded border text-xs font-bold uppercase ${getStatusColor(r.status || 'pending')}`}>
                                            {r.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-text-secondary">
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            {r.status !== 'approved' && (
                                                <button
                                                    onClick={() => updateStatus(r.id, 'approved', r.name)}
                                                    className="px-3 py-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded text-xs font-bold border border-green-500/30"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {r.status !== 'rejected' && (
                                                <button
                                                    onClick={() => updateStatus(r.id, 'rejected', r.name)}
                                                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded text-xs font-bold border border-red-500/30"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-text-secondary italic">
                                        No entities found in this sector.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OwnerPortal;
