import { useState, useEffect } from 'react';
import { useBookingQuery } from '@/hooks/useBookingQuery';
import { useBookingMutation } from '@/hooks/useBookingMutation';
import { useVisaBookingQuery } from '@/hooks/useVisaBookingQuery';
import { useVisaBookingMutation } from '@/hooks/useVisaBookingMutation';
import { useDebounce } from '@/hooks/useDebounce';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
	Globe,
	StampIcon as Passport,
	ArrowRightLeft,
} from 'lucide-react';

// Booking type enum
const BookingType = {
	DESTINATION: 'destination',
	VISA: 'visa',
};

const AdminBookings = () => {
	// State for active tab
	const [activeTab, setActiveTab] = useState(BookingType.DESTINATION);

	// State for filters and pagination - destination bookings
	const [destSearchTerm, setDestSearchTerm] = useState('');
	const [destStatusFilter, setDestStatusFilter] = useState('');
	const [destPaymentStatusFilter, setDestPaymentStatusFilter] = useState('');
	const [destCurrentPage, setDestCurrentPage] = useState(1);
	const limit = 10;

	// State for filters and pagination - visa bookings
	const [visaSearchTerm, setVisaSearchTerm] = useState('');
	const [visaStatusFilter, setVisaStatusFilter] = useState('');
	const [visaPaymentStatusFilter, setVisaPaymentStatusFilter] = useState('');
	const [visaCurrentPage, setVisaCurrentPage] = useState(1);

	// State for selected booking and dialogs
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [selectedBookingType, setSelectedBookingType] = useState(null);
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
	const [newStatus, setNewStatus] = useState('');
	const [newPaymentStatus, setNewPaymentStatus] = useState('');
	const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);

	// Debounce search terms
	const debouncedDestSearchTerm = useDebounce(destSearchTerm, 500);
	const debouncedVisaSearchTerm = useDebounce(visaSearchTerm, 500);

	// Get destination bookings with filters
	const { allBookingsQuery } = useBookingQuery(null, {
		page: destCurrentPage,
		limit,
		status: destStatusFilter === 'all' ? '' : destStatusFilter,
		paymentStatus: destPaymentStatusFilter === 'all' ? '' : destPaymentStatusFilter,
		search: debouncedDestSearchTerm,
	});

	// Get visa bookings with filters
	const { allVisaBookingsQuery } = useVisaBookingQuery(null, {
		page: visaCurrentPage,
		limit,
		status: visaStatusFilter === 'all' ? '' : visaStatusFilter,
		paymentStatus: visaPaymentStatusFilter === 'all' ? '' : visaPaymentStatusFilter,
		search: debouncedVisaSearchTerm,
	});

	// Booking mutations
	const { updateBookingStatus } = useBookingMutation();
	const { updateVisaBookingStatus } = useVisaBookingMutation();

	// Reset page when filters change - destination bookings
	useEffect(() => {
		setDestCurrentPage(1);
	}, [destStatusFilter, destPaymentStatusFilter, debouncedDestSearchTerm]);

	// Reset page when filters change - visa bookings
	useEffect(() => {
		setVisaCurrentPage(1);
	}, [visaStatusFilter, visaPaymentStatusFilter, debouncedVisaSearchTerm]);

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
	const getStatusBadge = (status, type) => {
		// Common statuses
		if (status === 'pending') {
			return (
				<Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200'>
					Pending
				</Badge>
			);
		} else if (status === 'cancelled' || status === 'rejected') {
			return (
				<Badge variant='outline' className='bg-red-50 text-red-700 border-red-200'>
					{status === 'cancelled' ? 'Cancelled' : 'Rejected'}
				</Badge>
			);
		}

		// Destination-specific statuses
		if (type === BookingType.DESTINATION) {
			switch (status) {
				case 'confirmed':
					return (
						<Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
							Confirmed
						</Badge>
					);
				case 'completed':
					return (
						<Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
							Completed
						</Badge>
					);
				default:
					return <Badge variant='outline'>{status}</Badge>;
			}
		}

		// Visa-specific statuses
		if (type === BookingType.VISA) {
			switch (status) {
				case 'processing':
					return (
						<Badge variant='outline' className='bg-indigo-50 text-indigo-700 border-indigo-200'>
							Processing
						</Badge>
					);
				case 'approved':
					return (
						<Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
							Approved
						</Badge>
					);
				case 'completed':
					return (
						<Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
							Completed
						</Badge>
					);
				default:
					return <Badge variant='outline'>{status}</Badge>;
			}
		}

		return <Badge variant='outline'>{status}</Badge>;
	};

	// Get payment status badge
	const getPaymentStatusBadge = (status) => {
		switch (status) {
			case 'paid':
				return (
					<Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
						Paid
					</Badge>
				);
			case 'pending':
				return (
					<Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200'>
						Pending
					</Badge>
				);
			case 'refunded':
				return (
					<Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
						Refunded
					</Badge>
				);
			case 'cancelled':
				return (
					<Badge variant='outline' className='bg-red-50 text-red-700 border-red-200'>
						Cancelled
					</Badge>
				);
			default:
				return <Badge variant='outline'>{status}</Badge>;
		}
	};

	// Handle status update
	const handleStatusUpdate = () => {
		if (!selectedBooking || !selectedBookingType) return;

		const updates = {};
		if (newStatus) updates.status = newStatus;
		if (newPaymentStatus) updates.paymentStatus = newPaymentStatus;

		if (Object.keys(updates).length === 0) {
			toast.error('No changes to update');
			return;
		}

		if (selectedBookingType === BookingType.DESTINATION) {
			updateBookingStatus.mutate(
				{ id: selectedBooking._id, updates },
				{
					onSuccess: () => {
						toast.success('Booking status updated successfully');
						setIsUpdateDialogOpen(false);
						allBookingsQuery.refetch();
					},
					onError: (error) => {
						toast.error(`Failed to update booking: ${error.response?.data?.message || 'Unknown error'}`);
					},
				}
			);
		} else {
			updateVisaBookingStatus.mutate(
				{ id: selectedBooking._id, updates },
				{
					onSuccess: () => {
						toast.success('Visa booking status updated successfully');
						setIsUpdateDialogOpen(false);
						allVisaBookingsQuery.refetch();
					},
					onError: (error) => {
						toast.error(`Failed to update visa booking: ${error.response?.data?.message || 'Unknown error'}`);
					},
				}
			);
		}
	};

	// Handle view booking details
	const handleViewBooking = (booking, type) => {
		setSelectedBooking(booking);
		setSelectedBookingType(type);
		setIsViewSheetOpen(true);
	};

	// Handle update booking status
	const handleOpenUpdateDialog = (booking, type) => {
		setSelectedBooking(booking);
		setSelectedBookingType(type);
		setNewStatus(booking.status);
		setNewPaymentStatus(booking.pricing?.paymentStatus);
		setIsUpdateDialogOpen(true);
	};

	// Clear destination filters
	const clearDestFilters = () => {
		setDestSearchTerm('');
		setDestStatusFilter('');
		setDestPaymentStatusFilter('');
	};

	// Clear visa filters
	const clearVisaFilters = () => {
		setVisaSearchTerm('');
		setVisaStatusFilter('');
		setVisaPaymentStatusFilter('');
	};

	// Get available statuses based on booking type
	const getAvailableStatuses = () => {
		if (selectedBookingType === BookingType.DESTINATION) {
			return [
				{ value: 'pending', label: 'Pending' },
				{ value: 'confirmed', label: 'Confirmed' },
				{ value: 'cancelled', label: 'Cancelled' },
				{ value: 'completed', label: 'Completed' },
			];
		} else {
			return [
				{ value: 'pending', label: 'Pending' },
				{ value: 'processing', label: 'Processing' },
				{ value: 'approved', label: 'Approved' },
				{ value: 'rejected', label: 'Rejected' },
				{ value: 'completed', label: 'Completed' },
			];
		}
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>Booking Management</h1>
					<p className='text-muted-foreground'>Manage and track all customer bookings</p>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
				<TabsList className='grid w-full grid-cols-2 mb-6'>
					<TabsTrigger value={BookingType.DESTINATION} className='flex items-center gap-2'>
						<Globe className='h-4 w-4' />
						<span>Trip Bookings</span>
					</TabsTrigger>
					<TabsTrigger value={BookingType.VISA} className='flex items-center gap-2'>
						<Passport className='h-4 w-4' />
						<span>Visa Bookings</span>
					</TabsTrigger>
				</TabsList>

				{/* Destination Bookings Tab */}
				<TabsContent value={BookingType.DESTINATION} className='space-y-6'>
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
										value={destSearchTerm}
										onChange={(e) => setDestSearchTerm(e.target.value)}
										className='pl-8'
									/>
								</div>

								<Select value={destStatusFilter} onValueChange={setDestStatusFilter}>
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

								<Select value={destPaymentStatusFilter} onValueChange={setDestPaymentStatusFilter}>
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

								<Button variant='outline' onClick={clearDestFilters} className='h-10'>
									<Filter className='mr-2 h-4 w-4' />
									Clear Filters
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Destination Bookings Table */}
					<Card>
						<CardContent className='pt-6'>
							{allBookingsQuery.isLoading ? (
								<div className='flex justify-center items-center h-64'>
									<Loader2 className='h-8 w-8 animate-spin text-primary' />
								</div>
							) : allBookingsQuery.isError ? (
								<div className='text-center py-10'>
									<AlertCircle className='h-10 w-10 text-red-500 mx-auto mb-2' />
									<h3 className='text-lg font-medium'>Failed to load bookings</h3>
									<p className='text-muted-foreground'>Please try again later</p>
									<Button onClick={() => allBookingsQuery.refetch()} className='mt-4'>
										Retry
									</Button>
								</div>
							) : allBookingsQuery.data?.bookings?.length === 0 ? (
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
											{allBookingsQuery.data?.bookings?.map((booking) => (
												<TableRow key={booking._id}>
													<TableCell className='font-medium'>{booking._id.substring(0, 8).toUpperCase()}</TableCell>
													<TableCell>
														<div className='font-medium'>{booking.fullName}</div>
														<div className='text-sm text-muted-foreground'>{booking.email}</div>
													</TableCell>
													<TableCell>{booking.destinationDetails?.title}</TableCell>
													<TableCell>{formatDate(booking.travelDate)}</TableCell>
													<TableCell>{getStatusBadge(booking.status, BookingType.DESTINATION)}</TableCell>
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
																<DropdownMenuItem onClick={() => handleViewBooking(booking, BookingType.DESTINATION)}>
																	View Details
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() => handleOpenUpdateDialog(booking, BookingType.DESTINATION)}>
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
							{allBookingsQuery.data?.pagination && allBookingsQuery.data.pagination.totalPages > 1 && (
								<div className='mt-4'>
									<PaginationControls
										currentPage={destCurrentPage}
										totalPages={allBookingsQuery.data.pagination.totalPages}
										onPageChange={setDestCurrentPage}
									/>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Visa Bookings Tab */}
				<TabsContent value={BookingType.VISA} className='space-y-6'>
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
										value={visaSearchTerm}
										onChange={(e) => setVisaSearchTerm(e.target.value)}
										className='pl-8'
									/>
								</div>

								<Select value={visaStatusFilter} onValueChange={setVisaStatusFilter}>
									<SelectTrigger>
										<SelectValue placeholder='Booking Status' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All Statuses</SelectItem>
										<SelectItem value='pending'>Pending</SelectItem>
										<SelectItem value='processing'>Processing</SelectItem>
										<SelectItem value='approved'>Approved</SelectItem>
										<SelectItem value='rejected'>Rejected</SelectItem>
										<SelectItem value='completed'>Completed</SelectItem>
									</SelectContent>
								</Select>

								<Select value={visaPaymentStatusFilter} onValueChange={setVisaPaymentStatusFilter}>
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

								<Button variant='outline' onClick={clearVisaFilters} className='h-10'>
									<Filter className='mr-2 h-4 w-4' />
									Clear Filters
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Visa Bookings Table */}
					<Card>
						<CardContent className='pt-6'>
							{allVisaBookingsQuery.isLoading ? (
								<div className='flex justify-center items-center h-64'>
									<Loader2 className='h-8 w-8 animate-spin text-primary' />
								</div>
							) : allVisaBookingsQuery.isError ? (
								<div className='text-center py-10'>
									<AlertCircle className='h-10 w-10 text-red-500 mx-auto mb-2' />
									<h3 className='text-lg font-medium'>Failed to load visa bookings</h3>
									<p className='text-muted-foreground'>Please try again later</p>
									<Button onClick={() => allVisaBookingsQuery.refetch()} className='mt-4'>
										Retry
									</Button>
								</div>
							) : allVisaBookingsQuery.data?.bookings?.length === 0 ? (
								<div className='text-center py-10'>
									<h3 className='text-lg font-medium'>No visa bookings found</h3>
									<p className='text-muted-foreground'>Try adjusting your filters</p>
								</div>
							) : (
								<div className='overflow-x-auto'>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Reference</TableHead>
												<TableHead>Applicant</TableHead>
												<TableHead>Visa Type</TableHead>
												<TableHead>From/To</TableHead>
												<TableHead>Travel Date</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Payment</TableHead>
												<TableHead className='text-right'>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{allVisaBookingsQuery.data?.bookings?.map((booking) => (
												<TableRow key={booking._id}>
													<TableCell className='font-medium'>{booking._id.substring(0, 8).toUpperCase()}</TableCell>
													<TableCell>
														<div className='font-medium'>{booking.name}</div>
														<div className='text-sm text-muted-foreground'>{booking.email}</div>
													</TableCell>
													<TableCell>{booking.visaDetails?.title}</TableCell>
													<TableCell>
														<div className='flex items-center gap-1 text-sm'>
															<ArrowRightLeft className='h-3 w-3 text-muted-foreground' />
															<span>
																{booking.visaDetails?.from} → {booking.visaDetails?.to}
															</span>
														</div>
													</TableCell>
													<TableCell>{formatDate(booking.travelDate)}</TableCell>
													<TableCell>{getStatusBadge(booking.status, BookingType.VISA)}</TableCell>
													<TableCell>{getPaymentStatusBadge(booking.pricing?.paymentStatus)}</TableCell>
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
																<DropdownMenuItem onClick={() => handleViewBooking(booking, BookingType.VISA)}>
																	View Details
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem onClick={() => handleOpenUpdateDialog(booking, BookingType.VISA)}>
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
							{allVisaBookingsQuery.data?.pagination && allVisaBookingsQuery.data.pagination.totalPages > 1 && (
								<div className='mt-4'>
									<PaginationControls
										currentPage={visaCurrentPage}
										totalPages={allVisaBookingsQuery.data.pagination.totalPages}
										onPageChange={setVisaCurrentPage}
									/>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* View Booking Details Sheet */}
			<Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
				<SheetContent side='right' className='w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto'>
					<SheetHeader className='mb-5'>
						<SheetTitle className='text-xl'>
							{selectedBookingType === BookingType.DESTINATION ? 'Trip' : 'Visa'} Booking Details
						</SheetTitle>
						<SheetDescription>
							Reference: {selectedBooking && selectedBooking._id.substring(0, 8).toUpperCase()}
						</SheetDescription>
					</SheetHeader>

					{selectedBooking && (
						<div className='space-y-6'>
							{/* Customer Information */}
							<Card>
								<CardHeader className='pb-2'>
									<CardTitle className='text-lg'>
										{selectedBookingType === BookingType.DESTINATION ? 'Customer' : 'Applicant'} Information
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div>
										<h4 className='font-medium'>
											{selectedBookingType === BookingType.DESTINATION
												? selectedBooking.fullName
												: `${selectedBooking.name}`}
										</h4>
										<div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
											<Mail className='h-4 w-4' />
											<span>{selectedBooking.email}</span>
										</div>
										<div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
											<Phone className='h-4 w-4' />
											<span>{selectedBooking.phone}</span>
										</div>
										{selectedBookingType === BookingType.VISA && selectedBooking.nationality && (
											<div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
												<Globe className='h-4 w-4' />
												<span>Nationality: {selectedBooking.nationality}</span>
											</div>
										)}
										{selectedBookingType === BookingType.VISA && selectedBooking.passportNumber && (
											<div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
												<Passport className='h-4 w-4' />
												<span>Passport: {selectedBooking.passportNumber}</span>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Destination/Visa Details */}
							<Card>
								<CardHeader className='pb-2'>
									<CardTitle className='text-lg'>
										{selectedBookingType === BookingType.DESTINATION ? 'Destination' : 'Visa'} Details
									</CardTitle>
								</CardHeader>
								<CardContent className='p-6'>
									<div className='aspect-video relative overflow-hidden rounded-2xl'>
										<img
											src={
												(selectedBookingType === BookingType.DESTINATION
													? selectedBooking.destinationDetails?.image
													: selectedBooking.visaDetails?.image) || '/placeholder.svg?height=200&width=300'
											}
											alt={
												selectedBookingType === BookingType.DESTINATION
													? selectedBooking.destinationDetails?.title
													: selectedBooking.visaDetails?.title
											}
											className='w-full h-full object-cover'
										/>
									</div>
									<div className='p-4'>
										<h4 className='font-medium'>
											{selectedBookingType === BookingType.DESTINATION
												? selectedBooking.destinationDetails?.title
												: selectedBooking.visaDetails?.title}
										</h4>
										<div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground'>
											{selectedBookingType === BookingType.DESTINATION ? (
												<>
													<MapPin className='h-4 w-4' />
													<span>{selectedBooking.destinationDetails?.location}</span>
												</>
											) : (
												<>
													<ArrowRightLeft className='h-4 w-4' />
													<span>
														{selectedBooking.visaDetails?.from} to {selectedBooking.visaDetails?.to}
													</span>
												</>
											)}
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

										{selectedBookingType === BookingType.DESTINATION ? (
											<>
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
											</>
										) : (
											<div>
												<div className='text-sm text-muted-foreground'>Processing Time</div>
												<div className='flex items-center gap-2 mt-1'>
													<Clock className='h-4 w-4 text-muted-foreground' />
													<span>{selectedBooking.visaDetails?.processingTime || 'Standard processing'}</span>
												</div>
											</div>
										)}

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

									{selectedBookingType === BookingType.DESTINATION &&
										selectedBooking.dietaryRestrictions &&
										selectedBooking.dietaryRestrictions.length > 0 && (
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
											<div className='mt-1'>{getStatusBadge(selectedBooking.status, selectedBookingType)}</div>
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
											handleOpenUpdateDialog(selectedBooking, selectedBookingType);
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

										{selectedBookingType === BookingType.DESTINATION && (
											<>
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
											</>
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
						<DialogTitle>Update {selectedBookingType === BookingType.VISA ? 'Visa ' : ''}Booking Status</DialogTitle>
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
									{getAvailableStatuses().map((status) => (
										<SelectItem key={status.value} value={status.value}>
											{status.label}
										</SelectItem>
									))}
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
						<Button
							onClick={handleStatusUpdate}
							disabled={updateBookingStatus.isPending || updateVisaBookingStatus.isPending}>
							{updateBookingStatus.isPending || updateVisaBookingStatus.isPending ? (
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
