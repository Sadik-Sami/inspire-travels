import HeroSection from '@/components/Sections/HeroSection';
import FeaturedDestinations from '@/components/Sections/FeaturedDestinations';
import ValueProposition from '@/components/Sections/ValueProposition';
import TestimonialSection from '@/components/Sections/TestimonialSection';
import NewsletterSection from '@/components/Sections/NewsletterSection';

const Home = () => {
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

			{/* Featured Destinations */}
			<FeaturedDestinations />

			{/* Why Choose Us */}
			<ValueProposition />

			{/* Testimonials */}
			<TestimonialSection />

			{/* Newsletter */}
			<NewsletterSection />
		</div>
	);
};

export default Home;
