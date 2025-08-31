import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Star } from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedCard from '@/components/Animation/AnimatedCard';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDestinationQuery } from '@/hooks/useDestinationQuery';
import DestinationFilters from '@/components/Destination/DestinationFilters';
import PaginationControls from '@/components/Destination/PaginationControls';
import HeroSection from '@/components/Sections/HeroSection';
import NewsletterSection from '@/components/Sections/NewsletterSection';

const Destinations = () => {
	// State for pagination, filtering, and sorting
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		priceRange: [0, 5000],
		duration: 'any',
		categories: [],
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [activeSort, setActiveSort] = useState('popular-desc');

	// Sort options
	const sortOptions = [
		{ value: 'popular-desc', label: 'Most Popular' },
		{ value: 'price-asc', label: 'Price: Low to High' },
		{ value: 'price-desc', label: 'Price: High to Low' },
		{ value: 'duration-asc', label: 'Duration: Short to Long' },
		{ value: 'duration-desc', label: 'Duration: Long to Short' },
		{ value: 'rating-desc', label: 'Highest Rated' },
		{ value: 'createdAt-desc', label: 'Newest First' },
	];

	// Convert filters to API parameters
	const getApiFilters = () => {
		const apiFilters = {};

		// Price range
		if (filters.priceRange) {
			if (filters.priceRange[0] > 0) apiFilters.minPrice = filters.priceRange[0];
			if (filters.priceRange[1] < 5000) apiFilters.maxPrice = filters.priceRange[1];
		}

		// Duration
		if (filters.duration && filters.duration !== 'any') {
			const [min, max] = filters.duration.split('-').map(Number);
			if (max) {
				apiFilters.minDuration = min;
				apiFilters.maxDuration = max;
			} else {
				apiFilters.minDuration = min;
			}
		}

		// Categories
		if (filters.categories && filters.categories.length > 0) {
			apiFilters.categories = filters.categories;
		}

		return apiFilters;
	};

	// Convert sort option to API parameter
	const getSortParam = () => {
		switch (activeSort) {
			case 'price-asc':
				return 'pricing.basePrice-asc';
			case 'price-desc':
				return 'pricing.basePrice-desc';
			case 'duration-asc':
				return 'duration.days-asc';
			case 'duration-desc':
				return 'duration.days-desc';
			case 'rating-desc':
				return 'rating-desc';
			case 'newest':
				return 'createdAt-desc';
			case 'popular':
			default:
				return 'popular-desc';
		}
	};

	// Fetch destinations with TanStack Query
	const { data, isLoading, isError, error } = useDestinationQuery({
		page,
		limit: 9,
		search: searchQuery,
		sortBy: getSortParam(),
		filters: getApiFilters(),
	});
	// Handle search
	const handleSearch = (query) => {
		setSearchQuery(query);
		setPage(1); // Reset to first page on new search
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPage(newPage);
		// Scroll to top of the page
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<div className='min-h-screen bg-background text-foreground'>
			<HeroSection
				title='Explore Our Group Packages'
				subtitle='Discover our carefully curated selection of travel experiences around the world'
				imageUrl='/assets/images/hero.jpg'
				showButton={false}
			/>

			{/* Filters Section */}
			<section className='py-8 bg-content1'>
				<div className='container mx-auto px-4'>
					<DestinationFilters
						filters={filters}
						setFilters={setFilters}
						sortOptions={sortOptions}
						activeSort={activeSort}
						setActiveSort={setActiveSort}
						onSearch={handleSearch}
					/>

					<div className='mt-4'>
						<p className='text-sm text-muted-foreground'>
							{isLoading
								? 'Loading destinations...'
								: `Showing ${data?.total || 0} of ${data?.total || 0} destinations`}
						</p>
					</div>
				</div>
			</section>

			{/* Destinations Grid */}
			<section className='py-12'>
				<div className='container mx-auto px-4'>
					{isLoading ? (
						// Loading skeletons
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{[...Array(9)].map((_, index) => (
								<div key={index} className='bg-content1 rounded-lg h-[450px] animate-pulse'>
									<Skeleton className='h-48 w-full rounded-t-lg' />
									<div className='p-5 space-y-4'>
										<Skeleton className='h-6 w-3/4' />
										<Skeleton className='h-4 w-1/2' />
										<Skeleton className='h-4 w-full' />
										<Skeleton className='h-4 w-full' />
										<div className='flex justify-between items-center pt-4'>
											<Skeleton className='h-6 w-1/3' />
											<Skeleton className='h-9 w-1/4' />
										</div>
									</div>
								</div>
							))}
						</div>
					) : isError ? (
						// Error state
						<div className='text-center py-12'>
							<FadeIn>
								<h3 className='text-xl font-bold mb-2'>Error loading destinations</h3>
								<p className='text-muted-foreground mb-6'>{error?.message || 'Please try again later'}</p>
								<Button onClick={() => window.location.reload()}>Refresh Page</Button>
							</FadeIn>
						</div>
					) : data?.data?.length === 0 ? (
						// No results
						<div className='text-center py-12'>
							<FadeIn>
								<h3 className='text-xl font-bold mb-2'>No destinations found</h3>
								<p className='text-muted-foreground mb-6'>Try adjusting your filters or search query</p>
								<Button
									onClick={() => {
										setSearchQuery('');
										setFilters({
											priceRange: [0, 5000],
											duration: 'any',
											categories: [],
										});
										setActiveSort('popular-desc');
									}}>
									Reset All Filters
								</Button>
							</FadeIn>
						</div>
					) : (
						// Destinations grid
						<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'>
							{data.destinations?.map((destination, index) => (
								<AnimatedCard key={destination._id} delay={index * 0.05}>
									<Card className='bg-background rounded-lg overflow-hidden shadow-md h-full flex flex-col py-0'>
										<div className='relative h-48 overflow-hidden'>
											<img
												src={destination.images?.[0]?.url || '/placeholder.svg?height=300&width=400'}
												alt={destination.title}
												className='w-full h-full object-cover transition-transform duration-500 hover:scale-110'
											/>
											{destination.isPopular && (
												<div className='absolute top-2 left-2'>
													<Badge variant='primary' className='bg-primary text-primary-foreground'>
														Popular
													</Badge>
												</div>
											)}
										</div>

										<CardContent className='p-5 flex-grow flex flex-col'>
											<div className='mb-4'>
												<h3 className='text-xl font-bold mb-1'>{destination.title}</h3>
												<div className='flex items-center text-muted-foreground mb-2'>
													<MapPin size={14} className='mr-1' />
													<span className='text-sm'>{destination.location?.to}</span>
												</div>
												<div className='flex items-center text-muted-foreground'>
													<Calendar size={14} className='mr-1' />
													<span className='text-sm'>{destination.duration?.days} days</span>
													{destination.duration?.nights > 0 && (
														<span className='text-sm ml-1'>/ {destination.duration.nights} nights</span>
													)}
												</div>
											</div>

											<p className='text-muted-foreground mb-4 line-clamp-3'>{destination.summary}</p>

											<div className='mb-4 flex-grow'>
												<div className='flex flex-wrap gap-2'>
													{destination.features?.slice(0, 3).map((feature, i) => (
														<Badge key={i} variant='outline' className='bg-content1'>
															{feature}
														</Badge>
													))}
													{destination.features?.length > 3 && (
														<Badge variant='outline' className='bg-content1'>
															+{destination.features.length - 3} more
														</Badge>
													)}
												</div>
											</div>

											<div className='flex items-center justify-between mt-auto'>
												<div className='font-bold text-lg'>
													${destination.pricing?.basePrice}
													<span className='text-sm font-normal text-muted-foreground'> / person</span>
												</div>
												<AnimatedButton
													variant='outline'
													className='border-primary text-primary hover:bg-primary/10'
													asChild>
													<Link to={`/destinations/${destination._id}`}>View Details</Link>
												</AnimatedButton>
											</div>
										</CardContent>
									</Card>
								</AnimatedCard>
							))}
						</div>
					)}

					{/* Pagination */}
					{!isLoading && data?.pagination && (
						<PaginationControls
							currentPage={page}
							totalPages={data.pagination.totalPages}
							onPageChange={handlePageChange}
						/>
					)}
				</div>
			</section>

			<NewsletterSection />
		</div>
	);
};

export default Destinations;
