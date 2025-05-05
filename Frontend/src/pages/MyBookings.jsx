'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useBookingQuery } from '@/hooks/useBookingQuery';
import { useBookingMutation } from '@/hooks/useBookingMutation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { CalendarIcon, MapPinIcon, Clock, Users, CreditCard, XCircle, Loader2 } from 'lucide-react';

const MyBookings = () => {
	const { userBookingsQuery } = useBookingQuery();
	const { cancelBooking } = useBookingMutation();
	const { data, isLoading, isError } = userBookingsQuery;
	const [bookingToCancel, setBookingToCancel] = useState(null);

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return 'Not specified';
		return format(new Date(dateString), 'MMMM d, yyyy');
	};

	// Format price
	const formatPrice = (price, currency = '$') => {
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

	// Handle cancel booking
	const handleCancelBooking = () => {
		if (!bookingToCancel) return;

		cancelBooking.mutate(bookingToCancel._id, {
			onSuccess: () => {
				toast.success('Booking cancelled successfully');
				setBookingToCancel(null);
			},
			onError: (error) => {
				toast.error(`Failed to cancel booking: ${error.response?.data?.message || 'Unknown error'}`);
			},
		});
	};

	// Filter bookings by status
	const getFilteredBookings = (status) => {
		if (!data?.bookings) return [];

		if (status === 'active') {
			return data.bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status));
		} else if (status === 'past') {
			return data.bookings.filter((booking) => ['completed', 'cancelled'].includes(booking.status));
		}

		return data.bookings;
	};

	if (isLoading) {
		return (
			<div className='container mx-auto px-4 py-12 max-w-5xl'>
				<div className='flex justify-center items-center h-64'>
					<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='container mx-auto px-4 py-12 max-w-5xl'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-red-600'>Error</h2>
					<p className='mt-2'>Failed to load your bookings. Please try again later.</p>
				</div>
			</div>
		);
	}

	const bookings = data?.bookings || [];

	return (
		<div className='container mx-auto px-4 py-12 max-w-5xl'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold'>My Bookings</h1>
				<p className='text-muted-foreground mt-2'>View and manage your trip bookings</p>
			</div>

			{bookings.length === 0 ? (
				<div className='text-center py-16 bg-muted/30 rounded-lg'>
					<h3 className='text-xl font-medium mb-2'>No bookings found</h3>
					<p className='text-muted-foreground mb-6'>You haven't made any bookings yet.</p>
					<Button onClick={() => (window.location.href = '/destinations')}>Explore Destinations</Button>
				</div>
			) : (
				<Tabs defaultValue='active' className='w-full'>
					<TabsList className='mb-6'>
						<TabsTrigger value='active'>Active Bookings</TabsTrigger>
						<TabsTrigger value='past'>Past Bookings</TabsTrigger>
						<TabsTrigger value='all'>All Bookings</TabsTrigger>
					</TabsList>

					<TabsContent value='active'>
						<div className='grid gap-6'>
							{getFilteredBookings('active').length > 0 ? (
								getFilteredBookings('active').map((booking) => (
									<BookingCard
										key={booking._id}
										booking={booking}
										onCancel={() => setBookingToCancel(booking)}
										formatDate={formatDate}
										formatPrice={formatPrice}
										getStatusBadge={getStatusBadge}
										getPaymentStatusBadge={getPaymentStatusBadge}
									/>
								))
							) : (
								<div className='text-center py-10 bg-muted/30 rounded-lg'>
									<p className='text-muted-foreground'>No active bookings found</p>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent value='past'>
						<div className='grid gap-6'>
							{getFilteredBookings('past').length > 0 ? (
								getFilteredBookings('past').map((booking) => (
									<BookingCard
										key={booking._id}
										booking={booking}
										onCancel={() => setBookingToCancel(booking)}
										formatDate={formatDate}
										formatPrice={formatPrice}
										getStatusBadge={getStatusBadge}
										getPaymentStatusBadge={getPaymentStatusBadge}
										isPast
									/>
								))
							) : (
								<div className='text-center py-10 bg-muted/30 rounded-lg'>
									<p className='text-muted-foreground'>No past bookings found</p>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent value='all'>
						<div className='grid gap-6'>
							{bookings.map((booking) => (
								<BookingCard
									key={booking._id}
									booking={booking}
									onCancel={() => setBookingToCancel(booking)}
									formatDate={formatDate}
									formatPrice={formatPrice}
									getStatusBadge={getStatusBadge}
									getPaymentStatusBadge={getPaymentStatusBadge}
									isPast={['completed', 'cancelled'].includes(booking.status)}
								/>
							))}
						</div>
					</TabsContent>
				</Tabs>
			)}

			{/* Cancel Booking Dialog */}
			<AlertDialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Booking</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel this booking? This action cannot be undone.
							{bookingToCancel?.pricing?.paymentStatus === 'paid' && (
								<p className='mt-2 text-amber-600'>Your payment will be refunded according to our refund policy.</p>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep Booking</AlertDialogCancel>
						<AlertDialogAction onClick={handleCancelBooking} className='bg-red-500 hover:bg-red-600'>
							{cancelBooking.isPending ? (
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

// Booking Card Component
const BookingCard = ({
	booking,
	onCancel,
	formatDate,
	formatPrice,
	getStatusBadge,
	getPaymentStatusBadge,
	isPast = false,
}) => {
	return (
		<Card className='overflow-hidden'>
			<div className='flex flex-col md:flex-row'>
				{/* Left side - Image */}
				<div className='w-full md:w-1/4 h-48 md:h-auto relative'>
					<img
						src={booking.destinationDetails?.image || '/placeholder.svg?height=200&width=200'}
						alt={booking.destinationDetails?.title || 'Destination'}
						className='w-full h-full object-cover'
					/>
					<div className='absolute top-2 right-2'>{getStatusBadge(booking.status)}</div>
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

						{!isPast && booking.status !== 'cancelled' && (
							<Button variant='outline' size='sm' className='text-red-500 border-red-200' onClick={onCancel}>
								<XCircle className='h-4 w-4 mr-2' />
								Cancel Booking
							</Button>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
};

export default MyBookings;
