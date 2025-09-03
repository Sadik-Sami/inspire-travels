import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = ({
	title,
	subtitle,
	imageUrl,
	buttonText,
	buttonLink,
	height = 'h-[640px] md:h-[720px]',
	showButton = true,
}) => {
	return (
		<section className={`relative ${height} flex items-center overflow-hidden`}>
			{/* Parallax Background Image */}
			<motion.div
				className='absolute inset-0 bg-cover bg-center'
				style={{ backgroundImage: `url(${imageUrl})` }}
				initial={{ scale: 1.2 }}
				animate={{ scale: 1 }}
				transition={{ duration: 1.5, ease: 'easeOut' }}></motion.div>

			{/* Gradient Overlay */}
			<div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-0'></div>

			{/* Content */}
			<div className='container mx-auto px-4 relative z-10 text-white'>
				<div className='max-w-2xl'>
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}>
						<span className='font-accent inline-block text-primary-300 mb-2 uppercase tracking-wider font-medium'>
							Discover the world
						</span>
						<h1 className='text-4xl md:text-5xl lg:text-7xl font-heading font-bold mb-6 text-shadow-lg'>{title}</h1>
					</motion.div>

					<motion.p
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.6 }}
						className='text-xl md:text-2xl mb-8 max-w-xl text-white/90 text-shadow'>
						{subtitle}
					</motion.p>

					{showButton && (
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.8 }}>
							<Button
								asChild
								size='lg'
								className='bg-primary hover:bg-primary-600 text-white font-medium shadow-lg px-8 py-6 text-lg transition-all duration-300'>
								<Link to={buttonLink}>{buttonText}</Link>
							</Button>
						</motion.div>
					)}
				</div>

				{/* Scroll indicator */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.5,
						delay: 1.5,
						repeat: Number.POSITIVE_INFINITY,
						repeatType: 'reverse',
						repeatDelay: 0.5,
					}}
					className='absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center'>
					<span className='text-sm text-white/70 mb-2'>Scroll to explore</span>
					<ArrowDown className='text-white/70' size={20} />
				</motion.div>
			</div>

			{/* Decorative Elements */}
			<motion.div
				className='absolute bottom-10 right-10 w-64 h-64 border-4 border-white/10 rounded-full z-0'
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ duration: 1, delay: 1 }}></motion.div>

			<motion.div
				className='absolute top-20 left-10 w-32 h-32 border-2 border-white/10 rounded-full z-0'
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ duration: 1, delay: 1.2 }}></motion.div>
		</section>
	);
};

export default HeroSection;
