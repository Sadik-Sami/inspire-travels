import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CalendarIcon, X, CreditCard, CheckCircle2, Loader2, MinusCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const DIETARY_RESTRICTIONS = [
	{ id: 'vegetarian', label: 'Vegetarian' },
	{ id: 'vegan', label: 'Vegan' },
	{ id: 'gluten-free', label: 'Gluten-Free' },
	{ id: 'dairy-free', label: 'Dairy-Free' },
	{ id: 'nut-allergy', label: 'Nut Allergy' },
	{ id: 'halal', label: 'Halal' },
	{ id: 'kosher', label: 'Kosher' },
];

const BookingForm = ({ destination, selectedDate, onClose }) => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();

	// Form state
	const [formData, setFormData] = useState({
		fullName: user?.name || '',
		email: user?.email || '',
		phone: user?.phone || '',
		travelDate: selectedDate || null,
		adults: 1,
		children: 0,
		specialRequests: '',
		dietaryRestrictions: [],
		agreeToTerms: true,
	});

	// UI state
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [bookingConfirmed, setBookingConfirmed] = useState(null);

	// Update travel date when selectedDate prop changes
	useEffect(() => {
		if (selectedDate) {
			setFormData((prev) => ({ ...prev, travelDate: selectedDate }));
		}
	}, [selectedDate]);

	// Handle input change
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle date selection
	const handleDateSelect = (date) => {
		setFormData((prev) => ({ ...prev, travelDate: date }));
	};

	// Handle dietary restriction toggle
	const handleDietaryToggle = (id) => {
		setFormData((prev) => {
			const current = [...prev.dietaryRestrictions];
			if (current.includes(id)) {
				return { ...prev, dietaryRestrictions: current.filter((item) => item !== id) };
			} else {
				return { ...prev, dietaryRestrictions: [...current, id] };
			}
		});
	};

	// Handle traveler count change
	const handleTravelerChange = (type, action) => {
		setFormData((prev) => {
			let newValue = prev[type];

			if (action === 'increment') {
				newValue += 1;
			} else if (action === 'decrement') {
				newValue = Math.max(type === 'adults' ? 1 : 0, newValue - 1);
			}

			return { ...prev, [type]: newValue };
		});
	};

	// Calculate total price
	const calculateTotalPrice = () => {
		const basePrice = destination.pricing?.discountedPrice || 0;
		const adultPrice = basePrice * formData.adults;
		const childPrice = basePrice * 0.5 * formData.children; // 50% discount for children
		return adultPrice + childPrice;
	};

	// Format price with currency
	const formatPrice = (price) => {
		return `${destination.pricing?.currency || '$'}${price.toFixed(2)}`;
	};

	// Navigate between steps
	const goToNextStep = () => {
		if (currentStep === 1) {
			// Validate personal information
			if (!formData.fullName.trim()) {
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
				destinationId: destination._id,
				fullName: formData.fullName,
				email: formData.email,
				phone: formData.phone,
				travelDate: formData.travelDate,
				numberOfTravelers: {
					adults: formData.adults,
					children: formData.children,
				},
				specialRequests: formData.specialRequests,
				dietaryRestrictions: formData.dietaryRestrictions,
			};

			const response = await axiosSecure.post('/api/bookings', bookingData);

			setBookingConfirmed(response.data.booking);
			setShowConfirmation(true);
		} catch (error) {
			console.error('Error creating booking:', error);
			toast.error(error.response?.data?.message || 'Failed to create booking. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle view booking details
	const handleViewBooking = () => {
		navigate('/my-bookings');
		onClose();
	};

	// Animation variants
	const fadeIn = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { duration: 0.3 } },
		exit: { opacity: 0, transition: { duration: 0.2 } },
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[600px] p-0 overflow-hidden'>
				<div className='relative'>
					{/* Header with destination image */}
					<div className='relative h-64 overflow-hidden'>
						{destination.images && destination.images.length > 0 && (
							<img
								src={destination.images[0].url || '/placeholder.svg'}
								alt={destination.title}
								className='w-full h-full object-cover object-top'
							/>
						)}
						<div className='absolute bottom-4 left-6 text-white'>
							<h3 className='text-xl font-bold'>{destination.title}</h3>
							<p className='text-sm opacity-90'>
								{destination.duration?.days} days / {destination.duration?.nights} nights
							</p>
						</div>
					</div>

					{/* Booking form */}
					<div className='p-6'>
						{!showConfirmation ? (
							<form onSubmit={handleSubmit}>
								{/* Progress indicator */}
								<div className='mb-6'>
									<div className='flex justify-between items-center mb-2'>
										{['Personal Info', 'Trip Details', 'Review & Pay'].map((step, index) => (
											<div
												key={index}
												className={cn(
													'text-xs font-medium',
													currentStep > index + 1
														? 'text-primary'
														: currentStep === index + 1
														? 'text-primary'
														: 'text-muted-foreground'
												)}>
												{step}
											</div>
										))}
									</div>
									<div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
										<motion.div
											className='h-full bg-primary'
											initial={{ width: `${((currentStep - 1) / 3) * 100}%` }}
											animate={{ width: `${(currentStep / 3) * 100}%` }}
											transition={{ duration: 0.3 }}
										/>
									</div>
								</div>

								{/* Step content */}
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

											<div className='space-y-3'>
												<div>
													<Label htmlFor='fullName'>Full Name</Label>
													<Input
														id='fullName'
														name='fullName'
														value={formData.fullName}
														onChange={handleInputChange}
														placeholder='Enter your full name'
													/>
												</div>

												<div>
													<Label htmlFor='email'>Email</Label>
													<Input
														id='email'
														name='email'
														type='email'
														value={formData.email}
														onChange={handleInputChange}
														placeholder='Enter your email'
													/>
												</div>

												<div>
													<Label htmlFor='phone'>Phone Number</Label>
													<Input
														id='phone'
														name='phone'
														value={formData.phone}
														onChange={handleInputChange}
														placeholder='Enter your phone number'
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
											<h2 className='text-lg font-semibold'>Trip Details</h2>

											<div className='space-y-4'>
												<div>
													<Label htmlFor='travelDate' className='mb-1 block'>
														Consulting Date
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
												</div>

												<div>
													<Label className='mb-2 block'>Number of Travelers</Label>
													<div className='space-y-2'>
														<div className='flex items-center justify-between'>
															<span className='text-sm'>Adults</span>
															<div className='flex items-center gap-3'>
																<Button
																	type='button'
																	variant='outline'
																	size='icon'
																	className='h-8 w-8'
																	onClick={() => handleTravelerChange('adults', 'decrement')}
																	disabled={formData.adults <= 1}>
																	<MinusCircle className='h-4 w-4' />
																</Button>
																<span className='w-6 text-center'>{formData.adults}</span>
																<Button
																	type='button'
																	variant='outline'
																	size='icon'
																	className='h-8 w-8'
																	onClick={() => handleTravelerChange('adults', 'increment')}>
																	<PlusCircle className='h-4 w-4' />
																</Button>
															</div>
														</div>

														<div className='flex items-center justify-between'>
															<span className='text-sm'>Children (under 12)</span>
															<div className='flex items-center gap-3'>
																<Button
																	type='button'
																	variant='outline'
																	size='icon'
																	className='h-8 w-8'
																	onClick={() => handleTravelerChange('children', 'decrement')}
																	disabled={formData.children <= 0}>
																	<MinusCircle className='h-4 w-4' />
																</Button>
																<span className='w-6 text-center'>{formData.children}</span>
																<Button
																	type='button'
																	variant='outline'
																	size='icon'
																	className='h-8 w-8'
																	onClick={() => handleTravelerChange('children', 'increment')}>
																	<PlusCircle className='h-4 w-4' />
																</Button>
															</div>
														</div>
													</div>
												</div>

												<div>
													<Label htmlFor='specialRequests' className='mb-1 block'>
														Special Requests (Optional)
													</Label>
													<Textarea
														id='specialRequests'
														name='specialRequests'
														value={formData.specialRequests}
														onChange={handleInputChange}
														placeholder='Any special requests or requirements?'
														rows={3}
													/>
												</div>

												<div>
													<Label className='mb-2 block'>Dietary Restrictions (Optional)</Label>
													<div className='grid grid-cols-2 gap-2'>
														{DIETARY_RESTRICTIONS.map((restriction) => (
															<div key={restriction.id} className='flex items-center space-x-2'>
																<Checkbox
																	id={restriction.id}
																	checked={formData.dietaryRestrictions.includes(restriction.id)}
																	onCheckedChange={() => handleDietaryToggle(restriction.id)}
																/>
																<label
																	htmlFor={restriction.id}
																	className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
																	{restriction.label}
																</label>
															</div>
														))}
													</div>
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
														<Badge variant='outline'>{destination.title}</Badge>
													</div>

													<div className='space-y-2 text-sm'>
														<div className='flex justify-between'>
															<span className='text-muted-foreground'>Travel Date</span>
															<span>{formData.travelDate ? format(formData.travelDate, 'PPP') : 'Not selected'}</span>
														</div>

														<div className='flex justify-between'>
															<span className='text-muted-foreground'>Duration</span>
															<span>
																{destination.duration?.days} days / {destination.duration?.nights} nights
															</span>
														</div>

														<div className='flex justify-between'>
															<span className='text-muted-foreground'>Travelers</span>
															<span>
																{formData.adults} {formData.adults === 1 ? 'adult' : 'adults'}
																{formData.children > 0
																	? `, ${formData.children} ${formData.children === 1 ? 'child' : 'children'}`
																	: ''}
															</span>
														</div>
													</div>

													<Separator />

													<div className='space-y-2'>
														<div className='flex justify-between text-sm'>
															<span className='text-muted-foreground'>
																Base Price ({formData.adults} {formData.adults === 1 ? 'adult' : 'adults'})
															</span>
															<span>{formatPrice(destination.pricing?.discountedPrice * formData.adults)}</span>
														</div>

														{formData.children > 0 && (
															<div className='flex justify-between text-sm'>
																<span className='text-muted-foreground'>
																	Children ({formData.children}) - 50% discount
																</span>
																<span>
																	{formatPrice(destination.pricing?.discountedPrice * 0.5 * formData.children)}
																</span>
															</div>
														)}

														<div className='flex justify-between font-medium pt-2'>
															<span>Total Price</span>
															<span>{formatPrice(calculateTotalPrice())}</span>
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
														id='terms'
														checked={formData.agreeToTerms}
														onCheckedChange={(checked) =>
															setFormData((prev) => ({ ...prev, agreeToTerms: checked === true }))
														}
													/>
													<label
														htmlFor='terms'
														className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
														I agree to the terms and conditions
													</label>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>

								{/* Navigation buttons */}
								<div className='flex justify-between mt-8'>
									{currentStep > 1 ? (
										<Button type='button' variant='outline' onClick={goToPreviousStep}>
											Back
										</Button>
									) : (
										<Button type='button' variant='outline' onClick={onClose}>
											Cancel
										</Button>
									)}

									{currentStep < 3 ? (
										<Button type='button' onClick={goToNextStep}>
											Continue
										</Button>
									) : (
										<Button type='submit' disabled={isSubmitting || !formData.agreeToTerms}>
											{isSubmitting ? (
												<>
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
													Processing...
												</>
											) : (
												<>Complete Booking</>
											)}
										</Button>
									)}
								</div>
							</form>
						) : (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5 }}
								className='py-6'>
								<div className='flex flex-col items-center text-center'>
									<div className='h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
										<CheckCircle2 className='h-8 w-8 text-green-600' />
									</div>

									<h2 className='text-2xl font-bold mb-2'>Booking Confirmed!</h2>
									<p className='text-muted-foreground mb-6'>
										Your booking has been successfully confirmed. We've sent a confirmation email to {formData.email}.
									</p>

									<div className='bg-muted/50 rounded-lg p-4 w-full max-w-md mb-6'>
										<div className='space-y-3 text-sm'>
											<div className='flex justify-between'>
												<span className='text-muted-foreground'>Booking Reference</span>
												<span className='font-medium'>{bookingConfirmed?._id.substring(0, 8).toUpperCase()}</span>
											</div>

											<div className='flex justify-between'>
												<span className='text-muted-foreground'>Destination</span>
												<span>{destination.title}</span>
											</div>

											<div className='flex justify-between'>
												<span className='text-muted-foreground'>Travel Date</span>
												<span>{format(new Date(bookingConfirmed?.travelDate), 'PPP')}</span>
											</div>

											<div className='flex justify-between'>
												<span className='text-muted-foreground'>Total Amount</span>
												<span className='font-medium'>{formatPrice(bookingConfirmed?.pricing.totalPrice)}</span>
											</div>
										</div>
									</div>

									<div className='flex gap-3'>
										<Button variant='outline' onClick={onClose}>
											Close
										</Button>
										<Button onClick={handleViewBooking}>View My Bookings</Button>
									</div>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default BookingForm;
