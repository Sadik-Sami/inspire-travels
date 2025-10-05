import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	Facebook,
	Twitter,
	Instagram,
	Linkedin,
	Mail,
	Phone,
	MapPin,
	Globe,
	Shield,
	CreditCard,
	Award,
} from 'lucide-react';

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
		hover: { scale: 1.1, transition: { duration: 0.2 } },
	};

	const quickLinks = [
		{ name: 'Home', path: '/' },
		{ name: 'Destinations', path: '/destinations' },
		{ name: 'About Us', path: '/about' },
		{ name: 'Contact', path: '/contact' },
		{ name: 'Blog', path: '/blog' },
		{ name: 'FAQ', path: '/faq' },
	];

	const services = [
		{ name: 'Flight Booking', path: '#' },
		{ name: 'Hotel Reservations', path: '#' },
		{ name: 'Tour Packages', path: '#' },
		{ name: 'Travel Insurance', path: '#' },
		{ name: 'Visa Assistance', path: '#' },
		{ name: 'Group Travel', path: '#' },
	];

	const legalLinks = [
		{ name: 'Privacy Policy', path: '#' },
		{ name: 'Terms of Service', path: '#' },
		{ name: 'Cookie Policy', path: '#' },
		{ name: 'Refund Policy', path: '#' },
	];

	const trustIndicators = [
		{ icon: Shield, text: 'Secure Booking' },
		{ icon: Award, text: 'Award Winning' },
		{ icon: CreditCard, text: 'Safe Payments' },
		{ icon: Globe, text: '150+ Destinations' },
	];

	return (
		<motion.footer
			initial='hidden'
			whileInView='visible'
			viewport={{ once: true, amount: 0.1 }}
			variants={containerVariants}
			className='bg-card border-t border-border'>
			<div className='container mx-auto px-4 py-12'>
				{/* Main Footer Content */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
					{/* Company Info */}
					<motion.div variants={itemVariants} className='lg:col-span-1'>
						<div className='mb-4'>
							<h3 className='text-2xl font-heading font-bold text-foreground mb-2'>Inspire Travels</h3>
							<p className='text-muted-foreground leading-relaxed'>
								Creating unforgettable travel experiences with personalized service, expert guidance, and unbeatable
								value since 2010.
							</p>
						</div>

						{/* Social Media */}
						<div className='flex items-center gap-3 mb-6'>
							{[
								{ icon: Facebook, href: '#', label: 'Facebook' },
								{ icon: Twitter, href: '#', label: 'Twitter' },
								{ icon: Instagram, href: '#', label: 'Instagram' },
								{ icon: Linkedin, href: '#', label: 'LinkedIn' },
							].map((social, index) => {
								const IconComponent = social.icon;
								return (
									<motion.a
										key={index}
										href={social.href}
										variants={socialVariants}
										whileHover='hover'
										className='w-10 h-10 bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300'
										aria-label={social.label}>
										<IconComponent size={18} />
									</motion.a>
								);
							})}
						</div>

						{/* Trust Indicators */}
						<div className='grid grid-cols-2 gap-2'>
							{trustIndicators.map((indicator, index) => {
								const IconComponent = indicator.icon;
								return (
									<div key={index} className='flex items-center gap-2 text-xs text-muted-foreground'>
										<IconComponent size={14} className='text-primary' />
										<span>{indicator.text}</span>
									</div>
								);
							})}
						</div>
					</motion.div>

					{/* Quick Links */}
					<motion.div variants={itemVariants}>
						<h4 className='text-lg font-heading font-semibold text-foreground mb-4'>Quick Links</h4>
						<ul className='space-y-2'>
							{quickLinks.map((link, index) => (
								<motion.li
									key={index}
									whileHover={{ x: 5 }}
									transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
									<Link
										to={link.path}
										className='text-muted-foreground hover:text-primary transition-colors duration-300 text-sm'>
										{link.name}
									</Link>
								</motion.li>
							))}
						</ul>
					</motion.div>

					{/* Services */}
					<motion.div variants={itemVariants}>
						<h4 className='text-lg font-heading font-semibold text-foreground mb-4'>Our Services</h4>
						<ul className='space-y-2'>
							{services.map((service, index) => (
								<motion.li
									key={index}
									whileHover={{ x: 5 }}
									transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
									<Link
										to={service.path}
										className='text-muted-foreground hover:text-primary transition-colors duration-300 text-sm'>
										{service.name}
									</Link>
								</motion.li>
							))}
						</ul>
					</motion.div>

					{/* Contact Info */}
					<motion.div variants={itemVariants}>
						<h4 className='text-lg font-heading font-semibold text-foreground mb-4'>Get in Touch</h4>
						<ul className='space-y-3'>
							<motion.li
								className='flex items-start gap-3'
								whileHover={{ x: 5 }}
								transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
								<MapPin size={16} className='text-primary mt-0.5 flex-shrink-0' />
								<span className='text-muted-foreground text-sm'>
									123 Travel Avenue
									<br />
									New York, NY 10001
								</span>
							</motion.li>
							<motion.li
								className='flex items-center gap-3'
								whileHover={{ x: 5 }}
								transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
								<Phone size={16} className='text-primary flex-shrink-0' />
								<a
									href='tel:+1234567890'
									className='text-muted-foreground hover:text-primary transition-colors text-sm'>
									+1 (234) 567-8900
								</a>
							</motion.li>
							<motion.li
								className='flex items-center gap-3'
								whileHover={{ x: 5 }}
								transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
								<Mail size={16} className='text-primary flex-shrink-0' />
								<a
									href='mailto:hello@inspiretravels.com'
									className='text-muted-foreground hover:text-primary transition-colors text-sm'>
									hello@inspiretravels.com
								</a>
							</motion.li>
						</ul>

						{/* Business Hours */}
						<div className='mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10'>
							<h5 className='text-sm font-medium text-foreground mb-1'>Business Hours</h5>
							<p className='text-xs text-muted-foreground'>
								Mon - Fri: 9:00 AM - 6:00 PM
								<br />
								Sat - Sun: 10:00 AM - 4:00 PM
							</p>
						</div>
					</motion.div>
				</div>

				{/* Bottom Section */}
				<motion.div variants={itemVariants} className='border-t border-border pt-6'>
					<div className='flex flex-col md:flex-row justify-between items-center gap-4'>
						{/* Copyright */}
						<div className='text-center md:text-left'>
							<p className='text-sm text-muted-foreground'>
								© {new Date().getFullYear()} Inspire Travels. All rights reserved.
							</p>
						</div>

						{/* Legal Links */}
						<div className='flex flex-wrap justify-center md:justify-end gap-4'>
							{legalLinks.map((link, index) => (
								<Link
									key={index}
									to={link.path}
									className='text-xs text-muted-foreground hover:text-primary transition-colors duration-300'>
									{link.name}
								</Link>
							))}
						</div>
					</div>

					{/* Additional Trust Elements */}
					<div className='flex flex-wrap justify-center items-center gap-6 mt-4 pt-4 border-t border-border'>
						<div className='text-xs text-muted-foreground'>Licensed Travel Agency #TA-2024-001</div>
						<div className='text-xs text-muted-foreground'>IATA Certified</div>
						<div className='text-xs text-muted-foreground'>24/7 Customer Support</div>
					</div>
				</motion.div>
			</div>
		</motion.footer>
	);
};

export default Footer;
