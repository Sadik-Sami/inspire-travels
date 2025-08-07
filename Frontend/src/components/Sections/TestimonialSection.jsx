import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, MapPin, Calendar, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import person1 from '../../assets/person.jpg';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa6';

const TestimonialSection = () => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [direction, setDirection] = useState(0);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);

	const testimonials = [
		{
			name: 'Sarah Johnson',
			location: 'New York, USA',
			tripDestination: 'Japan Cultural Tour',
			comment:
				'Our trip to Japan was flawlessly organized. Every detail was considered, from the ryokan stays to the private tea ceremony. The attention to cultural authenticity made this truly the experience of a lifetime!',
			rating: 5,
			date: 'March 2024',
			avatar: '/src/assets/person1.png',
		},
		{
			name: 'David Chen',
			location: 'Toronto, Canada',
			tripDestination: 'African Safari Adventure',
			comment:
				'The African safari exceeded all expectations. Our guide was incredibly knowledgeable about wildlife behavior, and the accommodations perfectly balanced luxury with authentic bush experience. Will definitely book again!',
			rating: 5,
			date: 'February 2024',
			avatar: '/professional-man-outdoors.png',
		},
		{
			name: 'Emma Rodriguez',
			location: 'London, UK',
			tripDestination: 'European Heritage Tour',
			comment:
				"The customized European tour was perfect for our family of five. The team was incredibly responsive to our needs, and the local experiences they arranged gave us genuine insights into each country's culture and history.",
			rating: 5,
			date: 'January 2024',
			avatar: '/placeholder-jw29h.png',
		},
		{
			name: 'Michael Thompson',
			location: 'Sydney, Australia',
			tripDestination: 'Southeast Asia Explorer',
			comment:
				'From the bustling markets of Bangkok to the serene temples of Angkor Wat, every moment was perfectly curated. The local guides were exceptional, and the seamless logistics made traveling with elderly parents stress-free.',
			rating: 5,
			date: 'December 2023',
			avatar: '/middle-aged-man-travel.png',
		},
		{
			name: 'Lisa Park',
			location: 'Seoul, South Korea',
			tripDestination: 'Mediterranean Cruise',
			comment:
				'The Mediterranean cruise was absolutely magical. Each port offered unique experiences, from cooking classes in Tuscany to archaeological tours in Greece. The attention to detail and personalized service was outstanding.',
			rating: 5,
			date: 'November 2023',
			avatar: '/asian-woman-vacation.png',
		},
	];

	// Auto-play functionality
	useEffect(() => {
		if (!isAutoPlaying) return;

		const interval = setInterval(() => {
			setDirection(1);
			setActiveIndex((prev) => (prev + 1) % testimonials.length);
		}, 5000);

		return () => clearInterval(interval);
	}, [activeIndex, isAutoPlaying, testimonials.length]);

	const nextTestimonial = () => {
		setIsAutoPlaying(false);
		setDirection(1);
		setActiveIndex((prev) => (prev + 1) % testimonials.length);
	};

	const prevTestimonial = () => {
		setIsAutoPlaying(false);
		setDirection(-1);
		setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
	};

	const goToTestimonial = (index) => {
		setIsAutoPlaying(false);
		setDirection(index > activeIndex ? 1 : -1);
		setActiveIndex(index);
	};

	const slideVariants = {
		enter: (direction) => ({
			x: direction > 0 ? 1000 : -1000,
			opacity: 0,
			scale: 0.9,
		}),
		center: {
			x: 0,
			opacity: 1,
			scale: 1,
		},
		exit: (direction) => ({
			x: direction < 0 ? 1000 : -1000,
			opacity: 0,
			scale: 0.9,
		}),
	};

	const currentTestimonial = testimonials[activeIndex];

	return (
		<section className='py-24 bg-background relative overflow-hidden'>
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
								Testimonials
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
							What Our{' '}
							<span className='text-primary relative'>
								Travelers Say
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
							Don't just take our word for it — discover why thousands of travelers choose us for their most memorable
							adventures.
						</p>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className='flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground'>
						<div className='flex items-center gap-2'>
							<Star size={16} className='text-yellow-500' fill='currentColor' />
							<span>4.9/5 from 2,500+ reviews</span>
						</div>
						<div className='flex items-center gap-2'>
							<Quote size={16} className='text-primary' />
							<span>98% would recommend us</span>
						</div>
					</motion.div>
				</div>

				{/* Testimonial Carousel */}
				<div className='relative max-w-6xl mx-auto'>
					{/* Large decorative quote */}
					<div className='absolute -top-14 -left-30 text-primary/10 hidden lg:block pointer-events-none z-10'>
						<FaQuoteLeft className='text-primary' size={120} />
					</div>

					<div className='relative'>
						<AnimatePresence mode='wait' custom={direction}>
							<motion.div
								key={activeIndex}
								custom={direction}
								variants={slideVariants}
								initial='enter'
								animate='center'
								exit='exit'
								transition={{
									x: { type: 'spring', stiffness: 300, damping: 30 },
									opacity: { duration: 0.2 },
									scale: { duration: 0.2 },
								}}
								className='bg-card rounded-3xl shadow-xl border border-border overflow-hidden'>
								<div className='p-8 md:p-12'>
									<div className='flex flex-col lg:flex-row gap-8 items-center'>
										{/* Avatar and Info */}
										<div className='lg:w-1/3 text-center lg:text-left'>
											<div className='relative inline-block mb-6'>
												<div className='w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg'>
													<img src={person1} alt={currentTestimonial.name} className='w-full h-full object-cover' />
												</div>
												<div className='absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-lg'>
													<Quote size={16} className='text-primary-foreground' />
												</div>
											</div>

											<div className='space-y-3'>
												<h4 className='text-xl font-heading font-bold text-foreground'>{currentTestimonial.name}</h4>

												<div className='flex items-center justify-center lg:justify-start gap-1 text-muted-foreground'>
													<MapPin size={14} />
													<span className='text-sm'>{currentTestimonial.location}</span>
												</div>

												<div className='flex items-center justify-center lg:justify-start gap-1 text-muted-foreground'>
													<Calendar size={14} />
													<span className='text-sm'>{currentTestimonial.date}</span>
												</div>

												<div className='inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium'>
													{currentTestimonial.tripDestination}
												</div>

												{/* Rating */}
												<div className='flex justify-center lg:justify-start gap-1'>
													{[...Array(5)].map((_, i) => (
														<Star
															key={i}
															size={18}
															className={
																i < currentTestimonial.rating
																	? 'text-yellow-400 fill-current'
																	: 'text-muted-foreground/30'
															}
														/>
													))}
												</div>
											</div>
										</div>

										{/* Testimonial Content */}
										<div className='lg:w-2/3'>
											<blockquote className='text-lg md:text-xl text-foreground leading-relaxed italic mb-6 relative'>
												<span className='text-primary/30 text-6xl absolute -top-4 -left-2 font-serif'>"</span>
												<span className='relative z-10'>{currentTestimonial.comment}</span>
												<span className='text-primary/30 text-6xl absolute -bottom-8 -right-2 font-serif'>"</span>
											</blockquote>
										</div>
									</div>
								</div>
							</motion.div>
						</AnimatePresence>

						{/* Navigation Controls */}
						<div className='flex justify-center items-center mt-12 gap-6'>
							<motion.button
								onClick={prevTestimonial}
								className='p-3 rounded-full bg-card border border-border hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm'
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								aria-label='Previous testimonial'>
								<ChevronLeft size={20} className='text-foreground' />
							</motion.button>

							{/* Dot Indicators */}
							<div className='flex items-center gap-3'>
								{testimonials.map((_, index) => (
									<motion.button
										key={index}
										onClick={() => goToTestimonial(index)}
										className={`rounded-full transition-all duration-300 ${
											index === activeIndex
												? 'bg-primary w-8 h-3'
												: 'bg-muted-foreground/30 hover:bg-primary/50 w-3 h-3'
										}`}
										whileHover={{ scale: 1.2 }}
										whileTap={{ scale: 0.9 }}
										aria-label={`Go to testimonial ${index + 1}`}
									/>
								))}
							</div>

							<motion.button
								onClick={nextTestimonial}
								className='p-3 rounded-full bg-card border border-border hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm'
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								aria-label='Next testimonial'>
								<ChevronRight size={20} className='text-foreground' />
							</motion.button>
						</div>

						{/* Auto-play indicator */}
						<div className='flex justify-center mt-6'>
							<button
								onClick={() => setIsAutoPlaying(!isAutoPlaying)}
								className='text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2'>
								<div
									className={`w-2 h-2 rounded-full ${
										isAutoPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
									}`}
								/>
								{isAutoPlaying ? 'Auto-playing' : 'Paused'}
							</button>
						</div>
					</div>

					<div className='absolute bottom-20 -right-30 text-primary/10 hidden lg:block pointer-events-none z-10'>
						<FaQuoteRight className='text-primary' size={120} />
					</div>
				</div>

				{/* Bottom CTA */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className='text-center mt-20'>
					<div className='bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10 max-w-4xl mx-auto'>
						<h3 className='text-2xl md:text-3xl font-heading font-bold text-foreground mb-4'>
							Ready to Create Your Own Story?
						</h3>
						<p className='text-muted-foreground mb-8 max-w-2xl mx-auto'>
							Join our community of satisfied travelers and start planning your next unforgettable adventure.
						</p>
						<motion.button
							className='bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium hover:bg-primary/90 transition-colors duration-300 shadow-lg hover:shadow-xl'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}>
							Start Your Journey
						</motion.button>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default TestimonialSection;
