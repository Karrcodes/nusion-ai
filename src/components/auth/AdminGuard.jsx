
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
        const { data: { user } } = await supabase.auth.getUser();

        // HARDCODED OWNER EMAILS (For MVP "Shadow Strategy")
        // In production, this should check a 'role' column in 'profiles' table.
        const OWNERS = ['owner@nusion.ai', 'abduluk98@gmail.com'];

        if (user && OWNERS.includes(user.email)) {
            setAuthorized(true);
        } else {
            // Kick them out strictly
            navigate('/dashboard');
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
