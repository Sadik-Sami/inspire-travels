'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import { Plus, Trash, DollarSign, User, Mail, Phone, MapPin, Loader2, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const CreateInvoiceForm = ({ onSuccess, onCancel }) => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	// State for invoice form
	const [formData, setFormData] = useState({
		customer: {
			name: '',
			email: '',
			phone: '',
			address: '',
		},
		items: [
			{
				name: '',
				description: '',
				quantity: 1,
				unitPrice: 0,
				discount: 0,
				tax: 0,
				total: 0,
			},
		],
		subtotal: 0,
		totalDiscount: 0,
		totalTax: 0,
		totalAmount: 0,
		issueDate: new Date(),
		dueDate: addDays(new Date(), 30),
		notes: '',
		terms: 'Payment is due within 30 days. Thank you for your business.',
		currency: 'USD',
		relatedTo: {
			type: 'custom',
			bookingId: null,
			visaBookingId: null,
		},
	});

	// Fetch bookings for dropdown
	const { data: bookingsData } = useQuery({
		queryKey: ['bookings-for-invoice'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/bookings?limit=100');
			return response.data.bookings || [];
		},
	});

	// Fetch visa bookings for dropdown
	const { data: visaBookingsData } = useQuery({
		queryKey: ['visa-bookings-for-invoice'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/visa-bookings?limit=100');
			return response.data.bookings || [];
		},
	});

	// Create invoice mutation
	const createInvoiceMutation = useMutation({
		mutationFn: async (invoiceData) => {
			const response = await axiosSecure.post('/api/invoices', invoiceData);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
			toast.success('Invoice created successfully');
			if (onSuccess) onSuccess();
		},
		onError: (error) => {
			toast.error(`Failed to create invoice: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		if (name.startsWith('customer.')) {
			const field = name.split('.')[1];
			setFormData({
				...formData,
				customer: {
					...formData.customer,
					[field]: value,
				},
			});
		} else {
			setFormData({
				...formData,
				[name]: value,
			});
		}
	};

	// Handle item changes
	const handleItemChange = (index, field, value) => {
		const updatedItems = [...formData.items];
		updatedItems[index][field] = value;

		// Recalculate item total
		const item = updatedItems[index];
		const quantity = Number.parseFloat(item.quantity) || 0;
		const unitPrice = Number.parseFloat(item.unitPrice) || 0;
		const discount = Number.parseFloat(item.discount) || 0;
		const tax = Number.parseFloat(item.tax) || 0;

		const subtotal = quantity * unitPrice;
		const discountAmount = (subtotal * discount) / 100;
		const taxAmount = ((subtotal - discountAmount) * tax) / 100;
		const total = subtotal - discountAmount + taxAmount;

		updatedItems[index].total = total;

		setFormData({
			...formData,
			items: updatedItems,
		});
	};

	// Add new item
	const handleAddItem = () => {
		setFormData({
			...formData,
			items: [
				...formData.items,
				{
					name: '',
					description: '',
					quantity: 1,
					unitPrice: 0,
					discount: 0,
					tax: 0,
					total: 0,
				},
			],
		});
	};

	// Remove item
	const handleRemoveItem = (index) => {
		if (formData.items.length === 1) {
			toast.error('Invoice must have at least one item');
			return;
		}

		const updatedItems = [...formData.items];
		updatedItems.splice(index, 1);

		setFormData({
			...formData,
			items: updatedItems,
		});
	};

	// Handle related entity selection
	const handleRelatedEntityChange = (type, id) => {
		if (type === 'booking' && id) {
			const booking = bookingsData.find((b) => b._id === id);
			if (booking) {
				setFormData({
					...formData,
					customer: {
						name: booking.fullName || '',
						email: booking.email || '',
						phone: booking.phone || '',
						address: '',
					},
					relatedTo: {
						type: 'booking',
						bookingId: id,
						visaBookingId: null,
					},
				});
			}
		} else if (type === 'visa' && id) {
			const visaBooking = visaBookingsData.find((b) => b._id === id);
			if (visaBooking) {
				setFormData({
					...formData,
					customer: {
						name: `${visaBooking.firstName} ${visaBooking.lastName}` || '',
						email: visaBooking.email || '',
						phone: visaBooking.phone || '',
						address: '',
					},
					relatedTo: {
						type: 'visa',
						bookingId: null,
						visaBookingId: id,
					},
				});
			}
		} else {
			setFormData({
				...formData,
				relatedTo: {
					type: 'custom',
					bookingId: null,
					visaBookingId: null,
				},
			});
		}
	};

	// Calculate totals when items change
	useEffect(() => {
		let subtotal = 0;
		let totalTax = 0;
		let totalDiscount = 0;

		formData.items.forEach((item) => {
			const itemSubtotal = (Number.parseFloat(item.quantity) || 0) * (Number.parseFloat(item.unitPrice) || 0);
			const itemDiscount = (itemSubtotal * (Number.parseFloat(item.discount) || 0)) / 100;
			const itemTax = ((itemSubtotal - itemDiscount) * (Number.parseFloat(item.tax) || 0)) / 100;

			subtotal += itemSubtotal;
			totalDiscount += itemDiscount;
			totalTax += itemTax;
		});

		const totalAmount = subtotal - totalDiscount + totalTax;

		setFormData({
			...formData,
			subtotal,
			totalDiscount,
			totalTax,
			totalAmount,
		});
	}, [formData.items]);

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		// Validate form
		if (!formData.customer.name || !formData.customer.email || !formData.customer.phone) {
			toast.error('Please fill in all customer information');
			return;
		}

		if (formData.items.some((item) => !item.name || item.quantity <= 0)) {
			toast.error('Please fill in all item details with valid quantities');
			return;
		}

		if (formData.totalAmount <= 0) {
			toast.error('Invoice total must be greater than zero');
			return;
		}

		// Submit form
		createInvoiceMutation.mutate(formData);
	};

	// Format currency
	const formatCurrency = (amount) => {
		const currencySymbols = {
			USD: '$',
			EUR: '€',
			GBP: '£',
			BDT: '৳',
		};

		return `${currencySymbols[formData.currency] || '$'}${Number.parseFloat(amount).toFixed(2)}`;
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			{/* Related Entity Selection */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div className='space-y-2'>
					<Label>Related To</Label>
					<Select value={formData.relatedTo.type} onValueChange={(value) => handleRelatedEntityChange(value, null)}>
						<SelectTrigger>
							<SelectValue placeholder='Select related entity type' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='custom'>Custom Invoice</SelectItem>
							<SelectItem value='booking'>Trip Booking</SelectItem>
							<SelectItem value='visa'>Visa Booking</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{formData.relatedTo.type === 'booking' && (
					<div className='space-y-2'>
						<Label>Select Booking</Label>
						<Select
							value={formData.relatedTo.bookingId || ''}
							onValueChange={(value) => handleRelatedEntityChange('booking', value)}>
							<SelectTrigger>
								<SelectValue placeholder='Select a booking' />
							</SelectTrigger>
							<SelectContent>
								{bookingsData?.map((booking) => (
									<SelectItem key={booking._id} value={booking._id}>
										{booking.fullName} - {booking.destinationDetails?.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{formData.relatedTo.type === 'visa' && (
					<div className='space-y-2'>
						<Label>Select Visa Booking</Label>
						<Select
							value={formData.relatedTo.visaBookingId || ''}
							onValueChange={(value) => handleRelatedEntityChange('visa', value)}>
							<SelectTrigger>
								<SelectValue placeholder='Select a visa booking' />
							</SelectTrigger>
							<SelectContent>
								{visaBookingsData?.map((booking) => (
									<SelectItem key={booking._id} value={booking._id}>
										{booking.firstName} {booking.lastName} - {booking.visaDetails?.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>

			{/* Customer Information */}
			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Customer Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='customer.name'>
								Name <span className='text-red-500'>*</span>
							</Label>
							<div className='relative'>
								<User className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									id='customer.name'
									name='customer.name'
									placeholder='Customer name'
									className='pl-9'
									value={formData.customer.name}
									onChange={handleInputChange}
									required
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='customer.email'>
								Email <span className='text-red-500'>*</span>
							</Label>
							<div className='relative'>
								<Mail className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									id='customer.email'
									name='customer.email'
									type='email'
									placeholder='Customer email'
									className='pl-9'
									value={formData.customer.email}
									onChange={handleInputChange}
									required
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='customer.phone'>
								Phone <span className='text-red-500'>*</span>
							</Label>
							<div className='relative'>
								<Phone className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									id='customer.phone'
									name='customer.phone'
									placeholder='Customer phone'
									className='pl-9'
									value={formData.customer.phone}
									onChange={handleInputChange}
									required
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='customer.address'>Address</Label>
							<div className='relative'>
								<MapPin className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									id='customer.address'
									name='customer.address'
									placeholder='Customer address'
									className='pl-9'
									value={formData.customer.address}
									onChange={handleInputChange}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Invoice Details */}
			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Invoice Details</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
						<div className='space-y-2'>
							<Label htmlFor='issueDate'>
								Issue Date <span className='text-red-500'>*</span>
							</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className={cn(
											'w-full justify-start text-left font-normal',
											!formData.issueDate && 'text-muted-foreground'
										)}>
										<CalendarIcon className='mr-2 h-4 w-4' />
										{formData.issueDate ? format(formData.issueDate, 'PPP') : <span>Pick a date</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0' align='start'>
									<Calendar
										mode='single'
										selected={formData.issueDate}
										onSelect={(date) => setFormData({ ...formData, issueDate: date })}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='dueDate'>
								Due Date <span className='text-red-500'>*</span>
							</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className={cn(
											'w-full justify-start text-left font-normal',
											!formData.dueDate && 'text-muted-foreground'
										)}>
										<CalendarIcon className='mr-2 h-4 w-4' />
										{formData.dueDate ? format(formData.dueDate, 'PPP') : <span>Pick a date</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0' align='start'>
									<Calendar
										mode='single'
										selected={formData.dueDate}
										onSelect={(date) => setFormData({ ...formData, dueDate: date })}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='currency'>Currency</Label>
							<Select
								value={formData.currency}
								onValueChange={(value) => setFormData({ ...formData, currency: value })}>
								<SelectTrigger id='currency'>
									<SelectValue placeholder='Select currency' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='USD'>USD ($)</SelectItem>
									<SelectItem value='EUR'>EUR (€)</SelectItem>
									<SelectItem value='GBP'>GBP (£)</SelectItem>
									<SelectItem value='BDT'>BDT (৳)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Invoice Items */}
					<div className='space-y-4'>
						<div className='flex justify-between items-center'>
							<h3 className='font-medium'>Invoice Items</h3>
							<Button type='button' variant='outline' size='sm' onClick={handleAddItem}>
								<Plus className='h-4 w-4 mr-1' /> Add Item
							</Button>
						</div>

						<div className='space-y-4'>
							{formData.items.map((item, index) => (
								<div key={index} className='border rounded-md p-4'>
									<div className='flex justify-between items-center mb-4'>
										<h4 className='font-medium'>Item #{index + 1}</h4>
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={() => handleRemoveItem(index)}
											className='text-red-500 hover:text-red-700'>
											<Trash className='h-4 w-4' />
										</Button>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
										<div className='space-y-2'>
											<Label htmlFor={`item-${index}-name`}>
												Item Name <span className='text-red-500'>*</span>
											</Label>
											<Input
												id={`item-${index}-name`}
												value={item.name}
												onChange={(e) => handleItemChange(index, 'name', e.target.value)}
												placeholder='Item name'
												required
											/>
										</div>

										<div className='space-y-2'>
											<Label htmlFor={`item-${index}-description`}>Description</Label>
											<Input
												id={`item-${index}-description`}
												value={item.description}
												onChange={(e) => handleItemChange(index, 'description', e.target.value)}
												placeholder='Item description'
											/>
										</div>
									</div>

									<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor={`item-${index}-quantity`}>
												Quantity <span className='text-red-500'>*</span>
											</Label>
											<Input
												id={`item-${index}-quantity`}
												type='number'
												min='1'
												step='1'
												value={item.quantity}
												onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
												required
											/>
										</div>

										<div className='space-y-2'>
											<Label htmlFor={`item-${index}-unitPrice`}>
												Unit Price <span className='text-red-500'>*</span>
											</Label>
											<div className='relative'>
												<DollarSign className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
												<Input
													id={`item-${index}-unitPrice`}
													type='number'
													min='0'
													step='0.01'
													className='pl-9'
													value={item.unitPrice}
													onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
													required
												/>
											</div>
										</div>

										<div className='space-y-2'>
											<Label htmlFor={`item-${index}-discount`}>Discount (%)</Label>
											<Input
												id={`item-${index}-discount`}
												type='number'
												min='0'
												max='100'
												step='0.01'
												value={item.discount}
												onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
											/>
										</div>

										<div className='space-y-2'>
											<Label htmlFor={`item-${index}-tax`}>Tax (%)</Label>
											<Input
												id={`item-${index}-tax`}
												type='number'
												min='0'
												step='0.01'
												value={item.tax}
												onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
											/>
										</div>
									</div>

									<div className='mt-4 text-right'>
										<div className='text-sm text-muted-foreground'>Item Total:</div>
										<div className='font-medium'>{formatCurrency(item.total)}</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Invoice Totals */}
					<div className='mt-6 border-t pt-4'>
						<div className='flex flex-col items-end space-y-2'>
							<div className='flex justify-between w-full md:w-1/3'>
								<span className='text-muted-foreground'>Subtotal:</span>
								<span>{formatCurrency(formData.subtotal)}</span>
							</div>
							<div className='flex justify-between w-full md:w-1/3'>
								<span className='text-muted-foreground'>Discount:</span>
								<span>{formatCurrency(formData.totalDiscount)}</span>
							</div>
							<div className='flex justify-between w-full md:w-1/3'>
								<span className='text-muted-foreground'>Tax:</span>
								<span>{formatCurrency(formData.totalTax)}</span>
							</div>
							<Separator className='w-full md:w-1/3 my-2' />
							<div className='flex justify-between w-full md:w-1/3 font-medium text-lg'>
								<span>Total:</span>
								<span>{formatCurrency(formData.totalAmount)}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Notes and Terms */}
			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Additional Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label htmlFor='notes'>Notes</Label>
							<Textarea
								id='notes'
								name='notes'
								placeholder='Additional notes for the customer'
								rows={4}
								value={formData.notes}
								onChange={handleInputChange}
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='terms'>Terms and Conditions</Label>
							<Textarea
								id='terms'
								name='terms'
								placeholder='Terms and conditions'
								rows={4}
								value={formData.terms}
								onChange={handleInputChange}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Form Actions */}
			<div className='flex justify-end gap-4'>
				<Button type='button' variant='outline' onClick={onCancel}>
					Cancel
				</Button>
				<Button type='submit' disabled={createInvoiceMutation.isPending}>
					{createInvoiceMutation.isPending ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Creating...
						</>
					) : (
						'Create Invoice'
					)}
				</Button>
			</div>
		</form>
	);
};

export default CreateInvoiceForm;
