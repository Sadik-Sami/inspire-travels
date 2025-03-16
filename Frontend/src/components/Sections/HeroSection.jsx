import { motion } from 'framer-motion';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Link } from 'react-router-dom';

const HeroSection = ({
	title,
	subtitle,
	imageUrl,
	buttonText,
	buttonLink,
	height = 'h-[700px]',
	showButton = false,
}) => {
	return (
		<motion.section
			className={`relative ${height} bg-cover bg-center flex items-center`}
			style={{ backgroundImage: `url(${imageUrl})` }}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1 }}>
			<div className='absolute inset-0 bg-black/40'></div>
			<div className='container mx-auto px-4 relative z-10 text-white'>
				<FadeIn direction='up' delay={0.2}>
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-4'>{title}</h1>
				</FadeIn>
				<FadeIn direction='up' delay={0.4}>
					<p className='text-xl md:text-2xl mb-8 max-w-2xl'>{subtitle}</p>
				</FadeIn>
				{showButton && (
					<FadeIn direction='up' delay={0.6}>
						<AnimatedButton size='lg' asChild className='bg-secondary hover:bg-secondary/90 text-secondary-foreground'>
							<Link to={buttonLink}>{buttonText}</Link>
						</AnimatedButton>
					</FadeIn>
				)}
			</div>
		</motion.section>
	);
};

export default HeroSection;
