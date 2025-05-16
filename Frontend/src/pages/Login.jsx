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
					<img
						src={loginPhoto || '/placeholder.svg'}
						alt='Travel destinations'
						className='h-screen w-full object-cover'
					/>
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
						<CardFooter className='flex justify-center'>
							<motion.div variants={itemVariants} className='text-center'>
								<p className='text-sm text-muted-foreground'>
									Don't have an account?{' '}
									<Link to='/signup' className='text-primary hover:underline font-medium'>
										Sign up
									</Link>
								</p>
							</motion.div>
						</CardFooter>
					</Card>
				</motion.div>
			</div>
		</div>
	);
};

export default Login;
