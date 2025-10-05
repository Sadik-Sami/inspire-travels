import { motion } from 'framer-motion';
import { DollarSign, Shield, Users, Clock, Award, Globe, CheckCircle, Star, Sparkles } from 'lucide-react';
import MotionWrapper from '@/components/Animation/MotionWrapper';

const ValueProposition = () => {
	const features = [
		{
			title: 'Best Price Guarantee',
			description:
				"We offer competitive prices for your dream vacation. If you find a lower price elsewhere, we'll work to match it and provide additional value.",
			icon: DollarSign,
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-50',
			stats: [
				{ value: '25%', label: 'Average Savings' },
				{ value: '100%', label: 'Price Match' },
			],
		},
		{
			title: 'Safe & Secure Travel',
			description:
				'Your safety is our top priority. We ensure all our travel packages meet the highest safety standards with 24/7 support.',
			icon: Shield,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			stats: [
				{ value: '24/7', label: 'Support' },
				{ value: '99.9%', label: 'Safety Rating' },
			],
		},
		{
			title: 'Expert Local Guides',
			description:
				'Our experienced local guides provide authentic insights and ensure you have unforgettable experiences at every destination.',
			icon: Users,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
			stats: [
				{ value: '500+', label: 'Expert Guides' },
				{ value: '4.9★', label: 'Average Rating' },
			],
		},
		{
			title: 'Instant Booking',
			description:
				'Book your perfect trip in minutes with our streamlined process. No waiting, no hassle - just seamless travel planning.',
			icon: Clock,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
			stats: [
				{ value: '<5min', label: 'Booking Time' },
				{ value: '100K+', label: 'Happy Travelers' },
			],
		},
		{
			title: 'Award-Winning Service',
			description:
				'Recognized globally for excellence in travel services. Our commitment to quality has earned us numerous industry awards.',
			icon: Award,
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50',
			stats: [
				{ value: '15+', label: 'Awards Won' },
				{ value: '98%', label: 'Satisfaction' },
			],
		},
		{
			title: 'Global Coverage',
			description:
				'Explore 150+ destinations worldwide with our extensive network. From popular hotspots to hidden gems, we cover it all.',
			icon: Globe,
			color: 'text-teal-600',
			bgColor: 'bg-teal-50',
			stats: [
				{ value: '150+', label: 'Destinations' },
				{ value: '50+', label: 'Countries' },
			],
		},
	];

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
		hidden: { opacity: 0, y: 30 },
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
		<section className='py-24 bg-background relative'>
			<div className='container mx-auto px-4'>
				{/* Enhanced Header Section */}
				<div className='text-center mb-20 max-w-4xl mx-auto'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className='mb-6'>
						<div className='flex items-center justify-center gap-2 mb-4'>
							<span className='font-display text-sm inline-block text-primary uppercase tracking-wider font-medium'>
								Why Choose Us
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
							Experience Travel Like{' '}
							<span className='text-primary relative'>
								Never Before
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
							We combine decades of expertise, cutting-edge technology, and personalized service to create extraordinary
							journeys that exceed your expectations.
						</p>
					</motion.div>

					{/* Trust Indicators */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className='flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground'>
						<div className='flex items-center gap-2'>
							<CheckCircle size={16} className='text-emerald-500' />
							<span>Trusted by 100K+ travelers</span>
						</div>
						<div className='flex items-center gap-2'>
							<Star size={16} className='text-yellow-500' fill='currentColor' />
							<span>4.9/5 average rating</span>
						</div>
						<div className='flex items-center gap-2'>
							<Award size={16} className='text-primary' />
							<span>Award-winning service</span>
						</div>
					</motion.div>
				</div>

				{/* Features Grid */}
				<motion.div
					className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
					variants={containerVariants}
					initial='hidden'
					whileInView='show'
					viewport={{ once: true, margin: '-100px' }}>
					{features.map((feature, index) => {
						const IconComponent = feature.icon;
						return (
							<motion.div key={index} variants={itemVariants} className='group'>
								<motion.div
									className='bg-card rounded-2xl p-8 shadow-sm border border-border h-full flex flex-col hover:shadow-lg transition-all duration-300'
									whileHover={{
										y: -8,
										transition: { duration: 0.3, ease: 'easeOut' },
									}}>
									{/* Icon */}
									<div className='mb-6'>
										<div
											className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
											<IconComponent size={32} className={feature.color} />
										</div>
									</div>

									{/* Content */}
									<div className='flex-grow'>
										<h3 className='text-xl font-heading font-bold text-foreground mb-4'>{feature.title}</h3>
										<p className='text-muted-foreground leading-relaxed mb-6'>{feature.description}</p>
									</div>

									{/* Stats */}
									{feature.stats && (
										<div className='mt-auto pt-6 border-t border-border'>
											<div className='grid grid-cols-2 gap-4'>
												{feature.stats.map((stat, i) => (
													<div key={i} className='text-center'>
														<motion.p
															className='text-2xl font-bold text-foreground'
															initial={{ opacity: 0, scale: 0.5 }}
															whileInView={{ opacity: 1, scale: 1 }}
															viewport={{ once: true }}
															transition={{
																duration: 0.5,
																delay: index * 0.1 + i * 0.1 + 0.5,
															}}>
															{stat.value}
														</motion.p>
														<p className='text-sm text-muted-foreground font-medium'>{stat.label}</p>
													</div>
												))}
											</div>
										</div>
									)}
								</motion.div>
							</motion.div>
						);
					})}
				</motion.div>

				{/* Bottom CTA Section */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className='text-center mt-20'>
					<div className='bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10'>
						<h3 className='text-2xl md:text-3xl font-heading font-bold text-foreground mb-4'>
							Ready to Start Your Journey?
						</h3>
						<p className='text-muted-foreground mb-8 max-w-2xl mx-auto'>
							Join thousands of satisfied travelers who have discovered the world with us. Your next adventure is just a
							click away.
						</p>
						<motion.button
							className='bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors duration-300 shadow-lg hover:shadow-xl'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}>
							Start Planning Your Trip
						</motion.button>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default ValueProposition;
