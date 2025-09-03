import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';
import { useGalleryActive } from '@/hooks/useGalleryQuery';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import 'swiper/css';
import 'swiper/css/navigation';

const FeaturedStories = () => {
	const { data: stories = [], isLoading, error } = useGalleryActive();
	const [selectedStory, setSelectedStory] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleStoryClick = (story) => {
		setSelectedStory(story);
		setIsModalOpen(true);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	if (error) {
		return (
			<section className='py-16 px-4'>
				<div className='container mx-auto text-center'>
					<p className='text-destructive'>Failed to load success stories</p>
				</div>
			</section>
		);
	}

	return (
		<section className='py-16 px-4 bg-gradient-to-br from-background via-background to-muted/20'>
			<div className='container mx-auto'>
				{/* Section Header */}
				<div className='text-center mb-12'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}>
						<h2 className='text-4xl md:text-5xl font-bold text-foreground mb-4 font-serif'>Success Stories</h2>
						<p className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
							Discover the journeys of our satisfied clients and their amazing experiences with our services
						</p>
					</motion.div>
				</div>

				{/* Stories Carousel */}
				<div className='relative'>
					{isLoading ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{[...Array(3)].map((_, index) => (
								<Card key={index} className='overflow-hidden'>
									<Skeleton className='h-64 w-full' />
									<div className='p-4'>
										<Skeleton className='h-6 w-3/4 mb-2' />
										<Skeleton className='h-4 w-full' />
									</div>
								</Card>
							))}
						</div>
					) : stories.length > 0 ? (
						<>
							<Swiper
								modules={[Navigation, Autoplay]}
								spaceBetween={24}
								slidesPerView={1}
								navigation={{
									prevEl: '.success-stories-prev',
									nextEl: '.success-stories-next',
								}}
								autoplay={{
									delay: 4000,
									pauseOnMouseEnter: true,
									disableOnInteraction: false,
								}}
								loop={true}
								breakpoints={{
									640: { slidesPerView: 2 },
									1024: { slidesPerView: 3 },
								}}
								className='pb-12'>
								{stories.map((story) => (
									<SwiperSlide key={story._id}>
										<motion.div
											whileHover={{ y: -8 }}
											transition={{ duration: 0.3 }}
											className='group cursor-pointer'
											onClick={() => handleStoryClick(story)}>
											<Card className='overflow-hidden h-80 relative border-0 shadow-lg hover:shadow-xl transition-all duration-300'>
												{/* Background Image */}
												<div className='absolute inset-0'>
													<img
														src={story.image?.url || '/placeholder.svg?height=320&width=400&query=success story'}
														alt={story.title}
														className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
													/>
													<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
												</div>

												{/* Content Overlay */}
												<div className='absolute inset-0 p-6 flex flex-col justify-end text-white'>
													{/* Category Badge */}
													<div className='absolute top-4 left-4'>
														<Badge variant='secondary' className='bg-primary/90 text-primary-foreground border-0'>
															{story.category}
														</Badge>
													</div>

													{/* Title */}
													<h3 className='text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors'>
														{story.title}
													</h3>

													{/* Content Preview - Shows on Hover */}
													<AnimatePresence>
														<motion.div
															initial={{ opacity: 0, height: 0 }}
															whileHover={{ opacity: 1, height: 'auto' }}
															exit={{ opacity: 0, height: 0 }}
															transition={{ duration: 0.3 }}
															className='overflow-hidden'>
															<p className='text-sm text-gray-200 line-clamp-3 mb-3'>{story.content}</p>
															<div className='flex items-center gap-4 text-xs text-gray-300'>
																<div className='flex items-center gap-1'>
																	<Calendar className='w-3 h-3' />
																	{formatDate(story.createdAt)}
																</div>
																{story.tags?.length > 0 && (
																	<div className='flex items-center gap-1'>
																		<Tag className='w-3 h-3' />
																		{story.tags[0]}
																	</div>
																)}
															</div>
														</motion.div>
													</AnimatePresence>
												</div>
											</Card>
										</motion.div>
									</SwiperSlide>
								))}
							</Swiper>

							{/* Navigation Buttons */}
							<Button
								variant='outline'
								size='icon'
								className='success-stories-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background hover:border-border'>
								<ChevronLeft className='w-4 h-4' />
							</Button>
							<Button
								variant='outline'
								size='icon'
								className='success-stories-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background hover:border-border'>
								<ChevronRight className='w-4 h-4' />
							</Button>
						</>
					) : (
						<div className='text-center py-12'>
							<p className='text-muted-foreground'>No success stories available at the moment.</p>
						</div>
					)}
				</div>

				{/* Detailed Story Modal */}
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
						{selectedStory && (
							<>
								<DialogHeader>
									<DialogTitle className='text-2xl font-bold pr-8'>{selectedStory.title}</DialogTitle>
									<DialogDescription className='sr-only'></DialogDescription>
								</DialogHeader>

								<div className='space-y-6'>
									{/* Story Image */}
									<div className='relative h-64 md:h-80 rounded-lg overflow-hidden'>
										<img
											src={
												selectedStory.image?.url || '/placeholder.svg?height=320&width=800&query=success story detail'
											}
											alt={selectedStory.title}
											className='w-full h-full object-cover'
										/>
										<div className='absolute top-4 left-4'>
											<Badge variant='secondary' className='bg-primary text-primary-foreground'>
												{selectedStory.category}
											</Badge>
										</div>
									</div>

									{/* Story Details */}
									<div className='space-y-4'>
										<div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
											<div className='flex items-center gap-2'>
												<Calendar className='w-4 h-4' />
												{formatDate(selectedStory.createdAt)}
											</div>
											{selectedStory.tags?.length > 0 && (
												<div className='flex items-center gap-2'>
													<Tag className='w-4 h-4' />
													<div className='flex gap-1'>
														{selectedStory.tags.map((tag, index) => (
															<Badge key={index} variant='outline' className='text-xs'>
																{tag}
															</Badge>
														))}
													</div>
												</div>
											)}
										</div>

										<div className='prose prose-gray max-w-none'>
											<p className='text-foreground leading-relaxed text-base'>{selectedStory.content}</p>
										</div>
									</div>
								</div>
							</>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</section>
	);
};

export default FeaturedStories;
