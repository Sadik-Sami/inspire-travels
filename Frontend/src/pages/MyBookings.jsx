'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingQuery } from '@/hooks/useBookingQuery';
import { useBookingMutation } from '@/hooks/useBookingMutation';
import { useVisaBookingQuery } from '@/hooks/useVisaBookingQuery';
import { useVisaBookingMutation } from '@/hooks/useVisaBookingMutation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { toast } from 'sonner';
import {
	CalendarIcon,
	MapPinIcon,
	Clock,
	Users,
	CreditCard,
	XCircle,
	Loader2,
	Search,
	StampIcon as Passport,
	Globe,
	ArrowRightLeft,
	CheckCircle2,
	AlertCircle,
} from 'lucide-react';

// Booking type enum
const BookingType = {
	DESTINATION: 'destination',
	VISA: 'visa',
};

const MyBookings = () => {
	// Queries for both booking types
	const { userBookingsQuery } = useBookingQuery();
	const { cancelBooking } = useBookingMutation();
	const { userVisaBookingsQuery } = useVisaBookingQuery();
	const { cancelVisaBooking } = useVisaBookingMutation();

	// UI state
	const [activeTab, setActiveTab] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState('newest');
	const [bookingToCancel, setBookingToCancel] = useState(null);
	const [bookingTypeToCancel, setBookingTypeToCancel] = useState(null);
	const [combinedBookings, setCombinedBookings] = useState([]);
	const [filteredBookings, setFilteredBookings] = useState([]);

	// Loading and error states
	const isLoading = userBookingsQuery.isLoading || userVisaBookingsQuery.isLoading;
	const isError = userBookingsQuery.isError || userVisaBookingsQuery.isError;

	// Combine and process bookings when data changes
	useEffect(() => {
		if (userBookingsQuery.data?.bookings && userVisaBookingsQuery.data?.bookings) {
			// Process destination bookings
			const destinationBookings = userBookingsQuery.data.bookings.map((booking) => ({
				...booking,
				type: BookingType.DESTINATION,
			}));

			// Process visa bookings
			const visaBookings = userVisaBookingsQuery.data.bookings.map((booking) => ({
				...booking,
				type: BookingType.VISA,
			}));

			// Combine all bookings
			const allBookings = [...destinationBookings, ...visaBookings];

			// Sort bookings by date (newest first by default)
			const sortedBookings = allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

			setCombinedBookings(sortedBookings);
		}
	}, [userBookingsQuery.data, userVisaBookingsQuery.data]);

	// Filter and sort bookings when filters change
	useEffect(() => {
		if (combinedBookings.length > 0) {
			let filtered = [...combinedBookings];

			// Filter by status
			if (activeTab === 'active') {
				filtered = filtered.filter((booking) => ['pending', 'confirmed', 'processing'].includes(booking.status));
			} else if (activeTab === 'past') {
				filtered = filtered.filter((booking) =>
					['completed', 'cancelled', 'rejected', 'approved'].includes(booking.status)
				);
			} else if (activeTab === 'destination') {
				filtered = filtered.filter((booking) => booking.type === BookingType.DESTINATION);
			} else if (activeTab === 'visa') {
				filtered = filtered.filter((booking) => booking.type === BookingType.VISA);
			}

			// Filter by search query
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				filtered = filtered.filter((booking) => {
					if (booking.type === BookingType.DESTINATION) {
						return (
							booking.destinationDetails?.title?.toLowerCase().includes(query) ||
							booking.destinationDetails?.location?.toLowerCase().includes(query) ||
							booking._id.toLowerCase().includes(query)
						);
					} else {
						return (
							booking.visaDetails?.title?.toLowerCase().includes(query) ||
							booking.visaDetails?.from?.toLowerCase().includes(query) ||
							booking.visaDetails?.to?.toLowerCase().includes(query) ||
							booking._id.toLowerCase().includes(query)
						);
					}
				});
			}

			// Sort bookings
			if (sortBy === 'newest') {
				filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			} else if (sortBy === 'oldest') {
				filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
			} else if (sortBy === 'price-high') {
				filtered.sort((a, b) => b.pricing?.totalPrice - a.pricing?.totalPrice);
			} else if (sortBy === 'price-low') {
				filtered.sort((a, b) => a.pricing?.totalPrice - b.pricing?.totalPrice);
			} else if (sortBy === 'travel-date') {
				filtered.sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate));
			}

			setFilteredBookings(filtered);
		}
	}, [combinedBookings, activeTab, searchQuery, sortBy]);

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return 'Not specified';
		return format(new Date(dateString), 'MMMM d, yyyy');
	};

	// Format price
	const formatPrice = (price, currency = '$') => {
		if (!price) return 'N/A';
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

	// Handle cancel booking
	const handleCancelBooking = () => {
		if (!bookingToCancel || !bookingTypeToCancel) return;

		if (bookingTypeToCancel === BookingType.DESTINATION) {
			cancelBooking.mutate(bookingToCancel._id, {
				onSuccess: () => {
					toast.success('Booking cancelled successfully');
					setBookingToCancel(null);
					setBookingTypeToCancel(null);
				},
				onError: (error) => {
					toast.error(`Failed to cancel booking: ${error.response?.data?.message || 'Unknown error'}`);
				},
			});
		} else {
			cancelVisaBooking.mutate(bookingToCancel._id, {
				onSuccess: () => {
					toast.success('Visa booking cancelled successfully');
					setBookingToCancel(null);
					setBookingTypeToCancel(null);
				},
				onError: (error) => {
					toast.error(`Failed to cancel visa booking: ${error.response?.data?.message || 'Unknown error'}`);
				},
			});
		}
	};

	// Handle search
	const handleSearch = (e) => {
		setSearchQuery(e.target.value);
	};

	// Check if booking can be cancelled
	const canCancelBooking = (booking) => {
		if (booking.type === BookingType.DESTINATION) {
			return ['pending', 'confirmed'].includes(booking.status);
		} else {
			return ['pending', 'processing'].includes(booking.status);
		}
	};

	if (isLoading) {
		return (
			<div className='container mx-auto px-4 py-12'>
				<div className='flex justify-center items-center h-64'>
					<Loader2 className='h-12 w-12 animate-spin text-primary' />
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='container mx-auto px-4 py-12'>
				<div className='text-center'>
					<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
					<h2 className='text-2xl font-bold text-red-600'>Error</h2>
					<p className='mt-2 text-muted-foreground'>Failed to load your bookings. Please try again later.</p>
					<Button className='mt-6' onClick={() => window.location.reload()}>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-12'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold'>My Bookings</h1>
				<p className='text-muted-foreground mt-2'>View and manage your travel bookings</p>
			</div>

			{combinedBookings.length === 0 ? (
				<div className='text-center py-16 bg-muted/30 rounded-lg'>
					<h3 className='text-xl font-medium mb-2'>No bookings found</h3>
					<p className='text-muted-foreground mb-6'>You haven't made any bookings yet.</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button onClick={() => (window.location.href = '/destinations')}>Explore Destinations</Button>
						<Button variant='outline' onClick={() => (window.location.href = '/visas')}>
							Browse Visa Services
						</Button>
					</div>
				</div>
			) : (
				<>
					{/* Filters and Search */}
					<div className='mb-6 flex flex-col md:flex-row gap-4'>
						<div className='relative flex-grow'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input placeholder='Search bookings...' value={searchQuery} onChange={handleSearch} className='pl-10' />
						</div>
						<div className='flex gap-3'>
							<Select value={sortBy} onValueChange={setSortBy}>
								<SelectTrigger className='w-[180px]'>
									<SelectValue placeholder='Sort by' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='newest'>Newest First</SelectItem>
									<SelectItem value='oldest'>Oldest First</SelectItem>
									<SelectItem value='price-high'>Price: High to Low</SelectItem>
									<SelectItem value='price-low'>Price: Low to High</SelectItem>
									<SelectItem value='travel-date'>Travel Date</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Tabs */}
					<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
						<TabsList className='mb-6 grid grid-cols-5 md:w-auto'>
							<TabsTrigger value='all' className='flex items-center gap-1'>
								<Globe className='h-4 w-4' />
								<span className='hidden sm:inline'>All</span>
							</TabsTrigger>
							<TabsTrigger value='active' className='flex items-center gap-1'>
								<CheckCircle2 className='h-4 w-4' />
								<span className='hidden sm:inline'>Active</span>
							</TabsTrigger>
							<TabsTrigger value='past' className='flex items-center gap-1'>
								<Clock className='h-4 w-4' />
								<span className='hidden sm:inline'>Past</span>
							</TabsTrigger>
							<TabsTrigger value='destination' className='flex items-center gap-1'>
								<MapPinIcon className='h-4 w-4' />
								<span className='hidden sm:inline'>Trips</span>
							</TabsTrigger>
							<TabsTrigger value='visa' className='flex items-center gap-1'>
								<Passport className='h-4 w-4' />
								<span className='hidden sm:inline'>Visas</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value={activeTab}>
							<AnimatePresence>
								{filteredBookings.length > 0 ? (
									<div className='grid gap-6'>
										{filteredBookings.map((booking, index) => (
											<motion.div
												key={`${booking.type}-${booking._id}`}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3, delay: index * 0.05 }}>
												{booking.type === BookingType.DESTINATION ? (
													<DestinationBookingCard
														booking={booking}
														onCancel={() => {
															setBookingToCancel(booking);
															setBookingTypeToCancel(BookingType.DESTINATION);
														}}
														formatDate={formatDate}
														formatPrice={formatPrice}
														getStatusBadge={getStatusBadge}
														getPaymentStatusBadge={getPaymentStatusBadge}
														canCancel={canCancelBooking(booking)}
													/>
												) : (
													<VisaBookingCard
														booking={booking}
														onCancel={() => {
															setBookingToCancel(booking);
															setBookingTypeToCancel(BookingType.VISA);
														}}
														formatDate={formatDate}
														formatPrice={formatPrice}
														getStatusBadge={getStatusBadge}
														getPaymentStatusBadge={getPaymentStatusBadge}
														canCancel={canCancelBooking(booking)}
													/>
												)}
											</motion.div>
										))}
									</div>
								) : (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className='text-center py-10 bg-muted/30 rounded-lg'>
										<p className='text-muted-foreground'>No bookings found matching your criteria</p>
										{searchQuery && (
											<Button variant='ghost' className='mt-2' onClick={() => setSearchQuery('')}>
												Clear search
											</Button>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</TabsContent>
					</Tabs>
				</>
			)}

			{/* Cancel Booking Dialog */}
			<AlertDialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel {bookingTypeToCancel === BookingType.VISA ? 'Visa ' : ''}Booking</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel this {bookingTypeToCancel === BookingType.VISA ? 'visa ' : ''}booking?
							This action cannot be undone.
							{bookingToCancel?.pricing?.paymentStatus === 'paid' && (
								<p className='mt-2 text-amber-600'>Your payment will be refunded according to our refund policy.</p>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep Booking</AlertDialogCancel>
						<AlertDialogAction onClick={handleCancelBooking} className='bg-red-500 hover:bg-red-600'>
							{cancelBooking.isPending || cancelVisaBooking.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Cancelling...
								</>
							) : (
								<>Cancel Booking</>
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

// Destination Booking Card Component
const DestinationBookingCard = ({
	booking,
	onCancel,
	formatDate,
	formatPrice,
	getStatusBadge,
	getPaymentStatusBadge,
	canCancel,
}) => {
	return (
		<Card className='overflow-hidden hover:shadow-md transition-shadow duration-300 p-0'>
			<CardContent className='p-0'>
				<div className='flex flex-col md:flex-row'>
					{/* Left side - Image */}
					<div className='w-full md:w-1/4 h-48 md:h-auto relative'>
						<div className='absolute top-0 left-0 bg-primary/80 text-white text-xs px-2 py-1 rounded-br-md'>
							Trip Booking
						</div>
						<img
							src={booking.destinationDetails?.image || '/placeholder.svg?height=200&width=200'}
							alt={booking.destinationDetails?.title || 'Destination'}
							className='w-full h-full object-cover'
						/>
						<div className='absolute top-2 right-2'>{getStatusBadge(booking.status, BookingType.DESTINATION)}</div>
					</div>

					{/* Right side - Content */}
					<div className='flex-1 p-6'>
						<div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
							<div>
								<h3 className='text-xl font-bold'>{booking.destinationDetails?.title}</h3>
								<div className='flex items-center text-muted-foreground mt-1'>
									<MapPinIcon className='h-4 w-4 mr-1' />
									<span className='text-sm'>{booking.destinationDetails?.location}</span>
								</div>
							</div>
							<div className='text-right'>
								<div className='text-sm text-muted-foreground'>Booking Reference</div>
								<div className='font-medium'>{booking._id.substring(0, 8).toUpperCase()}</div>
							</div>
						</div>

						<Separator className='my-4' />

						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div>
								<div className='flex items-center gap-1 text-sm text-muted-foreground'>
									<CalendarIcon className='h-4 w-4' />
									<span>Travel Date</span>
								</div>
								<div className='font-medium'>{formatDate(booking.travelDate)}</div>
							</div>

							<div>
								<div className='flex items-center gap-1 text-sm text-muted-foreground'>
									<Clock className='h-4 w-4' />
									<span>Duration</span>
								</div>
								<div className='font-medium'>
									{booking.destinationDetails?.duration?.days} days / {booking.destinationDetails?.duration?.nights}{' '}
									nights
								</div>
							</div>

							<div>
								<div className='flex items-center gap-1 text-sm text-muted-foreground'>
									<Users className='h-4 w-4' />
									<span>Travelers</span>
								</div>
								<div className='font-medium'>
									{booking.numberOfTravelers?.adults} {booking.numberOfTravelers?.adults === 1 ? 'adult' : 'adults'}
									{booking.numberOfTravelers?.children > 0
										? `, ${booking.numberOfTravelers.children} ${
												booking.numberOfTravelers.children === 1 ? 'child' : 'children'
										  }`
										: ''}
								</div>
							</div>
						</div>

						<div className='flex flex-col md:flex-row md:items-center justify-between mt-6'>
							<div className='flex items-center gap-2 mb-4 md:mb-0'>
								<div className='flex items-center gap-1'>
									<CreditCard className='h-4 w-4 text-muted-foreground' />
									<span className='text-sm text-muted-foreground'>Payment:</span>
								</div>
								<div>{getPaymentStatusBadge(booking.pricing?.paymentStatus)}</div>
								<div className='font-medium ml-2'>
									{formatPrice(booking.pricing?.totalPrice, booking.pricing?.currency)}
								</div>
							</div>

							{canCancel && (
								<Button variant='outline' size='sm' className='text-red-500 border-red-200' onClick={onCancel}>
									<XCircle className='h-4 w-4 mr-2' />
									Cancel Booking
								</Button>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

// Visa Booking Card Component
const VisaBookingCard = ({
	booking,
	onCancel,
	formatDate,
	formatPrice,
	getStatusBadge,
	getPaymentStatusBadge,
	canCancel,
}) => {
	return (
		<Card className='overflow-hidden hover:shadow-md transition-shadow duration-300 p-0'>
			<CardContent className='p-0'>
				<div className='flex flex-col md:flex-row'>
					{/* Left side - Image */}
					<div className='w-full md:w-1/4 h-48 md:h-auto relative'>
						<div className='absolute top-0 left-0 bg-indigo-600/80 text-white text-xs px-2 py-1 rounded-br-md'>
							Visa Booking
						</div>
						<img
							src={booking.visaDetails?.image || '/placeholder.svg?height=200&width=200'}
							alt={booking.visaDetails?.title || 'Visa'}
							className='w-full h-full object-cover'
						/>
						<div className='absolute top-2 right-2'>{getStatusBadge(booking.status, BookingType.VISA)}</div>
					</div>

					{/* Right side - Content */}
					<div className='flex-1 p-6'>
						<div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
							<div>
								<h3 className='text-xl font-bold'>{booking.visaDetails?.title}</h3>
								<div className='flex items-center text-muted-foreground mt-1'>
									<ArrowRightLeft className='h-4 w-4 mr-1' />
									<span className='text-sm'>
										{booking.visaDetails?.from} to {booking.visaDetails?.to}
									</span>
								</div>
							</div>
							<div className='text-right'>
								<div className='text-sm text-muted-foreground'>Booking Reference</div>
								<div className='font-medium'>{booking._id.substring(0, 8).toUpperCase()}</div>
							</div>
						</div>

						<Separator className='my-4' />

						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div>
								<div className='flex items-center gap-1 text-sm text-muted-foreground'>
									<CalendarIcon className='h-4 w-4' />
									<span>Travel Date</span>
								</div>
								<div className='font-medium'>{formatDate(booking.travelDate)}</div>
							</div>

							<div>
								<div className='flex items-center gap-1 text-sm text-muted-foreground'>
									<Clock className='h-4 w-4' />
									<span>Processing Time</span>
								</div>
								<div className='font-medium'>{booking.visaDetails?.processingTime || 'Standard processing'}</div>
							</div>

							<div>
								<div className='flex items-center gap-1 text-sm text-muted-foreground'>
									<Passport className='h-4 w-4' />
									<span>Applicant</span>
								</div>
								<div className='font-medium'>
									{booking.firstName} {booking.lastName}
								</div>
							</div>
						</div>

						<div className='flex flex-col md:flex-row md:items-center justify-between mt-6'>
							<div className='flex items-center gap-2 mb-4 md:mb-0'>
								<div className='flex items-center gap-1'>
									<CreditCard className='h-4 w-4 text-muted-foreground' />
									<span className='text-sm text-muted-foreground'>Payment:</span>
								</div>
								<div>{getPaymentStatusBadge(booking.pricing?.paymentStatus)}</div>
								<div className='font-medium ml-2'>
									{formatPrice(booking.pricing?.totalPrice, booking.pricing?.currency)}
								</div>
							</div>

							{canCancel && (
								<Button variant='outline' size='sm' className='text-red-500 border-red-200' onClick={onCancel}>
									<XCircle className='h-4 w-4 mr-2' />
									Cancel Booking
								</Button>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default MyBookings;
