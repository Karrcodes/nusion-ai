
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const AdminGuard = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        // Check for admin session token (set by AdminLogin component)
        const adminSession = sessionStorage.getItem('nusion_admin_session');
        const timestamp = sessionStorage.getItem('nusion_admin_timestamp');

        // Verify session exists and is valid (within 24 hours for extra safety)
        const isValidSession = adminSession === 'true' &&
            timestamp &&
            (Date.now() - parseInt(timestamp)) < 24 * 60 * 60 * 1000;

        if (isValidSession) {
            setAuthorized(true);
        } else {
            // Clear any stale session data
            sessionStorage.removeItem('nusion_admin_session');
            sessionStorage.removeItem('nusion_admin_timestamp');

            // Redirect to admin login
            navigate('/admin');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
                <div className="animate-pulse">Verifying Clearance...</div>
            </div>
        );
    }

    return authorized ? children : null;
};

export default AdminGuard;
