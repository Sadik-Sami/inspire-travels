import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedCard from '@/components/Animation/AnimatedCard';
import AnimatedButton from '@/components/Animation/AnimatedButton';

const FeaturedDestinations = ({ destinations }) => {
	return (
		<section className='py-16'>
			<div className='container mx-auto px-4'>
				<div className='flex justify-between items-center mb-10'>
					<FadeIn>
						<h2 className='text-3xl font-bold'>Featured Destinations</h2>
					</FadeIn>
					<FadeIn direction='left'>
						<Link to='/destinations' className='text-primary flex items-center gap-1 hover:underline group'>
							View all
							<ArrowRight size={16} className='group-hover:translate-x-1 transition-transform' />
						</Link>
					</FadeIn>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
					{destinations.map((destination, index) => (
						<AnimatedCard
							key={destination.id}
							delay={index * 0.1}
							className='overflow-hidden rounded-lg shadow-md group'>
							<div className='relative h-64 overflow-hidden'>
								<img
									src={destination.imageUrl || '/placeholder.svg'}
									alt={destination.name}
									className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
								/>
								<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4'>
									<h3 className='text-white text-xl font-bold'>{destination.name}</h3>
									<div className='flex items-center text-white/80'>
										<MapPin size={14} className='mr-1' />
										<span className='text-sm'>{destination.location}</span>
									</div>
								</div>
							</div>
							<div className='p-4'>
								<p className='text-muted-foreground mb-4 line-clamp-2'>{destination.description}</p>
								<div className='flex justify-between items-center'>
									<span className='font-bold text-lg'>
										${destination.price} <span className='text-sm font-normal'>/ person</span>
									</span>
									<AnimatedButton
										asChild
										variant='outline'
										size='sm'
										className='border-primary text-primary hover:bg-primary/10'>
										<Link to={`/destinations/${destination.id}`}>View Details</Link>
									</AnimatedButton>
								</div>
							</div>
						</AnimatedCard>
					))}
				</div>
			</div>
		</section>
	);
};

export default FeaturedDestinations;
