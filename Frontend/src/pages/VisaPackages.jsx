'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Filter, Search, ChevronRight } from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedCard from '@/components/Animation/AnimatedCard';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useVisaQuery from '@/hooks/useVisaQuery';
import PaginationControls from '@/components/Destination/PaginationControls';
import { useDebounce } from '@/hooks/useDebounce';
import HeroSection from '@/components/Sections/HeroSection';
import NewsletterSection from '@/components/Sections/NewsletterSection';

const VisaPackages = () => {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(9);
	const [search, setSearch] = useState('');
	const [filters, setFilters] = useState({
		priceRange: [0, 5000],
		from: '',
		to: '',
	});
	const [activeSort, setActiveSort] = useState('newest');

	const debouncedSearch = useDebounce(search, 500);
	const debouncedFrom = useDebounce(filters.from, 500);
	const debouncedTo = useDebounce(filters.to, 500);

	// Sort options
	const sortOptions = [
		{ value: 'newest', label: 'Newest First' },
		{ value: 'price-asc', label: 'Price: Low to High' },
		{ value: 'price-desc', label: 'Price: High to Low' },
		{ value: 'title-asc', label: 'Title: A-Z' },
		{ value: 'title-desc', label: 'Title: Z-A' },
	];

	// Convert sort option to API parameter
	const getSortParam = () => {
		switch (activeSort) {
			case 'price-asc':
				return 'pricing.basePrice-asc';
			case 'price-desc':
				return 'pricing.basePrice-desc';
			case 'title-asc':
				return 'title-asc';
			case 'title-desc':
				return 'title-desc';
			case 'newest':
			default:
				return 'createdAt-desc';
		}
	};

	const { useGetVisas } = useVisaQuery();
	const { data, isLoading, isError } = useGetVisas({
		page,
		limit,
		search: debouncedSearch,
		from: debouncedFrom,
		to: debouncedTo,
		minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
		maxPrice: filters.priceRange[1] < 5000 ? filters.priceRange[1] : undefined,
		sortBy: getSortParam(),
	});

	const visas = data?.visas || [];
	const totalPages = data?.pagination?.totalPages || 0;

	const handleSearch = (e) => {
		setSearch(e.target.value);
		setPage(1);
	};

	const handlePageChange = (newPage) => {
		setPage(newPage);
		// Scroll to top of the page
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const resetFilters = () => {
		setFilters({
			priceRange: [0, 5000],
			from: '',
			to: '',
		});
		setSearch('');
		setActiveSort('newest');
		setPage(1);
	};

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

	// Format price
	const formatPrice = (price, currency = 'USD') => {
		return `${getCurrencySymbol(currency)}${price.toLocaleString()}`;
	};

	return (
		<div className='min-h-screen bg-background text-foreground'>
			<HeroSection
				title='Visa Services'
				subtitle='Simplify your travel with our comprehensive visa services for destinations worldwide'
				imageUrl='/assets/images/hero.jpg'
				showButton={false}
			/>

			{/* Filters Section */}
			<section className='py-8 bg-content1'>
				<div className='container mx-auto px-4'>
					<div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
						{/* Search */}
						<div className='relative w-full md:w-80'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input placeholder='Search visa packages...' value={search} onChange={handleSearch} className='pl-10' />
						</div>
						<div className='flex flex-wrap gap-2 items-center'>
							{/* Filters Sheet */}
							<Sheet>
								<SheetTrigger asChild>
									<Button variant='outline' className='gap-2'>
										<Filter className='h-4 w-4' />
										Filters
									</Button>
								</SheetTrigger>
								<SheetContent className='w-full sm:max-w-lg overflow-y-auto px-4'>
									<SheetHeader className='mb-4'>
										<SheetTitle>Filter Visa Packages</SheetTitle>
										<SheetDescription>Adjust the filters to find the perfect visa package.</SheetDescription>
									</SheetHeader>

									<div className='space-y-6'>
										{/* Price Range Filter */}
										<div>
											<Label className='text-base'>Price Range</Label>
											<div className='mt-4 px-1'>
												<Slider
													defaultValue={filters.priceRange}
													value={filters.priceRange}
													onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
													min={0}
													max={5000}
													step={50}
													minStepsBetweenThumbs={1}
													className='mb-2'
												/>
												<div className='flex justify-between text-sm text-muted-foreground'>
													<span>{formatPrice(filters.priceRange[0])}</span>
													<span>{formatPrice(filters.priceRange[1])}</span>
												</div>
											</div>
										</div>

										{/* From Country Filter */}
										<div>
											<Label htmlFor='from-country' className='text-base'>
												From Country
											</Label>
											<Input
												id='from-country'
												placeholder='e.g. USA'
												value={filters.from}
												onChange={(e) => setFilters({ ...filters, from: e.target.value })}
												className='mt-2'
											/>
										</div>

										{/* To Country Filter */}
										<div>
											<Label htmlFor='to-country' className='text-base'>
												To Country
											</Label>
											<Input
												id='to-country'
												placeholder='e.g. Japan'
												value={filters.to}
												onChange={(e) => setFilters({ ...filters, to: e.target.value })}
												className='mt-2'
											/>
										</div>
									</div>

									<SheetFooter className='mt-6 flex-row justify-between gap-2'>
										<Button variant='outline' onClick={resetFilters} className='flex-1'>
											Reset
										</Button>
										<SheetClose asChild>
											<Button className='flex-1'>Apply Filters</Button>
										</SheetClose>
									</SheetFooter>
								</SheetContent>
							</Sheet>
							{/* Sort Dropdown */}
							<Select value={activeSort} onValueChange={(value) => setActiveSort(value)}>
								<SelectTrigger className='w-[180px]'>
									<SelectValue placeholder='Sort by' />
								</SelectTrigger>
								<SelectContent>
									{sortOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className='mt-4'>
						<p className='text-sm text-muted-foreground'>
							{isLoading
								? 'Loading visa packages...'
								: `Showing ${visas.length} of ${data?.pagination?.total || 0} visa packages`}
						</p>
					</div>
				</div>
			</section>

			{/* Visa Packages Grid */}
			<section className='py-12'>
				<div className='container mx-auto px-4'>
					{isLoading ? (
						// Loading skeletons
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{[...Array(9)].map((_, index) => (
								<div key={index} className='bg-content1 rounded-lg h-[450px] animate-pulse'>
									<Skeleton className='h-48 w-full rounded-t-lg' />
									<div className='p-5 space-y-4'>
										<Skeleton className='h-6 w-3/4' />
										<Skeleton className='h-4 w-1/2' />
										<Skeleton className='h-4 w-full' />
										<Skeleton className='h-4 w-full' />
										<div className='flex justify-between items-center pt-4'>
											<Skeleton className='h-6 w-1/3' />
											<Skeleton className='h-9 w-1/4' />
										</div>
									</div>
								</div>
							))}
						</div>
					) : isError ? (
						// Error state
						<div className='text-center py-12'>
							<FadeIn>
								<h3 className='text-xl font-bold mb-2'>Error loading visa packages</h3>
								<p className='text-muted-foreground mb-6'>Please try again later</p>
								<Button onClick={() => window.location.reload()}>Refresh Page</Button>
							</FadeIn>
						</div>
					) : visas.length === 0 ? (
						// No results
						<div className='text-center py-12'>
							<FadeIn>
								<h3 className='text-xl font-bold mb-2'>No visa packages found</h3>
								<p className='text-muted-foreground mb-6'>Try adjusting your filters or search query</p>
								<Button onClick={resetFilters}>Reset All Filters</Button>
							</FadeIn>
						</div>
					) : (
						// Visa packages grid
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{visas.map((visa, index) => (
								<AnimatedCard key={visa._id} delay={index * 0.05}>
									<Card className='bg-background rounded-lg overflow-hidden shadow-md h-full flex flex-col py-0'>
										<div className='relative h-48 overflow-hidden'>
											<img
												src={
													visa.coverImage?.url ||
													(visa.images && visa.images.length > 0
														? visa.images[0].url
														: '/placeholder.svg?height=300&width=400')
												}
												alt={visa.title}
												className='w-full h-full object-cover transition-transform duration-500 hover:scale-110'
											/>
											{visa.featured && (
												<div className='absolute top-2 left-2'>
													<Badge variant='primary' className='bg-primary text-primary-foreground'>
														Featured
													</Badge>
												</div>
											)}
										</div>

										<CardContent className='p-5 flex-grow flex flex-col'>
											<div className='mb-4'>
												<h3 className='text-xl font-bold mb-1'>{visa.title}</h3>
												<div className='flex items-center text-muted-foreground mb-2'>
													<MapPin size={14} className='mr-1' />
													<span className='text-sm'>
														<span className='font-medium'>{visa.from}</span> to{' '}
														<span className='font-medium'>{visa.to}</span>
													</span>
												</div>
												{visa.processingTime && (
													<div className='flex items-center text-muted-foreground'>
														<Clock size={14} className='mr-1' />
														<span className='text-sm'>Processing: {visa.processingTime}</span>
													</div>
												)}
											</div>

											<p className='text-muted-foreground mb-4 line-clamp-3'>{visa.shortDescription}</p>

											<div className='mt-auto'>
												<div className='flex items-center justify-between'>
													<div>
														<span className='text-sm text-muted-foreground'>Price</span>
														<div className='font-bold text-lg'>
															{getCurrencySymbol(visa.pricing.currency)}
															{visa.pricing.basePrice}
														</div>
													</div>
													<div className='flex gap-2'>
														<AnimatedButton
															variant='outline'
															className='border-primary text-primary hover:bg-primary/10'
															asChild>
															<Link to={`/visas/details/${visa.slug}`} className='flex items-center'>
																Details <ChevronRight size={16} />
															</Link>
														</AnimatedButton>
													</div>
												</div>
												<Button asChild className='w-full mt-4' variant='default'>
													<Link to={`/visas/book/${visa.slug}`}>Book Now</Link>
												</Button>
											</div>
										</CardContent>
									</Card>
								</AnimatedCard>
							))}
						</div>
					)}

					{/* Pagination */}
					{!isLoading && totalPages > 1 && (
						<PaginationControls
							currentPage={page}
							totalPages={totalPages}
							onPageChange={handlePageChange}
							limit={limit}
							onLimitChange={setLimit}
						/>
					)}
				</div>
			</section>

			<NewsletterSection />
		</div>
	);
};

export default VisaPackages;
