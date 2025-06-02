'use client';

import { motion } from 'framer-motion';
import MotionWrapper from '@/components/Animation/MotionWrapper';
import GradientText from '@/components/ui/gradient-text';

const ValueProposition = ({ features }) => {
	return (
		<section className='py-24 bg-content1 relative overflow-hidden'>
			{/* Background decoration */}
			<div className='absolute inset-0'>
				<div className='absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 transform translate-x-1/3 -translate-y-1/3' />
				<div className='absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 rounded-full blur-3xl opacity-30 transform -translate-x-1/3 translate-y-1/3' />
			</div>

			<div className='container mx-auto px-4'>
				<MotionWrapper className='text-center mb-16 max-w-3xl mx-auto'>
					<h2 className='text-4xl font-extrabold mb-4 tracking-tight'>
						<GradientText>Why Choose Our Travel Experience</GradientText>
					</h2>
					<p className='text-lg text-muted-foreground'>
						We combine expertise, personalization, and exceptional service to create unforgettable journeys
					</p>
				</MotionWrapper>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					{features.map((feature, index) => (
						<MotionWrapper key={index} delay={index * 0.1} direction='up'>
							<motion.div
								className='bg-background rounded-2xl p-8 shadow-lg border border-content4/10 h-full flex flex-col'
								whileHover={{
									y: -5,
									boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
									transition: { duration: 0.2 },
								}}>
								<div className='mb-6'>
									<div className='w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600'>
										{feature.icon}
									</div>
								</div>

								<h3 className='text-xl font-bold mb-4'>{feature.title}</h3>

								<p className='text-muted-foreground leading-relaxed flex-grow'>{feature.description}</p>

								{feature.stats && (
									<div className='mt-6 pt-6 border-t border-content4/20'>
										<div className='flex justify-between'>
											{feature.stats.map((stat, i) => (
												<div key={i} className='text-center'>
													<p className='text-2xl font-bold text-primary-600'>{stat.value}</p>
													<p className='text-sm text-muted-foreground'>{stat.label}</p>
												</div>
											))}
										</div>
									</div>
								)}
							</motion.div>
						</MotionWrapper>
					))}
				</div>
			</div>
		</section>
	);
};

export default ValueProposition;
