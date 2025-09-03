import { ImagesSlider } from '@/components/ui/images-slider';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, Plane, Shield, Star } from 'lucide-react';

const Hero = () => {
	const images = [
		'https://i.ibb.co.com/CKpJqpk9/mesut-kaya-e-Ocyhe5-9s-Q-unsplash.jpg',
		'https://i.ibb.co.com/JwDfk3BS/rebe-adelaida-zun-Qw-My5-B6-M-unsplash.jpg',
		'https://i.ibb.co.com/Y4B6nr4G/jack-anstey-XVoy-X7l9oc-Y-unsplash.jpg',
		'https://i.ibb.co.com/q3WQtZTm/paul-pastourmatzis-km74-CLco7qs-unsplash.jpg',
	];

	return (
		<section className='relative h-screen w-full overflow-hidden'>
			<ImagesSlider className='h-full' images={images} autoplay={true} direction='up'>
				<motion.div
					initial={{
						opacity: 0,
						y: -80,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					transition={{
						duration: 0.6,
					}}
					className='z-50 flex flex-col justify-center items-center h-full px-4 sm:px-6 lg:px-8'>
					<div className='text-center max-w-4xl mx-auto'>
						<div className='flex flex-wrap justify-center gap-2 mb-6'>
							<Badge variant='secondary' className='bg-white/20 text-white border-white/30 backdrop-blur-sm'>
								<Star className='w-3 h-3 mr-1' />
								4.9/5 Rating
							</Badge>
							<Badge variant='secondary' className='bg-white/20 text-white border-white/30 backdrop-blur-sm'>
								<Shield className='w-3 h-3 mr-1' />
								Trusted by 50K+ Travelers
							</Badge>
							<Badge variant='secondary' className='bg-white/20 text-white border-white/30 backdrop-blur-sm'>
								<MapPin className='w-3 h-3 mr-1' />
								150+ Destinations
							</Badge>
						</div>

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.6 }}
							className='text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight text-balance'>
							Explore the World
							<span className='block text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text'>
								with Confidence
							</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.6 }}
							className='text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed text-pretty'>
							Discover breathtaking destinations, hassle-free visa services, and tailored tour packages. Your dream
							adventure awaits with our expert guidance and unmatched support.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6, duration: 0.6 }}
							className='flex flex-wrap justify-center gap-6 mb-10 text-white/80'>
							<div className='flex items-center gap-2'>
								<Plane className='w-5 h-5 text-primary' />
								<span className='text-sm md:text-base'>Custom Tour Packages</span>
							</div>
							<div className='flex items-center gap-2'>
								<Shield className='w-5 h-5 text-primary' />
								<span className='text-sm md:text-base'>Visa Assistance</span>
							</div>
							<div className='flex items-center gap-2'>
								<MapPin className='w-5 h-5 text-primary' />
								<span className='text-sm md:text-base'>Expert Local Guides</span>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.8, duration: 0.6 }}
							className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
							<Button
								size='lg'
								className='bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold group transition-all duration-300 hover:scale-105'>
								Start Your Journey
								<ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
							</Button>

							<Button
								variant='outline'
								size='lg'
								className='bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105'>
								View Packages
							</Button>
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1, duration: 0.6 }}
							className='mt-12 text-white/70 text-sm'>
							Join thousands of satisfied travelers who've made their dreams come true
						</motion.div>
					</div>
				</motion.div>
			</ImagesSlider>
		</section>
	);
};

export default Hero;
