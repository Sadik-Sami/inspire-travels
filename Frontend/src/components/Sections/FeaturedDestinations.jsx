import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star, Heart, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import GradientText from '@/components/ui/gradient-text';

const FeaturedDestinations = ({ destinations, isLoading }) => {
	const [hoveredIndex, setHoveredIndex] = useState(null);
	const [favorites, setFavorites] = useState({});

	const toggleFavorite = (id, e) => {
		e.preventDefault();
		setFavorites((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.3,
			},
		},
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
	};

	return (
		<section className='py-20 bg-background relative overflow-hidden'>
			{/* Subtle professional background decorations */}
			<div className='absolute inset-0 pointer-events-none'>
				{/* Subtle top-left gradient circle */}
				<div
					className='absolute top-0 left-0 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full opacity-10'
					style={{
						background:
							'radial-gradient(circle, rgba(var(--color-primary-200), 0.4) 0%, rgba(var(--color-primary-100), 0.1) 50%, transparent 80%)',
						transform: 'translate(-30%, -30%)',
						filter: 'blur(60px)',
					}}
				/>

				{/* Subtle bottom-right gradient circle */}
				<div
					className='absolute bottom-0 right-0 w-[45vw] h-[45vw] max-w-[700px] max-h-[700px] rounded-full opacity-10'
					style={{
						background:
							'radial-gradient(circle, rgba(var(--color-secondary-200), 0.3) 0%, rgba(var(--color-secondary-100), 0.1) 60%, transparent 80%)',
						transform: 'translate(30%, 30%)',
						filter: 'blur(70px)',
					}}
				/>

				{/* Very subtle center accent */}
				<div
					className='absolute top-1/2 left-1/2 w-[60vw] h-[30vw] max-w-[900px] max-h-[400px] rounded-full opacity-5'
					style={{
						background:
							'radial-gradient(ellipse, rgba(var(--color-primary-300), 0.3) 0%, rgba(var(--color-primary-100), 0.1) 50%, transparent 80%)',
						transform: 'translate(-50%, -50%) rotate(-10deg)',
						filter: 'blur(50px)',
					}}
				/>
			</div>

			<div className='container mx-auto px-4'>
				<div className='flex flex-col md:flex-row md:justify-between md:items-end mb-12'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className='mb-4 md:mb-0'>
						<div className='flex items-center gap-2 mb-2'>
							<span className='font-accent text-sm inline-block text-primary-600 uppercase tracking-wider'>
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
								<Sparkles size={16} className='text-primary-600' />
							</motion.div>
						</div>
						<h2 className='text-3xl md:text-4xl font-heading font-bold max-w-lg mb-3'>
							Discover Our{' '}
							<GradientText from='primary-400' to='primary-600'>
								Featured Destinations
							</GradientText>
						</h2>
						<p className='text-muted-foreground mt-3 max-w-xl'>
							Explore our handpicked destinations that travelers love. From iconic landmarks to hidden gems, we've got
							your next adventure covered.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						viewport={{ once: true }}>
						<Link
							to='/destinations'
							className='group flex items-center gap-1 text-primary font-medium hover:text-primary-600 transition-colors'>
							<span>View all destinations</span>
							<ArrowRight size={16} className='group-hover:translate-x-1 transition-transform duration-300' />
						</Link>
					</motion.div>
				</div>

				{isLoading ? (
					// Loading skeleton UI that matches the card structure
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
						{[...Array(3)].map((_, index) => (
							<div
								key={index}
								className='bg-background rounded-2xl shadow-sm overflow-hidden border border-border h-full'>
								{/* Image skeleton */}
								<div className='relative h-60'>
									<Skeleton className='h-full w-full' />
									{/* Title area skeleton */}
									<div className='absolute bottom-0 left-0 right-0 p-5'>
										<Skeleton className='h-6 w-3/4 mb-2' />
										<Skeleton className='h-4 w-1/2' />
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
										<Skeleton className='h-6 w-20' />
										<Skeleton className='h-10 w-28 rounded-xl' />
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<motion.div
						variants={container}
						initial='hidden'
						whileInView='show'
						viewport={{ once: true, margin: '-100px' }}
						className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
						{destinations?.map((destination, index) => (
							<motion.div
								key={destination?._id || index}
								variants={item}
								className='relative'
								whileHover={{
									y: -8,
									transition: { duration: 0.3 },
								}}>
								<div
									className='bg-background rounded-2xl shadow-lg overflow-hidden border border-border transition-all duration-500 h-full flex flex-col'
									onMouseEnter={() => setHoveredIndex(index)}
									onMouseLeave={() => setHoveredIndex(null)}>
									<div className='relative h-60 overflow-hidden'>
										<img
											src={destination?.images?.[0]?.url}
											alt={destination?.name || 'Destination image'}
											className='w-full h-full object-cover transition-transform duration-700 ease-out'
											style={{
												transform: hoveredIndex === index ? 'scale(1.08)' : 'scale(1)',
											}}
										/>
										<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent'></div>

										{/* Favorites button with animation */}
										<motion.button
											onClick={(e) => toggleFavorite(destination?._id || index, e)}
											className='absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300 z-10'
											whileTap={{ scale: 0.9 }}
											whileHover={{ scale: 1.1 }}>
											<Heart
												size={18}
												className={favorites[destination?._id || index] ? 'fill-red-500 text-red-500' : 'text-white'}
											/>
										</motion.button>

										{/* Trending badge with animation */}
										{destination?.trending && (
											<motion.div
												className='absolute top-4 left-4 z-10'
												initial={{ x: -20, opacity: 0 }}
												animate={{ x: 0, opacity: 1 }}
												transition={{ delay: 0.3 }}>
												<Badge className='bg-primary-600 text-white font-medium px-3 py-1 flex items-center gap-1'>
													<TrendingUp size={14} />
													<span>Trending</span>
												</Badge>
											</motion.div>
										)}

										<div className='absolute bottom-0 left-0 right-0 p-5'>
											<div className='flex items-start justify-between'>
												<div>
													<h3 className='text-xl font-bold text-white font-heading'>{destination?.name}</h3>
													<div className='flex items-center text-white/90 mt-1'>
														<MapPin size={14} className='mr-1' />
														<span className='text-sm'>{destination?.location?.to}</span>
													</div>
												</div>
												<div className='flex items-center bg-white/20 backdrop-blur-md rounded-md px-2 py-1'>
													<Star size={14} className='text-yellow-400' fill='currentColor' />
													<span className='text-white text-sm ml-1 font-medium'>{destination?.rating || '4.5'}</span>
												</div>
											</div>
										</div>
									</div>

									<div className='p-6 flex flex-col flex-grow'>
										<div className='flex flex-wrap items-center gap-2 mb-3'>
											{destination?.tags?.slice(0, 3).map((tag, idx) => (
												<Badge
													key={idx}
													variant='outline'
													className='bg-primary-50 text-primary-700 border-primary-200'>
													{tag}
												</Badge>
											)) || (
												<>
													<Badge variant='outline' className='bg-primary-50 text-primary-700 border-primary-200'>
														Beach
													</Badge>
													<Badge variant='outline' className='bg-primary-50 text-primary-700 border-primary-200'>
														Adventure
													</Badge>
												</>
											)}
										</div>

										<p className='text-muted-foreground mb-4 line-clamp-2 flex-grow'>{destination?.summary}</p>

										<div className='flex justify-between items-center mt-auto'>
											<div>
												<span className='font-bold text-xl'>${destination?.pricing?.basePrice} </span>
												<span className='text-sm text-muted-foreground'>/ {destination?.pricing?.priceType}</span>
											</div>

											<AnimatedButton
												asChild
												variant='outline'
												className='border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-xl'>
												<Link to={`/destinations/${destination?.id}`}>View Details</Link>
											</AnimatedButton>
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>
				)}
			</div>
		</section>
	);
};

export default FeaturedDestinations;
