import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ChevronRight } from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedCard from '@/components/Animation/AnimatedCard';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogQuery } from '@/hooks/useBlogQuery';
import BlogsFilter from '@/components/blogs/BlogsFilter';
import PaginationControls from '@/components/Destination/PaginationControls';
import HeroSection from '@/components/Sections/HeroSection';
import NewsletterSection from '@/components/Sections/NewsletterSection';

const Blogs = () => {
	// State for pagination, filtering, and sorting
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		categories: [],
		readTimeRange: [0, 60],
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [activeSort, setActiveSort] = useState('createdAt-desc');

	// Sort options
	const sortOptions = [
		{ value: 'createdAt-desc', label: 'Newest First' },
		{ value: 'createdAt-asc', label: 'Oldest First' },
		{ value: 'viewCount-desc', label: 'Most Popular' },
		{ value: 'title-asc', label: 'Title: A-Z' },
		{ value: 'title-desc', label: 'Title: Z-A' },
		{ value: 'readTime-asc', label: 'Read Time: Short to Long' },
		{ value: 'readTime-desc', label: 'Read Time: Long to Short' },
	];

	// Convert filters to API parameters
	const getApiFilters = () => {
		const apiFilters = {};

		// Categories
		if (filters.categories && filters.categories.length > 0) {
			apiFilters.category = filters.categories;
		}

		// Read Time Range
		if (filters.readTimeRange) {
			if (filters.readTimeRange[0] > 0) {
				apiFilters.minReadTime = filters.readTimeRange[0];
			}
			if (filters.readTimeRange[1] < 60) {
				apiFilters.maxReadTime = filters.readTimeRange[1];
			}
		}

		return apiFilters;
	};

	// Fetch blogs with TanStack Query
	const { data, isLoading, isError, error } = useBlogQuery({
		page,
		limit: 9,
		search: searchQuery,
		sortBy: activeSort,
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

	// Format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(date);
	};

	return (
		<div className='min-h-screen bg-background text-foreground'>
			<HeroSection
				title='Our Travel Blog'
				subtitle='Discover travel tips, destination guides, and inspiring stories from around the world'
				imageUrl='https://i.ibb.co.com/v40H6BZx/tom-winckels-I7o-LRd-M9-YIw-unsplash.jpg'
				height='h-[600px]'
			/>

			{/* Filters Section */}
			<section className='py-8 bg-content1'>
				<div className='container mx-auto px-4'>
					<BlogsFilter
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
								? 'Loading blogs...'
								: `Showing ${data?.blogs?.length || 0} of ${data?.pagination?.total || 0} blogs`}
						</p>
					</div>
				</div>
			</section>

			{/* Blogs Grid */}
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
								<h3 className='text-xl font-bold mb-2'>Error loading blogs</h3>
								<p className='text-muted-foreground mb-6'>{error?.message || 'Please try again later'}</p>
								<Button onClick={() => window.location.reload()}>Refresh Page</Button>
							</FadeIn>
						</div>
					) : data?.blogs?.length === 0 ? (
						// No results
						<div className='text-center py-12'>
							<FadeIn>
								<h3 className='text-xl font-bold mb-2'>No blogs found</h3>
								<p className='text-muted-foreground mb-6'>Try adjusting your filters or search query</p>
								<Button
									onClick={() => {
										setSearchQuery('');
										setFilters({
											categories: [],
											readTimeRange: [0, 60],
										});
										setActiveSort('createdAt-desc');
									}}>
									Reset All Filters
								</Button>
							</FadeIn>
						</div>
					) : (
						// Blogs grid
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{data.blogs?.map((blog, index) => (
								<AnimatedCard key={blog._id} delay={index * 0.05}>
									<Card className='bg-background rounded-lg overflow-hidden shadow-md h-full flex flex-col py-0'>
										<div className='relative h-48 overflow-hidden'>
											<img
												src={blog.coverImage?.url || '/placeholder.svg?height=300&width=400'}
												alt={blog.title}
												className='w-full h-full object-cover transition-transform duration-500 hover:scale-110'
											/>
											{blog.isFeatured && (
												<div className='absolute top-2 left-2'>
													<Badge variant='primary' className='bg-primary text-primary-foreground'>
														Featured
													</Badge>
												</div>
											)}
										</div>

										<CardContent className='p-5 flex-grow flex flex-col'>
											<div className='mb-2 flex flex-wrap gap-2'>
												{blog.categories.slice(0, 3).map((category, i) => (
													<Badge key={i} variant='outline' className='bg-content1'>
														{category}
													</Badge>
												))}
											</div>

											<h3 className='text-xl font-bold mb-2'>{blog.title}</h3>

											<div className='flex items-center text-muted-foreground mb-3 text-sm'>
												<User size={14} className='mr-1' />
												<span>{blog.author?.name || 'Anonymous'}</span>
												<span className='mx-2'>•</span>
												<Calendar size={14} className='mr-1' />
												<span>{formatDate(blog.createdAt)}</span>
											</div>

											<p className='text-muted-foreground mb-4 line-clamp-3'>{blog.summary}</p>

											<div className='mt-auto flex items-center justify-between'>
												<div className='flex items-center text-sm text-muted-foreground'>
													<Clock size={14} className='mr-1' />
													<span>{blog.readTime} min read</span>
												</div>
												<AnimatedButton
													variant='outline'
													className='border-primary text-primary hover:bg-primary/10'
													asChild>
													<Link to={`/blogs/${blog.slug}`} className='flex items-center'>
														Read More
														<ChevronRight className='ml-1 h-4 w-4' />
													</Link>
												</AnimatedButton>
											</div>
										</CardContent>
									</Card>
								</AnimatedCard>
							))}
						</div>
					)}

					{/* Pagination */}
					{!isLoading && data?.pagination && data.pagination.totalPages > 1 && (
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

export default Blogs;
