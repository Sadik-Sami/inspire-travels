import HeroSection from '@/components/Sections/HeroSection';
import SearchSection from '@/components/Sections/SearchSection';
import FeaturedDestinations from '@/components/Sections/FeaturedDestinations';
import ValueProposition from '@/components/Sections/ValueProposition';
import TestimonialSection from '@/components/Sections/TestimonialSection';
import NewsletterSection from '@/components/Sections/NewsletterSection';
import { useEffect, useState } from 'react';
import useAxiosPublic from '@/hooks/use-AxiosPublic';

const Home = () => {
	const axiosPublic = useAxiosPublic();
	const [featuredDestinations, setFeaturedDestinations] = useState();
	const [isLoading, setIsLoading] = useState(true);
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
				'Our trip to Japan was flawlessly organized. Every detail was considered, from the ryokan stays to the private tea ceremony. It was truly the experience of a lifetime!',
			rating: 5,
		},
		{
			name: 'David Chen',
			location: 'Toronto, Canada',
			comment:
				'The African safari exceeded all expectations. Our guide was incredibly knowledgeable, and the accommodations were luxurious yet authentic. Will definitely book again!',
			rating: 5,
		},
		{
			name: 'Emma Rodriguez',
			location: 'London, UK',
			comment:
				'The customized European tour was perfect for our family. The team was responsive to our needs and the local experiences they arranged gave us a genuine feel for each country.',
			rating: 4.5,
		},
	];

	useEffect(() => {
		setIsLoading(true);
		const getFeaturedDestinations = async () => {
			const response = await axiosPublic.get(`/api/destinations/featured`);
			setFeaturedDestinations(response.data.destinations);
		};
		try {
			getFeaturedDestinations();
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return (
		<div className='min-h-screen bg-background text-foreground'>
			{/* Hero Section */}
			<HeroSection
				title='Explore the World with Us'
				subtitle='Discover amazing places at exclusive deals'
				imageUrl='/assets/images/hero.jpg'
				buttonText='Explore Destinations'
				buttonLink='/destinations'
				showButton={true}
			/>

			{/* Search Section (commented for later when flyhub API is integrated) */}
			{/* <SearchSection /> */}

			{/* Featured Destinations */}
			<FeaturedDestinations destinations={featuredDestinations} loading={isLoading} />

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
