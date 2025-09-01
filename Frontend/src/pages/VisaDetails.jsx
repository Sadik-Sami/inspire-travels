import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useVisaQuery from '@/hooks/useVisaQuery';
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
import { CalendarIcon, Clock, MapPin, CheckCircle, ArrowRight, AlertCircle, ChevronLeft } from 'lucide-react';

const VisaDetails = () => {
	const { slug } = useParams();
	const navigate = useNavigate();
	const { useGetVisaBySlug } = useVisaQuery();
	const { data: visa, isLoading, isError } = useGetVisaBySlug(slug);
	const { user, isAuthenticated } = useAuth();
	const [selectedDate, setSelectedDate] = useState(null);
	const [activeImage, setActiveImage] = useState(null);

	useEffect(() => {
		if (visa && visa.coverImage) {
			setActiveImage(visa.coverImage.url);
		} else if (visa && visa.images && visa.images.length > 0) {
			setActiveImage(visa.images[0].url);
		}
	}, [visa]);

	const handleDateSelect = (date) => {
		setSelectedDate(date);
	};

	const handleBookNow = () => {
		if (!isAuthenticated) {
			// Redirect to login page with return URL
			window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
			return;
		}

		navigate(`/visas/book/${slug}`);
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

	// Format dates
	const formatDate = (dateString) => {
		if (!dateString) return 'Not specified';
		return format(new Date(dateString), 'MMMM d, yyyy');
	};

	if (isLoading) {
		return <VisaSkeleton />;
	}

	if (isError || !visa) {
		return (
			<div className='container mx-auto px-4 py-12'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-red-600'>Error</h2>
					<p className='mt-2'>The visa package you're looking for doesn't exist or has been removed.</p>
					<Button className='mt-4' variant='outline' onClick={() => navigate('/visas')}>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			{/* Back Button */}
			<div className='mb-6'>
				<Button
					variant='ghost'
					className='flex items-center gap-1 text-muted-foreground'
					onClick={() => navigate('/visas')}>
					<ChevronLeft size={16} />
					Back to Visa Packages
				</Button>
			</div>

			{/* Hero Section with Image Carousel */}
			<div className='mb-8'>
				<Carousel className='w-full'>
					<CarouselContent>
						{visa.images && visa.images.length > 0 ? (
							visa.images.map((image, index) => (
								<CarouselItem key={index}>
									<div className='relative h-[60vh] w-full overflow-hidden rounded-xl'>
										<img
											src={image.url || '/placeholder.svg'}
											alt={`${visa.title} - Image ${index + 1}`}
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

			{/* Visa Header */}
			<div className='mb-8'>
				<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
					<div>
						<h1 className='text-3xl md:text-4xl font-bold'>{visa.title}</h1>
						<div className='flex items-center mt-2 text-muted-foreground'>
							<MapPin className='h-4 w-4 mr-1' />
							<span>
								<span className='font-medium'>{visa.from}</span> to <span className='font-medium'>{visa.to}</span>
							</span>
						</div>
					</div>
					<div className='flex flex-wrap gap-2'>
						{visa.featured && (
							<Badge variant='default' className='bg-amber-500 hover:bg-amber-600'>
								Featured
							</Badge>
						)}
					</div>
				</div>
				<p className='mt-4 text-lg'>{visa.shortDescription}</p>
			</div>

			{/* Main Content */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Left Column - Details */}
				<div className='lg:col-span-2'>
					<Tabs defaultValue='overview' className='w-full'>
						<TabsList className='grid grid-cols-2 mb-8'>
							<TabsTrigger value='overview'>Overview</TabsTrigger>
							<TabsTrigger value='requirements'>Requirements</TabsTrigger>
						</TabsList>

						{/* Overview Tab */}
						<TabsContent value='overview' className='space-y-6'>
							<div>
								<h2 className='text-2xl font-semibold mb-4'>About This Visa Package</h2>
								<div className='prose max-w-none text-foreground'>
									<p className='whitespace-pre-line'>{visa.description}</p>
								</div>
							</div>

							{visa.processingTime && (
								<div>
									<h3 className='text-xl font-semibold mb-3'>Processing Time</h3>
									<div className='flex items-start'>
										<Clock className='h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0' />
										<span>{visa.processingTime}</span>
									</div>
								</div>
							)}

							{visa.specialRequests && (
								<div>
									<h3 className='text-xl font-semibold mb-3'>Special Requests</h3>
									<div className='flex items-start'>
										<AlertCircle className='h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0' />
										<span>{visa.specialRequests}</span>
									</div>
								</div>
							)}
						</TabsContent>

						{/* Requirements Tab */}
						<TabsContent value='requirements' className='space-y-6'>
							<div>
								<h2 className='text-2xl font-semibold mb-4'>Visa Requirements</h2>
								{visa.requirements ? (
									<div className='space-y-4'>
										<div className='grid grid-cols-1 gap-4'>
											{visa.requirements.split(',').map((requirement, index) => (
												<div key={index} className='flex items-start'>
													<CheckCircle className='h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0' />
													<span>{requirement.trim()}</span>
												</div>
											))}
										</div>
									</div>
								) : (
									<p className='text-muted-foreground'>
										No specific requirements listed. Please contact us for details.
									</p>
								)}
							</div>

							<div>
								<h3 className='text-xl font-semibold mb-3'>Important Documents</h3>
								<div className='space-y-2'>
									<div className='flex items-start'>
										<CheckCircle className='h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0' />
										<span>Valid passport with at least 6 months validity</span>
									</div>
									<div className='flex items-start'>
										<CheckCircle className='h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0' />
										<span>Completed visa application form</span>
									</div>
									<div className='flex items-start'>
										<CheckCircle className='h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0' />
										<span>Passport-sized photographs</span>
									</div>
									<div className='flex items-start'>
										<CheckCircle className='h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0' />
										<span>Proof of travel arrangements</span>
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</div>

				{/* Right Column - Booking Card */}
				<div className='lg:col-span-1'>
					<Card className='sticky top-8'>
						<CardHeader>
							<CardTitle>Book This Visa</CardTitle>
							<CardDescription>Select your preferred travel date</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Price Display */}
							<div className='space-y-2'>
								<h3 className='font-medium'>Price</h3>
								<div className='p-4 border rounded-md bg-primary/5'>
									<div className='flex items-center justify-between'>
										<span className='text-muted-foreground'>Regular price</span>
										<span className='text-muted-foreground line-through'>
											{getCurrencySymbol(visa.pricing?.currency)}
											{visa.pricing?.basePrice?.toFixed(2)}
										</span>
									</div>

									<div className='flex items-center justify-between mt-1'>
										<div className='flex items-center'>
											<span className='font-medium'>Special price</span>
											{visa.discountPercentage > 0 && (
												<Badge variant='outline' className='ml-2 bg-green-50 text-green-700 border-green-200'>
													Save {visa.discountPercentage}%
												</Badge>
											)}
										</div>
										<span className='font-bold text-xl'>
											{getCurrencySymbol(visa.pricing?.currency)}
											{visa.pricing?.discountedPrice?.toFixed(2)}
										</span>
									</div>
								</div>
							</div>

							{/* Date Selection */}
							<div className='space-y-3'>
								<h3 className='font-medium'>Select Travel Date</h3>
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
										<Calendar mode='single' selected={selectedDate} onSelect={handleDateSelect} initialFocus />
									</PopoverContent>
								</Popover>
							</div>

							{/* Trip Details Summary */}
							<div className='space-y-2 pt-2'>
								<Separator />
								<div className='space-y-2'>
									<div className='flex justify-between items-center text-sm'>
										<span className='text-muted-foreground'>Processing Time</span>
										<span>{visa.processingTime || 'Contact for details'}</span>
									</div>

									<div className='flex justify-between items-center text-sm'>
										<span className='text-muted-foreground'>From</span>
										<span>{visa.from}</span>
									</div>

									<div className='flex justify-between items-center text-sm'>
										<span className='text-muted-foreground'>To</span>
										<span>{visa.to}</span>
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
		</div>
	);
};

// Loading skeleton
const VisaSkeleton = () => {
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
							{[1, 2].map((i) => (
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

export default VisaDetails;
