'use client';

import { Link } from 'react-router-dom';
import {
	ArrowRight,
	Clock,
	FileText,
	Heart,
	TrendingUp,
	Sparkles,
	Plane,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import useVisaQuery from '@/hooks/useVisaQuery';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Button } from '../ui/button';

const FeaturedVisas = () => {
	const [hoveredIndex, setHoveredIndex] = useState(null);
	const [favorites, setFavorites] = useState({});
	const visaQuery = useVisaQuery();
	const { data: visas = [], isLoading, isError, error } = visaQuery.useGetFeaturedVisas();

	const getCurrencySymbol = (currency) => {
		switch (currency) {
			case 'USD':
				return '$';
			case 'EUR':
				return '€';
			case 'GBP':
				return '£';
			case 'BDT':
				return '৳';
			default:
				return '$';
		}
	};

	const toggleFavorite = (id, e) => {
		e.preventDefault();
		setFavorites((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
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

	const VisaSkeleton = () => (
		<Card className='h-full min-w-0 flex-shrink-0 flex flex-col'>
			<CardHeader className='p-0 flex-shrink-0'>
				<div className='relative h-60'>
					<Skeleton className='h-full w-full rounded-none' />
					<div className='absolute bottom-0 left-0 right-0 p-5'>
						<Skeleton className='h-6 w-3/4 mb-2 bg-white/20' />
						<Skeleton className='h-4 w-1/2 bg-white/20' />
					</div>
					<div className='absolute top-4 right-4'>
						<Skeleton className='h-10 w-10 rounded-full bg-white/20' />
					</div>
				</div>
			</CardHeader>

			<CardContent className='p-6 flex-grow flex flex-col'>
				<div className='flex gap-2 mb-3 flex-shrink-0'>
					<Skeleton className='h-6 w-20 rounded-full' />
					<Skeleton className='h-6 w-16 rounded-full' />
				</div>
				<div className='flex-grow'>
					<Skeleton className='h-4 w-full mb-2' />
					<Skeleton className='h-4 w-5/6 mb-4' />
				</div>
			</CardContent>

			<CardFooter className='p-6 pt-0 flex-shrink-0'>
				<div className='flex justify-between items-center w-full'>
					<div>
						<Skeleton className='h-6 w-20 mb-1' />
						<Skeleton className='h-4 w-16' />
					</div>
					<Skeleton className='h-10 w-28 rounded-xl' />
				</div>
			</CardFooter>
		</Card>
	);

	if (isError) {
		return (
			<section className='py-20 bg-background'>
				<div className='container mx-auto px-4'>
					<div className='text-center'>
						<h2 className='text-2xl font-heading font-bold text-foreground mb-4'>Unable to load visa packages</h2>
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
								Travel with ease
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
						<h2 className='text-3xl md:text-4xl font-heading font-bold max-w-lg mb-3 text-foreground'>
							Featured <span className='text-primary'>Visa Packages</span>
						</h2>
						<p className='text-muted-foreground mt-3 max-w-xl leading-relaxed'>
							Hassle-free visa processing for your dream destinations. Fast, reliable, and professional service to get
							you traveling sooner.
						</p>
					</div>

					<div>
						<Link
							to='/visas'
							className='group flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors duration-300'>
							<span>View all visa packages</span>
							<ArrowRight size={16} className='group-hover:translate-x-1 transition-transform duration-300' />
						</Link>
					</div>
				</div>

				{/* Visas Grid/Carousel */}
				{isLoading ? (
					<div className='flex gap-8 overflow-hidden'>
						{[...Array(3)].map((_, index) => (
							<div key={index} className='w-full sm:w-1/2 lg:w-1/3 flex-shrink-0'>
								<VisaSkeleton />
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
								prevEl: '.swiper-button-prev-custom-visas',
								nextEl: '.swiper-button-next-custom-visas',
							}}
							breakpoints={{
								640: {
									slidesPerView: 2,
								},
								1024: {
									slidesPerView: 3,
								},
							}}>
							{visas?.map((visa, index) => (
								<SwiperSlide key={visa?._id || index}>
									<motion.div
										variants={itemVariants}
										initial='hidden'
										animate='show'
										className='relative group h-[512px]'
										onMouseEnter={() => setHoveredIndex(index)}
										onMouseLeave={() => setHoveredIndex(null)}>
										<Card className='overflow-hidden transition-all duration-500 h-full flex flex-col py-0'>
											<CardHeader className='p-0'>
												<div className='relative h-60 overflow-hidden'>
													<img
														src={
															visa?.coverImage?.url ||
															'/placeholder.svg?height=240&width=400&query=travel visa destination' ||
															'/placeholder.svg' ||
															'/placeholder.svg' ||
															'/placeholder.svg'
														}
														alt={visa?.coverImage?.alt || visa?.title || 'Visa destination image'}
														className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110'
													/>
													<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
													{/* Title Overlay */}
													<div className='absolute bottom-0 left-0 right-0 p-5'>
														<div className='flex items-start justify-between'>
															<div className='flex-1'>
																<h3 className='text-xl font-bold text-white font-heading mb-1 line-clamp-2 leading-tight'>
																	{visa?.title || 'Visa Package'}
																</h3>
																<div className='flex items-center text-white/90'>
																	<Plane size={14} className='mr-1.5 flex-shrink-0' />
																	<span className='text-sm'>
																		{visa?.from} → {visa?.to}
																	</span>
																</div>
															</div>
														</div>
													</div>
												</div>
											</CardHeader>

											<CardContent className='flex flex-col flex-grow'>
												{/* Processing Time and Requirements */}
												<div className='flex flex-wrap items-center gap-2 mb-2'>
													<Badge
														variant='outline'
														className='bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1'>
														<Clock size={12} />
														{visa?.processingTime || '3-5 days'}
													</Badge>
													<Badge
														variant='outline'
														className='bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1'>
														<FileText size={12} />
														Requirements
													</Badge>
												</div>

												{/* Description */}
												<p className='text-muted-foreground text-sm'>
													{visa?.shortDescription ||
														'Professional visa processing service with expert guidance and fast turnaround time. Get your visa processed quickly and efficiently.'}
												</p>

												{/* Special Requirements */}
												{visa?.specialRequests && (
													<div className='mb-4'>
														<p className='text-sm text-muted-foreground'>
															<span className='font-bold'>Special Requirements:</span> {visa.specialRequests}
														</p>
													</div>
												)}
											</CardContent>

											<CardFooter className='flex justify-between items-center pb-4'>
												<div>
													<div className='flex items-baseline gap-1'>
														{visa?.pricing?.discountedPrice !== visa?.pricing?.basePrice ? (
															<>
																<span className='font-bold text-2xl text-foreground'>
																	{getCurrencySymbol(visa?.pricing?.currency)}
																	{visa?.pricing?.discountedPrice?.toLocaleString() || '0'}
																</span>
																<span className='text-sm text-muted-foreground line-through ml-1'>
																	{getCurrencySymbol(visa?.pricing?.currency)}
																	{visa?.pricing?.basePrice?.toLocaleString() || '0'}
																</span>
															</>
														) : (
															<span className='font-bold text-2xl text-foreground'>
																{getCurrencySymbol(visa?.pricing?.currency)}
																{visa?.pricing?.basePrice?.toLocaleString() || '0'}
															</span>
														)}
													</div>
													<span className='text-sm text-muted-foreground'>Processing fee</span>
												</div>
												<AnimatedButton
													asChild
													variant='outline'
													className='border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-xl px-6 py-2.5 font-medium flex-shrink-0'>
													<Link to={`/visas/${visa?.slug || visa?._id}`}>Apply Now</Link>
												</AnimatedButton>
											</CardFooter>
										</Card>
									</motion.div>
								</SwiperSlide>
							))}
						</Swiper>

						{visas?.length > 3 && (
							<>
								<Button
									className='swiper-button-prev-custom-visas absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 z-10 group'
									aria-label='Previous visas'
									variant='outline'>
									<ChevronLeft size={20} className='transition-colors' />
								</Button>
								<Button
									className='swiper-button-next-custom-visas absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 z-10 group'
									aria-label='Next visas'
									variant='outline'>
									<ChevronRight size={20} className='transition-colors' />
								</Button>
							</>
						)}
					</div>
				)}

				{/* Empty State */}
				{!isLoading && visas?.length === 0 && (
					<div className='text-center py-12'>
						<div className='max-w-md mx-auto'>
							<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
								<FileText className='w-8 h-8 text-primary' />
							</div>
							<h3 className='text-xl font-heading font-bold text-foreground mb-2'>No visa packages found</h3>
							<p className='text-muted-foreground mb-6'>
								We're working on adding visa processing services for popular destinations.
							</p>
							<AnimatedButton asChild className='cta-primary'>
								<Link to='/visas'>Explore All Visa Services</Link>
							</AnimatedButton>
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default FeaturedVisas;
