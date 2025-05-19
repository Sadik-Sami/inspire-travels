import { motion } from 'framer-motion';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedCard from '@/components/Animation/AnimatedCard';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import HeroSection from '@/components/Sections/HeroSection';

const About = () => {
	const teamMembers = [
		{
			name: 'Sarah Johnson',
			role: 'CEO & Founder',
			bio: 'With over 15 years in the travel industry, Sarah founded TravelEase with a vision to make exceptional travel experiences accessible to everyone.',
			image: '/placeholder.svg?height=300&width=300',
		},
		{
			name: 'Michael Chen',
			role: 'Head of Operations',
			bio: 'Michael ensures that every trip runs smoothly, from booking to return. His attention to detail and problem-solving skills are unmatched.',
			image: '/placeholder.svg?height=300&width=300',
		},
		{
			name: 'Emily Rodriguez',
			role: 'Lead Travel Consultant',
			bio: "Emily has visited over 50 countries and uses her extensive knowledge to create unforgettable itineraries tailored to each client's preferences.",
			image: '/placeholder.svg?height=300&width=300',
		},
		{
			name: 'David Kim',
			role: 'Marketing Director',
			bio: "David's creative approach to marketing has helped TravelEase grow from a small startup to a recognized name in the travel industry.",
			image: '/placeholder.svg?height=300&width=300',
		},
	];

	const values = [
		{
			title: 'Exceptional Service',
			description: 'We go above and beyond to ensure every aspect of your journey exceeds expectations.',
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-10 w-10'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
					/>
				</svg>
			),
		},
		{
			title: 'Sustainable Travel',
			description: "We're committed to promoting responsible tourism that respects local cultures and environments.",
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-10 w-10'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
					/>
				</svg>
			),
		},
		{
			title: 'Authentic Experiences',
			description: 'We believe in creating genuine connections with destinations, beyond typical tourist attractions.',
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-10 w-10'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
					/>
				</svg>
			),
		},
		{
			title: 'Transparent Pricing',
			description: 'No hidden fees or surprises. We believe in clear, upfront pricing for all our travel packages.',
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-10 w-10'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
					/>
				</svg>
			),
		},
	];

	return (
		<div className='min-h-screen bg-background text-foreground'>
			<HeroSection
				title='About Inspire Travels'
				subtitle="We're passionate about creating unforgettable travel experiences that connect people with the world's most
							amazing destinations."
				imageUrl='/assets/images/hero.jpg'
				showButton={false}
			/>
			{/* Our Story Section */}
			<section className='py-16'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
						<FadeIn direction='right'>
							<div className='rounded-lg overflow-hidden'>
								<motion.img
									src='/placeholder.svg?height=600&width=800'
									alt='Our journey'
									className='w-full h-auto'
									whileHover={{ scale: 1.05 }}
									transition={{ duration: 0.5 }}
								/>
							</div>
						</FadeIn>

						<FadeIn direction='left'>
							<h2 className='text-3xl font-bold mb-6'>Our Story</h2>
							<p className='mb-4'>
								Founded in 2010, TravelEase began with a simple mission: to make extraordinary travel experiences
								accessible to everyone. What started as a small team of passionate travelers has grown into a trusted
								travel company serving thousands of adventurers each year.
							</p>
							<p className='mb-4'>
								Our founder, Sarah Johnson, believed that travel should be more than just visiting popular tourist
								spots. It should be about creating meaningful connections with different cultures, environments, and
								people. This philosophy continues to guide everything we do.
							</p>
							<p>
								Over the years, we've expanded our destinations and services, but our commitment to exceptional customer
								service, sustainable travel practices, and authentic experiences remains unchanged.
							</p>
						</FadeIn>
					</div>
				</div>
			</section>

			{/* Our Values Section */}
			<section className='py-16 bg-content1'>
				<div className='container mx-auto px-4'>
					<FadeIn>
						<h2 className='text-3xl font-bold mb-12 text-center'>Our Values</h2>
					</FadeIn>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						{values.map((value, index) => (
							<AnimatedCard key={index} delay={index * 0.1}>
								<div className='bg-background p-6 rounded-lg shadow-md h-full flex flex-col'>
									<div className='text-secondary mb-4'>{value.icon}</div>
									<h3 className='text-xl font-bold mb-2'>{value.title}</h3>
									<p className='text-muted-foreground flex-grow'>{value.description}</p>
								</div>
							</AnimatedCard>
						))}
					</div>
				</div>
			</section>

			{/* Team Section */}
			<section className='py-16'>
				<div className='container mx-auto px-4'>
					<FadeIn>
						<h2 className='text-3xl font-bold mb-4 text-center'>Meet Our Team</h2>
						<p className='text-center text-muted-foreground max-w-2xl mx-auto mb-12'>
							Our diverse team of travel experts is passionate about creating unforgettable experiences for our clients.
						</p>
					</FadeIn>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
						{teamMembers.map((member, index) => (
							<AnimatedCard key={index} delay={index * 0.1}>
								<div className='bg-background rounded-lg overflow-hidden shadow-md'>
									<div className='relative h-64 overflow-hidden'>
										<img
											src={member.image || '/placeholder.svg'}
											alt={member.name}
											className='w-full h-full object-cover transition-transform duration-500 hover:scale-110'
										/>
									</div>
									<div className='p-6'>
										<h3 className='text-xl font-bold'>{member.name}</h3>
										<p className='text-primary font-medium mb-3'>{member.role}</p>
										<p className='text-muted-foreground'>{member.bio}</p>
									</div>
								</div>
							</AnimatedCard>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-16 bg-primary text-primary-foreground'>
				<div className='container mx-auto px-4 text-center'>
					<FadeIn>
						<h2 className='text-3xl font-bold mb-6'>Ready to Start Your Adventure?</h2>
						<p className='text-xl mb-8 max-w-2xl mx-auto'>
							Join thousands of satisfied travelers who have experienced the world with TravelEase.
						</p>
						<AnimatedButton size='lg' className='bg-secondary hover:bg-secondary/90 text-secondary-foreground'>
							Browse Destinations
						</AnimatedButton>
					</FadeIn>
				</div>
			</section>
		</div>
	);
};

export default About;
