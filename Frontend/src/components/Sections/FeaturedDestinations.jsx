'use client';

import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star, Heart, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimatedButton from '../Animation/AnimatedButton';

const FeaturedDestinations = ({ destinations, isLoading }) => {
	const [hoveredIndex, setHoveredIndex] = useState(null);
	const [favorites, setFavorites] = useState({});
	console.log(destinations);
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
			{/* Decorative Background Elements */}
			<div className='absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary-100/10 to-transparent -z-10'></div>
			<div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-100/10 to-transparent -z-10'></div>
			<div className='absolute top-20 left-10 w-64 h-64 rounded-full bg-primary-200/5 blur-3xl -z-10'></div>
			<div className='absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary-300/5 blur-3xl -z-10'></div>

			<div className='container mx-auto px-4'>
				<div className='flex flex-col md:flex-row md:justify-between md:items-end mb-12'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className='mb-4 md:mb-0'>
						<span className='font-accent text-sm inline-block text-primary-600 mb-2 uppercase tracking-wider'>
							Explore the world
						</span>
						<h2 className='text-3xl md:text-4xl font-heading font-bold max-w-lg'>
							Discover Our <span className='text-gradient'>Featured Destinations</span>
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
							View all destinations
							<ArrowRight size={16} className='group-hover:translate-x-1 transition-transform duration-300' />
						</Link>
					</motion.div>
				</div>

				{isLoading ? (
					<div className='h-[400px] flex items-center justify-center z-50'>
						{/* <Loader2 className='animate-spin text-primary' size={32} /> */}
						<div className='relative w-16 h-16'>
							<div className='absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-primary-200 opacity-25'></div>
							<div className='absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin'></div>
						</div>
					</div>
				) : (
					<motion.div
						variants={container}
						// initial='hidden'
						whileInView='show'
						className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
						{destinations?.map((destination, index) => (
							<motion.div key={destination?._id || index} variants={item} className='relative'>
								<div
									className='bg-background rounded-2xl shadow-lg overflow-hidden border border-border transition-all duration-500'
									onMouseEnter={() => setHoveredIndex(index)}
									onMouseLeave={() => setHoveredIndex(null)}>
									<div className='relative h-60 overflow-hidden'>
										<img
											src={destination.images[0]?.url || '/placeholder.svg?height=400&width=600'}
											alt={destination.name}
											className='w-full h-full object-cover transition-transform duration-700 ease-out'
											style={{
												transform: hoveredIndex === index ? 'scale(1.08)' : 'scale(1)',
											}}
										/>
										<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent'></div>

										{/* Favorites button */}
										<button
											onClick={(e) => toggleFavorite(destination._id || index, e)}
											className='absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300 z-10'>
											<Heart
												size={18}
												className={favorites[destination._id || index] ? 'fill-red-500 text-red-500' : 'text-white'}
											/>
										</button>

										{/* Trending badge */}
										{destination.trending && (
											<div className='absolute top-4 left-4 z-10'>
												<Badge className='bg-primary-600 text-white font-medium px-3 py-1 flex items-center gap-1'>
													<TrendingUp size={14} />
													Trending
												</Badge>
											</div>
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

									<div className='p-6'>
										<div className='flex items-center gap-2 mb-3'>
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

										<p className='text-muted-foreground mb-4 line-clamp-2'>{destination?.summary}</p>

										<div className='flex justify-between items-center'>
											<div>
												<span className='font-bold text-xl'>${destination?.pricing?.basePrice} </span>
												<span className='text-sm text-muted-foreground'>/ {destination?.pricing?.priceType}</span>
											</div>

											<AnimatedButton
												asChild
												variant='outline'
												className='border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-xl'>
												<Link to={`/destinations/${destination.id}`}>View Details</Link>
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
