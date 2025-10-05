import FeaturedDestinations from '@/components/Sections/FeaturedDestinations';
import ValueProposition from '@/components/Sections/ValueProposition';
import TestimonialSection from '@/components/Sections/TestimonialSection';
import NewsletterSection from '@/components/Sections/NewsletterSection';
import FeaturedVisas from '@/components/Sections/FeaturedVisas';
import FeaturedBlogs from '@/components/Sections/FeaturedBlogs';
import FeaturedStories from '@/components/Sections/FeaturedStories';
import Hero from '@/components/ui/Hero';

const Home = () => {
	return (
		<div className='min-h-screen bg-background text-foreground'>
			{/* Hero Section */}
			<Hero />
			{/* Featured Destinations */}
			<FeaturedDestinations />

			{/* Featured Visas */}
			<FeaturedVisas />

			{/* Featured Blogs */}
			<FeaturedBlogs />

			{/* Featured Stories */}
			<FeaturedStories />

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
