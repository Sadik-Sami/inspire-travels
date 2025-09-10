import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { useFeaturedBlogs } from '@/hooks/useBlogQuery';
import { ArrowRight, BookOpen, Eye, Clock, Sparkles, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const FeaturedBlogs = () => {
	const [hoveredIndex, setHoveredIndex] = useState(null);
	const { data: blogs, isLoading, error } = useFeaturedBlogs(6);

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		show: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	};

	// Loading skeleton component
	const BlogSkeleton = () => (
		<Card className='h-[512px] min-w-0 flex-shrink-0 flex flex-col'>
			<CardHeader className='p-0 flex-shrink-0'>
				<div className='relative h-60'>
					<Skeleton className='h-full w-full rounded-none' />
					<div className='absolute bottom-0 left-0 right-0 p-5'>
						<Skeleton className='h-6 w-3/4 mb-2 bg-white/20' />
						<Skeleton className='h-4 w-1/2 bg-white/20' />
					</div>
				</div>
			</CardHeader>

			<CardContent className='p-6 flex-grow flex flex-col'>
				<div className='flex gap-2 mb-3 flex-shrink-0'>
					<Skeleton className='h-6 w-16 rounded-full' />
					<Skeleton className='h-6 w-20 rounded-full' />
				</div>
				<div className='flex-grow'>
					<Skeleton className='h-4 w-full mb-2' />
					<Skeleton className='h-4 w-5/6 mb-4' />
				</div>
			</CardContent>

			<CardFooter className='p-6 pt-0 flex-shrink-0'>
				<div className='flex justify-between items-center w-full'>
					<div className='flex gap-4'>
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-20' />
					</div>
					<Skeleton className='h-10 w-28 rounded-xl' />
				</div>
			</CardFooter>
		</Card>
	);

	if (error) {
		return (
			<section className='py-20 bg-background'>
				<div className='container mx-auto px-4'>
					<div className='text-center'>
						<h2 className='text-2xl font-heading font-bold text-foreground mb-4'>Unable to load blogs</h2>
						<p className='text-muted-foreground'>Please try again later or contact support if the problem persists.</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className='py-20 bg-background relative'>
			<div className='container mx-auto px-4'>
				{/* Header Section */}
				<div className='flex flex-col md:flex-row md:justify-between md:items-end mb-12'>
					<div className='mb-4 md:mb-0'>
						<div className='flex items-center gap-2 mb-2'>
							<span className='font-display text-sm inline-block text-primary uppercase tracking-wider font-medium'>
								Travel Stories
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
						<h2 className='text-3xl md:text-4xl font-heading font-bold max-w-md mb-3 text-foreground'>
							Featured <span className='text-primary'>Travel Blogs</span>
						</h2>
						<p className='text-muted-foreground mt-3 max-w-xl leading-relaxed'>
							Discover inspiring travel stories, tips, and guides from our community of travelers. Get inspired for your
							next adventure.
						</p>
					</div>

					<div>
						<Link
							href='/blogs'
							className='group flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors duration-300'>
							<span>View all blogs</span>
							<ArrowRight size={16} className='group-hover:translate-x-1 transition-transform duration-300' />
						</Link>
					</div>
				</div>

				{isLoading ? (
					<div className='flex gap-8 overflow-hidden'>
						{[...Array(3)].map((_, index) => (
							<div key={index} className='w-full sm:w-1/2 lg:w-1/3 flex-shrink-0'>
								<BlogSkeleton />
							</div>
						))}
					</div>
				) : (
					<div className='relative'>
						<Swiper
							modules={[Navigation, Autoplay]}
							spaceBetween={32}
							slidesPerView={1}
							loop={true}
							autoplay={{
								delay: 4000,
								disableOnInteraction: false,
								pauseOnMouseEnter: true,
							}}
							navigation={{
								prevEl: '.swiper-button-prev-custom-blogs',
								nextEl: '.swiper-button-next-custom-blogs',
							}}
							breakpoints={{
								640: {
									slidesPerView: 2,
								},
								1024: {
									slidesPerView: 3,
								},
							}}>
							{blogs?.map((blog, index) => (
								<SwiperSlide key={blog?._id || index}>
									<motion.div
										variants={itemVariants}
										initial='hidden'
										animate='show'
										className='relative group h-[512px]'
										onMouseEnter={() => setHoveredIndex(index)}
										onMouseLeave={() => setHoveredIndex(null)}>
										<Card className='overflow-hidden transition-all h-full flex flex-col py-0'>
											{/* Card Header - Image Section */}
											<CardHeader className='p-0 flex-shrink-0'>
												<div className='relative h-60 overflow-hidden'>
													<img
														src={
															blog?.coverImage?.url ||
															'/placeholder.svg?height=240&width=400&query=travel blog cover image'
														}
														alt={blog?.title || 'Blog cover image'}
														className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110'
													/>
													<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />

													{/* Title Overlay */}
													<div className='absolute bottom-0 left-0 right-0 p-5'>
														<div className='flex items-start justify-between'>
															<div className='flex-1'>
																<h3 className='text-xl font-bold text-white font-heading mb-1 line-clamp-2 leading-tight'>
																	{blog?.title || 'Amazing Travel Story'}
																</h3>
																<div className='flex items-center text-white/90'>
																	<Calendar size={14} className='mr-1.5 flex-shrink-0' />
																	<span className='text-sm'>{formatDate(blog?.createdAt)}</span>
																</div>
															</div>
														</div>
													</div>
												</div>
											</CardHeader>

											{/* Card Content - Categories and Summary */}
											<CardContent className='p-6 flex flex-col flex-grow'>
												{/* Categories */}
												<div className='flex flex-wrap items-center gap-2 mb-4 flex-shrink-0'>
													{blog?.categories?.slice(0, 2).map((category, idx) => (
														<Badge
															key={idx}
															variant='outline'
															className='bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors'>
															{category}
														</Badge>
													)) || (
														<Badge variant='outline' className='bg-primary/5 text-primary border-primary/20'>
															Travel Tips
														</Badge>
													)}
												</div>

												{/* Summary */}
												<div className='flex-grow flex items-start'>
													<p className='text-muted-foreground line-clamp-3 leading-relaxed text-sm'>
														{blog?.summary ||
															'Discover amazing travel insights and tips from experienced travelers around the world. Get inspired for your next adventure with detailed guides and personal stories.'}
													</p>
												</div>
											</CardContent>

											{/* Card Footer - Meta Info and CTA */}
											<CardFooter className='p-6 pt-0 flex-shrink-0'>
												<div className='flex justify-between items-center w-full'>
													<div className='flex items-center gap-4 text-sm text-muted-foreground'>
														<div className='flex items-center gap-1'>
															<Clock size={14} />
															<span>{blog?.readTime || 5} min read</span>
														</div>
														<div className='flex items-center gap-1'>
															<Eye size={14} />
															<span>{blog?.viewCount || 0} views</span>
														</div>
													</div>

													<AnimatedButton
														asChild
														variant='outline'
														className='border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-xl px-6 py-2.5 font-medium flex-shrink-0'>
														<Link to={`/blogs/${blog.slug}`}>
															<BookOpen size={16} className='mr-2' />
															Read More
														</Link>
													</AnimatedButton>
												</div>
											</CardFooter>
										</Card>
									</motion.div>
								</SwiperSlide>
							))}
						</Swiper>

						{blogs?.length > 3 && (
							<>
								<button
									className='swiper-button-prev-custom-blogs absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 z-10 group'
									aria-label='Previous blogs'>
									<ChevronLeft size={20} className='text-gray-700 group-hover:text-primary transition-colors' />
								</button>
								<button
									className='swiper-button-next-custom-blogs absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 z-10 group'
									aria-label='Next blogs'>
									<ChevronRight size={20} className='text-gray-700 group-hover:text-primary transition-colors' />
								</button>
							</>
						)}
					</div>
				)}

				{/* Empty State */}
				{!isLoading && blogs?.length === 0 && (
					<div className='text-center py-12'>
						<div className='max-w-md mx-auto'>
							<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
								<BookOpen className='w-8 h-8 text-primary' />
							</div>
							<h3 className='text-xl font-heading font-bold text-foreground mb-2'>No blogs found</h3>
							<p className='text-muted-foreground mb-6'>
								We're working on adding amazing travel stories for you to explore.
							</p>
							<AnimatedButton asChild className='cta-primary'>
								<Link href='/blogs'>Explore All Blogs</Link>
							</AnimatedButton>
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default FeaturedBlogs;
