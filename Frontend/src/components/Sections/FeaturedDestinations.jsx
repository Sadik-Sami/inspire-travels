import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { useFeaturedDestinations } from '@/hooks/useDestinationQuery';
import { ArrowRight, MapPin, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const FeaturedDestinations = () => {
	const [hoveredIndex, setHoveredIndex] = useState(null);
	const [favorites, setFavorites] = useState({});
	const { destinations, isLoading, error } = useFeaturedDestinations();

	const toggleFavorite = (id, e) => {
		e.preventDefault();
		setFavorites((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const formatPrice = (price, currency) => {
		const currencySymbols = {
			USD: '$',
			EUR: '€',
			GBP: '£',
			JPY: '¥',
			AUD: 'A$',
			CAD: 'C$',
			BDT: '৳',
		};

		return `${currencySymbols[currency] || '$'}${price.toLocaleString()}`;
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
	const DestinationSkeleton = () => (
		<div className='bg-card rounded-2xl shadow-sm overflow-hidden border border-border h-full min-w-0 flex-shrink-0'>
			{/* Image skeleton */}
			<div className='relative h-60'>
				<Skeleton className='h-full w-full rounded-none' />
				{/* Overlay content skeleton */}
				<div className='absolute bottom-0 left-0 right-0 p-5'>
					<Skeleton className='h-6 w-3/4 mb-2 bg-white/20' />
					<Skeleton className='h-4 w-1/2 bg-white/20' />
				</div>
				{/* Heart button skeleton */}
				<div className='absolute top-4 right-4'>
					<Skeleton className='h-10 w-10 rounded-full bg-white/20' />
				</div>
			</div>

			{/* Content skeleton */}
			<div className='p-6'>
				{/* Tags skeleton */}
				<div className='flex gap-2 mb-3'>
					<Skeleton className='h-6 w-16 rounded-full' />
					<Skeleton className='h-6 w-20 rounded-full' />
					<Skeleton className='h-6 w-14 rounded-full' />
				</div>

				{/* Description skeleton */}
				<Skeleton className='h-4 w-full mb-2' />
				<Skeleton className='h-4 w-5/6 mb-4' />

				{/* Price and button skeleton */}
				<div className='flex justify-between items-center'>
					<div>
						<Skeleton className='h-6 w-20 mb-1' />
						<Skeleton className='h-4 w-16' />
					</div>
					<Skeleton className='h-10 w-28 rounded-xl' />
				</div>
			</div>
		</div>
	);

	if (error) {
		return (
			<section className='py-20 bg-background'>
				<div className='container mx-auto px-4'>
					<div className='text-center'>
						<h2 className='text-2xl font-heading font-bold text-foreground mb-4'>Unable to load destinations</h2>
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
								Explore the world
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
							Discover Our <span className='text-primary'>Group Packages</span>
						</h2>
						<p className='text-muted-foreground mt-3 max-w-xl leading-relaxed'>
							Explore our handpicked destinations that travelers love. From iconic landmarks to hidden gems, we've got
							your next adventure covered.
						</p>
					</div>

					<div>
						<Link
							to='/destinations'
							className='group flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors duration-300'>
							<span>View all destinations</span>
							<ArrowRight size={16} className='group-hover:translate-x-1 transition-transform duration-300' />
						</Link>
					</div>
				</div>

				{isLoading ? (
					<div className='flex gap-8 overflow-hidden'>
						{[...Array(3)].map((_, index) => (
							<div key={index} className='w-full sm:w-1/2 lg:w-1/3 flex-shrink-0'>
								<DestinationSkeleton />
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
								delay: 5000,
								disableOnInteraction: false,
								pauseOnMouseEnter: true,
							}}
							navigation={{
								prevEl: '.swiper-button-prev-custom',
								nextEl: '.swiper-button-next-custom',
							}}
							breakpoints={{
								640: {
									slidesPerView: 2,
								},
								1024: {
									slidesPerView: 3,
								},
							}}>
							{destinations?.map((destination, index) => (
								<SwiperSlide key={destination?._id || index}>
									<motion.div
										variants={itemVariants}
										initial='hidden'
										animate='show'
										className='relative group h-full'
										onMouseEnter={() => setHoveredIndex(index)}
										onMouseLeave={() => setHoveredIndex(null)}>
										<div className='bg-card rounded-2xl overflow-hidden border border-border transition-all duration-500 h-full flex flex-col'>
											{/* Image Section */}
											<div className='relative h-60 overflow-hidden'>
												<img
													src={
														destination?.images?.[0]?.url ||
														'/placeholder.svg?height=240&width=400&query=travel destination' ||
														'/placeholder.svg' ||
														'/placeholder.svg'
													}
													alt={destination?.name || 'Destination image'}
													className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110'
												/>
												<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />

												{/* Trending Badge */}
												{destination?.trending && (
													<motion.div
														className='absolute top-4 left-4 z-10'
														initial={{ x: -20, opacity: 0 }}
														animate={{ x: 0, opacity: 1 }}
														transition={{ delay: 0.3 }}>
														<Badge className='bg-primary text-primary-foreground font-medium px-3 py-1.5 flex items-center gap-1.5 shadow-lg'>
															<TrendingUp size={14} />
															<span>Trending</span>
														</Badge>
													</motion.div>
												)}

												{/* Title Overlay */}
												<div className='absolute bottom-0 left-0 right-0 p-5'>
													<div className='flex items-start justify-between'>
														<div className='flex-1'>
															<h3 className='text-xl font-bold text-white font-heading mb-1'>
																{destination?.title || 'Beautiful Destination'}
															</h3>
															<div className='flex items-center text-white/90'>
																<MapPin size={14} className='mr-1.5 flex-shrink-0' />
																<span className='text-sm'>{destination?.location?.to || 'Amazing Location'}</span>
															</div>
														</div>
													</div>
												</div>
											</div>

											{/* Content Section */}
											<div className='p-6 flex flex-col flex-grow'>
												{/* Tags */}
												<div className='flex flex-wrap items-center gap-2 mb-4'>
													{destination?.tags?.slice(0, 3).map((tag, idx) => (
														<Badge
															key={idx}
															variant='outline'
															className='bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors'>
															{tag}
														</Badge>
													)) || (
														<>
															<Badge variant='outline' className='bg-primary/5 text-primary border-primary/20'>
																Beach
															</Badge>
															<Badge variant='outline' className='bg-primary/5 text-primary border-primary/20'>
																Adventure
															</Badge>
															<Badge variant='outline' className='bg-primary/5 text-primary border-primary/20'>
																Culture
															</Badge>
														</>
													)}
												</div>

												{/* Description */}
												<p className='text-muted-foreground mb-6 line-clamp-2 flex-grow leading-relaxed'>
													{destination?.summary ||
														'Discover this amazing destination with breathtaking views and unforgettable experiences.'}
												</p>

												{/* Price and CTA */}
												<div className='flex justify-between items-center mt-auto'>
													<div>
														<div className='flex items-baseline gap-1'>
															<span className='font-bold text-2xl text-foreground'>
																{formatPrice(
																	destination.pricing?.basePrice || 0,
																	destination.pricing?.currency || 'BDT'
																)}
															</span>
															<span className='text-sm text-muted-foreground'>
																/ {destination?.pricing?.priceType || 'person'}
															</span>
														</div>
													</div>

													<AnimatedButton
														asChild
														variant='outline'
														className='border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-xl px-6 py-2.5 font-medium'>
														<Link to={`/destinations/${destination?.id || destination?._id}`}>View Details</Link>
													</AnimatedButton>
												</div>
											</div>
										</div>
									</motion.div>
								</SwiperSlide>
							))}
						</Swiper>

						{destinations?.length > 3 && (
							<>
								<button
									className='swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 z-10 group'
									aria-label='Previous destinations'>
									<ChevronLeft size={20} className='text-gray-700 group-hover:text-primary transition-colors' />
								</button>
								<button
									className='swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 z-10 group'
									aria-label='Next destinations'>
									<ChevronRight size={20} className='text-gray-700 group-hover:text-primary transition-colors' />
								</button>
							</>
						)}
					</div>
				)}

				{/* Empty State */}
				{!isLoading && destinations?.length === 0 && (
					<div className='text-center py-12'>
						<div className='max-w-md mx-auto'>
							<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
								<MapPin className='w-8 h-8 text-primary' />
							</div>
							<h3 className='text-xl font-heading font-bold text-foreground mb-2'>No destinations found</h3>
							<p className='text-muted-foreground mb-6'>
								We're working on adding amazing destinations for you to explore.
							</p>
							<AnimatedButton asChild className='cta-primary'>
								<Link to='/destinations'>Explore All Destinations</Link>
							</AnimatedButton>
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default FeaturedDestinations;
