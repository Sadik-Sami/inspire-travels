import { useState } from 'react';
import { Calendar, MapPin, User, Eye } from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedCard from '@/components/Animation/AnimatedCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useGalleryQuery } from '@/hooks/useGalleryQuery';
import PaginationControls from '@/components/Destination/PaginationControls';
import GalleryDialog from '@/components/Gallery/GalleryDialog';
import HeroSection from '@/components/Sections/HeroSection';
import NewsletterSection from '@/components/Sections/NewsletterSection';

const Gallery = () => {
	// State for pagination and dialog
	const [page, setPage] = useState(1);
	const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Fetch gallery items with TanStack Query
	const { data, isLoading, isError, error } = useGalleryQuery({
		page,
		limit: 12,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});
	// Handle page change
	const handlePageChange = (newPage) => {
		setPage(newPage);
		// Scroll to top of the page
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Handle gallery item click
	const handleGalleryItemClick = (item) => {
		setSelectedGalleryItem(item);
		setIsDialogOpen(true);
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(date);
	};

	return (
		<div className='min-h-screen bg-background text-foreground'>
			<HeroSection
				title='Success Stories & Gallery'
				subtitle='Discover the amazing experiences and memories created by our travelers around the world'
				imageUrl='https://i.ibb.co.com/JwDfk3BS/rebe-adelaida-zun-Qw-My5-B6-M-unsplash.jpg'
				showButton={false}
			/>

			{/* Gallery Stats Section */}
			<section className='py-8 bg-content1'>
				<div className='container mx-auto px-4'>
					<div className='text-center'>
						<p className='text-sm text-muted-foreground'>
							{isLoading
								? 'Loading gallery...'
								: `Showing ${data?.data?.items.length || 0} of ${
										data?.data?.pagination?.totalCount || 0
								  } success stories`}
						</p>
					</div>
				</div>
			</section>

			{/* Gallery Grid */}
			<section className='py-12'>
				<div className='container mx-auto px-4'>
					{isLoading ? (
						// Loading skeletons
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
							{[...Array(12)].map((_, index) => (
								<div key={index} className='bg-content1 rounded-lg h-[350px] animate-pulse'>
									<Skeleton className='h-48 w-full rounded-t-lg' />
									<div className='p-4 space-y-3'>
										<Skeleton className='h-5 w-3/4' />
										<Skeleton className='h-4 w-1/2' />
										<Skeleton className='h-4 w-full' />
										<Skeleton className='h-4 w-2/3' />
									</div>
								</div>
							))}
						</div>
					) : isError ? (
						// Error state
						<div className='text-center py-12'>
							<FadeIn>
								<h3 className='text-xl font-bold mb-2'>Error loading gallery</h3>
								<p className='text-muted-foreground mb-6'>{error?.message || 'Please try again later'}</p>
								<Button onClick={() => window.location.reload()}>Refresh Page</Button>
							</FadeIn>
						</div>
					) : data?.data?.items?.length === 0 ? (
						// No results
						<div className='text-center py-12'>
							<FadeIn>
								<h3 className='text-xl font-bold mb-2'>No gallery items found</h3>
								<p className='text-muted-foreground mb-6'>Check back later for new success stories and photos</p>
							</FadeIn>
						</div>
					) : (
						// Gallery grid
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
							{data.data.items?.map((item, index) => (
								<AnimatedCard key={item._id} delay={index * 0.05}>
									<Card
										className='bg-background rounded-lg overflow-hidden shadow-md h-full flex flex-col cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 pt-0'
										onClick={() => handleGalleryItemClick(item)}>
										<div className='relative h-48 overflow-hidden'>
											<img
												src={item.image?.url || '/placeholder.svg?height=300&width=400'}
												alt={item.title}
												className='w-full h-full object-cover transition-transform duration-500 hover:scale-110'
											/>
											{item.category && (
												<div className='absolute top-2 left-2'>
													<Badge variant='secondary' className='bg-black/70 text-white'>
														{item.category}
													</Badge>
												</div>
											)}
											{item.images && item.images.length > 0 && (
												<div className='absolute top-2 right-2'>
													<Badge variant='secondary' className='bg-black/70 text-white'>
														+{item.images.length + 1} photos
													</Badge>
												</div>
											)}
										</div>

										<CardContent className='p-4 flex-grow flex flex-col'>
											<div className='mb-3'>
												<h3 className='text-lg font-bold mb-2 line-clamp-2'>{item.title}</h3>

												{/* Metadata */}
												<div className='flex flex-col gap-1 text-sm text-muted-foreground mb-2'>
													{item.location && (
														<div className='flex items-center'>
															<MapPin size={14} className='mr-1 flex-shrink-0' />
															<span className='truncate'>{item.location}</span>
														</div>
													)}
													{item.customerName && (
														<div className='flex items-center'>
															<User size={14} className='mr-1 flex-shrink-0' />
															<span className='truncate'>{item.customerName}</span>
														</div>
													)}
													<div className='flex items-center'>
														<Calendar size={14} className='mr-1 flex-shrink-0' />
														<span>{formatDate(item.createdAt)}</span>
													</div>
												</div>
											</div>
											{/* Tags */}
											{item.tags && item.tags.length > 0 && (
												<div className='flex flex-wrap gap-1 mb-3'>
													{item.tags.slice(0, 2).map((tag, i) => (
														<Badge key={i} variant='outline' className='text-xs'>
															{tag}
														</Badge>
													))}
													{item.tags.length > 2 && (
														<Badge variant='outline' className='text-xs'>
															+{item.tags.length - 2}
														</Badge>
													)}
												</div>
											)}

											{/* Footer */}
											<div className='flex items-center justify-between mt-auto pt-2 border-t'>
												<div className='flex items-center text-xs text-muted-foreground'>
													<Eye size={12} className='mr-1' />
													<span>View Story</span>
												</div>
												<Badge variant='outline' className='text-xs'>
													{item.status || 'Published'}
												</Badge>
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

			{/* Gallery Dialog */}
			<GalleryDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} galleryItem={selectedGalleryItem} />

			<NewsletterSection />
		</div>
	);
};

export default Gallery;
