import { motion } from 'framer-motion';
import { useState } from 'react';
import MotionWrapper from '@/components/Animation/MotionWrapper';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Send, Mail, Gift, Bell, MapPin, Users, CheckCircle, Sparkles, Plane } from 'lucide-react';

const NewsletterSection = () => {
	const [email, setEmail] = useState('');
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const benefits = [
		{
			icon: Gift,
			title: 'Exclusive Deals',
			description: 'Up to 40% off on selected destinations',
		},
		{
			icon: Bell,
			title: 'Early Access',
			description: 'Be first to know about new packages',
		},
		{
			icon: MapPin,
			title: 'Travel Tips',
			description: 'Expert advice from seasoned travelers',
		},
		{
			icon: Plane,
			title: 'Flash Sales',
			description: 'Limited-time offers just for subscribers',
		},
	];

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email) return;

		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			setIsSubmitted(true);
			setIsLoading(false);
			setEmail('');
		}, 1500);
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	};

	return (
		<section className='py-24 bg-background relative overflow-hidden'>
			<div className='container mx-auto px-4'>
				{/* Enhanced Header Section */}
				<div className='text-center mb-16 max-w-4xl mx-auto'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className='mb-6'>
						<div className='flex items-center justify-center gap-2 mb-4'>
							<span className='font-display text-sm inline-block text-primary uppercase tracking-wider font-medium'>
								Newsletter
							</span>
							<motion.div
								animate={{
									rotate: [0, 5, -5, 0],
									scale: [1, 1.1, 1],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									repeatType: 'reverse',
								}}>
								<Sparkles size={16} className='text-primary' />
							</motion.div>
						</div>

						<h2 className='text-4xl md:text-5xl font-heading font-bold text-foreground mb-6 leading-tight'>
							Stay Updated on{' '}
							<span className='text-primary relative'>
								Travel Deals
								<motion.div
									className='absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full'
									initial={{ scaleX: 0 }}
									whileInView={{ scaleX: 1 }}
									viewport={{ once: true }}
									transition={{ duration: 0.8, delay: 0.5 }}
								/>
							</span>
						</h2>

						<p className='text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto'>
							Join over 50,000 travelers who receive exclusive offers, insider tips, and early access to our best deals
							delivered straight to their inbox.
						</p>
					</motion.div>

					{/* Trust Indicators */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className='flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground mb-12'>
						<div className='flex items-center gap-2'>
							<Users size={16} className='text-primary' />
							<span>50K+ subscribers</span>
						</div>
						<div className='flex items-center gap-2'>
							<Mail size={16} className='text-primary' />
							<span>Weekly updates</span>
						</div>
						<div className='flex items-center gap-2'>
							<CheckCircle size={16} className='text-emerald-500' />
							<span>No spam, unsubscribe anytime</span>
						</div>
					</motion.div>
				</div>

				{/* Main Newsletter Card */}
				<div className='container mx-auto px-4'>
					<div className='bg-card rounded-3xl shadow-xl border border-border overflow-hidden'>
						<div className='relative p-8 md:p-16 lg:p-20'>
							{/* Success State */}
							{isSubmitted && (
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									className='text-center py-12'>
									<div className='w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6'>
										<CheckCircle size={40} className='text-emerald-600' />
									</div>
									<h3 className='text-3xl font-heading font-bold text-foreground mb-4'>Welcome Aboard! 🎉</h3>
									<p className='text-lg text-muted-foreground mb-8 max-w-md mx-auto'>
										Thank you for subscribing! Check your email for a special welcome offer and your first travel
										inspiration.
									</p>
									<button
										onClick={() => setIsSubmitted(false)}
										className='text-primary hover:text-primary/80 font-medium text-lg'>
										Subscribe another email
									</button>
								</motion.div>
							)}

							{/* Default State */}
							{!isSubmitted && (
								<div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
									{/* Left Side - Form */}
									<div className='order-2 lg:order-1'>
										{/* Icon */}
										<motion.div
											initial={{ opacity: 0, scale: 0.5 }}
											whileInView={{ opacity: 1, scale: 1 }}
											viewport={{ once: true }}
											transition={{ duration: 0.5 }}
											className='mb-8'>
											<div className='inline-block p-5 bg-primary/10 rounded-2xl'>
												<Mail className='h-16 w-16 text-primary' />
											</div>
										</motion.div>

										<div className='mb-8'>
											<h3 className='text-2xl md:text-3xl font-heading font-bold text-foreground mb-4'>
												Never Miss a Deal Again
											</h3>
											<p className='text-lg text-muted-foreground leading-relaxed'>
												Get exclusive access to flash sales, early bird discounts, and personalized travel
												recommendations based on your preferences.
											</p>
										</div>

										{/* Newsletter Form */}
										<form onSubmit={handleSubmit} className='space-y-6 mb-8'>
											<div className='relative'>
												<Input
													type='email'
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													placeholder='Enter your email address'
													className='w-full px-6 py-5 text-lg rounded-xl border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300'
													required
												/>
											</div>
											<AnimatedButton
												type='submit'
												disabled={isLoading || !email}
												className='w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50'>
												{isLoading ? (
													<>
														<motion.div
															animate={{ rotate: 360 }}
															transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
															className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2'
														/>
														Subscribing...
													</>
												) : (
													<>
														Get Exclusive Deals
														<Send className='ml-2 h-5 w-5' />
													</>
												)}
											</AnimatedButton>
										</form>

										<p className='text-sm text-muted-foreground'>
											By subscribing, you agree to our{' '}
											<a href='#' className='text-primary hover:underline'>
												Privacy Policy
											</a>{' '}
											and consent to receive updates from our company.
										</p>
									</div>

									{/* Right Side - Benefits */}
									<div className='order-1 lg:order-2'>
										<div className='bg-primary/5 rounded-2xl p-8 border border-primary/10'>
											<h4 className='text-xl font-heading font-bold text-foreground mb-6'>What You'll Get:</h4>

											<motion.div
												variants={containerVariants}
												initial='hidden'
												whileInView='show'
												viewport={{ once: true }}
												className='space-y-6'>
												{benefits.map((benefit, index) => {
													const IconComponent = benefit.icon;
													return (
														<motion.div key={index} variants={itemVariants} className='flex items-start gap-4 group'>
															<div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300'>
																<IconComponent size={24} className='text-primary' />
															</div>
															<div>
																<h5 className='font-heading font-semibold text-foreground mb-1'>{benefit.title}</h5>
																<p className='text-muted-foreground'>{benefit.description}</p>
															</div>
														</motion.div>
													);
												})}
											</motion.div>

											{/* Additional Stats */}
											<div className='mt-8 pt-6 border-t border-border'>
												<div className='grid grid-cols-2 gap-4 text-center'>
													<div>
														<div className='text-2xl font-bold text-primary'>40%</div>
														<div className='text-sm text-muted-foreground'>Average Savings</div>
													</div>
													<div>
														<div className='text-2xl font-bold text-primary'>24h</div>
														<div className='text-sm text-muted-foreground'>Early Access</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Social Proof Section */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className='text-center mt-16'>
					<div className='max-w-3xl mx-auto'>
						<h3 className='text-xl font-heading font-semibold text-foreground mb-6'>
							Join travelers from around the world
						</h3>

						{/* Testimonial Preview */}
						<div className='bg-primary/5 rounded-2xl p-6 border border-primary/10'>
							<div className='flex items-center justify-center gap-4 mb-4'>
								<div className='flex -space-x-2'>
									{[1, 2, 3, 4, 5].map((i) => (
										<div
											key={i}
											className='w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary'>
											{String.fromCharCode(64 + i)}
										</div>
									))}
								</div>
								<span className='text-sm text-muted-foreground'>+50,000 more</span>
							</div>
							<p className='text-muted-foreground italic'>
								"Thanks to the newsletter, I saved $800 on my European vacation and discovered hidden gems I never would
								have found otherwise!"
							</p>
							<p className='text-sm text-muted-foreground mt-2 font-medium'>- Sarah M., Newsletter Subscriber</p>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default NewsletterSection;
