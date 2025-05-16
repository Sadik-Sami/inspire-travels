import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }) => {
	const { isAuthenticated, loading, accessToken } = useAuth();
	const location = useLocation();

	console.log('PrivateRoute:', {
		isAuthenticated,
		loading,
		accessToken,
	});

	// Show loading state while checking authentication
	if (loading) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center'>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='flex flex-col items-center gap-4'>
					<Loader2 className='h-12 w-12 text-primary animate-spin' />
					<p className='text-lg text-muted-foreground'>Verifying your credentials...</p>
				</motion.div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to='/login' state={{ from: location.pathname }} replace />;
	}

	// Render children if authenticated
	return children;
};

export default PrivateRoute;
