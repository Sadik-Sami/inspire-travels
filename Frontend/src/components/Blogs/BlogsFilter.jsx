import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const BlogsFilter = ({ filters, setFilters, sortOptions, activeSort, setActiveSort, onSearch, isAdmin = false }) => {
	// Local state for search input
	const [searchInput, setSearchInput] = useState(filters.search || '');
	// Debounce search to avoid too many API calls
	const debouncedSearch = useDebounce(searchInput, 500);

	// Local state for filters in the sheet
	const [localFilters, setLocalFilters] = useState(filters);

	// Static blog categories
	const categories = [
		{ id: 'travel-tips', label: 'Travel Tips' },
		{ id: 'destination-guides', label: 'Destination Guides' },
		{ id: 'adventure', label: 'Adventure' },
		{ id: 'food-and-dining', label: 'Food & Dining' },
		{ id: 'culture', label: 'Culture' },
		{ id: 'budget-travel', label: 'Budget Travel' },
		{ id: 'luxury-travel', label: 'Luxury Travel' },
		{ id: 'family-travel', label: 'Family Travel' },
		{ id: 'solo-travel', label: 'Solo Travel' },
		{ id: 'photography', label: 'Photography' },
		{ id: 'sustainable-travel', label: 'Sustainable Travel' },
		{ id: 'travel-stories', label: 'Travel Stories' },
	];

	// Update search when debounced value changes
	useEffect(() => {
		onSearch(debouncedSearch);
	}, [debouncedSearch, onSearch]);

	// Handle search input change
	const handleSearchChange = (e) => {
		setSearchInput(e.target.value);
	};

	// Handle clear search
	const handleClearSearch = () => {
		setSearchInput('');
		onSearch('');
	};

	// Handle filter changes in the sheet
	const handleFilterChange = (key, value) => {
		setLocalFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	// Apply filters from the sheet
	const applyFilters = () => {
		setFilters(localFilters);
	};

	// Reset filters
	const resetFilters = () => {
		const defaultFilters = {
			readTimeRange: [0, 60],
			categories: [],
			...(isAdmin && { status: 'all' }),
		};
		setLocalFilters(defaultFilters);
		setFilters(defaultFilters);
	};

	// Count active filters
	const countActiveFilters = () => {
		let count = 0;
		if (filters.readTimeRange && (filters.readTimeRange[0] > 0 || filters.readTimeRange[1] < 60)) count++;
		if (filters.categories && filters.categories.length > 0) count++;
		if (isAdmin && filters.status && filters.status !== 'all') count++;
		return count;
	};

	// Status options (for admin)
	const statusOptions = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'published', label: 'Published' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'archived', label: 'Archived' },
	];

	return (
		<div className='mb-6 space-y-4'>
			<div className='flex flex-col sm:flex-row gap-4 sm:justify-between'>
				{/* Search Input */}
				<div className='relative flex-grow max-w-md'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
					<Input
						type='text'
						placeholder='Search blogs...'
						value={searchInput}
						onChange={handleSearchChange}
						className='pl-10 pr-10'
					/>
					{searchInput && (
						<button
							onClick={handleClearSearch}
							className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'>
							<X className='h-4 w-4' />
						</button>
					)}
				</div>

				<div className='flex flex-wrap gap-2'>
					{/* Filter Button */}
					<Sheet>
						<SheetTrigger asChild>
							<Button variant='outline' className='flex items-center gap-2'>
								<Filter className='h-4 w-4' />
								<span>Filters</span>
								{countActiveFilters() > 0 && (
									<Badge variant='secondary' className='ml-1 h-5 w-5 p-0 flex items-center justify-center'>
										{countActiveFilters()}
									</Badge>
								)}
							</Button>
						</SheetTrigger>
						<SheetContent className='sm:max-w-md overflow-y-auto'>
							<SheetHeader>
								<SheetTitle>Filter Blogs</SheetTitle>
								<SheetDescription>Narrow down your search with these filters</SheetDescription>
							</SheetHeader>

							<div className='p-6 space-y-6'>
								<Accordion type='single' collapsible className='w-full' defaultValue='categories'>
									{/* Read Time Range Filter */}
									<AccordionItem value='readTime'>
										<AccordionTrigger>Read Time</AccordionTrigger>
										<AccordionContent>
											<div className='space-y-4 pt-2'>
												<Slider
													defaultValue={localFilters.readTimeRange || [0, 60]}
													max={60}
													step={5}
													value={localFilters.readTimeRange || [0, 60]}
													onValueChange={(value) => handleFilterChange('readTimeRange', value)}
												/>
												<div className='flex justify-between mt-2 text-sm'>
													<span>{localFilters.readTimeRange?.[0] || 0} min</span>
													<span>{localFilters.readTimeRange?.[1] || 60} min</span>
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>

									{/* Categories Filter */}
									<AccordionItem value='categories'>
										<AccordionTrigger>Categories</AccordionTrigger>
										<AccordionContent>
											<div className='space-y-2 pt-2'>
												{categories.map((category) => (
													<div key={category.id} className='flex items-center space-x-2'>
														<Checkbox
															id={`category-${category.id}`}
															checked={(localFilters.categories || []).includes(category.id)}
															onCheckedChange={(checked) => {
																const currentCategories = localFilters.categories || [];
																const newCategories = checked
																	? [...currentCategories, category.id]
																	: currentCategories.filter((id) => id !== category.id);
																handleFilterChange('categories', newCategories);
															}}
														/>
														<Label htmlFor={`category-${category.id}`}>{category.label}</Label>
													</div>
												))}
											</div>
										</AccordionContent>
									</AccordionItem>

									{/* Status Filter (Admin Only) */}
									{isAdmin && (
										<AccordionItem value='status'>
											<AccordionTrigger>Status</AccordionTrigger>
											<AccordionContent>
												<RadioGroup
													value={localFilters.status || 'all'}
													onValueChange={(value) => handleFilterChange('status', value)}
													className='space-y-2 pt-2'>
													{statusOptions.map((option) => (
														<div key={option.value} className='flex items-center space-x-2'>
															<RadioGroupItem value={option.value} id={`status-${option.value}`} />
															<Label htmlFor={`status-${option.value}`}>{option.label}</Label>
														</div>
													))}
												</RadioGroup>
											</AccordionContent>
										</AccordionItem>
									)}
								</Accordion>
							</div>

							<SheetFooter className='flex flex-row gap-2 sm:space-x-0'>
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

					{/* Sort Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='outline' className='flex items-center gap-2'>
								<span>Sort: {sortOptions.find((o) => o.value === activeSort)?.label || 'Default'}</span>
								<ChevronDown className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							{sortOptions.map((option) => (
								<DropdownMenuItem
									key={option.value}
									onClick={() => setActiveSort(option.value)}
									className={activeSort === option.value ? 'bg-primary/10' : ''}>
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Active Filters Display */}
			{countActiveFilters() > 0 && (
				<div className='flex flex-wrap gap-2 items-center'>
					<span className='text-sm text-muted-foreground'>Active filters:</span>
					{filters.readTimeRange && (filters.readTimeRange[0] > 0 || filters.readTimeRange[1] < 60) && (
						<Badge variant='outline' className='flex items-center gap-1'>
							<span>
								Read Time: {filters.readTimeRange[0]} - {filters.readTimeRange[1]} min
							</span>
							<X
								className='h-3 w-3 ml-1 cursor-pointer'
								onClick={() => setFilters({ ...filters, readTimeRange: [0, 60] })}
							/>
						</Badge>
					)}
					{filters.categories && filters.categories.length > 0 && (
						<Badge variant='outline' className='flex items-center gap-1'>
							<span>Categories: {filters.categories.length}</span>
							<X className='h-3 w-3 ml-1 cursor-pointer' onClick={() => setFilters({ ...filters, categories: [] })} />
						</Badge>
					)}
					{isAdmin && filters.status && filters.status !== 'all' && (
						<Badge variant='outline' className='flex items-center gap-1'>
							<span>Status: {filters.status}</span>
							<X className='h-3 w-3 ml-1 cursor-pointer' onClick={() => setFilters({ ...filters, status: 'all' })} />
						</Badge>
					)}
					<Button variant='ghost' size='sm' className='text-sm h-7 px-2' onClick={resetFilters}>
						Clear all
					</Button>
				</div>
			)}
		</div>
	);
};

export default BlogsFilter;
