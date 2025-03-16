import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import signupPhoto from '../assets/signupPhoto.jpg';

const Signup = () => {
	const navigate = useNavigate();
	const { signup } = useAuth();

	// Form state
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
		role: 'customer',
	});

	// UI state
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [signupError, setSignupError] = useState('');

	// Password strength indicators
	const [passwordFocus, setPasswordFocus] = useState(false);

	// Handle input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear errors when user types
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}
	};

	// Password validation checks
	const passwordChecks = {
		length: formData.password.length >= 8,
		uppercase: /[A-Z]/.test(formData.password),
		lowercase: /[a-z]/.test(formData.password),
		number: /[0-9]/.test(formData.password),
		match: formData.password === formData.confirmPassword && formData.confirmPassword !== '',
	};

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		// Name validation
		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		}

		// Email validation
		if (!formData.email) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Email is invalid';
		}

		// Phone validation
		if (!formData.phone) {
			newErrors.phone = 'Phone number is required';
		}

		// Password validation
		if (!formData.password) {
			newErrors.password = 'Password is required';
		} else if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.lowercase) {
			newErrors.password = "Password doesn't meet requirements";
		}

		// Confirm password validation
		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords don't match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Clear previous errors
		setSignupError('');

		// Validate form
		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			console.log(formData);
			const result = await signup(formData.name, formData.email, formData.phone, formData.password);

			if (result.success) {
				navigate('/'); // Redirect to home page after successful signup
			} else {
				setSignupError(result.error || 'Failed to create account. Please try again.');
			}
		} catch (error) {
			setSignupError('An unexpected error occurred. Please try again.');
			console.error('Signup error:', error);
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
			{/* Form Section */}
			<div className='w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 order-2 md:order-1'>
				<motion.div className='w-full max-w-md' variants={containerVariants} initial='hidden' animate='visible'>
					<Card className='border-none shadow-lg'>
						<CardHeader className='space-y-1'>
							<motion.div variants={itemVariants}>
								<CardTitle className='text-2xl font-bold text-center'>Create an Account</CardTitle>
								<CardDescription className='text-center'>Enter your details to create your account</CardDescription>
							</motion.div>
						</CardHeader>
						<CardContent>
							{signupError && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}>
									<Alert variant='destructive' className='mb-6'>
										<AlertDescription>{signupError}</AlertDescription>
									</Alert>
								</motion.div>
							)}

							<form onSubmit={handleSubmit} className='space-y-4'>
								<motion.div className='space-y-2' variants={itemVariants}>
									<Label htmlFor='name'>Full Name</Label>
									<Input
										id='name'
										name='name'
										placeholder='John Doe'
										value={formData.name}
										onChange={handleChange}
										className={errors.name ? 'border-red-500' : ''}
									/>
									{errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
								</motion.div>

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
									<Label htmlFor='phone'>Phone Number</Label>
									<Input
										id='phone'
										name='phone'
										placeholder='+1 (555) 123-4567'
										value={formData.phone}
										onChange={handleChange}
										className={errors.phone ? 'border-red-500' : ''}
									/>
									{errors.phone && <p className='text-sm text-red-500'>{errors.phone}</p>}
								</motion.div>

								<motion.div className='space-y-2' variants={itemVariants}>
									<Label htmlFor='password'>Password</Label>
									<div className='relative'>
										<Input
											id='password'
											name='password'
											type={showPassword ? 'text' : 'password'}
											placeholder='••••••••'
											value={formData.password}
											onChange={handleChange}
											onFocus={() => setPasswordFocus(true)}
											onBlur={() => setPasswordFocus(false)}
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

									{/* Password strength indicators */}
									{(passwordFocus || formData.password) && (
										<div className='mt-2 space-y-2'>
											<p className='text-xs font-medium'>Password must contain:</p>
											<div className='space-y-1'>
												<div className='flex items-center text-xs'>
													{passwordChecks.length ? (
														<Check size={14} className='text-green-500 mr-1' />
													) : (
														<X size={14} className='text-red-500 mr-1' />
													)}
													<span className={passwordChecks.length ? 'text-green-500' : 'text-muted-foreground'}>
														At least 8 characters
													</span>
												</div>
												<div className='flex items-center text-xs'>
													{passwordChecks.uppercase ? (
														<Check size={14} className='text-green-500 mr-1' />
													) : (
														<X size={14} className='text-red-500 mr-1' />
													)}
													<span className={passwordChecks.uppercase ? 'text-green-500' : 'text-muted-foreground'}>
														At least one uppercase letter
													</span>
												</div>
												<div className='flex items-center text-xs'>
													{passwordChecks.lowercase ? (
														<Check size={14} className='text-green-500 mr-1' />
													) : (
														<X size={14} className='text-red-500 mr-1' />
													)}
													<span className={passwordChecks.lowercase ? 'text-green-500' : 'text-muted-foreground'}>
														At least one lowercase letter
													</span>
												</div>
											</div>
										</div>
									)}
								</motion.div>

								<motion.div className='space-y-2' variants={itemVariants}>
									<Label htmlFor='confirmPassword'>Confirm Password</Label>
									<div className='relative'>
										<Input
											id='confirmPassword'
											name='confirmPassword'
											type={showConfirmPassword ? 'text' : 'password'}
											placeholder='••••••••'
											value={formData.confirmPassword}
											onChange={handleChange}
											className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
										/>
										<button
											type='button'
											className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500'
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
											{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</div>
									{errors.confirmPassword && <p className='text-sm text-red-500'>{errors.confirmPassword}</p>}
									{formData.confirmPassword && passwordChecks.match && (
										<p className='text-xs text-green-500 flex items-center'>
											<Check size={14} className='mr-1' />
											Passwords match
										</p>
									)}
								</motion.div>

								<motion.div variants={itemVariants}>
									<Button type='submit' className='w-full bg-primary hover:bg-primary/90' disabled={isSubmitting}>
										{isSubmitting ? (
											<div className='flex items-center'>
												<div className='animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full'></div>
												Creating account...
											</div>
										) : (
											<div className='flex items-center justify-center'>
												<UserPlus className='mr-2 h-4 w-4' />
												Sign Up
											</div>
										)}
									</Button>
								</motion.div>
							</form>
						</CardContent>
						<CardFooter className='flex flex-col space-y-4'>
							<motion.div variants={itemVariants} className='text-center w-full'>
								<p className='text-sm text-muted-foreground'>
									Already have an account?{' '}
									<Link to='/login' className='text-primary hover:underline font-medium'>
										Log in
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

			{/* Image Section */}
			<div className='md:w-1/2 bg-secondary order-1 md:order-2'>
				<div className='h-full w-full relative overflow-hidden'>
					<img src={signupPhoto} alt='Travel destinations' className='h-screen w-full object-cover' />
					<div className='absolute inset-0 bg-secondary/40 flex flex-col justify-center items-center text-white p-12'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.5 }}
							className='max-w-md text-center'>
							<h2 className='text-3xl font-bold mb-6'>Join Our Travel Community</h2>
							<p className='text-lg mb-8'>
								Create an account to unlock exclusive deals, save your favorite destinations, and start planning your
								next adventure.
							</p>
							<div className='flex justify-center space-x-4'>
								<div className='w-3 h-3 rounded-full bg-white/30'></div>
								<div className='w-3 h-3 rounded-full bg-white/60'></div>
								<div className='w-3 h-3 rounded-full bg-white/90'></div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signup;
