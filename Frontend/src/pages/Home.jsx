import HeroSection from '@/components/Sections/HeroSection';
import SearchSection from '@/components/Sections/SearchSection';
import FeaturedDestinations from '@/components/Sections/FeaturedDestinations';
import ValueProposition from '@/components/Sections/ValueProposition';
import TestimonialSection from '@/components/Sections/TestimonialSection';
import NewsletterSection from '@/components/Sections/NewsletterSection';

const Home = () => {
	const featuredDestinations = [
		{
			id: 1,
			name: 'Bali',
			location: 'Indonesia',
			description: 'Beautiful beaches, vibrant culture, and stunning landscapes make Bali a perfect tropical getaway.',
			price: 1299,
			imageUrl: 'https://picsum.photos/300/400?random=1',
		},
		{
			id: 2,
			name: 'Paris',
			location: 'France',
			description: 'The City of Light offers iconic landmarks, world-class cuisine, and romantic ambiance.',
			price: 1599,
			imageUrl: 'https://picsum.photos/300/400?random=2',
		},
		{
			id: 3,
			name: 'Tokyo',
			location: 'Japan',
			description:
				"A fascinating blend of traditional culture and cutting-edge technology in Japan's bustling capital.",
			price: 1899,
			imageUrl: 'https://picsum.photos/300/400?random=3',
		},
	];

	const features = [
		{
			title: 'Best Price Guarantee',
			description: "We offer the best prices for your dream vacation. If you find a lower price, we'll match it.",
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-8 w-8 text-secondary'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
					/>
				</svg>
			),
		},
		{
			title: 'Safe and Secure',
			description: 'Your safety is our priority. We ensure all our travel packages meet the highest safety standards.',
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-8 w-8 text-secondary'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
					/>
				</svg>
			),
		},
		{
			title: 'Expert Travel Guides',
			description: 'Our experienced guides will ensure you have the best experience at every destination.',
			icon: (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-8 w-8 text-secondary'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
					/>
				</svg>
			),
		},
	];

	const testimonials = [
		{
			name: 'Sarah Johnson',
			location: 'New York, USA',
			comment:
				'"The trip to Bali was amazing! Everything was well organized and the accommodations were fantastic. Will definitely book with TravelEase again."',
		},
		{
			name: 'Michael Chen',
			location: 'Toronto, Canada',
			comment:
				'"Our family trip to Paris was perfect. The itinerary was well-planned and gave us plenty of time to explore. The hotel was in a great location. Highly recommend!"',
		},
		{
			name: 'Emily Rodriguez',
			location: 'Sydney, Australia',
			comment:
				'"The customer service was exceptional. When our flight was delayed, the TravelEase team quickly rearranged our transportation. They really went above and beyond!"',
		},
	];

	return (
		<div className='min-h-screen bg-background text-foreground'>
			{/* Hero Section */}
			<HeroSection
				title='Explore the World with Us'
				subtitle='Discover amazing places at exclusive deals'
				imageUrl='https://i.ibb.co.com/v40H6BZx/tom-winckels-I7o-LRd-M9-YIw-unsplash.jpg'
				buttonText='Explore Destinations'
				buttonLink='/destinations'
				showButton={true}
			/>

			{/* Search Section */}
			<SearchSection />

			{/* Featured Destinations */}
			<FeaturedDestinations destinations={featuredDestinations} />

			{/* Why Choose Us */}
			<ValueProposition features={features} />

			{/* Testimonials */}
			<TestimonialSection testimonials={testimonials} />

			{/* Newsletter */}
			<NewsletterSection />
		</div>
	);
};

export default Home;
