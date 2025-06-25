import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Edit, Trash, Eye, Star, Clock } from 'lucide-react';
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
import { useQueryClient } from '@tanstack/react-query';
import VisaFilters from '@/components/Visa/VisaFilters';
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
import { useVisaQuery } from '@/hooks/useVisaQuery';
import { useVisaMutation } from '@/hooks/useVisaMutation';

const AdminVisas = () => {
	const navigate = useNavigate();
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();
	const { deleteVisa, toggleFeatured } = useVisaMutation();

	// State for pagination, filtering, and sorting
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [filters, setFilters] = useState({
		priceRange: [0, 5000],
		from: '',
		to: '',
		status: 'all',
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [activeSort, setActiveSort] = useState('newest');
	const [visaToDelete, setVisaToDelete] = useState(null);

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

		// From country
		if (filters.from) {
			apiFilters.from = filters.from;
		}

		// To country
		if (filters.to) {
			apiFilters.to = filters.to;
		}

		// Status
		if (filters.status && filters.status !== 'all') {
			apiFilters.status = filters.status === 'active' ? true : false;
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

	// Fetch visas with TanStack Query
	const { data, isLoading, isError, refetch } = useVisaQuery().useGetAdminVisas({
		page,
		limit,
		search: searchQuery,
		sortBy: getSortParam(),
		...getApiFilters(),
	});

	// Delete visa mutation handler
	const handleDeleteVisa = () => {
		if (!visaToDelete) return;

		deleteVisa.mutate(visaToDelete, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['admin-visas'] });
				toast.success('Visa package deleted successfully');
				setVisaToDelete(null);
			},
			onError: (error) => {
				toast.error(`Failed to delete visa package: ${error.message || 'Unknown error'}`);
			},
		});
	};

	// Handle toggle featured status
	const handleToggleFeatured = (id) => {
		toggleFeatured.mutate(id, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['admin-visas'] });
				toast.success('Featured status updated');
			},
		});
	};

	// Handle search
	const handleSearch = (query) => {
		setSearchQuery(query);
		setPage(1); // Reset to first page on new search
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPage(newPage);
	};

	// Handle add new visa
	const handleAddVisa = () => {
		navigate('/admin/visas/new');
	};

	// Handle edit visa
	const handleEditVisa = (id) => {
		navigate(`/admin/visas/edit/${id}`);
	};

	// Handle view visa
	const handleViewVisa = (slug) => {
		navigate(`/visas/details/${slug}`);
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

	// Format price
	const formatPrice = (price, currency) => {
		const currencySymbols = {
			USD: '$',
			EUR: '€',
			GBP: '£',
			BDT: '৳',
		};

		return `${currencySymbols[currency] || '$'}${price.toLocaleString()}`;
	};

	// Extract visas array safely
	const visas = data?.visas || [];
	const pagination = data?.pagination || { totalPages: 1, total: 0 };

	return (
		<div>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
				<h1 className='text-3xl font-bold'>Visa Packages</h1>

				<Button className='flex items-center gap-2' onClick={handleAddVisa}>
					<Plus className='h-4 w-4' />
					Add Visa Package
				</Button>
			</div>

			{/* Filters Section */}
			<VisaFilters
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
					<CardTitle>Visa Packages</CardTitle>
					<CardDescription>Manage your visa packages and services.</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className='flex justify-center items-center h-40'>
							<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
						</div>
					) : isError ? (
						<div className='text-center py-10'>
							<h3 className='text-lg font-medium text-red-500'>Error loading visa packages</h3>
							<p className='mt-2 text-sm text-gray-400'>Please try again later</p>
						</div>
					) : visas.length > 0 ? (
						// Visas table
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Visa Package</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>From</TableHead>
										<TableHead>To</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{visas.map((visa) => (
										<TableRow key={visa._id}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<div className='h-10 w-10 rounded-md overflow-hidden bg-muted'>
														<img
															src={
																visa.coverImage?.url ||
																(visa.images && visa.images.length > 0
																	? visa.images[0].url
																	: '/placeholder.svg?height=40&width=40')
															}
															alt={visa.title}
															className='h-full w-full object-cover'
														/>
													</div>
													<div>
														<div className='font-medium'>{visa.title}</div>
														<div className='text-sm text-muted-foreground truncate max-w-[300px]'>
															{visa.shortDescription}
														</div>
														<div className='flex items-center gap-1 mt-1'>
															{visa.featured && (
																<Badge variant='secondary' className='text-xs'>
																	<Star className='h-3 w-3 mr-1' />
																	Featured
																</Badge>
															)}
															{visa.processingTime && (
																<Badge variant='outline' className='text-xs'>
																	<Clock className='h-3 w-3 mr-1' />
																	{visa.processingTime}
																</Badge>
															)}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{formatPrice(visa.pricing?.basePrice || 0, visa.pricing?.currency || 'USD')}
											</TableCell>
											<TableCell>{visa.from}</TableCell>
											<TableCell>{visa.to}</TableCell>
											<TableCell>
												<Badge variant={visa.isActive ? 'default' : 'secondary'} className='capitalize'>
													{visa.isActive ? 'Active' : 'Inactive'}
												</Badge>
											</TableCell>
											<TableCell>{formatDate(visa.createdAt)}</TableCell>
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
															onClick={() => handleViewVisa(visa.slug)}>
															<Eye className='h-4 w-4' />
															View
														</DropdownMenuItem>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleEditVisa(visa._id)}>
															<Edit className='h-4 w-4' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleToggleFeatured(visa._id)}>
															<Star className='h-4 w-4' />
															{visa.featured ? 'Unfeature' : 'Feature'}
														</DropdownMenuItem>
														<DropdownMenuItem
															className='flex items-center gap-2 text-red-500 focus:text-red-500'
															onClick={() => setVisaToDelete(visa._id)}>
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
							<h3 className='text-lg font-medium text-gray-500'>No visa packages found</h3>
							<p className='mt-2 text-sm text-gray-400'>Add your first visa package to get started</p>
						</div>
					)}

					{/* Pagination */}
					{!isLoading && visas.length > 0 && (
						<div className='mt-4'>
							<PaginationControls
								currentPage={page}
								totalPages={pagination.totalPages}
								onPageChange={handlePageChange}
								limit={limit}
								onLimitChange={setLimit}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!visaToDelete} onOpenChange={(open) => !open && setVisaToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the visa package and all associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteVisa} className='bg-red-500 hover:bg-red-600'>
							{deleteVisa.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default AdminVisas;
