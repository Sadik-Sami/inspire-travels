import { MapPin, Calendar, Users } from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedButton from '@/components/Animation/AnimatedButton';

const SearchSection = () => {
	return (
		<section className='py-12 bg-content'>
			<div className='container mx-auto px-4'>
				<FadeIn direction='up'>
					<div className='bg-background rounded-2xl shadow-lg p-6 -mt-32 relative z-20'>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div className='space-y-2'>
								<label className='font-medium'>Where to</label>
								<div className='flex items-center border rounded-md p-3 bg-white'>
									<MapPin className='text-muted-foreground mr-2' size={18} />
									<input
										type='text'
										placeholder='Search destination'
										className='w-full outline-none bg-transparent dark:placeholder:text-black/60'
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<label className='font-medium'>When</label>
								<div className='flex items-center border rounded-md p-3 bg-white'>
									<Calendar className='text-muted-foreground mr-2' size={18} />
									<input
										type='text'
										placeholder='Select dates'
										className='w-full outline-none bg-transparent dark:placeholder:text-black/60'
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<label className='font-medium'>Travelers</label>
								<div className='flex items-center border rounded-md p-3 bg-white'>
									<Users className='text-muted-foreground mr-2' size={18} />
									<select className='w-full outline-none bg-transparent dark:text-black/80'>
										<option>1 Adult</option>
										<option>2 Adults</option>
										<option>2 Adults, 1 Child</option>
										<option>2 Adults, 2 Children</option>
									</select>
								</div>
							</div>
						</div>

						<div className='mt-6 text-center'>
							<AnimatedButton size='lg' className='bg-secondary hover:bg-secondary/90 text-secondary-foreground'>
								Search Trips
							</AnimatedButton>
						</div>
					</div>
				</FadeIn>
			</div>
		</section>
	);
};

export default SearchSection;
