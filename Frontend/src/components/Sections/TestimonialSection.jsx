'use client';

import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useState } from 'react';
import GradientText from '../ui/gradient-text';

const TestimonialSection = ({ testimonials }) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [direction, setDirection] = useState(0);

	const nextTestimonial = () => {
		setDirection(1);
		setActiveIndex((prev) => (prev + 1) % testimonials.length);
	};

	const prevTestimonial = () => {
		setDirection(-1);
		setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
	};

	const variants = {
		enter: (direction) => ({
			x: direction > 0 ? 300 : -300,
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (direction) => ({
			x: direction < 0 ? 300 : -300,
			opacity: 0,
		}),
	};

	return (
		<section className='py-20 relative overflow-hidden'>
			{/* Decorative Background Elements */}
			<div className='absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-primary-100/20 to-transparent -z-10'></div>
			<div className='absolute hidden lg:block -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary-200/20 -z-10'></div>
			<div className='absolute hidden lg:block top-24 -right-16 w-48 h-48 rounded-full bg-secondary-300/10 -z-10'></div>

			<div className='container mx-auto px-4'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					className='text-center mb-16 max-w-2xl mx-auto'>
					{/* <h2 className='font-heading text-4xl md:text-5xl font-bold mb-4 text-gradient'>What Our Travelers Say</h2> */}
					<h2 className='text-4xl font-extrabold mb-4 tracking-tight'>
						<GradientText variant='purple'>What Our Travelers Say</GradientText>
					</h2>
					<p className='text-muted-foreground text-lg'>
						Don't just take our word for it — hear from our happy travelers about their experiences.
					</p>
				</motion.div>

				<div className='relative overflow-hidden'>
					<div className='flex justify-between items-center mb-10'>
						{/* Large quote mark */}
						<motion.div
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className='absolute top-0 left-8 text-primary-200/30 hidden lg:block'>
							<Quote size={120} />
						</motion.div>

						{/* Testimonial Carousel */}
						<div className='relative w-full max-w-4xl mx-auto px-4'>
							<motion.div
								key={activeIndex}
								custom={direction}
								variants={variants}
								initial='enter'
								animate='center'
								exit='exit'
								transition={{ duration: 0.5, ease: 'easeInOut' }}
								className='bg-background rounded-2xl shadow-lg p-8 md:p-12 relative z-10 border border-content1'>
								<div className='flex flex-col md:flex-row gap-8 items-center'>
									<div className='md:w-1/3'>
										<div className='relative'>
											<div className='w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary-200 mx-auto'>
												{testimonials[activeIndex]?.image ? (
													<img
														src={testimonials[activeIndex].image || '/placeholder.svg'}
														alt={testimonials[activeIndex].name}
														className='w-full h-full object-cover'
													/>
												) : (
													<div className='w-full h-full bg-primary-100/50 flex items-center justify-center text-primary-700 text-2xl font-bold'>
														{testimonials[activeIndex]?.name?.charAt(0) || 'T'}
													</div>
												)}
											</div>
											<div className='absolute -bottom-2 -right-2 bg-primary rounded-full p-1.5'>
												<Quote size={16} className='text-white' />
											</div>
										</div>
										<div className='text-center mt-4'>
											<div className='flex justify-center mt-2 text-yellow-400'>
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														size={16}
														fill={i < testimonials[activeIndex]?.rating ? 'currentColor' : 'none'}
														className={i < testimonials[activeIndex]?.rating ? 'text-yellow-400' : 'text-muted'}
													/>
												))}
											</div>
										</div>
									</div>

									<div className='md:w-2/3'>
										<p className='text-lg md:text-xl italic mb-6 text-foreground/90'>
											"{testimonials[activeIndex]?.comment}"
										</p>
										<div>
											<h4 className='text-lg font-bold font-heading text-primary-600'>
												{testimonials[activeIndex]?.name}
											</h4>
											<p className='text-sm text-muted-foreground font-accent'>{testimonials[activeIndex]?.location}</p>
										</div>
									</div>
								</div>
							</motion.div>

							{/* Navigation Controls */}
							<div className='flex justify-center mt-8 gap-4'>
								<button
									onClick={prevTestimonial}
									className='p-3 rounded-full bg-background border border-border hover:bg-primary/5 transition-colors'
									aria-label='Previous testimonial'>
									<ChevronLeft size={20} />
								</button>

								<div className='flex items-center gap-2'>
									{testimonials.map((_, index) => (
										<button
											key={index}
											onClick={() => {
												setDirection(index > activeIndex ? 1 : -1);
												setActiveIndex(index);
											}}
											className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
												index === activeIndex ? 'bg-primary w-6' : 'bg-primary-200 hover:bg-primary-300'
											}`}
											aria-label={`Go to testimonial ${index + 1}`}></button>
									))}
								</div>

								<button
									onClick={nextTestimonial}
									className='p-3 rounded-full bg-background border border-border hover:bg-primary/5 transition-colors'
									aria-label='Next testimonial'>
									<ChevronRight size={20} />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default TestimonialSection;
