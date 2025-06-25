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
						<CardFooter className='flex justify-center'>
							<motion.div variants={itemVariants} className='text-center'>
								<p className='text-sm text-muted-foreground'>
									Already have an account?{' '}
									<Link to='/login' className='text-primary hover:underline font-medium'>
										Log in
									</Link>
								</p>
							</motion.div>
						</CardFooter>
					</Card>
				</motion.div>
			</div>

			{/* Image Section */}
			<div className='md:w-1/2 bg-secondary order-1 md:order-2'>
				<div className='h-full w-full relative overflow-hidden'>
					<img
						src={signupPhoto || '/placeholder.svg'}
						alt='Travel destinations'
						className='h-screen w-full object-cover'
					/>
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
