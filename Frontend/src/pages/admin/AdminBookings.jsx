'use client';

import { useState, useEffect } from 'react';
import { useBookingQuery } from '@/hooks/useBookingQuery';
import { useBookingMutation } from '@/hooks/useBookingMutation';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PaginationControls from '@/components/Destination/PaginationControls';
import {
	Search,
	Filter,
	MoreHorizontal,
	Calendar,
	MapPin,
	Users,
	Clock,
	Phone,
	Mail,
	AlertCircle,
	Loader2,
	X,
} from 'lucide-react';

const AdminBookings = () => {
	// State for filters and pagination
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
	const [newStatus, setNewStatus] = useState('');
	const [newPaymentStatus, setNewPaymentStatus] = useState('');
	const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
	const limit = 10;

	// Debounce search term to prevent excessive API calls
	const debouncedSearchTerm = useDebounce(searchTerm, 500);

	// Get bookings with filters - handle 'all' value by setting to empty string
	const { allBookingsQuery } = useBookingQuery(null, {
		page: currentPage,
		limit,
		status: statusFilter === 'all' ? '' : statusFilter,
		paymentStatus: paymentStatusFilter === 'all' ? '' : paymentStatusFilter,
		search: debouncedSearchTerm,
	});

	const { data, isLoading, isError, refetch } = allBookingsQuery;

	// Booking mutation for updating status
	const { updateBookingStatus } = useBookingMutation();

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [statusFilter, paymentStatusFilter, debouncedSearchTerm]);

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return 'Not specified';
		return format(new Date(dateString), 'MMM d, yyyy');
	};

	// Format price
	const formatPrice = (price, currency = '$') => {
		if (price === undefined || price === null) return 'N/A';
		return `${currency}${price.toFixed(2)}`;
	};

	// Get status badge
	const getStatusBadge = (status) => {
		switch (status) {
			case 'confirmed':
				return <Badge className='bg-green-500'>Confirmed</Badge>;
			case 'pending':
				return (
					<Badge variant='outline' className='text-amber-500 border-amber-500'>
						Pending
					</Badge>
				);
			case 'cancelled':
				return (
					<Badge variant='outline' className='text-red-500 border-red-500'>
						Cancelled
					</Badge>
				);
			case 'completed':
				return (
					<Badge variant='outline' className='text-blue-500 border-blue-500'>
						Completed
					</Badge>
				);
			default:
				return <Badge variant='outline'>{status}</Badge>;
		}
	};

	// Get payment status badge
	const getPaymentStatusBadge = (status) => {
		switch (status) {
			case 'paid':
				return <Badge className='bg-green-500'>Paid</Badge>;
			case 'pending':
				return (
					<Badge variant='outline' className='text-amber-500 border-amber-500'>
						Pending
					</Badge>
				);
			case 'refunded':
				return (
					<Badge variant='outline' className='text-blue-500 border-blue-500'>
						Refunded
					</Badge>
				);
			case 'cancelled':
				return (
					<Badge variant='outline' className='text-red-500 border-red-500'>
						Cancelled
					</Badge>
				);
			default:
				return <Badge variant='outline'>{status}</Badge>;
		}
	};

	// Handle status update
	const handleStatusUpdate = () => {
		if (!selectedBooking) return;

		const updates = {};
		if (newStatus) updates.status = newStatus;
		if (newPaymentStatus) updates.paymentStatus = newPaymentStatus;

		if (Object.keys(updates).length === 0) {
			toast.error('No changes to update');
			return;
		}

		updateBookingStatus.mutate(
			{ id: selectedBooking._id, updates },
			{
				onSuccess: () => {
					toast.success('Booking status updated successfully');
					setIsUpdateDialogOpen(false);
					refetch();
				},
				onError: (error) => {
					toast.error(`Failed to update booking: ${error.response?.data?.message || 'Unknown error'}`);
				},
			}
		);
	};

	// Handle view booking details
	const handleViewBooking = (booking) => {
		setSelectedBooking(booking);
		setIsViewSheetOpen(true);
	};

	// Handle update booking status
	const handleOpenUpdateDialog = (booking) => {
		setSelectedBooking(booking);
		setNewStatus(booking.status);
		setNewPaymentStatus(booking.pricing?.paymentStatus);
		setIsUpdateDialogOpen(true);
	};

	// Handle page change
	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	// Clear filters
	const clearFilters = () => {
		setSearchTerm('');
		setStatusFilter('');
		setPaymentStatusFilter('');
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>Booking Management</h1>
					<p className='text-muted-foreground'>Manage and track all customer bookings</p>
				</div>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader className='pb-3'>
					<CardTitle className='text-md font-medium'>Filters & Search</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
						<div className='relative'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search by name or email'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-8'
							/>
						</div>

						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger>
								<SelectValue placeholder='Booking Status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Statuses</SelectItem>
								<SelectItem value='pending'>Pending</SelectItem>
								<SelectItem value='confirmed'>Confirmed</SelectItem>
								<SelectItem value='cancelled'>Cancelled</SelectItem>
								<SelectItem value='completed'>Completed</SelectItem>
							</SelectContent>
						</Select>

						<Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
							<SelectTrigger>
								<SelectValue placeholder='Payment Status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Payment Statuses</SelectItem>
								<SelectItem value='pending'>Pending</SelectItem>
								<SelectItem value='paid'>Paid</SelectItem>
								<SelectItem value='refunded'>Refunded</SelectItem>
								<SelectItem value='cancelled'>Cancelled</SelectItem>
							</SelectContent>
						</Select>

						<Button variant='outline' onClick={clearFilters} className='h-10'>
							<Filter className='mr-2 h-4 w-4' />
							Clear Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Bookings Table */}
			<Card>
				<CardContent className='pt-6'>
					{isLoading ? (
						<div className='flex justify-center items-center h-64'>
							<Loader2 className='h-8 w-8 animate-spin text-primary' />
						</div>
					) : isError ? (
						<div className='text-center py-10'>
							<AlertCircle className='h-10 w-10 text-red-500 mx-auto mb-2' />
							<h3 className='text-lg font-medium'>Failed to load bookings</h3>
							<p className='text-muted-foreground'>Please try again later</p>
							<Button onClick={() => refetch()} className='mt-4'>
								Retry
							</Button>
						</div>
					) : data?.bookings?.length === 0 ? (
						<div className='text-center py-10'>
							<h3 className='text-lg font-medium'>No bookings found</h3>
							<p className='text-muted-foreground'>Try adjusting your filters</p>
						</div>
					) : (
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Reference</TableHead>
										<TableHead>Customer</TableHead>
										<TableHead>Destination</TableHead>
										<TableHead>Travel Date</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Payment</TableHead>
										<TableHead>Total</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data?.bookings?.map((booking) => (
										<TableRow key={booking._id}>
											<TableCell className='font-medium'>{booking._id.substring(0, 8).toUpperCase()}</TableCell>
											<TableCell>
												<div className='font-medium'>{booking.fullName}</div>
												<div className='text-sm text-muted-foreground'>{booking.email}</div>
											</TableCell>
											<TableCell>{booking.destinationDetails?.title}</TableCell>
											<TableCell>{formatDate(booking.travelDate)}</TableCell>
											<TableCell>{getStatusBadge(booking.status)}</TableCell>
											<TableCell>{getPaymentStatusBadge(booking.pricing?.paymentStatus)}</TableCell>
											<TableCell>{formatPrice(booking.pricing?.totalPrice, booking.pricing?.currency)}</TableCell>
											<TableCell className='text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' className='h-8 w-8 p-0'>
															<span className='sr-only'>Open menu</span>
															<MoreHorizontal className='h-4 w-4' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem onClick={() => handleViewBooking(booking)}>View Details</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={() => handleOpenUpdateDialog(booking)}>
															Update Status
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}

					{/* Pagination */}
					{data?.pagination && data.pagination.totalPages > 1 && (
						<div className='mt-4'>
							<PaginationControls
								currentPage={currentPage}
								totalPages={data.pagination.totalPages}
								onPageChange={handlePageChange}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* View Booking Details Sheet - Replaced Dialog with Sheet for better responsiveness */}
			<Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
				<SheetContent side='right' className='w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto'>
					<SheetHeader className='mb-5'>
						<SheetTitle className='text-xl'>Booking Details</SheetTitle>
						<SheetDescription>
							Reference: {selectedBooking && selectedBooking._id.substring(0, 8).toUpperCase()}
						</SheetDescription>
					</SheetHeader>

					{selectedBooking && (
						<div className='space-y-6'>
							{/* Customer Information */}
							<Card>
								<CardHeader className='pb-2'>
									<CardTitle className='text-lg'>Customer Information</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div>
										<h4 className='font-medium'>{selectedBooking.fullName}</h4>
										<div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
											<Mail className='h-4 w-4' />
											<span>{selectedBooking.email}</span>
										</div>
										<div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
											<Phone className='h-4 w-4' />
											<span>{selectedBooking.phone}</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Destination */}
							<Card>
								<CardHeader className='pb-2'>
									<CardTitle className='text-lg'>Destination</CardTitle>
								</CardHeader>
								<CardContent className='p-6'>
									<div className='aspect-video relative overflow-hidden rounded-2xl'>
										<img
											src={
												selectedBooking.destinationDetails?.image ||
												'/placeholder.svg?height=200&width=300' ||
												'/placeholder.svg' ||
												'/placeholder.svg'
											}
											alt={selectedBooking.destinationDetails?.title}
											className='w-full h-full object-cover'
										/>
									</div>
									<div className='p-4'>
										<h4 className='font-medium'>{selectedBooking.destinationDetails?.title}</h4>
										<div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
											<MapPin className='h-4 w-4' />
											<span>{selectedBooking.destinationDetails?.location}</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Booking Details */}
							<Card>
								<CardHeader className='pb-2'>
									<CardTitle className='text-lg'>Booking Details</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<div>
											<div className='text-sm text-muted-foreground'>Travel Date</div>
											<div className='flex items-center gap-2 mt-1'>
												<Calendar className='h-4 w-4 text-muted-foreground' />
												<span>{formatDate(selectedBooking.travelDate)}</span>
											</div>
										</div>

										<div>
											<div className='text-sm text-muted-foreground'>Duration</div>
											<div className='flex items-center gap-2 mt-1'>
												<Clock className='h-4 w-4 text-muted-foreground' />
												<span>
													{selectedBooking.destinationDetails?.duration?.days} days /{' '}
													{selectedBooking.destinationDetails?.duration?.nights} nights
												</span>
											</div>
										</div>

										<div>
											<div className='text-sm text-muted-foreground'>Travelers</div>
											<div className='flex items-center gap-2 mt-1'>
												<Users className='h-4 w-4 text-muted-foreground' />
												<span>
													{selectedBooking.numberOfTravelers?.adults}{' '}
													{selectedBooking.numberOfTravelers?.adults === 1 ? 'adult' : 'adults'}
													{selectedBooking.numberOfTravelers?.children > 0
														? `, ${selectedBooking.numberOfTravelers.children} ${
																selectedBooking.numberOfTravelers.children === 1 ? 'child' : 'children'
														  }`
														: ''}
												</span>
											</div>
										</div>

										<div>
											<div className='text-sm text-muted-foreground'>Created On</div>
											<div className='flex items-center gap-2 mt-1'>
												<Calendar className='h-4 w-4 text-muted-foreground' />
												<span>{formatDate(selectedBooking.createdAt)}</span>
											</div>
										</div>
									</div>

									{selectedBooking.specialRequests && (
										<div className='mt-4'>
											<div className='text-sm text-muted-foreground'>Special Requests</div>
											<p className='mt-1 text-sm p-3 bg-muted rounded-md'>{selectedBooking.specialRequests}</p>
										</div>
									)}

									{selectedBooking.dietaryRestrictions && selectedBooking.dietaryRestrictions.length > 0 && (
										<div className='mt-4'>
											<div className='text-sm text-muted-foreground'>Dietary Restrictions</div>
											<div className='flex flex-wrap gap-2 mt-1'>
												{selectedBooking.dietaryRestrictions.map((restriction, index) => (
													<Badge key={index} variant='outline'>
														{restriction}
													</Badge>
												))}
											</div>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Status Information */}
							<Card>
								<CardHeader className='pb-2'>
									<CardTitle className='text-lg'>Status</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<div>
											<div className='text-sm text-muted-foreground'>Booking Status</div>
											<div className='mt-1'>{getStatusBadge(selectedBooking.status)}</div>
										</div>

										<div>
											<div className='text-sm text-muted-foreground'>Payment Status</div>
											<div className='mt-1'>{getPaymentStatusBadge(selectedBooking.pricing?.paymentStatus)}</div>
										</div>
									</div>

									<Button
										className='w-full'
										onClick={() => {
											setIsViewSheetOpen(false);
											handleOpenUpdateDialog(selectedBooking);
										}}>
										Update Status
									</Button>
								</CardContent>
							</Card>

							{/* Payment Details */}
							<Card>
								<CardHeader className='pb-2'>
									<CardTitle className='text-lg'>Payment Details</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-2'>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>Base Price</span>
											<span>{formatPrice(selectedBooking.pricing?.basePrice, selectedBooking.pricing?.currency)}</span>
										</div>

										{selectedBooking.pricing?.discountedPrice !== selectedBooking.pricing?.basePrice && (
											<div className='flex justify-between'>
												<span className='text-muted-foreground'>Discounted Price</span>
												<span>
													{formatPrice(selectedBooking.pricing?.discountedPrice, selectedBooking.pricing?.currency)}
												</span>
											</div>
										)}

										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												Adults ({selectedBooking.numberOfTravelers?.adults || 1})
											</span>
											<span>
												{formatPrice(
													(selectedBooking.pricing?.discountedPrice || 0) *
														(selectedBooking.numberOfTravelers?.adults || 1),
													selectedBooking.pricing?.currency
												)}
											</span>
										</div>

										{selectedBooking.numberOfTravelers?.children > 0 && (
											<div className='flex justify-between'>
												<span className='text-muted-foreground'>
													Children ({selectedBooking.numberOfTravelers.children}) (50% off)
												</span>
												<span>
													{formatPrice(
														(selectedBooking.pricing?.discountedPrice || 0) *
															0.5 *
															selectedBooking.numberOfTravelers.children,
														selectedBooking.pricing?.currency
													)}
												</span>
											</div>
										)}

										<Separator />

										<div className='flex justify-between font-medium text-lg pt-2'>
											<span>Total</span>
											<span>{formatPrice(selectedBooking.pricing?.totalPrice, selectedBooking.pricing?.currency)}</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</SheetContent>
			</Sheet>

			{/* Update Status Dialog */}
			<Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Booking Status</DialogTitle>
						<DialogDescription>
							Update the status for booking {selectedBooking && selectedBooking._id.substring(0, 8).toUpperCase()}
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4 py-4'>
						<div className='space-y-2'>
							<label htmlFor='status' className='text-sm font-medium'>
								Booking Status
							</label>
							<Select value={newStatus} onValueChange={setNewStatus}>
								<SelectTrigger id='status'>
									<SelectValue placeholder='Select status' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='pending'>Pending</SelectItem>
									<SelectItem value='confirmed'>Confirmed</SelectItem>
									<SelectItem value='cancelled'>Cancelled</SelectItem>
									<SelectItem value='completed'>Completed</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<label htmlFor='paymentStatus' className='text-sm font-medium'>
								Payment Status
							</label>
							<Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
								<SelectTrigger id='paymentStatus'>
									<SelectValue placeholder='Select payment status' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='pending'>Pending</SelectItem>
									<SelectItem value='paid'>Paid</SelectItem>
									<SelectItem value='refunded'>Refunded</SelectItem>
									<SelectItem value='cancelled'>Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={() => setIsUpdateDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleStatusUpdate} disabled={updateBookingStatus.isPending}>
							{updateBookingStatus.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Updating...
								</>
							) : (
								'Update Status'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AdminBookings;
