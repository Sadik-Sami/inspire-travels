'use client';

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useDestinationDetail } from '../hooks/useDestinationQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import BookingForm from '@/components/booking/BookingForm';
import {
	CalendarIcon,
	Clock,
	MapPin,
	Users,
	Utensils,
	Building,
	Car,
	CheckCircle,
	ArrowRight,
	CalendarPlus2Icon as CalendarIcon2,
	Wifi,
	Snowflake,
	CarIcon,
	PocketIcon as Pool,
	Dumbbell,
	UtensilsCrossed,
	Wine,
	BedDouble,
	Shirt,
	ShipWheelIcon as Wheelchair,
	ExternalLink,
} from 'lucide-react';

const DestinationDetails = () => {
	const { id } = useParams();
	const { data: destination, isLoading, error } = useDestinationDetail(id);
	const { user, isAuthenticated } = useAuth();
	const [selectedDate, setSelectedDate] = useState(null);
	const [showBookingForm, setShowBookingForm] = useState(false);

	if (isLoading) {
		return <DestinationSkeleton />;
	}

	if (error) {
		return (
			<div className='container mx-auto px-4 py-12'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-red-600'>Error</h2>
					<p className='mt-2'>{error}</p>
					<Button className='mt-4' variant='outline' onClick={() => window.history.back()}>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	if (!destination) {
		return (
			<div className='container mx-auto px-4 py-12'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold'>Destination Not Found</h2>
					<Button className='mt-4' variant='outline' onClick={() => window.history.back()}>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	const handleDateSelect = (date) => {
		setSelectedDate(date);
	};

	const handleBookNow = () => {
		if (!isAuthenticated) {
			// Redirect to login page with return URL
			window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
			return;
		}

		setShowBookingForm(true);
	};

	// Format dates
	const formatDate = (dateString) => {
		if (!dateString) return 'Not specified';
		return format(new Date(dateString), 'MMMM d, yyyy');
	};

	// Calculate savings
	const savings = destination.pricing?.basePrice - destination.pricing?.discountedPrice || 0;
	const savingsPercentage =
		destination.discountPercentage ||
		(destination.pricing?.basePrice ? Math.round((savings / destination.pricing.basePrice) * 100) : 0);

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			{/* Hero Section with Image Carousel */}
			<div className='mb-8'>
				<Carousel className='w-full'>
					<CarouselContent>
						{destination.images && destination.images.length > 0 ? (
							destination.images.map((image, index) => (
								<CarouselItem key={index}>
									<div className='relative h-[60vh] w-full overflow-hidden rounded-xl'>
										<img
											src={image.url || '/placeholder.svg'}
											alt={`${destination.title} - Image ${index + 1}`}
											className='h-full w-full object-cover'
										/>
									</div>
								</CarouselItem>
							))
						) : (
							<CarouselItem>
								<div className='relative h-[60vh] w-full overflow-hidden rounded-xl bg-muted flex items-center justify-center'>
									<p className='text-muted-foreground'>No images available</p>
								</div>
							</CarouselItem>
						)}
					</CarouselContent>
					<CarouselPrevious className='left-4' />
					<CarouselNext className='right-4' />
				</Carousel>
			</div>

			{/* Destination Header */}
			<div className='mb-8'>
				<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
					<div>
						<h1 className='text-3xl md:text-4xl font-bold'>{destination.title}</h1>
						<div className='flex items-center mt-2 text-muted-foreground'>
							<MapPin className='h-4 w-4 mr-1' />
							<span>
								{destination.location?.from && destination.location?.to
									? `${destination.location.from} to ${destination.location.to}`
									: destination.location?.address || 'Location not specified'}
							</span>
							{destination.location?.mapLink && (
								<a
									href={destination.location.mapLink}
									target='_blank'
									rel='noopener noreferrer'
									className='ml-2 inline-flex items-center text-primary hover:underline'>
									View on Map <ExternalLink className='h-3 w-3 ml-1' />
								</a>
							)}
						</div>
					</div>
					<div className='flex flex-wrap gap-2'>
						{destination.categories?.map((category, index) => (
							<Badge key={index} variant='secondary'>
								{category}
							</Badge>
						))}
						{destination.isFeatured && (
							<Badge variant='default' className='bg-amber-500 hover:bg-amber-600'>
								Featured
							</Badge>
						)}
						{destination.isPopular && (
							<Badge variant='default' className='bg-purple-500 hover:bg-purple-600'>
								Popular
							</Badge>
						)}
					</div>
				</div>
				<p className='mt-4 text-lg'>{destination.summary}</p>
			</div>

			{/* Main Content */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Left Column - Details */}
				<div className='lg:col-span-2'>
					<Tabs defaultValue='overview' className='w-full'>
						<TabsList className='grid grid-cols-3 mb-8'>
							<TabsTrigger value='overview'>Overview</TabsTrigger>
							<TabsTrigger value='details'>Details</TabsTrigger>
							<TabsTrigger value='amenities'>Amenities</TabsTrigger>
						</TabsList>

						{/* Overview Tab */}
						<TabsContent value='overview' className='space-y-6'>
							<div>
								<h2 className='text-2xl font-semibold mb-4'>About This Destination</h2>
								<div className='prose max-w-none' dangerouslySetInnerHTML={{ __html: destination.description }} />
							</div>

							<div>
								<h3 className='text-xl font-semibold mb-3'>Key Highlights</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									{destination.advantages?.map((advantage, index) => (
										<div key={index} className='flex items-start'>
											<CheckCircle className='h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0' />
											<span>{advantage}</span>
										</div>
									))}
								</div>
							</div>

							{destination.features && destination.features.length > 0 && (
								<div>
									<h3 className='text-xl font-semibold mb-3'>Special Features</h3>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{destination.features.map((feature, index) => (
											<div key={index} className='flex items-start'>
												<CheckCircle className='h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0' />
												<span>{feature}</span>
											</div>
										))}
									</div>
								</div>
							)}

							{destination.activities && destination.activities.length > 0 && (
								<div>
									<h3 className='text-xl font-semibold mb-3'>Activities</h3>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{destination.activities.map((activity, index) => (
											<div key={index} className='flex items-start'>
												<CheckCircle className='h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0' />
												<span>{activity}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</TabsContent>

						{/* Details Tab */}
						<TabsContent value='details' className='space-y-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-lg'>Duration</CardTitle>
									</CardHeader>
									<CardContent className='flex items-center'>
										<Clock className='h-5 w-5 mr-2 text-muted-foreground' />
										<div>
											<p>
												{destination.duration?.days} days / {destination.duration?.nights} nights
											</p>
											{destination.duration?.flexible && (
												<p className='text-sm text-muted-foreground'>Flexible duration available</p>
											)}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-lg'>Dates</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='space-y-1'>
											<div className='flex items-center'>
												<CalendarIcon2 className='h-4 w-4 mr-2 text-muted-foreground' />
												<span className='text-sm'>Start: {formatDate(destination.dates?.startDate)}</span>
											</div>
											<div className='flex items-center'>
												<CalendarIcon2 className='h-4 w-4 mr-2 text-muted-foreground' />
												<span className='text-sm'>End: {formatDate(destination.dates?.endDate)}</span>
											</div>
											{destination.dates?.bookingDeadline && (
												<div className='flex items-center text-amber-600'>
													<CalendarIcon2 className='h-4 w-4 mr-2' />
													<span className='text-sm'>Book by: {formatDate(destination.dates.bookingDeadline)}</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-lg'>Group Size</CardTitle>
									</CardHeader>
									<CardContent className='flex items-center'>
										<Users className='h-5 w-5 mr-2 text-muted-foreground' />
										<div>
											<p>
												{destination.groupSize?.min}-{destination.groupSize?.max} people
											</p>
											{destination.groupSize?.privateAvailable && (
												<p className='text-sm text-muted-foreground'>Private tours available</p>
											)}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-lg'>Accommodation</CardTitle>
									</CardHeader>
									<CardContent className='flex items-start'>
										<Building className='h-5 w-5 mr-2 text-muted-foreground mt-0.5' />
										<div>
											<div className='flex items-center'>
												<span>{destination.accommodation?.type || 'Hotel'}</span>
												{destination.accommodation?.rating && (
													<div className='ml-2 flex'>
														{[...Array(destination.accommodation.rating)].map((_, i) => (
															<span key={i} className='text-yellow-500'>
																★
															</span>
														))}
													</div>
												)}
											</div>
											<p className='text-sm text-muted-foreground mt-1'>{destination.accommodation?.details}</p>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-lg'>Transportation</CardTitle>
									</CardHeader>
									<CardContent className='flex items-start'>
										<Car className='h-5 w-5 mr-2 text-muted-foreground mt-0.5' />
										<div>
											<p>{destination.transportation?.type || 'Not specified'}</p>
											<p className='text-sm text-muted-foreground mt-1'>{destination.transportation?.details}</p>
											{destination.transportation?.included && (
												<p className='text-sm text-green-600 mt-1'>Included in package</p>
											)}
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-lg'>Meals</CardTitle>
									</CardHeader>
									<CardContent className='flex items-start'>
										<Utensils className='h-5 w-5 mr-2 text-muted-foreground mt-0.5' />
										<div>
											<p>{destination.meals?.details || 'Not specified'}</p>
											{destination.meals?.included && (
												<p className='text-sm text-green-600 mt-1'>Included in package</p>
											)}
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						{/* Amenities Tab */}
						<TabsContent value='amenities' className='space-y-6'>
							<h2 className='text-2xl font-semibold mb-4'>Amenities & Facilities</h2>

							<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
								{destination.amenities?.wifi && (
									<div className='flex items-center p-3 border rounded-md'>
										<Wifi className='h-5 w-5 mr-2 text-blue-500' />
										<span>WiFi</span>
									</div>
								)}

								{destination.amenities?.airConditioning && (
									<div className='flex items-center p-3 border rounded-md'>
										<Snowflake className='h-5 w-5 mr-2 text-blue-500' />
										<span>Air Conditioning</span>
									</div>
								)}

								{destination.amenities?.parking && (
									<div className='flex items-center p-3 border rounded-md'>
										<CarIcon className='h-5 w-5 mr-2 text-blue-500' />
										<span>Parking</span>
									</div>
								)}

								{destination.amenities?.pool && (
									<div className='flex items-center p-3 border rounded-md'>
										<Pool className='h-5 w-5 mr-2 text-blue-500' />
										<span>Swimming Pool</span>
									</div>
								)}

								{destination.amenities?.spa && (
									<div className='flex items-center p-3 border rounded-md'>
										<CheckCircle className='h-5 w-5 mr-2 text-blue-500' />
										<span>Spa</span>
									</div>
								)}

								{destination.amenities?.gym && (
									<div className='flex items-center p-3 border rounded-md'>
										<Dumbbell className='h-5 w-5 mr-2 text-blue-500' />
										<span>Gym</span>
									</div>
								)}

								{destination.amenities?.restaurant && (
									<div className='flex items-center p-3 border rounded-md'>
										<UtensilsCrossed className='h-5 w-5 mr-2 text-blue-500' />
										<span>Restaurant</span>
									</div>
								)}

								{destination.amenities?.bar && (
									<div className='flex items-center p-3 border rounded-md'>
										<Wine className='h-5 w-5 mr-2 text-blue-500' />
										<span>Bar</span>
									</div>
								)}

								{destination.amenities?.roomService && (
									<div className='flex items-center p-3 border rounded-md'>
										<BedDouble className='h-5 w-5 mr-2 text-blue-500' />
										<span>Room Service</span>
									</div>
								)}

								{destination.amenities?.laundry && (
									<div className='flex items-center p-3 border rounded-md'>
										<Shirt className='h-5 w-5 mr-2 text-blue-500' />
										<span>Laundry</span>
									</div>
								)}

								{destination.amenities?.accessibility && (
									<div className='flex items-center p-3 border rounded-md'>
										<Wheelchair className='h-5 w-5 mr-2 text-blue-500' />
										<span>Accessibility</span>
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>
				</div>

				{/* Right Column - Booking Card */}
				<div className='lg:col-span-1'>
					<Card className='sticky top-8'>
						<CardHeader>
							<CardTitle>Book This Trip</CardTitle>
							<CardDescription>Select your preferred date</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Price Display */}
							<div className='space-y-2'>
								<h3 className='font-medium'>Price</h3>
								<div className='p-4 border rounded-md bg-primary/5'>
									<div className='flex items-center justify-between'>
										<span className='text-muted-foreground'>Regular price</span>
										<span className='text-muted-foreground line-through'>
											{destination.pricing?.currency || '$'}
											{destination.pricing?.basePrice?.toFixed(2)}
										</span>
									</div>

									<div className='flex items-center justify-between mt-1'>
										<div className='flex items-center'>
											<span className='font-medium'>Special price</span>
											{savingsPercentage > 0 && (
												<Badge variant='outline' className='ml-2 bg-green-50 text-green-700 border-green-200'>
													Save {savingsPercentage}%
												</Badge>
											)}
										</div>
										<span className='font-bold text-xl'>
											{destination.pricing?.currency || '$'}
											{destination.pricing?.discountedPrice?.toFixed(2)}
										</span>
									</div>

									<p className='text-xs text-muted-foreground mt-2'>
										{destination.pricing?.priceType === 'perPerson' ? 'Price per person' : 'Total price'}
									</p>
								</div>
							</div>

							{/* Date Selection */}
							<div className='space-y-3'>
								<h3 className='font-medium'>Select Date</h3>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant='outline'
											className={cn(
												'w-full justify-start text-left font-normal',
												!selectedDate && 'text-muted-foreground'
											)}>
											<CalendarIcon className='mr-2 h-4 w-4' />
											{selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0' align='start'>
										<Calendar
											mode='single'
											selected={selectedDate}
											onSelect={handleDateSelect}
											initialFocus
											disabled={(date) => {
												// Disable dates that are not in availableDates
												if (!destination.dates?.availableDates || destination.dates.availableDates.length === 0) {
													return false;
												}
												return !destination.dates.availableDates.some((availableDate) => {
													const dateObj = new Date(availableDate);
													return (
														date.getDate() === dateObj.getDate() &&
														date.getMonth() === dateObj.getMonth() &&
														date.getFullYear() === dateObj.getFullYear()
													);
												});
											}}
										/>
									</PopoverContent>
								</Popover>
								{destination.dates?.availableDates && destination.dates.availableDates.length > 0 && (
									<p className='text-xs text-muted-foreground'>Only highlighted dates are available for booking</p>
								)}

								{destination.dates?.bookingDeadline && (
									<p className='text-xs text-amber-600 flex items-center'>
										<CalendarIcon className='h-3 w-3 mr-1' />
										Book by {formatDate(destination.dates.bookingDeadline)}
									</p>
								)}
							</div>

							{/* Trip Details Summary */}
							<div className='space-y-2 pt-2'>
								<Separator />
								<div className='space-y-2'>
									<div className='flex justify-between items-center text-sm'>
										<span className='text-muted-foreground'>Duration</span>
										<span>
											{destination.duration?.days} days / {destination.duration?.nights} nights
										</span>
									</div>

									<div className='flex justify-between items-center text-sm'>
										<span className='text-muted-foreground'>Departure</span>
										<span>{destination.location?.from || 'Not specified'}</span>
									</div>

									<div className='flex justify-between items-center text-sm'>
										<span className='text-muted-foreground'>Destination</span>
										<span>{destination.location?.to || destination.location?.address || 'Not specified'}</span>
									</div>

									<div className='flex justify-between items-center text-sm'>
										<span className='text-muted-foreground'>Group Size</span>
										<span>
											{destination.groupSize?.min}-{destination.groupSize?.max} people
										</span>
									</div>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button className='w-full' size='lg' onClick={handleBookNow} disabled={!selectedDate}>
								Book Now <ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>

			{/* Booking Form Dialog */}
			{showBookingForm && (
				<BookingForm destination={destination} selectedDate={selectedDate} onClose={() => setShowBookingForm(false)} />
			)}
		</div>
	);
};

// Loading skeleton
const DestinationSkeleton = () => {
	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			<div className='mb-8'>
				<Skeleton className='h-[60vh] w-full rounded-xl' />
			</div>

			<div className='mb-8'>
				<Skeleton className='h-10 w-3/4 mb-2' />
				<Skeleton className='h-6 w-1/3 mb-4' />
				<Skeleton className='h-24 w-full' />
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2'>
					<div className='mb-6'>
						<div className='flex gap-4 mb-8'>
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className='h-10 w-24' />
							))}
						</div>
						<div className='space-y-4'>
							<Skeleton className='h-8 w-1/3 mb-2' />
							<Skeleton className='h-32 w-full' />
							<Skeleton className='h-8 w-1/3 mb-2' />
							<div className='grid grid-cols-2 gap-4'>
								{[1, 2, 3, 4].map((i) => (
									<Skeleton key={i} className='h-6 w-full' />
								))}
							</div>
						</div>
					</div>
				</div>

				<div className='lg:col-span-1'>
					<Skeleton className='h-[500px] w-full rounded-xl' />
				</div>
			</div>
		</div>
	);
};

export default DestinationDetails;
