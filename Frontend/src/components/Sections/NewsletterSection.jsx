'use client';

import { motion } from 'framer-motion';
import MotionWrapper from '@/components/Animation/MotionWrapper';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Send, Mail } from 'lucide-react';
import GradientText from '@/components/ui/gradient-text';

const NewsletterSection = () => {
	return (
		<section className='py-24 relative overflow-hidden'>
			<div className='container mx-auto px-4'>
				<div className='relative rounded-3xl overflow-hidden'>
					{/* Background gradient */}
					<div className='absolute inset-0 bg-gradient-to-br from-primary-400/20 via-primary-600/10 to-secondary-400/20 z-0' />

					{/* Decorative elements */}
					<div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0'>
						<motion.div
							className='absolute top-10 left-10 w-64 h-64 rounded-full bg-primary-300/20 blur-3xl'
							animate={{
								x: [0, 30, 0],
								y: [0, 20, 0],
							}}
							transition={{
								duration: 8,
								repeat: Number.POSITIVE_INFINITY,
								ease: 'easeInOut',
							}}
						/>
						<motion.div
							className='absolute bottom-10 right-10 w-80 h-80 rounded-full bg-secondary-400/20 blur-3xl'
							animate={{
								x: [0, -30, 0],
								y: [0, -20, 0],
							}}
							transition={{
								duration: 10,
								repeat: Number.POSITIVE_INFINITY,
								ease: 'easeInOut',
								delay: 1,
							}}
						/>
					</div>

					<div className='relative z-10 py-16 px-8 md:px-16 flex flex-col items-center text-center'>
						<MotionWrapper>
							<div className='inline-block p-3 bg-primary-100 rounded-full mb-6'>
								<Mail className='h-8 w-8 text-primary-600' />
							</div>
						</MotionWrapper>

						<MotionWrapper delay={0.1}>
							<h2 className='text-4xl md:text-5xl font-extrabold mb-4 tracking-tight'>
								<GradientText variant='primary'>
									Stay Updated on Travel Deals
								</GradientText>
							</h2>
						</MotionWrapper>

						<MotionWrapper delay={0.2}>
							<p className='text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl'>
								Subscribe to our newsletter and receive exclusive offers, travel tips, and inspiration for your next
								adventure.
							</p>
						</MotionWrapper>

						<MotionWrapper delay={0.3} className='w-full max-w-md'>
							<form className='flex flex-col sm:flex-row gap-3 w-full'>
								<Input
									type='email'
									placeholder='Enter your email address'
									className='flex-1 px-4 py-6 rounded-xl text-foreground placeholder:text-muted-foreground border-primary-100 focus-visible:ring-primary-400'
								/>
								<AnimatedButton size='lg' className='bg-primary hover:bg-primary-600 text-accent py-6 rounded-xl'>
									Subscribe <Send className='ml-2 h-4 w-4' />
								</AnimatedButton>
							</form>
						</MotionWrapper>

						<MotionWrapper delay={0.4}>
							<p className='text-xs text-muted-foreground mt-4'>
								By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
							</p>
						</MotionWrapper>
					</div>
				</div>
			</div>
		</section>
	);
};

export default NewsletterSection;
