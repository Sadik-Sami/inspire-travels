import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import useRole from '@/hooks/use-Role';
import { hasPermission } from '@/config/rbac';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import AccessDeniedPage from '@/pages/AccessDeniedPage';

const RoleBasedRoute = ({ children, requiredPermissions = [], fallbackPath = '/access-denied' }) => {
	const { isAuthenticated, loading, user } = useAuth();
	const { role, roleLoading } = useRole();

	// Show loading while checking authentication and role
	if (loading || roleLoading) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center'>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='flex flex-col items-center gap-4'>
					<Loader2 className='h-12 w-12 text-primary animate-spin' />
					<p className='text-lg text-muted-foreground'>Verifying access permissions...</p>
				</motion.div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated || !user) {
		return <Navigate to='/login' replace />;
	}

	// Check if user has required permissions
	if (requiredPermissions.length > 0 && !hasPermission(role, requiredPermissions)) {
		return <AccessDeniedPage requiredPermissions={requiredPermissions} userRole={role} />;
	}

	return children;
};

export default RoleBasedRoute;
