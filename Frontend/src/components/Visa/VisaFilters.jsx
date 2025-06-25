import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';

const VisaFilters = ({ filters, setFilters, sortOptions, activeSort, setActiveSort, onSearch, isAdmin = false }) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [tempFilters, setTempFilters] = useState(filters);
	const debouncedSearch = useDebounce(searchQuery, 500);

	// Update search when debounced value changes
	useEffect(() => {
		onSearch(debouncedSearch);
	}, [debouncedSearch, onSearch]);

	// Handle search input change
	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	// Handle price range change
	const handlePriceChange = (value) => {
		setTempFilters({ ...tempFilters, priceRange: value });
	};

	// Handle from country change
	const handleFromChange = (e) => {
		setTempFilters({ ...tempFilters, from: e.target.value });
	};

	// Handle to country change
	const handleToChange = (e) => {
		setTempFilters({ ...tempFilters, to: e.target.value });
	};

	// Handle status change
	const handleStatusChange = (value) => {
		setTempFilters({ ...tempFilters, status: value });
	};

	// Handle sort change
	const handleSortChange = (value) => {
		setActiveSort(value);
	};

	// Apply filters
	const applyFilters = () => {
		setFilters(tempFilters);
	};

	// Reset filters
	const resetFilters = () => {
		const defaultFilters = {
			priceRange: [0, 5000],
			from: '',
			to: '',
			status: 'all',
		};
		setTempFilters(defaultFilters);
		setFilters(defaultFilters);
	};

	// Format price for display
	const formatPrice = (price) => {
		return `$${price.toLocaleString()}`;
	};

	return (
		<Card className='mb-6'>
			<CardContent className='p-4'>
				<div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
					{/* Search */}
					<div className='relative w-full md:w-80'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search visa packages...'
							value={searchQuery}
							onChange={handleSearchChange}
							className='pl-10'
						/>
					</div>

					<div className='flex flex-wrap gap-2 items-center'>
						{/* Sort Dropdown */}
						<Select value={activeSort} onValueChange={handleSortChange}>
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

						{/* Filters Sheet */}
						<Sheet>
							<SheetTrigger asChild>
								<Button variant='outline' className='gap-2'>
									<SlidersHorizontal className='h-4 w-4' />
									Filters
								</Button>
							</SheetTrigger>
							<SheetContent className='w-full sm:max-w-md overflow-y-auto'>
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
												defaultValue={tempFilters.priceRange}
												value={tempFilters.priceRange}
												onValueChange={handlePriceChange}
												min={0}
												max={5000}
												step={50}
												minStepsBetweenThumbs={1}
												className='mb-2'
											/>
											<div className='flex justify-between text-sm text-muted-foreground'>
												<span>{formatPrice(tempFilters.priceRange[0])}</span>
												<span>{formatPrice(tempFilters.priceRange[1])}</span>
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
											value={tempFilters.from}
											onChange={handleFromChange}
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
											value={tempFilters.to}
											onChange={handleToChange}
											className='mt-2'
										/>
									</div>

									{/* Status Filter (Admin only) */}
									{isAdmin && (
										<div>
											<Label htmlFor='status' className='text-base'>
												Status
											</Label>
											<Select value={tempFilters.status} onValueChange={handleStatusChange} className='mt-2'>
												<SelectTrigger id='status'>
													<SelectValue placeholder='Select status' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='all'>All</SelectItem>
													<SelectItem value='active'>Active</SelectItem>
													<SelectItem value='inactive'>Inactive</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}
								</div>

								<SheetFooter className='mt-6 flex-row justify-between gap-2'>
									<Button variant='outline' onClick={resetFilters} className='flex-1'>
										Reset
									</Button>
									<SheetClose asChild>
										<Button onClick={applyFilters} className='flex-1'>
											Apply Filters
										</Button>
									</SheetClose>
								</SheetFooter>
							</SheetContent>
						</Sheet>
					</div>
				</div>

				{/* Active Filters Display */}
				<div className='flex flex-wrap gap-2 mt-4'>
					{tempFilters.priceRange[0] > 0 && (
						<Badge variant='outline' className='flex items-center gap-1'>
							Min Price: {formatPrice(filters.priceRange[0])}
							<X
								className='h-3 w-3 cursor-pointer'
								onClick={() => setFilters({ ...filters, priceRange: [0, filters.priceRange[1]] })}
							/>
						</Badge>
					)}
					{tempFilters.priceRange[1] < 5000 && (
						<Badge variant='outline' className='flex items-center gap-1'>
							Max Price: {formatPrice(filters.priceRange[1])}
							<X
								className='h-3 w-3 cursor-pointer'
								onClick={() => setFilters({ ...filters, priceRange: [filters.priceRange[0], 5000] })}
							/>
						</Badge>
					)}
					{filters.from && (
						<Badge variant='outline' className='flex items-center gap-1'>
							From: {filters.from}
							<X className='h-3 w-3 cursor-pointer' onClick={() => setFilters({ ...filters, from: '' })} />
						</Badge>
					)}
					{filters.to && (
						<Badge variant='outline' className='flex items-center gap-1'>
							To: {filters.to}
							<X className='h-3 w-3 cursor-pointer' onClick={() => setFilters({ ...filters, to: '' })} />
						</Badge>
					)}
					{isAdmin && filters.status !== 'all' && (
						<Badge variant='outline' className='flex items-center gap-1'>
							Status: {filters.status}
							<X className='h-3 w-3 cursor-pointer' onClick={() => setFilters({ ...filters, status: 'all' })} />
						</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default VisaFilters;
