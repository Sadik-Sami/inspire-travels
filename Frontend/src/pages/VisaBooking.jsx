'use client';

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useVisaQuery from '@/hooks/useVisaQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, MapPin, FileText, AlertCircle, ChevronLeft, Loader2, Check } from 'lucide-react';

const VisaBooking = () => {
	const { slug } = useParams();
	const navigate = useNavigate();
	const { useGetVisaBySlug } = useVisaQuery();
	const { data: visa, isLoading, isError } = useGetVisaBySlug(slug);
	const { user, isAuthenticated } = useAuth();

	const [formData, setFormData] = useState({
		firstName: user?.firstName || '',
		lastName: user?.lastName || '',
		email: user?.email || '',
		phone: user?.phone || '',
		nationality: '',
		passportNumber: '',
		travelDate: '',
		specialRequests: '',
		agreeToTerms: false,
	});

	const [selectedDate, setSelectedDate] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [bookingComplete, setBookingComplete] = useState(false);

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

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handleDateSelect = (date) => {
		setSelectedDate(date);
		setFormData({
			...formData,
			travelDate: format(date, 'yyyy-MM-dd'),
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate form
		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.email ||
			!formData.phone ||
			!formData.nationality ||
			!formData.passportNumber ||
			!formData.travelDate ||
			!formData.agreeToTerms
		) {
			alert('Please fill in all required fields');
			return;
		}

		setIsSubmitting(true);

		// Simulate API call
		setTimeout(() => {
			setIsSubmitting(false);
			setBookingComplete(true);
		}, 1500);
	};

	if (isLoading) {
		return (
			<div className='container mx-auto px-4 py-8 max-w-7xl'>
				<div className='flex justify-center items-center h-64'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			</div>
		);
	}

	if (isError || !visa) {
		return (
			<div className='container mx-auto px-4 py-12'>
				<div className='text-center'>
					<AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
					<h2 className='text-2xl font-bold mb-4'>Visa Package Not Found</h2>
					<p className='text-muted-foreground mb-8'>
						The visa package you're looking for doesn't exist or has been removed.
					</p>
					<Button variant='outline' onClick={() => navigate('/visas')}>
						<ChevronLeft size={16} className='mr-2' />
						Back to Visa Packages
					</Button>
				</div>
			</div>
		);
	}

	if (bookingComplete) {
		return (
			<div className='bg-background min-h-screen py-12'>
				<div className='container mx-auto px-4'>
					<div className='max-w-2xl mx-auto bg-card rounded-lg shadow-md p-8 text-center'>
						<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
							<Check className='h-8 w-8 text-green-600' />
						</div>
						<h1 className='text-2xl font-bold mb-4'>Booking Successful!</h1>
						<p className='text-muted-foreground mb-6'>
							Your visa application for {visa.from} to {visa.to} has been submitted successfully. We'll contact you
							shortly with further instructions.
						</p>
						<div className='bg-muted p-4 rounded-lg mb-6'>
							<h2 className='font-semibold mb-2'>Booking Details</h2>
							<p className='text-muted-foreground'>Visa Package: {visa.title}</p>
							<p className='text-muted-foreground'>
								Name: {formData.firstName} {formData.lastName}
							</p>
							<p className='text-muted-foreground'>Email: {formData.email}</p>
							<p className='text-muted-foreground'>Travel Date: {formData.travelDate}</p>
						</div>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Button asChild>
								<Link to='/visas'>Browse More Visas</Link>
							</Button>
							<Button variant='outline' asChild>
								<Link to='/'>Return to Home</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-background min-h-screen'>
			<div className='container mx-auto px-4 py-8'>
				<div className='mb-6'>
					<Button
						variant='ghost'
						className='flex items-center gap-1 text-muted-foreground'
						onClick={() => navigate(`/visas/details/${slug}`)}>
						<ChevronLeft size={16} />
						Back to Visa Details
					</Button>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					<div className='lg:col-span-2'>
						<Card>
							<CardHeader>
								<CardTitle>Book Visa Package</CardTitle>
								<CardDescription>Fill in your details to book this visa package</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} id='booking-form'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
										<div className='space-y-2'>
											<Label htmlFor='firstName'>
												First Name <span className='text-red-500'>*</span>
											</Label>
											<Input
												id='firstName'
												name='firstName'
												value={formData.firstName}
												onChange={handleChange}
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='lastName'>
												Last Name <span className='text-red-500'>*</span>
											</Label>
											<Input id='lastName' name='lastName' value={formData.lastName} onChange={handleChange} required />
										</div>
										<div className='space-y-2'>
											<Label htmlFor='email'>
												Email <span className='text-red-500'>*</span>
											</Label>
											<Input
												type='email'
												id='email'
												name='email'
												value={formData.email}
												onChange={handleChange}
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='phone'>
												Phone <span className='text-red-500'>*</span>
											</Label>
											<Input
												type='tel'
												id='phone'
												name='phone'
												value={formData.phone}
												onChange={handleChange}
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='nationality'>
												Nationality <span className='text-red-500'>*</span>
											</Label>
											<Input
												id='nationality'
												name='nationality'
												value={formData.nationality}
												onChange={handleChange}
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='passportNumber'>
												Passport Number <span className='text-red-500'>*</span>
											</Label>
											<Input
												id='passportNumber'
												name='passportNumber'
												value={formData.passportNumber}
												onChange={handleChange}
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='travelDate'>
												Expected Travel Date <span className='text-red-500'>*</span>
											</Label>
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
									</div>

									<div className='space-y-2 mb-6'>
										<Label htmlFor='specialRequests'>Special Requests or Notes</Label>
										<Textarea
											id='specialRequests'
											name='specialRequests'
											value={formData.specialRequests}
											onChange={handleChange}
											rows={4}
											placeholder='Any special requirements or additional information'
										/>
									</div>

									<div className='flex items-center space-x-2 mb-6'>
										<Checkbox
											id='agreeToTerms'
											name='agreeToTerms'
											checked={formData.agreeToTerms}
											onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked })}
											required
										/>
										<Label htmlFor='agreeToTerms' className='text-sm'>
											I agree to the{' '}
											<Link to='/terms' className='text-primary hover:underline'>
												Terms and Conditions
											</Link>{' '}
											and{' '}
											<Link to='/privacy' className='text-primary hover:underline'>
												Privacy Policy
											</Link>
										</Label>
									</div>
								</form>
							</CardContent>
							<CardFooter>
								<Button type='submit' form='booking-form' disabled={isSubmitting} className='w-full'>
									{isSubmitting ? (
										<>
											<Loader2 className='animate-spin h-5 w-5 mr-2' />
											<span>Processing...</span>
										</>
									) : (
										'Complete Booking'
									)}
								</Button>
							</CardFooter>
						</Card>
					</div>

					<div className='lg:col-span-1'>
						<Card className='sticky top-8'>
							<CardHeader>
								<CardTitle>Booking Summary</CardTitle>
								<CardDescription>Your visa package details</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								<div className='flex items-start gap-4 pb-4 border-b'>
									<img
										src={
											visa.coverImage?.url ||
											(visa.images && visa.images.length > 0
												? visa.images[0].url
												: '/placeholder.svg?height=80&width=80')
										}
										alt={visa.title}
										className='w-20 h-20 object-cover rounded-md'
									/>
									<div>
										<h3 className='font-semibold'>{visa.title}</h3>
										<div className='flex items-center text-sm text-muted-foreground mt-1'>
											<MapPin size={14} className='mr-1' />
											<span>
												{visa.from} to {visa.to}
											</span>
										</div>
									</div>
								</div>

								<div className='space-y-3'>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>Package Price</span>
										<span className='font-medium'>
											{getCurrencySymbol(visa.pricing.currency)}
											{visa.pricing.basePrice}
										</span>
									</div>
									{visa.pricing.discountedPrice < visa.pricing.basePrice && (
										<div className='flex justify-between text-green-600'>
											<span>Discount</span>
											<span>
												-{getCurrencySymbol(visa.pricing.currency)}
												{(visa.pricing.basePrice - visa.pricing.discountedPrice).toFixed(2)}
											</span>
										</div>
									)}
									<Separator />
									<div className='flex justify-between font-bold text-lg'>
										<span>Total</span>
										<span className='text-primary'>
											{getCurrencySymbol(visa.pricing.currency)}
											{visa.pricing.discountedPrice < visa.pricing.basePrice
												? visa.pricing.discountedPrice
												: visa.pricing.basePrice}
										</span>
									</div>
								</div>

								<div className='bg-primary/5 p-4 rounded-lg space-y-2'>
									<h3 className='font-semibold'>Important Information</h3>
									<ul className='text-sm text-muted-foreground space-y-2'>
										<li className='flex items-start'>
											<Clock size={16} className='mr-2 text-primary flex-shrink-0 mt-0.5' />
											<span>Processing time: {visa.processingTime || 'Contact for details'}</span>
										</li>
										<li className='flex items-start'>
											<AlertCircle size={16} className='mr-2 text-primary flex-shrink-0 mt-0.5' />
											<span>Passport must be valid for at least 6 months beyond your travel date</span>
										</li>
										<li className='flex items-start'>
											<FileText size={16} className='mr-2 text-primary flex-shrink-0 mt-0.5' />
											<span>Additional documentation may be required</span>
										</li>
									</ul>
								</div>

								<div className='text-sm text-muted-foreground'>
									Need assistance? Contact our support team at{' '}
									<a href='mailto:support@example.com' className='text-primary hover:underline'>
										support@example.com
									</a>{' '}
									or call{' '}
									<a href='tel:+1234567890' className='text-primary hover:underline'>
										+1 (234) 567-890
									</a>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VisaBooking;
