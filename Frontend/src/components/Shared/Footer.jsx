import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: 'easeOut' },
		},
	};

	const socialVariants = {
		hidden: { scale: 0 },
		visible: { scale: 1, transition: { duration: 0.3 } },
		hover: { scale: 1.2, transition: { duration: 0.2 } },
	};

	return (
		<motion.footer
			initial='hidden'
			whileInView='visible'
			viewport={{ once: true, amount: 0.1 }}
			variants={containerVariants}
			className='bg-content2 border-t border-border text-primary-foreground'>
			<div className='container mx-auto px-4 py-12'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
					<motion.div variants={itemVariants}>
						<h3 className='text-xl font-bold mb-4'>TravelEase</h3>
						<p className='mb-4'>
							Discover the world with us. We provide unforgettable travel experiences to destinations around the globe.
						</p>
						<div className='flex space-x-4'>
							<motion.a
								href='#'
								variants={socialVariants}
								whileHover='hover'
								className='hover:text-white/80 transition-colors'>
								<Facebook size={20} />
							</motion.a>
							<motion.a
								href='#'
								variants={socialVariants}
								whileHover='hover'
								className='hover:text-white/80 transition-colors'>
								<Twitter size={20} />
							</motion.a>
							<motion.a
								href='#'
								variants={socialVariants}
								whileHover='hover'
								className='hover:text-white/80 transition-colors'>
								<Instagram size={20} />
							</motion.a>
						</div>
					</motion.div>

					<motion.div variants={itemVariants}>
						<h3 className='text-xl font-bold mb-4'>Quick Links</h3>
						<ul className='space-y-2'>
							{['Home', 'Destinations', 'About Us', 'Contact'].map((item, index) => (
								<motion.li
									key={index}
									whileHover={{ x: 5 }}
									transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
									<Link
										to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
										className='hover:text-primary transition-colors'>
										{item}
									</Link>
								</motion.li>
							))}
						</ul>
					</motion.div>

					<motion.div variants={itemVariants}>
						<h3 className='text-xl font-bold mb-4'>Popular Destinations</h3>
						<ul className='space-y-2'>
							{[
								{ name: 'Bali, Indonesia', path: '/destinations/bali' },
								{ name: 'Paris, France', path: '/destinations/paris' },
								{ name: 'Tokyo, Japan', path: '/destinations/tokyo' },
								{ name: 'New York, USA', path: '/destinations/new-york' },
							].map((destination, index) => (
								<motion.li
									key={index}
									whileHover={{ x: 5 }}
									transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
									<Link to={destination.path} className='hover:text-primary transition-colors'>
										{destination.name}
									</Link>
								</motion.li>
							))}
						</ul>
					</motion.div>

					<motion.div variants={itemVariants}>
						<h3 className='text-xl font-bold mb-4'>Contact Us</h3>
						<ul className='space-y-2'>
							<motion.li
								className='flex items-center gap-2'
								whileHover={{ x: 5 }}
								transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
								<MapPin size={16} />
								<span>123 Travel Street, City, Country</span>
							</motion.li>
							<motion.li
								className='flex items-center gap-2'
								whileHover={{ x: 5 }}
								transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
								<Phone size={16} />
								<span>+1 (123) 456-7890</span>
							</motion.li>
							<motion.li
								className='flex items-center gap-2'
								whileHover={{ x: 5 }}
								transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
								<Mail size={16} />
								<span>info@travelease.com</span>
							</motion.li>
						</ul>
					</motion.div>
				</div>

				<motion.div variants={itemVariants} className='border-t border-content3-foreground/20 mt-8 pt-8 text-center'>
					<p>&copy; {new Date().getFullYear()} TravelEase. All rights reserved.</p>
				</motion.div>
			</div>
		</motion.footer>
	);
};

export default Footer;
