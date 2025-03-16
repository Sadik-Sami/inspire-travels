import { useState, useEffect } from 'react';
import { MapPin, Calendar, Star, Filter, ChevronDown, Search } from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedCard from '@/components/Animation/AnimatedCard';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import HeroSection from '@/components/Sections/HeroSection';
import NewsletterSection from '@/components/Sections/NewsletterSection';

const Destinations = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [priceRange, setPriceRange] = useState([0, 5000]);
	const [duration, setDuration] = useState('any');
	const [sortBy, setSortBy] = useState('popular');
	const [filteredDestinations, setFilteredDestinations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// Sample travel packages data
	const destinations = [
		{
			id: 1,
			name: 'Bali Paradise Escape',
			location: 'Bali, Indonesia',
			description:
				'Experience the perfect blend of relaxation and adventure in Bali with pristine beaches, ancient temples, and lush rice terraces.',
			price: 1299,
			duration: 7,
			rating: 4.8,
			reviews: 124,
			imageUrl: 'https://picsum.photos/400/600?random=4',
			features: ['Luxury Accommodation', 'Private Beach Access', 'Cultural Tours', 'Spa Treatment'],
			popular: true,
			category: 'beach',
		},
		{
			id: 2,
			name: 'Parisian Romance',
			location: 'Paris, France',
			description:
				'Discover the city of love with this romantic getaway featuring iconic landmarks, world-class cuisine, and charming neighborhoods.',
			price: 1899,
			duration: 5,
			rating: 4.7,
			reviews: 98,
			imageUrl: 'https://picsum.photos/400/600?random=5',
			features: ['Eiffel Tower Visit', 'Seine River Cruise', 'Wine Tasting', 'Museum Passes'],
			popular: true,
			category: 'city',
		},
		{
			id: 3,
			name: 'Tokyo Explorer',
			location: 'Tokyo, Japan',
			description:
				"Immerse yourself in the fascinating blend of traditional culture and futuristic technology in Japan's vibrant capital.",
			price: 2199,
			duration: 8,
			rating: 4.9,
			reviews: 156,
			imageUrl: 'https://picsum.photos/400/600?random=6',
			features: ['Robot Restaurant', 'Mt. Fuji Day Trip', 'Sushi Workshop', 'Anime District Tour'],
			popular: true,
			category: 'city',
		},
		{
			id: 4,
			name: 'Machu Picchu Adventure',
			location: 'Cusco, Peru',
			description:
				'Trek through the Andes to discover the ancient Incan citadel of Machu Picchu on this unforgettable adventure.',
			price: 1799,
			duration: 10,
			rating: 4.9,
			reviews: 203,
			imageUrl: 'https://picsum.photos/400/600?random=7',
			features: ['Inca Trail Trek', 'Sacred Valley Tour', 'Local Homestay', 'Archaeological Sites'],
			popular: false,
			category: 'adventure',
		},
		{
			id: 5,
			name: 'African Safari Experience',
			location: 'Serengeti, Tanzania',
			description:
				'Witness the incredible wildlife of Africa on this safari adventure through the Serengeti National Park.',
			price: 3299,
			duration: 9,
			rating: 4.8,
			reviews: 87,
			imageUrl: 'https://picsum.photos/400/600?random=8',
			features: ['Big Five Game Drives', 'Hot Air Balloon Ride', 'Maasai Village Visit', 'Luxury Tented Camp'],
			popular: true,
			category: 'adventure',
		},
		{
			id: 6,
			name: 'Greek Island Hopping',
			location: 'Santorini & Mykonos, Greece',
			description:
				'Explore the stunning Cycladic islands with their white-washed buildings, blue domes, and crystal-clear waters.',
			price: 1699,
			duration: 8,
			rating: 4.6,
			reviews: 112,
			imageUrl: 'https://picsum.photos/400/600?random=9',
			features: ['Sunset in Oia', 'Beach Club Day', 'Wine Tasting', 'Island Boat Tour'],
			popular: false,
			category: 'beach',
		},
		{
			id: 7,
			name: 'Northern Lights Expedition',
			location: 'Tromsø, Norway',
			description: 'Chase the magical Aurora Borealis in the Arctic Circle while enjoying unique winter activities.',
			price: 2499,
			duration: 6,
			rating: 4.7,
			reviews: 76,
			imageUrl: 'https://picsum.photos/400/600?random=10',
			features: ['Aurora Hunting', 'Husky Sledding', 'Reindeer Farm Visit', 'Fjord Cruise'],
			popular: false,
			category: 'adventure',
		},
		{
			id: 8,
			name: 'Amalfi Coast Retreat',
			location: 'Positano & Ravello, Italy',
			description:
				"Indulge in la dolce vita along Italy's most picturesque coastline with stunning views and delicious cuisine.",
			price: 2099,
			duration: 7,
			rating: 4.8,
			reviews: 134,
			imageUrl: 'https://picsum.photos/400/600?random=11',
			features: ['Coastal Drive', 'Cooking Class', 'Capri Day Trip', 'Limoncello Tasting'],
			popular: true,
			category: 'beach',
		},
		{
			id: 9,
			name: 'Maldives Overwater Villa',
			location: 'Malé, Maldives',
			description: 'Experience ultimate luxury in an overwater villa surrounded by turquoise lagoons and coral reefs.',
			price: 4299,
			duration: 6,
			rating: 4.9,
			reviews: 92,
			imageUrl: 'https://picsum.photos/400/600?random=12',
			features: ['Overwater Accommodation', 'Private Plunge Pool', 'Snorkeling', 'Sunset Dolphin Cruise'],
			popular: true,
			category: 'luxury',
		},
		// {
		// 	id: 10,
		// 	name: 'New Zealand Road Trip',
		// 	location: 'Auckland to Queenstown, New Zealand',
		// 	description:
		// 		"Embark on an epic road trip through New Zealand's breathtaking landscapes from the North to South Island.",
		// 	price: 2799,
		// 	duration: 14,
		// 	rating: 4.8,
		// 	reviews: 108,
		// 	imageUrl: 'https://picsum.photos/400/600?random=13',
		// 	features: ['Milford Sound Cruise', 'Hobbiton Movie Set', 'Bungee Jumping', 'Glacier Hike'],
		// 	popular: false,
		// 	category: 'adventure',
		// },
	];

	// Filter and sort destinations
	useEffect(() => {
		setIsLoading(true);

		let filtered = [...destinations];

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(dest) =>
					dest.name.toLowerCase().includes(query) ||
					dest.location.toLowerCase().includes(query) ||
					dest.description.toLowerCase().includes(query)
			);
		}

		// Apply price filter
		filtered = filtered.filter((dest) => dest.price >= priceRange[0] && dest.price <= priceRange[1]);

		// Apply duration filter
		if (duration !== 'any') {
			const [min, max] = duration.split('-').map(Number);
			if (max) {
				filtered = filtered.filter((dest) => dest.duration >= min && dest.duration <= max);
			} else {
				filtered = filtered.filter((dest) => dest.duration >= min);
			}
		}

		// Apply sorting
		switch (sortBy) {
			case 'price-low':
				filtered.sort((a, b) => a.price - b.price);
				break;
			case 'price-high':
				filtered.sort((a, b) => b.price - a.price);
				break;
			case 'duration':
				filtered.sort((a, b) => a.duration - b.duration);
				break;
			case 'rating':
				filtered.sort((a, b) => b.rating - a.rating);
				break;
			case 'popular':
			default:
				filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
				break;
		}

		setFilteredDestinations(filtered);

		// Simulate loading
		setTimeout(() => {
			setIsLoading(false);
		}, 500);
	}, [searchQuery, priceRange, duration, sortBy]);

	const durationOptions = [
		{ value: 'any', label: 'Any Duration' },
		{ value: '1-3', label: 'Short Trip (1-3 days)' },
		{ value: '4-7', label: 'Week Trip (4-7 days)' },
		{ value: '8-14', label: 'Extended Trip (8-14 days)' },
		{ value: '15', label: 'Long Trip (15+ days)' },
	];

	const sortOptions = [
		{ value: 'popular', label: 'Most Popular' },
		{ value: 'price-low', label: 'Price: Low to High' },
		{ value: 'price-high', label: 'Price: High to Low' },
		{ value: 'duration', label: 'Duration: Short to Long' },
		{ value: 'rating', label: 'Highest Rated' },
	];

	return (
		<div className='min-h-screen bg-background text-foreground'>
			<HeroSection
				title='Explore Our Destinations'
				subtitle='Discover our carefully curated selection of travel experiences around the world'
				imageUrl='https://i.ibb.co.com/v40H6BZx/tom-winckels-I7o-LRd-M9-YIw-unsplash.jpg'
				height='h-[500px]'
			/>

			{/* Filters Section */}
			<section className='py-8 bg-content1'>
				<div className='container mx-auto px-4'>
					<div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
						<div className='relative w-full lg:w-auto flex-grow max-w-md'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
							<Input
								type='text'
								placeholder='Search destinations...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10'
							/>
						</div>

						<div className='flex flex-wrap gap-2 items-center justify-end w-full lg:w-auto'>
							<Sheet>
								<SheetTrigger asChild>
									<Button variant='outline' className='flex items-center gap-2'>
										<Filter className='h-4 w-4' />
										Filters
									</Button>
								</SheetTrigger>
								<SheetContent>
									<SheetHeader>
										<SheetTitle>Filter Destinations</SheetTitle>
										<SheetDescription>Narrow down your search with these filters</SheetDescription>
									</SheetHeader>
									<div className='py-6 px-6 space-y-6'>
										<div className='space-y-2'>
											<h3 className='text-sm font-medium'>Price Range</h3>
											<div className='pt-4'>
												<Slider
													defaultValue={[0, 5000]}
													max={5000}
													step={100}
													value={priceRange}
													onValueChange={setPriceRange}
												/>
												<div className='flex justify-between mt-2 text-sm'>
													<span>${priceRange[0]}</span>
													<span>${priceRange[1]}</span>
												</div>
											</div>
										</div>

										<div className='space-y-2'>
											<h3 className='text-sm font-medium'>Duration</h3>
											<div className='space-y-1'>
												{durationOptions.map((option) => (
													<Button
														key={option.value}
														variant={duration === option.value ? 'default' : 'outline'}
														className='mr-2 mb-2'
														onClick={() => setDuration(option.value)}>
														{option.label}
													</Button>
												))}
											</div>
										</div>

										<Button
											className='w-full'
											onClick={() => {
												setPriceRange([0, 5000]);
												setDuration('any');
											}}>
											Reset Filters
										</Button>
									</div>
								</SheetContent>
							</Sheet>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant='outline' className='flex items-center gap-2'>
										Sort by: {sortOptions.find((o) => o.value === sortBy)?.label}
										<ChevronDown className='h-4 w-4' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									{sortOptions.map((option) => (
										<DropdownMenuItem
											key={option.value}
											onClick={() => setSortBy(option.value)}
											className={sortBy === option.value ? 'bg-primary/10' : ''}>
											{option.label}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					<div className='mt-4'>
						<p className='text-sm text-muted-foreground'>
							Showing {filteredDestinations.length} of {destinations.length} destinations
						</p>
					</div>
				</div>
			</section>

			{/* Destinations Grid */}
			<section className='py-12'>
				<div className='container mx-auto px-4'>
					{isLoading ? (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{[...Array(6)].map((_, index) => (
								<div key={index} className='bg-content1 rounded-lg h-[450px] animate-pulse'></div>
							))}
						</div>
					) : filteredDestinations.length === 0 ? (
						<div className='text-center py-12'>
							<FadeIn>
								<h3 className='text-xl font-bold mb-2'>No destinations found</h3>
								<p className='text-muted-foreground mb-6'>Try adjusting your filters or search query</p>
								<Button
									onClick={() => {
										setSearchQuery('');
										setPriceRange([0, 5000]);
										setDuration('any');
										setSortBy('popular');
									}}>
									Reset All Filters
								</Button>
							</FadeIn>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{filteredDestinations.map((destination, index) => (
								<AnimatedCard key={destination.id} delay={index * 0.05}>
									<div className='bg-background rounded-lg overflow-hidden shadow-md h-full flex flex-col'>
										<div className='relative h-48 overflow-hidden'>
											<img
												src={destination.imageUrl || '/placeholder.svg'}
												alt={destination.name}
												className='w-full h-full object-cover transition-transform duration-500 hover:scale-110'
											/>
											<div className='absolute top-2 right-2'>
												<Badge variant='secondary' className='flex items-center gap-1'>
													<Star className='h-3 w-3 fill-current' />
													{destination.rating}
												</Badge>
											</div>
											{destination.popular && (
												<div className='absolute top-2 left-2'>
													<Badge variant='primary' className='bg-primary text-primary-foreground'>
														Popular
													</Badge>
												</div>
											)}
										</div>

										<div className='p-5 flex-grow flex flex-col'>
											<div className='mb-4'>
												<h3 className='text-xl font-bold mb-1'>{destination.name}</h3>
												<div className='flex items-center text-muted-foreground mb-2'>
													<MapPin size={14} className='mr-1' />
													<span className='text-sm'>{destination.location}</span>
												</div>
												<div className='flex items-center text-muted-foreground'>
													<Calendar size={14} className='mr-1' />
													<span className='text-sm'>{destination.duration} days</span>
													<span className='mx-2'>•</span>
													<span className='text-sm'>{destination.reviews} reviews</span>
												</div>
											</div>

											<p className='text-muted-foreground mb-4 line-clamp-3'>{destination.description}</p>

											<div className='mb-4 flex-grow'>
												<div className='flex flex-wrap gap-2'>
													{destination.features.slice(0, 3).map((feature, i) => (
														<Badge key={i} variant='outline' className='bg-content1'>
															{feature}
														</Badge>
													))}
													{destination.features.length > 3 && (
														<Badge variant='outline' className='bg-content1'>
															+{destination.features.length - 3} more
														</Badge>
													)}
												</div>
											</div>

											<div className='flex items-center justify-between mt-auto'>
												<div className='font-bold text-lg'>
													${destination.price}
													<span className='text-sm font-normal text-muted-foreground'> / person</span>
												</div>
												<AnimatedButton variant='outline' className='border-primary text-primary hover:bg-primary/10'>
													View Details
												</AnimatedButton>
											</div>
										</div>
									</div>
								</AnimatedCard>
							))}
						</div>
					)}
				</div>
			</section>

			<NewsletterSection />
		</div>
	);
};

export default Destinations;
