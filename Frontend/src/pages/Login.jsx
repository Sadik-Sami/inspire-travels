import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import loginPhoto from '../assets/loginPhoto.jpg';

const Login = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();
	const from = location?.state?.from || '/'; // Redirect to previous location after login
	// Form state
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	// UI state
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loginError, setLoginError] = useState('');

	// Handle input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear errors when user types
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}
	};

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		// Email validation
		if (!formData.email) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Email is invalid';
		}

		// Password validation
		if (!formData.password) {
			newErrors.password = 'Password is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		// Clear previous errors
		setLoginError('');
		// Validate form
		if (!validateForm()) return;
		setIsSubmitting(true);
		try {
			const result = await login(formData.email, formData.password);
			if (result.success) {
				navigate(from); // Redirect after successful login
			} else {
				setLoginError(result.error || 'Invalid email or password');
			}
		} catch (error) {
			setLoginError('An unexpected error occurred. Please try again.');
			console.error('Login error:', error);
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
		<div className='min-h-screen flex flex-col md:flex-row bg-background'>
			{/* Image Section */}
			<div className='hidden md:block md:w-1/2 bg-primary'>
				<div className='h-full w-full relative overflow-hidden'>
					<img src={loginPhoto} alt='Travel destinations' className='h-screen w-full object-cover' />
					<div className='absolute inset-0 bg-primary/40 flex flex-col justify-center items-center text-white p-12'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.5 }}
							className='max-w-md text-center'>
							<h2 className='text-3xl font-bold mb-6'>Welcome Back to TravelEase</h2>
							<p className='text-lg mb-8'>
								Log in to access your account and continue exploring amazing destinations around the world.
							</p>
							<div className='flex justify-center space-x-4'>
								<div className='w-3 h-3 rounded-full bg-white/90'></div>
								<div className='w-3 h-3 rounded-full bg-white/60'></div>
								<div className='w-3 h-3 rounded-full bg-white/30'></div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Form Section */}
			<div className='w-full md:w-1/2 flex items-center justify-center p-4 md:p-8'>
				<motion.div className='w-full max-w-md' variants={containerVariants} initial='hidden' animate='visible'>
					<Card className='border-none shadow-lg'>
						<CardHeader className='space-y-1'>
							<motion.div variants={itemVariants}>
								<CardTitle className='text-2xl font-bold text-center'>Login to Your Account</CardTitle>
								<CardDescription className='text-center'>Enter your credentials to access your account</CardDescription>
							</motion.div>
						</CardHeader>
						<CardContent>
							{loginError && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}>
									<Alert variant='destructive' className='mb-6'>
										<AlertDescription>{loginError}</AlertDescription>
									</Alert>
								</motion.div>
							)}

							<form onSubmit={handleSubmit} className='space-y-4'>
								<motion.div className='space-y-2' variants={itemVariants}>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										name='email'
										type='email'
										placeholder='name@example.com'
										value={formData.email}
										onChange={handleChange}
										className={errors.email ? 'border-red-500' : ''}
									/>
									{errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
								</motion.div>

								<motion.div className='space-y-2' variants={itemVariants}>
									<div className='flex items-center justify-between'>
										<Label htmlFor='password'>Password</Label>
										<Link to='/forgot-password' className='text-sm text-primary hover:underline'>
											Forgot password?
										</Link>
									</div>
									<div className='relative'>
										<Input
											id='password'
											name='password'
											type={showPassword ? 'text' : 'password'}
											placeholder='••••••••'
											value={formData.password}
											onChange={handleChange}
											className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
										/>
										<button
											type='button'
											className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500'
											onClick={() => setShowPassword(!showPassword)}>
											{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</div>
									{errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
								</motion.div>

								<motion.div variants={itemVariants}>
									<Button type='submit' className='w-full bg-primary hover:bg-primary/90' disabled={isSubmitting}>
										{isSubmitting ? (
											<div className='flex items-center'>
												<div className='animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full'></div>
												Logging in...
											</div>
										) : (
											<div className='flex items-center justify-center'>
												<LogIn className='mr-2 h-4 w-4' />
												Login
											</div>
										)}
									</Button>
								</motion.div>
							</form>
						</CardContent>
						<CardFooter className='flex flex-col space-y-4'>
							<motion.div variants={itemVariants} className='text-center w-full'>
								<p className='text-sm text-muted-foreground'>
									Don't have an account?{' '}
									<Link to='/signup' className='text-primary hover:underline font-medium'>
										Sign up
									</Link>
								</p>
							</motion.div>

							<motion.div variants={itemVariants} className='relative w-full'>
								<div className='absolute inset-0 flex items-center'>
									<div className='w-full border-t border-muted'></div>
								</div>
								<div className='relative flex justify-center text-xs uppercase'>
									<span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
								</div>
							</motion.div>

							<motion.div variants={itemVariants} className='grid grid-cols-2 gap-4 w-full'>
								<Button variant='outline' className='w-full'>
									<svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
										<path
											d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
											fill='#4285F4'
										/>
										<path
											d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
											fill='#34A853'
										/>
										<path
											d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
											fill='#FBBC05'
										/>
										<path
											d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
											fill='#EA4335'
										/>
									</svg>
									Google
								</Button>
								<Button variant='outline' className='w-full'>
									<svg className='mr-2 h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
										<path d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' />
									</svg>
									Facebook
								</Button>
							</motion.div>
						</CardFooter>
					</Card>
				</motion.div>
			</div>
		</div>
	);
};

export default Login;
