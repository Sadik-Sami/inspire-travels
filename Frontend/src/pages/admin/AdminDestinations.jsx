import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Edit, Trash, Eye, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import DestinationFilters from '@/components/Destination/DestinationFilters';
import PaginationControls from '@/components/Destination/PaginationControls';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDestinationQuery } from '@/hooks/useDestinationQuery';

const AdminDestinations = () => {
	const navigate = useNavigate();
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	// State for pagination, filtering, and sorting
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		priceRange: [0, 5000],
		duration: 'any',
		categories: [],
		status: 'all',
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [activeSort, setActiveSort] = useState('newest');
	const [destinationToDelete, setDestinationToDelete] = useState(null);

	// Sort options
	const sortOptions = [
		{ value: 'newest', label: 'Newest First' },
		{ value: 'price-asc', label: 'Price: Low to High' },
		{ value: 'price-desc', label: 'Price: High to Low' },
		{ value: 'title-asc', label: 'Title: A-Z' },
		{ value: 'title-desc', label: 'Title: Z-A' },
	];

	// Convert filters to API parameters
	const getApiFilters = () => {
		const apiFilters = {};

		// Price range
		if (filters.priceRange) {
			if (filters.priceRange[0] > 0) apiFilters.minPrice = filters.priceRange[0];
			if (filters.priceRange[1] < 5000) apiFilters.maxPrice = filters.priceRange[1];
		}

		// Duration
		if (filters.duration && filters.duration !== 'any') {
			const [min, max] = filters.duration.split('-').map(Number);
			if (max) {
				apiFilters.minDuration = min;
				apiFilters.maxDuration = max;
			} else {
				apiFilters.minDuration = min;
			}
		}

		// Categories
		if (filters.categories && filters.categories.length > 0) {
			apiFilters.categories = filters.categories;
		}

		// Status
		if (filters.status && filters.status !== 'all') {
			apiFilters.status = filters.status;
		}

		return apiFilters;
	};

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

	// Fetch destinations with TanStack Query
	const { data, isLoading, isError } = useDestinationQuery({
		page,
		limit: 10,
		search: searchQuery,
		sortBy: getSortParam(),
		filters: getApiFilters(),
		enabled: true,
	});

	// Delete destination mutation
	const deleteMutation = useMutation({
		mutationFn: async (id) => {
			const response = await axiosSecure.delete(`/api/destinations/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['destinations'] });
			toast.success('Destination deleted successfully');
			setDestinationToDelete(null);
		},
		onError: (error) => {
			toast.error(`Failed to delete destination: ${error.message || 'Unknown error'}`);
		},
	});

	// Handle search
	const handleSearch = (query) => {
		setSearchQuery(query);
		setPage(1); // Reset to first page on new search
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPage(newPage);
	};

	// Handle add new destination
	const handleAddDestination = () => {
		navigate('/admin/destinations/new');
	};

	// Handle edit destination
	const handleEditDestination = (id) => {
		navigate(`/admin/destinations/edit/${id}`);
	};

	// Handle view destination
	const handleViewDestination = (id) => {
		navigate(`/destinations/${id}`);
	};

	// Handle delete destination
	const handleDeleteDestination = () => {
		if (!destinationToDelete) return;
		deleteMutation.mutate(destinationToDelete);
	};

	// Format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(date);
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

	// Extract destinations array safely
	const destinations = data?.destinations || [];
	const pagination = data?.pagination || { totalPages: 1, total: 0 };

	return (
		<div>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
				<h1 className='text-3xl font-bold'>Destinations</h1>

				<Button className='flex items-center gap-2' onClick={handleAddDestination}>
					<Plus className='h-4 w-4' />
					Add Destination
				</Button>
			</div>

			{/* Filters Section */}
			<DestinationFilters
				filters={filters}
				setFilters={setFilters}
				sortOptions={sortOptions}
				activeSort={activeSort}
				setActiveSort={setActiveSort}
				onSearch={handleSearch}
				isAdmin={true}
			/>

			<Card>
				<CardHeader className='pb-2'>
					<CardTitle>Destinations</CardTitle>
					<CardDescription>Manage your travel destinations and packages.</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className='flex justify-center items-center h-40'>
							<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
						</div>
					) : isError ? (
						<div className='text-center py-10'>
							<h3 className='text-lg font-medium text-red-500'>Error loading destinations</h3>
							<p className='mt-2 text-sm text-gray-400'>Please try again later</p>
						</div>
					) : destinations.length > 0 ? (
						// Destinations table
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Destination</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Duration</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{destinations.map((destination) => (
										<TableRow key={destination._id}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<div className='h-10 w-10 rounded-md overflow-hidden bg-muted'>
														<img
															src={destination.images?.[0]?.url || '/placeholder.svg?height=40&width=40'}
															alt={destination.title}
															className='h-full w-full object-cover'
														/>
													</div>
													<div>
														<div className='font-medium'>{destination.title}</div>
														<div className='text-sm text-muted-foreground truncate max-w-[300px]'>
															{destination.summary}
														</div>
														<div className='flex items-center gap-1 mt-1'>
															{destination.isFeatured && (
																<Badge variant='secondary' className='text-xs'>
																	<Star className='h-3 w-3 mr-1' />
																	Featured
																</Badge>
															)}
															{destination.isPopular && (
																<Badge variant='outline' className='text-xs'>
																	<TrendingUp className='h-3 w-3 mr-1' />
																	Popular
																</Badge>
															)}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{formatPrice(destination.pricing?.basePrice || 0, destination.pricing?.currency || 'BDT')}
											</TableCell>
											<TableCell>{destination.duration?.days} days</TableCell>
											<TableCell>
												<Badge
													variant={destination.status === 'active' ? 'default' : 'secondary'}
													className='capitalize'>
													{destination.status}
												</Badge>
											</TableCell>
											<TableCell>{formatDate(destination.createdAt)}</TableCell>
											<TableCell className='text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='icon'>
															<MoreHorizontal className='h-4 w-4' />
															<span className='sr-only'>Actions</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleViewDestination(destination._id)}>
															<Eye className='h-4 w-4' />
															View
														</DropdownMenuItem>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleEditDestination(destination._id)}>
															<Edit className='h-4 w-4' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															className='flex items-center gap-2 text-red-500 focus:text-red-500'
															onClick={() => setDestinationToDelete(destination._id)}>
															<Trash className='h-4 w-4' />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className='text-center py-10'>
							<h3 className='text-lg font-medium text-gray-500'>No destinations found</h3>
							<p className='mt-2 text-sm text-gray-400'>Add your first destination to get started</p>
						</div>
					)}

					{/* Pagination */}
					{!isLoading && destinations.length > 0 && (
						<div className='mt-4'>
							<PaginationControls
								currentPage={page}
								totalPages={pagination.totalPages}
								onPageChange={handlePageChange}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!destinationToDelete} onOpenChange={(open) => !open && setDestinationToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the destination and all associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteDestination} className='bg-red-500 hover:bg-red-600'>
							{deleteMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default AdminDestinations;
