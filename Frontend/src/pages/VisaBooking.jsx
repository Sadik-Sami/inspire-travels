'use client';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import useVisaQuery from '@/hooks/useVisaQuery';
import { useAuth } from '@/contexts/AuthContext';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
	CalendarIcon,
	Clock,
	MapPin,
	FileText,
	AlertCircle,
	ChevronLeft,
	Loader2,
	CreditCard,
	CheckCircle2,
} from 'lucide-react';

const VisaBooking = () => {
	const { slug } = useParams();
	const navigate = useNavigate();
	const { useGetVisaBySlug } = useVisaQuery();
	const { data: visa, isLoading, isError } = useGetVisaBySlug(slug);
	const { user, isAuthenticated } = useAuth();
	const axiosSecure = useAxiosSecure();

	// Form state
	const [formData, setFormData] = useState({
		firstName: user?.firstName || '',
		lastName: user?.lastName || '',
		email: user?.email || '',
		phone: user?.phone || '',
		nationality: '',
		passportNumber: '',
		travelDate: null,
		specialRequests: '',
		agreeToTerms: false,
	});

	// UI state
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [bookingComplete, setBookingComplete] = useState(false);
	const [bookingData, setBookingData] = useState(null);

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
		setFormData({
			...formData,
			travelDate: date,
		});
	};

	// Navigate between steps
	const goToNextStep = () => {
		if (currentStep === 1) {
			// Validate personal information
			if (!formData.firstName.trim() || !formData.lastName.trim()) {
				toast.error('Please enter your full name');
				return;
			}
			if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
				toast.error('Please enter a valid email address');
				return;
			}
			if (!formData.phone.trim()) {
				toast.error('Please enter your phone number');
				return;
			}
			if (!formData.nationality.trim()) {
				toast.error('Please enter your nationality');
				return;
			}
			if (!formData.passportNumber.trim()) {
				toast.error('Please enter your passport number');
				return;
			}
		}

		if (currentStep === 2) {
			// Validate travel details
			if (!formData.travelDate) {
				toast.error('Please select a travel date');
				return;
			}
		}

		if (currentStep < 3) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const goToPreviousStep = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Final validation
		if (!formData.agreeToTerms) {
			toast.error('Please agree to the terms and conditions');
			return;
		}

		try {
			setIsSubmitting(true);

			const bookingData = {
				visaId: visa._id,
				firstName: formData.firstName,
				lastName: formData.lastName,
				email: formData.email,
				phone: formData.phone,
				nationality: formData.nationality,
				passportNumber: formData.passportNumber,
				travelDate: formData.travelDate,
				specialRequests: formData.specialRequests,
			};

			const response = await axiosSecure.post('/api/visa-bookings', bookingData);

			setBookingData(response.data.booking);
			setBookingComplete(true);
		} catch (error) {
			console.error('Error creating visa booking:', error);
			toast.error(error.response?.data?.message || 'Failed to create booking. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle view booking details
	const handleViewBookings = () => {
		navigate('/my-bookings');
	};

	// Animation variants
	const fadeIn = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { duration: 0.3 } },
		exit: { opacity: 0, transition: { duration: 0.2 } },
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
					<div className='max-w-2xl mx-auto bg-card rounded-lg shadow-md p-8'>
						<div className='flex flex-col items-center text-center mb-6'>
							<div className='h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
								<CheckCircle2 className='h-8 w-8 text-green-600' />
							</div>
							<h1 className='text-2xl font-bold mb-2'>Booking Successful!</h1>
							<p className='text-muted-foreground'>
								Your visa application for {visa.from} to {visa.to} has been submitted successfully. We'll contact you
								shortly with further instructions.
							</p>
						</div>

						<div className='bg-muted p-4 rounded-lg mb-6'>
							<h2 className='font-semibold mb-2'>Booking Details</h2>
							<div className='space-y-2 text-sm'>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Booking Reference</span>
									<span className='font-medium'>{bookingData?._id?.substring(0, 8).toUpperCase() || 'N/A'}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Visa Package</span>
									<span>{visa.title}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Name</span>
									<span>
										{formData.firstName} {formData.lastName}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Email</span>
									<span>{formData.email}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Travel Date</span>
									<span>{formData.travelDate ? format(formData.travelDate, 'PPP') : 'Not specified'}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Status</span>
									<Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200'>
										Pending
									</Badge>
								</div>
							</div>
						</div>

						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Button asChild>
								<a href='/my-bookings'>View My Bookings</a>
							</Button>
							<Button variant='outline' asChild>
								<a href='/visas'>Browse More Visas</a>
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
								<div className='flex items-center justify-between'>
									<div>
										<CardTitle>Book Visa Package</CardTitle>
										<CardDescription>Complete your visa booking in a few simple steps</CardDescription>
									</div>
									<div className='flex items-center gap-2'>
										{[1, 2, 3].map((step) => (
											<div
												key={step}
												className={cn(
													'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
													currentStep === step
														? 'bg-primary text-primary-foreground'
														: currentStep > step
														? 'bg-primary/20 text-primary'
														: 'bg-muted text-muted-foreground'
												)}>
												{step}
											</div>
										))}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} id='booking-form'>
									<AnimatePresence mode='wait'>
										{currentStep === 1 && (
											<motion.div
												key='step1'
												variants={fadeIn}
												initial='hidden'
												animate='visible'
												exit='exit'
												className='space-y-4'>
												<h2 className='text-lg font-semibold'>Personal Information</h2>

												<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
														<Input
															id='lastName'
															name='lastName'
															value={formData.lastName}
															onChange={handleChange}
															required
														/>
													</div>
												</div>

												<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
												</div>

												<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
												</div>
											</motion.div>
										)}

										{currentStep === 2 && (
											<motion.div
												key='step2'
												variants={fadeIn}
												initial='hidden'
												animate='visible'
												exit='exit'
												className='space-y-4'>
												<h2 className='text-lg font-semibold'>Travel Details</h2>

												<div className='space-y-4'>
													<div className='space-y-2'>
														<Label htmlFor='travelDate' className='mb-1 block'>
															Expected Travel Date <span className='text-red-500'>*</span>
														</Label>
														<Popover>
															<PopoverTrigger asChild>
																<Button
																	variant='outline'
																	className={cn(
																		'w-full justify-start text-left font-normal',
																		!formData.travelDate && 'text-muted-foreground'
																	)}>
																	<CalendarIcon className='mr-2 h-4 w-4' />
																	{formData.travelDate ? format(formData.travelDate, 'PPP') : 'Select a date'}
																</Button>
															</PopoverTrigger>
															<PopoverContent className='w-auto p-0' align='start'>
																<Calendar
																	mode='single'
																	selected={formData.travelDate}
																	onSelect={handleDateSelect}
																	initialFocus
																	disabled={(date) => date < new Date()}
																/>
															</PopoverContent>
														</Popover>
														<p className='text-xs text-muted-foreground mt-1'>
															Please select a date at least 2 weeks before your intended travel date to allow for visa
															processing.
														</p>
													</div>

													<div className='space-y-2'>
														<Label htmlFor='specialRequests'>Special Requests or Notes (Optional)</Label>
														<Textarea
															id='specialRequests'
															name='specialRequests'
															value={formData.specialRequests}
															onChange={handleChange}
															rows={4}
															placeholder='Any special requirements or additional information'
														/>
													</div>

													<div className='bg-muted/50 p-4 rounded-lg space-y-2'>
														<h3 className='font-medium text-sm'>Important Information</h3>
														<ul className='text-sm text-muted-foreground space-y-2'>
															<li className='flex items-start'>
																<Clock size={16} className='mr-2 text-primary flex-shrink-0 mt-0.5' />
																<span>Processing time: {visa.processingTime || 'Standard processing'}</span>
															</li>
															<li className='flex items-start'>
																<AlertCircle size={16} className='mr-2 text-primary flex-shrink-0 mt-0.5' />
																<span>Passport must be valid for at least 6 months beyond your travel date</span>
															</li>
															<li className='flex items-start'>
																<FileText size={16} className='mr-2 text-primary flex-shrink-0 mt-0.5' />
																<span>Additional documentation may be required after submission</span>
															</li>
														</ul>
													</div>
												</div>
											</motion.div>
										)}

										{currentStep === 3 && (
											<motion.div
												key='step3'
												variants={fadeIn}
												initial='hidden'
												animate='visible'
												exit='exit'
												className='space-y-4'>
												<h2 className='text-lg font-semibold'>Review & Payment</h2>

												<div className='space-y-4'>
													<div className='bg-muted/50 rounded-lg p-4 space-y-3'>
														<div className='flex justify-between items-center'>
															<h3 className='font-medium'>Booking Summary</h3>
															<Badge variant='outline'>{visa.title}</Badge>
														</div>

														<div className='space-y-2 text-sm'>
															<div className='flex justify-between'>
																<span className='text-muted-foreground'>Applicant</span>
																<span>
																	{formData.firstName} {formData.lastName}
																</span>
															</div>

															<div className='flex justify-between'>
																<span className='text-muted-foreground'>Travel Date</span>
																<span>{formData.travelDate ? format(formData.travelDate, 'PPP') : 'Not selected'}</span>
															</div>

															<div className='flex justify-between'>
																<span className='text-muted-foreground'>From</span>
																<span>{visa.from}</span>
															</div>

															<div className='flex justify-between'>
																<span className='text-muted-foreground'>To</span>
																<span>{visa.to}</span>
															</div>

															<div className='flex justify-between'>
																<span className='text-muted-foreground'>Processing Time</span>
																<span>{visa.processingTime || 'Standard processing'}</span>
															</div>
														</div>

														<Separator />

														<div className='space-y-2'>
															<div className='flex justify-between text-sm'>
																<span className='text-muted-foreground'>Base Price</span>
																<span>
																	{getCurrencySymbol(visa.pricing.currency)}
																	{visa.pricing.basePrice.toFixed(2)}
																</span>
															</div>

															{visa.pricing.discountedPrice < visa.pricing.basePrice && (
																<div className='flex justify-between text-sm text-green-600'>
																	<span>Discount</span>
																	<span>
																		-{getCurrencySymbol(visa.pricing.currency)}
																		{(visa.pricing.basePrice - visa.pricing.discountedPrice).toFixed(2)}
																	</span>
																</div>
															)}

															<div className='flex justify-between font-medium pt-2'>
																<span>Total Price</span>
																<span>
																	{getCurrencySymbol(visa.pricing.currency)}
																	{visa.pricing.discountedPrice.toFixed(2)}
																</span>
															</div>
														</div>
													</div>

													<div className='space-y-3'>
														<h3 className='font-medium'>Payment Method</h3>
														<RadioGroup defaultValue='card' className='space-y-2'>
															<div className='flex items-center space-x-2 border rounded-md p-3'>
																<RadioGroupItem value='card' id='card' />
																<Label htmlFor='card' className='flex items-center gap-2 cursor-pointer'>
																	<CreditCard className='h-4 w-4' />
																	<span>Credit/Debit Card</span>
																</Label>
															</div>

															<div className='flex items-center space-x-2 border rounded-md p-3'>
																<RadioGroupItem value='paypal' id='paypal' disabled />
																<Label htmlFor='paypal' className='flex items-center gap-2 cursor-pointer opacity-50'>
																	<span>PayPal</span>
																	<Badge variant='outline' className='ml-2'>
																		Coming Soon
																	</Badge>
																</Label>
															</div>
														</RadioGroup>
													</div>

													<div className='flex items-center space-x-2 pt-2'>
														<Checkbox
															id='agreeToTerms'
															name='agreeToTerms'
															checked={formData.agreeToTerms}
															onCheckedChange={(checked) =>
																setFormData({ ...formData, agreeToTerms: checked === true })
															}
															required
														/>
														<label
															htmlFor='agreeToTerms'
															className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
															I agree to the{' '}
															<a href='/terms' className='text-primary hover:underline'>
																Terms and Conditions
															</a>{' '}
															and{' '}
															<a href='/privacy' className='text-primary hover:underline'>
																Privacy Policy
															</a>
														</label>
													</div>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</form>
							</CardContent>
							<CardFooter className='flex justify-between'>
								{currentStep > 1 ? (
									<Button type='button' variant='outline' onClick={goToPreviousStep}>
										Back
									</Button>
								) : (
									<Button type='button' variant='outline' onClick={() => navigate(`/visas/details/${slug}`)}>
										Cancel
									</Button>
								)}

								{currentStep < 3 ? (
									<Button type='button' onClick={goToNextStep}>
										Continue
									</Button>
								) : (
									<Button type='submit' form='booking-form' disabled={isSubmitting || !formData.agreeToTerms}>
										{isSubmitting ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												<span>Processing...</span>
											</>
										) : (
											'Complete Booking'
										)}
									</Button>
								)}
							</CardFooter>
						</Card>
					</div>

					<div className='lg:col-span-1'>
						<Card className='sticky top-8'>
							<CardHeader>
								<CardTitle>Visa Package</CardTitle>
								<CardDescription>Your selected visa package details</CardDescription>
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
