import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import useRole from '@/hooks/use-Role';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import AccessDeniedPage from '@/pages/AccessDeniedPage';

const AdminRoute = ({ children, allowedRoles = ['admin'] }) => {
	const { isAuthenticated, loading, user } = useAuth();
	const { role, isLoading, isAdmin, isEmployee, isModerator } = useRole();
	console.log('AdminRoute Rendered', { isAuthenticated, loading, role, user });

	if (loading) {
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
	} else if (isLoading) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center'>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className='flex flex-col items-center gap-4'>
					<Loader2 className='h-12 w-12 text-primary animate-spin' />
					<p className='text-lg text-muted-foreground'>Checking your role...</p>
				</motion.div>
			</div>
		);
	}
	if (user && (isAdmin || isEmployee || isModerator)) {
		return children;
	}
	return <AccessDeniedPage />;
};

export default AdminRoute;
