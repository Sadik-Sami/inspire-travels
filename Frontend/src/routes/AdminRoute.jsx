import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import useRole from '@/hooks/use-Role';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import AccessDeniedPage from '@/pages/AccessDeniedPage';

const AdminRoute = ({ children, allowedRoles = ['admin'] }) => {
	const { isAuthenticated, loading } = useAuth();
	console.log('Allowed role:', allowedRoles);
	console.log('Is user authenticated:', isAuthenticated);
	const { role, roleLoading } = useRole();
	const location = useLocation();
	const [showLoader, setShowLoader] = useState(true);

	// Hide loader after a minimum display time to prevent flashing
	useEffect(() => {
		const timer = setTimeout(() => {
			setShowLoader(false);
		}, 800);

		return () => clearTimeout(timer);
	}, []);

	// Show loading state while checking authentication and role
	if (loading || roleLoading || showLoader) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center'>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='flex flex-col items-center gap-4'>
					<Loader2 className='h-12 w-12 text-primary animate-spin' />
					<p className='text-lg text-muted-foreground'>Verifying your access...</p>
				</motion.div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to='/login' state={{ from: location.pathname }} replace />;
	}

	// Show access denied page if not authorized
	if (!allowedRoles.includes(role)) {
		return <AccessDeniedPage />;
	}

	// Render children if authenticated and authorized
	return children;
};

export default AdminRoute;
