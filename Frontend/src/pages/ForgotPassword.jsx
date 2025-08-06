'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

const ForgotPassword = () => {
	const { resetPassword } = useAuth();
	const [email, setEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [resetStatus, setResetStatus] = useState({ type: '', message: '' });

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email || !/\S+@\S+\.\S+/.test(email)) {
			setResetStatus({
				type: 'error',
				message: 'Please enter a valid email address',
			});
			return;
		}

		setIsSubmitting(true);
		setResetStatus({ type: '', message: '' });

		try {
			const result = await resetPassword(email);
			if (result.success) {
				setResetStatus({
					type: 'success',
					message: 'Password reset email sent. Please check your inbox.',
				});
			} else {
				setResetStatus({
					type: 'error',
					message: result.error || 'Failed to send reset email. Please try again.',
				});
			}
		} catch (error) {
			setResetStatus({
				type: 'error',
				message: 'An unexpected error occurred. Please try again.',
			});
			console.error('Password reset error:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.5,
				when: 'beforeChildren',
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.5 },
		},
	};

	return (
		<div className='min-h-screen flex items-center justify-center p-4 bg-background'>
			<motion.div className='w-full max-w-md' variants={containerVariants} initial='hidden' animate='visible'>
				<Card className='border-none shadow-lg'>
					<CardHeader className='space-y-1'>
						<motion.div variants={itemVariants}>
							<CardTitle className='text-2xl font-bold text-center'>Reset Your Password</CardTitle>
							<CardDescription className='text-center'>
								Enter your email address and we'll send you a link to reset your password
							</CardDescription>
						</motion.div>
					</CardHeader>
					<CardContent>
						{resetStatus.message && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}>
								<Alert
									variant={resetStatus.type === 'error' ? 'destructive' : 'default'}
									className={`mb-6 ${
										resetStatus.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : ''
									}`}>
									{resetStatus.type === 'success' && <CheckCircle className='h-4 w-4 mr-2' />}
									<AlertDescription>{resetStatus.message}</AlertDescription>
								</Alert>
							</motion.div>
						)}

						<form onSubmit={handleSubmit} className='space-y-4'>
							<motion.div className='space-y-2' variants={itemVariants}>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									placeholder='name@example.com'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</motion.div>

							<motion.div variants={itemVariants}>
								<Button type='submit' className='w-full bg-primary hover:bg-primary/90' disabled={isSubmitting}>
									{isSubmitting ? (
										<div className='flex items-center'>
											<div className='animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full'></div>
											Sending...
										</div>
									) : (
										<div className='flex items-center justify-center'>
											<Mail className='mr-2 h-4 w-4' />
											Send Reset Link
										</div>
									)}
								</Button>
							</motion.div>
						</form>
					</CardContent>
					<CardFooter className='flex justify-center'>
						<motion.div variants={itemVariants} className='text-center'>
							<Link to='/login' className='text-primary hover:underline font-medium flex items-center'>
								<ArrowLeft className='mr-1 h-4 w-4' />
								Back to Login
							</Link>
						</motion.div>
					</CardFooter>
				</Card>
			</motion.div>
		</div>
	);
};

export default ForgotPassword;
