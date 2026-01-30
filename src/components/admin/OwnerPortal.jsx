
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { useImpersonation } from '../../contexts/ImpersonationContext';
import { DEMO_RESTAURANTS } from '../../utils/demoData';

const OwnerPortal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { startImpersonation, exitImpersonation } = useImpersonation();
    const [restaurants, setRestaurants] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' or 'users'
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'status'
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const handleSeedData = async () => {
        if (!window.confirm("Inject 5 Demo Restaurants? This will add fake data to the list.")) return;
        setSeeding(true);
        try {
            const { DEMO_RESTAURANTS } = await import('../../utils/demoData');

            // Insert sequentially
            for (const restaurant of DEMO_RESTAURANTS) {
                // 1. Check if Auth User exists
                let userId;
                const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                const existingUser = users?.users?.find(u => u.email === restaurant.email);

                if (existingUser) {
                    userId = existingUser.id;
                } else {
                    // 2. Create Auth User
                    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                        email: restaurant.email,
                        password: 'demo_password_123',
                        email_confirm: true,
                        user_metadata: { name: restaurant.name, type: 'restaurant' }
                    });
                    if (createError) {
                        console.error("Failed to create user", restaurant.name, createError);
                        continue;
                    }
                    userId = newUser.user.id;
                }

                // 3. Upsert Profile (Idempotent)
                const { error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: userId,
                        ...restaurant, // Ensure this object has type: 'restaurant', or override below
                        type: 'restaurant', // FORCE TYPE
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });

                if (profileError) console.error("Failed to upsert profile", restaurant.name, profileError);
                else console.log("Seeded/Updated:", restaurant.name);
            }

            // Refresh BOTH lists to reflect changes (move from Users -> Restaurants)
            await Promise.all([
                fetchRestaurants(),
                fetchUsers()
            ]);

            alert("Demo Data Injected & Updated! 🍱\nCheck the 'Restaurants' tab.");
        } catch (error) {
            console.error(error);
            alert("Error seeding data: " + error.message);
        } finally {
            setSeeding(false);
        }
    };

    useEffect(() => {
        // Check for exit impersonation flag
        const params = new URLSearchParams(location.search);
        if (params.get('exit') === 'true') {
            exitImpersonation();
            // Clean up the URL
            navigate('/portal/owner', { replace: true });
        }

        // Ensure admin client is available
        if (!supabaseAdmin) {
            console.error("Supabase Admin client not initialized. Check VITE_SUPABASE_SERVICE_ROLE_KEY.");
            alert("Configuration Error: Admin Service Key missing. Please check your .env file.");
            setLoading(false);
            return;
        }

        fetchRestaurants();
        fetchUsers();
    }, [location.search]);

    const fetchRestaurants = async () => {
        try {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('type', 'restaurant')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRestaurants(data || []);
        } catch (err) {
            console.error("Error fetching restaurants:", err);
            alert(`Failed to load data: ${err.message || err.error_description || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('type', 'diner')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            // Don't alert twice if both fail, just log
        }
    };

    const updateStatus = async (id, newStatus, currentName) => {
        if (!window.confirm(`Are you sure you want to set ${currentName} to ${newStatus.toUpperCase()}?`)) return;

        try {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setRestaurants(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
            console.log(`[Notification] Sent ${newStatus} email to entity ${id}`);
            alert(`Updated ${currentName} to ${newStatus}`);

        } catch (err) {
            console.error("Update failed:", err);
            alert("Update failed.");
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedIds.length === 0) {
            alert('Please select at least one restaurant');
            return;
        }

        if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} ${selectedIds.length} restaurant(s)?`)) return;

        setBulkActionLoading(true);
        try {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ status: action })
                .in('id', selectedIds);

            if (error) throw error;

            setRestaurants(prev => prev.map(r =>
                selectedIds.includes(r.id) ? { ...r, status: action } : r
            ));
            setSelectedIds([]);
            alert(`Successfully ${action}d ${selectedIds.length} restaurant(s)`);

        } catch (err) {
            console.error("Bulk action failed:", err);
            alert("Bulk action failed.");
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleViewDashboard = (restaurant) => {
        startImpersonation(restaurant);
        navigate('/dashboard/restaurant');
    };

    const handleLogout = () => {
        sessionStorage.removeItem('nusion_admin_session');
        sessionStorage.removeItem('nusion_admin_timestamp');
        navigate('/admin');
    };

    const handleConvertType = async (id, currentType, name) => {
        const newType = currentType === 'diner' ? 'restaurant' : 'diner';
        if (!window.confirm(`Are you sure you want to convert ${name} from ${currentType} to ${newType}?`)) return;

        try {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ type: newType })
                .eq('id', id);

            if (error) throw error;

            // Move user between lists locally
            if (newType === 'restaurant') {
                const user = users.find(u => u.id === id);
                setUsers(prev => prev.filter(u => u.id !== id));
                setRestaurants(prev => [{ ...user, type: 'restaurant', status: user.status || 'pending' }, ...prev]);
            } else {
                const restaurant = restaurants.find(r => r.id === id);
                setRestaurants(prev => prev.filter(r => r.id !== id));
                setUsers(prev => [{ ...restaurant, type: 'diner' }, ...prev]);
            }

            alert(`Converted ${name} to ${newType}`);

        } catch (err) {
            console.error("Conversion failed:", err);
            alert("Conversion failed: " + err.message);
        }
    };

    const handleDelete = async (id, name, type) => {
        if (!window.confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE ${type} "${name}"?\n\nThis action cannot be undone. All data will be lost.`)) return;

        // Double confirm
        if (!window.confirm(`Final Confirmation: Delete ${name}?`)) return;

        try {
            // Delete from Auth (cascades to public profiles usually, but we use admin client)
            const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

            if (error) throw error;

            // Update local state
            if (type === 'restaurant') {
                setRestaurants(prev => prev.filter(r => r.id !== id));
            } else {
                setUsers(prev => prev.filter(u => u.id !== id));
            }

            alert(`Successfully deleted ${name}`);

        } catch (err) {
            console.error("Delete failed:", err);
            // Fallback: try deleting profile directly if auth delete fails/is not needed
            try {
                const { error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .delete()
                    .eq('id', id);

                if (profileError) throw profileError;

                // Update local state (same as above)
                if (type === 'restaurant') {
                    setRestaurants(prev => prev.filter(r => r.id !== id));
                } else {
                    setUsers(prev => prev.filter(u => u.id !== id));
                }
                alert(`Successfully deleted ${name} (Profile only)`);

            } catch (fallbackErr) {
                alert("Delete failed: " + err.message);
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredList.map(r => r.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Filtering and Sorting
    const filteredList = restaurants
        .filter(r => {
            if (filter !== 'all' && (r.status || 'pending') !== filter) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    (r.name || '').toLowerCase().includes(query) ||
                    (r.email || '').toLowerCase().includes(query) ||
                    (r.city || '').toLowerCase().includes(query)
                );
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'status') return (a.status || 'pending').localeCompare(b.status || 'pending');
            return new Date(b.created_at) - new Date(a.created_at); // date (default)
        });

    // Stats
    const stats = {
        total: restaurants.length,
        pending: restaurants.filter(r => (r.status || 'pending') === 'pending').length,
        approved: restaurants.filter(r => r.status === 'approved').length,
        rejected: restaurants.filter(r => r.status === 'rejected').length,
        disabled: restaurants.filter(r => r.status === 'disabled').length,
        suspended: restaurants.filter(r => r.status === 'suspended').length,
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'disabled': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
            case 'suspended': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'pending':
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        }
    };

    if (loading) return <div className="p-10 text-center text-text-primary">Loading Shadow Portal...</div>;

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <img
                                src="/nusion-logo.png"
                                alt="Nusion"
                                className="h-6 w-auto opacity-90"
                                style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(13%) saturate(928%) hue-rotate(338deg) brightness(96%) contrast(90%)' }}
                            />
                            <h1 className="text-xl font-sans font-semibold text-text-primary">
                                Admin Portal
                            </h1>
                        </div>
                        <p className="text-text-secondary text-sm font-sans">God Mode • {stats.total} Total Entities</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 border border-red-500/50 hover:bg-red-500/20 rounded-lg text-sm text-red-400 transition font-mono uppercase tracking-wider"
                        >
                            🔒 Logout
                        </button>
                        <Link to="/dashboard" className="px-4 py-2 border border-glass-border hover:bg-glass-border/20 rounded-lg text-sm text-text-secondary transition">
                            Exit God Mode
                        </Link>
                        <button onClick={fetchRestaurants} className="px-4 py-2 bg-glass-border hover:bg-glass-border/50 rounded-lg text-sm transition">
                            Refresh
                        </button>
                        <button
                            onClick={handleSeedData}
                            disabled={seeding}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-sm text-white transition font-bold shadow-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            {seeding ? 'Seeding...' : '🚀 Seed Demo Data'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-glass-border">
                    <button
                        onClick={() => setActiveTab('restaurants')}
                        className={`px-6 py-3 font-sans font-medium transition-all ${activeTab === 'restaurants'
                            ? 'text-text-primary border-b-2 border-text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Restaurants
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 font-sans font-medium transition-all ${activeTab === 'users'
                            ? 'text-text-primary border-b-2 border-text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Users ({users.length})
                    </button>
                </div>

                {/* Restaurants Tab */}
                {activeTab === 'restaurants' && (
                    <>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                            <div className="bg-bg-secondary border border-glass-border rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider">Total</div>
                            </div>
                            <div className="bg-bg-secondary border border-yellow-500/30 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider">Pending</div>
                            </div>
                            <div className="bg-bg-secondary border border-green-500/30 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider">Approved</div>
                            </div>
                            <div className="bg-bg-secondary border border-red-500/30 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider">Rejected</div>
                            </div>
                            <div className="bg-bg-secondary border border-gray-500/30 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-400">{stats.disabled}</div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider">Disabled</div>
                            </div>
                            <div className="bg-bg-secondary border border-orange-500/30 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-orange-400">{stats.suspended}</div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider">Suspended</div>
                            </div>
                        </div>

                        {/* Search and Controls */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Search by name, email, or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-bg-secondary border border-glass-border rounded-lg px-4 py-2 text-sm text-text-primary placeholder-text-secondary/50 focus:border-accent-jp focus:outline-none transition-colors"
                            />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-bg-secondary border border-glass-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-accent-jp focus:outline-none transition-colors"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="name">Sort by Name</option>
                                <option value="status">Sort by Status</option>
                            </select>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 mb-6">
                            {['all', 'pending', 'approved', 'rejected', 'disabled', 'suspended'].map(f => (
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

                        {/* Bulk Actions */}
                        {selectedIds.length > 0 && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6 flex items-center justify-between">
                                <div className="text-sm text-purple-300">
                                    <strong>{selectedIds.length}</strong> restaurant(s) selected
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleBulkAction('approved')}
                                        disabled={bulkActionLoading}
                                        className="px-3 py-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded text-xs font-bold border border-green-500/30 disabled:opacity-50"
                                    >
                                        Approve All
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('rejected')}
                                        disabled={bulkActionLoading}
                                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded text-xs font-bold border border-red-500/30 disabled:opacity-50"
                                    >
                                        Reject All
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('disabled')}
                                        disabled={bulkActionLoading}
                                        className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/40 text-gray-400 rounded text-xs font-bold border border-gray-500/30 disabled:opacity-50"
                                    >
                                        Disable All
                                    </button>
                                    <button
                                        onClick={() => setSelectedIds([])}
                                        className="px-3 py-1 bg-bg-secondary hover:bg-glass-border text-text-secondary rounded text-xs font-bold border border-glass-border"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <div className="bg-bg-secondary border border-glass-border rounded-xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-glass-border/30 text-xs uppercase text-text-secondary font-mono">
                                        <th className="p-4 border-b border-glass-border">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                                                onChange={toggleSelectAll}
                                                className="cursor-pointer"
                                            />
                                        </th>
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
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(r.id)}
                                                    onChange={() => toggleSelect(r.id)}
                                                    className="cursor-pointer"
                                                />
                                            </td>
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
                                                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity flex-wrap">
                                                    <button
                                                        onClick={() => handleViewDashboard(r)}
                                                        className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 rounded text-xs font-bold border border-purple-500/30"
                                                    >
                                                        👁️ View Dashboard
                                                    </button>
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
                                                    {r.status !== 'disabled' && (
                                                        <button
                                                            onClick={() => updateStatus(r.id, 'disabled', r.name)}
                                                            className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/40 text-gray-400 rounded text-xs font-bold border border-gray-500/30"
                                                        >
                                                            Disable
                                                        </button>
                                                    )}
                                                    {r.status !== 'suspended' && (
                                                        <button
                                                            onClick={() => updateStatus(r.id, 'suspended', r.name)}
                                                            className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 rounded text-xs font-bold border border-orange-500/30"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(r.id, r.name, 'restaurant')}
                                                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded text-xs font-bold border border-red-500/30 ml-2"
                                                        title="Permanently Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredList.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-text-secondary italic">
                                                No entities found in this sector.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-bg-secondary border border-glass-border rounded-xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-glass-border/30 text-xs uppercase text-text-secondary font-mono">
                                    <th className="p-4 border-b border-glass-border">User</th>
                                    <th className="p-4 border-b border-glass-border">Email</th>
                                    <th className="p-4 border-b border-glass-border">Joined</th>
                                    <th className="p-4 border-b border-glass-border">Status</th>
                                    <th className="p-4 border-b border-glass-border text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-glass-border/10 transition-colors border-b border-glass-border last:border-0">
                                        <td className="p-4">
                                            <div className="font-bold text-text-primary">{user.name || 'Unnamed User'}</div>
                                            <div className="text-xs text-text-secondary font-mono">ID: {user.id.slice(0, 8)}...</div>
                                        </td>
                                        <td className="p-4 text-text-secondary text-sm">{user.email || 'No email'}</td>
                                        <td className="p-4 text-text-secondary text-sm font-mono">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.status === 'disabled' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                {user.status === 'disabled' ? 'Disabled' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => updateStatus(user.id, user.status === 'disabled' ? 'active' : 'disabled', user.name || user.email)}
                                                className={`px-3 py-1 rounded text-xs font-bold transition ${user.status === 'disabled'
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                    }`}
                                            >
                                                {user.status === 'disabled' ? 'Enable' : 'Disable'}
                                            </button>
                                            <button
                                                onClick={() => handleConvertType(user.id, 'diner', user.name || user.email)}
                                                className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-xs font-bold transition ml-2 border border-purple-500/30"
                                                title="Convert to Restaurant Account"
                                            >
                                                To Restaurant
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id, user.name || user.email, 'diner')}
                                                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded text-xs font-bold border border-red-500/30 ml-2"
                                                title="Permanently Delete"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-text-secondary italic">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerPortal;
