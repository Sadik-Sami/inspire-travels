import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import useRole from '@/hooks/use-Role';

const AdminRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();
	const { isAdmin, isModerator, isEmployee, roleLoading } = useRole();
	const location = useLocation();

	if (loading || roleLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to='/login' state={{ from: location.pathname }} replace />;
	}
	if (isAdmin || isModerator || isEmployee) {
		return children;
	}
};

export default AdminRoute;
