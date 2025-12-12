import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ user, children, requiredType = null }) => {
    const location = useLocation();

    if (!user) {
        // Redirect to auth if not logged in, but save the location they were trying to go to
        // For now, simple redirect to home or auth
        return <Navigate to="/" replace />;
    }

    if (requiredType && user.type !== requiredType) {
        // If user is logged in but wrong type (e.g. diner trying to access restaurant dashboard)
        // Redirect to their appropriate dashboard
        return <Navigate to={user.type === 'restaurant' ? '/dashboard/restaurant' : '/dashboard/diner'} replace />;
    }

    return children;
};

export default ProtectedRoute;
