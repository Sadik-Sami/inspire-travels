import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
	const navigate = useNavigate();

	return (
		<div className='min-h-screen flex flex-col items-center justify-center p-4 bg-background'>
			<motion.div
				className='max-w-md w-full mx-auto text-center space-y-6'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}>
				<motion.div
					initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
					animate={{ scale: 1, rotate: 0, opacity: 1 }}
					transition={{
						type: 'spring',
						stiffness: 300,
						damping: 20,
						delay: 0.2,
					}}
					className='mx-auto'>
					<div className='bg-secondary/10 p-6 rounded-full inline-block'>
						<Search className='h-16 w-16 text-secondary' />
					</div>
				</motion.div>

				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
					<h1 className='text-7xl font-bold text-foreground'>404</h1>
					<h2 className='text-2xl font-semibold text-foreground mt-2'>Page Not Found</h2>
				</motion.div>

				<motion.p
					className='text-muted-foreground text-lg'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}>
					The page you are looking for doesn't exist or has been moved.
				</motion.p>

				<motion.div
					className='flex flex-col sm:flex-row gap-3 justify-center'
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}>
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

export default NotFoundPage;
