import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AccessDeniedPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	return (
		<div className='min-h-screen flex flex-col items-center justify-center p-4 bg-background'>
			<motion.div
				className='max-w-md w-full mx-auto text-center space-y-6'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{
						type: 'spring',
						stiffness: 300,
						damping: 20,
						delay: 0.2,
					}}
					className='mx-auto'>
					<div className='bg-danger/10 p-6 rounded-full inline-block'>
						<ShieldAlert className='h-16 w-16 text-danger' />
					</div>
				</motion.div>

				<motion.h1
					className='text-3xl font-bold text-foreground'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}>
					Access Denied
				</motion.h1>

				<motion.p
					className='text-muted-foreground text-lg'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}>
					Oops! You don't have sufficient permissions to access this area.
				</motion.p>

				<motion.div
					className='text-sm text-muted-foreground bg-content1 p-4 rounded-lg'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}>
					{user && (
						<p>
							You're logged in as <span className='font-medium text-foreground'>{user.name}</span> with role{' '}
							<span className='font-medium text-primary'>{user.role || 'customer'}</span>
						</p>
					)}
					<p className='mt-1'>
						This area requires admin privileges. Please contact your administrator if you believe this is an error.
					</p>
				</motion.div>

				<motion.div
					className='flex flex-col sm:flex-row gap-3 justify-center'
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}>
					<Button variant='outline' className='flex items-center gap-2' onClick={() => navigate(-1)}>
						<ArrowLeft className='h-4 w-4' />
						Go Back
					</Button>
					<Button className='flex items-center gap-2 bg-primary hover:bg-primary/90' onClick={() => navigate('/')}>
						<Home className='h-4 w-4' />
						Go to Home
					</Button>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default AccessDeniedPage;
