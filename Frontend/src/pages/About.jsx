import { motion } from 'framer-motion';
import {
	Sparkles,
	Users,
	Award,
	Globe,
	Heart,
	Shield,
	Lightbulb,
	DollarSign,
	CheckCircle,
	Star,
	MapPin,
	Calendar,
	Loader2,
	AlertCircle,
} from 'lucide-react';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import HeroSection from '@/components/Sections/HeroSection';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import person from '@/assets/person.jpg';
import { Link } from 'react-router-dom';
import journeyImage from '@/assets/loginPhoto.jpg';
import { useAboutQuery } from '@/hooks/useAboutQuery';
import { Button } from '@/components/ui/button';

const About = () => {
	const { data: aboutData, isLoading, error } = useAboutQuery();

	const teamMembers = [
		{
			name: 'Sarah Johnson',
			role: 'CEO & Founder',
			bio: 'With over 15 years in the travel industry, Sarah founded Inspire Travels with a vision to make exceptional travel experiences accessible to everyone.',
			image: person,
			experience: '15+ Years',
			specialization: 'Luxury Travel',
		},
		{
			name: 'Michael Chen',
			role: 'Head of Operations',
			bio: 'Michael ensures that every trip runs smoothly, from booking to return. His attention to detail and problem-solving skills are unmatched.',
			image: person,
			experience: '12+ Years',
			specialization: 'Operations Management',
		},
		{
			name: 'Emily Rodriguez',
			role: 'Lead Travel Consultant',
			bio: "Emily has visited over 50 countries and uses her extensive knowledge to create unforgettable itineraries tailored to each client's preferences.",
			image: person,
			experience: '10+ Years',
			specialization: 'Custom Itineraries',
		},
		{
			name: 'David Kim',
			role: 'Marketing Director',
			bio: "David's creative approach to marketing has helped Inspire Travels grow from a small startup to a recognized name in the travel industry.",
			image: person,
			experience: '8+ Years',
			specialization: 'Digital Marketing',
		},
	];

	const values = [
		{
			title: 'Exceptional Service',
			description:
				'We go above and beyond to ensure every aspect of your journey exceeds expectations with 24/7 support.',
			icon: Award,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
		},
		{
			title: 'Sustainable Travel',
			description: "We're committed to promoting responsible tourism that respects local cultures and environments.",
			icon: Globe,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
		},
		{
			title: 'Authentic Experiences',
			description: 'We believe in creating genuine connections with destinations, beyond typical tourist attractions.',
			icon: Heart,
			color: 'text-red-600',
			bgColor: 'bg-red-50',
		},
		{
			title: 'Transparent Pricing',
			description: 'No hidden fees or surprises. We believe in clear, upfront pricing for all our travel packages.',
			icon: DollarSign,
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-50',
		},
		{
			title: 'Safety First',
			description: 'Your safety and security are our top priorities, with comprehensive travel insurance and support.',
			icon: Shield,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
		},
		{
			title: 'Innovation',
			description:
				'We continuously innovate our services using the latest technology to enhance your travel experience.',
			icon: Lightbulb,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
		},
	];

	// Dynamic stats from database or fallback to defaults
	const stats = aboutData
		? [
				{
					number: aboutData.formattedStats?.happyTravelers || `${Math.floor(aboutData.happyTravelers / 1000)}K+`,
					label: 'Happy Travelers',
					icon: Users,
				},
				{
					number: aboutData.formattedStats?.destinations || `${aboutData.destinations}+`,
					label: 'Destinations',
					icon: MapPin,
				},
				{
					number: aboutData.formattedStats?.yearsOfExperience || `${aboutData.yearsOfExperience}+`,
					label: 'Years Experience',
					icon: Calendar,
				},
				{
					number: aboutData.formattedStats?.averageRating || `${aboutData.averageRating}★`,
					label: 'Average Rating',
					icon: Star,
				},
		  ]
		: [
				{ number: '50K+', label: 'Happy Travelers', icon: Users },
				{ number: '150+', label: 'Destinations', icon: MapPin },
				{ number: '15+', label: 'Years Experience', icon: Calendar },
				{ number: '4.9★', label: 'Average Rating', icon: Star },
		  ];

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
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	};

	// Loading state
	if (isLoading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='flex items-center gap-2'>
					<Loader2 className='h-6 w-6 animate-spin' />
					<span>Loading about page...</span>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center p-4'>
				<Alert variant='destructive' className='max-w-md'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>Failed to load about page content. Please try again later.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Dynamic content from database or fallback
	const pageTitle = aboutData?.title || 'About Inspire Travels';
	const pageSubtitle =
		"We're passionate about creating unforgettable travel experiences that connect people with the world's most amazing destinations.";
	const heroImage =
		aboutData?.image?.url || 'https://i.ibb.co.com/q3WQtZTm/paul-pastourmatzis-km74-CLco7qs-unsplash.jpg';
	const storyImage = aboutData?.image?.url || journeyImage;
	const aboutContent =
		aboutData?.content ||
		`Founded in 2010, Inspire Travels began with a simple mission: to make extraordinary travel experiences accessible to everyone. What started as a small team of passionate travelers has grown into a trusted travel company serving thousands of adventurers each year.

Our founder, Sarah Johnson, believed that travel should be more than just visiting popular tourist spots. It should be about creating meaningful connections with different cultures, environments, and people. This philosophy continues to guide everything we do.

Over the years, we've expanded our destinations and services, but our commitment to exceptional customer service, sustainable travel practices, and authentic experiences remains unchanged.`;

	return (
		<div className='min-h-screen bg-background'>
			{/* Dynamic Hero Section */}

			<HeroSection
				title='About Inspire Travels'
				subtitle="We're passionate about creating unforgettable travel experiences that connect people with the world's most amazing destinations."
				imageUrl='https://i.ibb.co.com/q3WQtZTm/paul-pastourmatzis-km74-CLco7qs-unsplash.jpg'
				showButton={false}
			/>

			{/* Professional Header Section with Dynamic Stats */}
			<section className='py-12 lg:py-24 bg-background relative overflow-hidden'>
				<div className='container mx-auto px-4'>
					<div className='text-center max-w-4xl mx-auto'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className='mb-6'>
							<div className='flex items-center justify-center gap-2 mb-4'>
								<span className='font-display text-sm inline-block text-primary uppercase tracking-wider font-medium'>
									Our Story
								</span>
								<motion.div
									animate={{
										rotate: [0, 5, -5, 0],
										scale: [1, 1.1, 1],
									}}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										repeatType: 'reverse',
									}}>
									<Sparkles size={16} className='text-primary' />
								</motion.div>
							</div>

							<h1 className='text-4xl md:text-5xl font-heading font-bold text-foreground mb-6 leading-tight'>
								Crafting Dreams Into{' '}
								<span className='text-primary relative'>
									Reality
									<motion.div
										className='absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full'
										initial={{ scaleX: 0 }}
										animate={{ scaleX: 1 }}
										transition={{ duration: 0.8, delay: 0.5 }}
									/>
								</span>
							</h1>

							<p className='text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto'>
								Since {aboutData ? new Date().getFullYear() - aboutData.yearsOfExperience : '2010'}, we've been
								transforming travel dreams into extraordinary experiences. Our passion for exploration and commitment to
								excellence has made us a trusted partner for thousands of adventurers worldwide.
							</p>
						</motion.div>

						{/* Dynamic Stats */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-12'>
							{stats.map((stat, index) => {
								const IconComponent = stat.icon;
								return (
									<motion.div
										key={index}
										initial={{ opacity: 0, scale: 0.5 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
										className='text-center'>
										<div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3'>
											<IconComponent size={24} className='text-primary' />
										</div>
										<div className='text-2xl md:text-3xl font-bold text-foreground mb-1'>{stat.number}</div>
										<div className='text-sm text-muted-foreground font-medium'>{stat.label}</div>
									</motion.div>
								);
							})}
						</motion.div>
					</div>
				</div>
			</section>

			{/* Our Story Section with Dynamic Content */}
			<section className='py-20 bg-background'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center container mx-auto'>
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className='h-full'>
							<div className='rounded-2xl overflow-hidden shadow-xl'>
								<motion.img
									src={storyImage}
									alt='Our journey'
									className='w-full h-[46rem] object-cover object-bottom'
									whileHover={{ scale: 1.05 }}
									transition={{ duration: 0.5 }}
								/>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className='space-y-6'>
							<div>
								<h2 className='text-3xl md:text-4xl font-heading font-bold text-foreground mb-6'>
									Our Journey Began With a Simple Dream
								</h2>
								<div className='space-y-4 text-muted-foreground leading-relaxed'>
									{aboutContent.split('\n\n').map((paragraph, index) => (
										<p key={index}>{paragraph}</p>
									))}
								</div>
							</div>

							<div className='grid grid-cols-2 gap-4 pt-6'>
								<div className='text-center p-4 bg-primary/5 rounded-xl border border-primary/10'>
									<div className='text-2xl font-bold text-primary mb-1'>{aboutData?.yearsOfExperience || '15'}+</div>
									<div className='text-sm text-muted-foreground'>Years of Excellence</div>
								</div>
								<div className='text-center p-4 bg-primary/5 rounded-xl border border-primary/10'>
									<div className='text-2xl font-bold text-primary mb-1'>
										{aboutData?.formattedStats?.satisfiedCustomers || '50K+'}
									</div>
									<div className='text-sm text-muted-foreground'>Satisfied Customers</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Our Values Section - Static */}
			<section className='py-20 bg-muted/30'>
				<div className='container mx-auto px-4'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className='text-center mb-16'>
						<h2 className='text-3xl md:text-4xl font-heading font-bold text-foreground mb-4'>Our Core Values</h2>
						<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
							These principles guide every decision we make and every experience we create for our travelers.
						</p>
					</motion.div>

					<motion.div
						variants={containerVariants}
						initial='hidden'
						whileInView='visible'
						viewport={{ once: true }}
						className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{values.map((value, index) => {
							const IconComponent = value.icon;
							return (
								<motion.div key={index} variants={itemVariants} className='group'>
									<Card className='bg-card shadow-lg border border-border h-full hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2'>
										<CardContent className='p-8'>
											<div className='mb-6'>
												<div
													className={`w-16 h-16 ${value.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
													<IconComponent size={32} className={value.color} />
												</div>
											</div>
											<h3 className='text-xl font-heading font-bold text-foreground mb-4'>{value.title}</h3>
											<p className='text-muted-foreground leading-relaxed'>{value.description}</p>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</section>

			{/* Team Section - Static */}
			<section className='py-20 bg-background'>
				<div className='container mx-auto px-4'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className='text-center mb-16'>
						<h2 className='text-3xl md:text-4xl font-heading font-bold text-foreground mb-4'>Meet Our Expert Team</h2>
						<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
							Our diverse team of travel experts is passionate about creating unforgettable experiences and bringing
							your travel dreams to life.
						</p>
					</motion.div>

					<motion.div
						variants={containerVariants}
						initial='hidden'
						whileInView='visible'
						viewport={{ once: true }}
						className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
						{teamMembers.map((member, index) => (
							<motion.div key={index} variants={itemVariants} className='group'>
								<Card className='bg-card shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y- py-0'>
									<div className='relative h-64 overflow-hidden'>
										<img
											src={member.image || '/placeholder.svg'}
											alt={member.name}
											className='w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110'
										/>
										<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
									</div>
									<CardContent className='p-6'>
										<h3 className='text-xl font-heading font-bold text-foreground mb-1'>{member.name}</h3>
										<p className='text-primary font-medium mb-3'>{member.role}</p>
										<p className='text-muted-foreground text-sm leading-relaxed mb-4'>{member.bio}</p>
										<div className='flex justify-between text-xs text-muted-foreground'>
											<span>
												<strong>Experience:</strong> {member.experience}
											</span>
										</div>
										<div className='mt-2 text-xs text-muted-foreground'>
											<span>
												<strong>Specialty:</strong> {member.specialization}
											</span>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Why Choose Us Section - Static */}
			<section className='py-20 bg-primary/5'>
				<div className='container mx-auto px-4'>
					<div className='max-w-4xl mx-auto text-center'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}>
							<h2 className='text-3xl md:text-4xl font-heading font-bold text-foreground mb-6'>
								Why Choose Inspire Travels?
							</h2>
							<p className='text-lg text-muted-foreground mb-12'>
								We're not just another travel agency. We're your partners in creating life-changing experiences.
							</p>
						</motion.div>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
							{[
								{
									icon: CheckCircle,
									title: 'Personalized Service',
									description: 'Every itinerary is tailored to your unique preferences and travel style.',
								},
								{
									icon: Shield,
									title: 'Peace of Mind',
									description: '24/7 support and comprehensive travel insurance for worry-free adventures.',
								},
								{
									icon: Award,
									title: 'Award-Winning Excellence',
									description: 'Recognized industry leader with numerous awards for outstanding service.',
								},
							].map((feature, index) => {
								const IconComponent = feature.icon;
								return (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
										className='text-center'>
										<div className='w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4'>
											<IconComponent size={32} className='text-primary' />
										</div>
										<h3 className='text-xl font-heading font-bold text-foreground mb-3'>{feature.title}</h3>
										<p className='text-muted-foreground'>{feature.description}</p>
									</motion.div>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section - Static */}
			<section className='py-20 bg-primary'>
				<div className='container mx-auto px-4 text-center'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}>
						<h2 className='text-3xl md:text-4xl font-heading font-bold mb-6'>Ready to Start Your Adventure?</h2>
						<p className='text-xl mb-8 max-w-2xl mx-auto opacity-90'>
							Join thousands of satisfied travelers who have experienced the world with Inspire Travels. Let's create
							your next unforgettable journey together.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Link to='/destinations'>
								<Button size='lg' className='bg-chart-3 hover:bg-chart-3/60'>
									Browse Planned Tours
								</Button>
							</Link>
							<Link to='/contact'>
								<Button variant='outline' size='lg'>
									Contact Our Experts
								</Button>
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default About;
