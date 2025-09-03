import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { Plus, Trash2, Save, ArrowLeft, Calendar, DollarSign, Percent, Loader2, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';

const CreateInvoice = () => {
	const axiosSecure = useAxiosSecure();
	const navigate = useNavigate();
	const location = useLocation();

	// Get customer data from location state (if coming from AdminUsers)
	const customerFromLocation = location.state?.customer;

	// State for invoice data
	const [invoiceData, setInvoiceData] = useState({
		customer: {
			name: customerFromLocation?.name || '',
			email: customerFromLocation?.email || '',
			phone: customerFromLocation?.phone || '',
			address: customerFromLocation?.address || '',
		},
		items: [
			{
				name: '',
				description: '',
				quantity: 1,
				unitPrice: '',
				discount: '',
				tax: '',
				total: 0,
			},
		],
		subtotal: 0,
		totalDiscount: 0,
		additionalDiscount: '',
		totalTax: 0,
		totalAmount: 0,
		paidAmount: '',
		dueAmount: 0,
		issueDate: new Date(),
		dueDate: addDays(new Date(), 30),
		status: 'draft',
		notes: '',
		terms: 'Payment is due within 30 days. Thank you for your business.',
		currency: 'BDT',
		relatedTo: {
			type: 'custom',
		},
	});

	// State for paid checkbox
	const [isPaid, setIsPaid] = useState(false);

	// Create invoice mutation
	const createInvoiceMutation = useMutation({
		mutationFn: async (data) => {
			const response = await axiosSecure.post('/api/invoices', data);
			return response.data;
		},
		onSuccess: (data) => {
			toast.success('Invoice created successfully');
			navigate('/admin/invoices');
		},
		onError: (error) => {
			toast.error(`Failed to create invoice: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Handle customer data change
	const handleCustomerChange = (e) => {
		const { name, value } = e.target;
		setInvoiceData({
			...invoiceData,
			customer: {
				...invoiceData.customer,
				[name]: value,
			},
		});
	};

	// Handle item change
	const handleItemChange = (index, field, value) => {
		const updatedItems = [...invoiceData.items];

		// Convert string values to numbers for numeric fields
		if (['quantity', 'unitPrice', 'discount', 'tax'].includes(field)) {
			value = value === '' ? 0 : Number(value);
		}

		updatedItems[index] = {
			...updatedItems[index],
			[field]: value,
		};

		// Recalculate item total
		if (['quantity', 'unitPrice', 'discount', 'tax'].includes(field)) {
			const item = updatedItems[index];
			const subtotal = item.quantity * item.unitPrice;
			const discountAmount = item.discount;
			const afterDiscount = subtotal - discountAmount;
			const taxAmount = afterDiscount * (item.tax / 100);
			item.total = afterDiscount + taxAmount;
		}

		setInvoiceData({
			...invoiceData,
			items: updatedItems,
		});
	};

	// Add new item
	const handleAddItem = () => {
		setInvoiceData({
			...invoiceData,
			items: [
				...invoiceData.items,
				{
					name: '',
					description: '',
					quantity: 1,
					unitPrice: '',
					discount: '',
					tax: '',
					total: 0,
				},
			],
		});
	};

	// Remove item
	const handleRemoveItem = (index) => {
		if (invoiceData.items.length === 1) {
			toast.error('Invoice must have at least one item');
			return;
		}

		const updatedItems = [...invoiceData.items];
		updatedItems.splice(index, 1);

		setInvoiceData({
			...invoiceData,
			items: updatedItems,
		});
	};

	// Handle paid checkbox change
	const handlePaidChange = (checked) => {
		setIsPaid(checked);

		if (checked) {
			// If paid, set paidAmount to totalAmount
			setInvoiceData({
				...invoiceData,
				paidAmount: invoiceData.totalAmount,
				dueAmount: 0,
				status: 'paid',
			});
		} else {
			// If not paid, reset paidAmount
			setInvoiceData({
				...invoiceData,
				paidAmount: 0,
				dueAmount: invoiceData.totalAmount,
				status: 'draft',
			});
		}
	};

	// Handle paid amount change
	const handlePaidAmountChange = (e) => {
		const paidAmount = e.target.value === '' ? 0 : Number(e.target.value);
		const dueAmount = invoiceData.totalAmount - paidAmount;

		setInvoiceData({
			...invoiceData,
			paidAmount,
			dueAmount,
			status: paidAmount === 0 ? 'draft' : paidAmount >= invoiceData.totalAmount ? 'paid' : 'partially_paid',
		});
	};

	// Calculate totals whenever items or additionalDiscount change
	// useEffect(() => {
	// 	const subtotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
	// 	const totalDiscount = invoiceData.items.reduce((sum, item) => {
	// 		const itemSubtotal = item.quantity * item.unitPrice;
	// 		return sum + itemSubtotal * (item.discount / 100);
	// 	}, 0);
	// 	const totalTax = invoiceData.items.reduce((sum, item) => {
	// 		const itemSubtotal = item.quantity * item.unitPrice;
	// 		const afterDiscount = itemSubtotal - itemSubtotal * (item.discount / 100);
	// 		return sum + afterDiscount * (item.tax / 100);
	// 	}, 0);

	// 	// Calculate additional discount amount
	// 	const additionalDiscountAmount = invoiceData.additionalDiscount;

	// 	// Calculate total amount
	// 	const totalAmount = subtotal - totalDiscount - additionalDiscountAmount + totalTax;

	// 	// Calculate due amount based on paid amount
	// 	const dueAmount = totalAmount - invoiceData.paidAmount;

	// 	setInvoiceData({
	// 		...invoiceData,
	// 		subtotal,
	// 		totalDiscount,
	// 		totalTax,
	// 		totalAmount,
	// 		dueAmount,
	// 	});
	// }, [invoiceData.items, invoiceData.additionalDiscount, invoiceData.paidAmount]);

	useEffect(() => {
		const subtotal = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

		const totalDiscount = invoiceData.items.reduce((sum, item) => {
			return sum + (item.discount || 0);
		}, 0);

		const totalTax = invoiceData.items.reduce((sum, item) => {
			const itemSubtotal = item.quantity * item.unitPrice;
			const afterDiscount = itemSubtotal - (item.discount || 0);
			return sum + afterDiscount * (item.tax / 100);
		}, 0);

		const additionalDiscountAmount = invoiceData.additionalDiscount || 0;

		// Calculate total amount
		const totalAmount = subtotal - totalDiscount - additionalDiscountAmount + totalTax;

		// Calculate due amount based on paid amount
		const dueAmount = totalAmount - (invoiceData.paidAmount || 0);

		setInvoiceData((prevData) => ({
			...prevData,
			subtotal,
			totalDiscount,
			totalTax,
			totalAmount,
			dueAmount,
		}));
	}, [invoiceData.items, invoiceData.additionalDiscount, invoiceData.paidAmount]);

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		// Validate customer data
		if (!invoiceData.customer.name || !invoiceData.customer.phone) {
			toast.error('Please fill in all required customer fields');
			return;
		}

		// Validate items
		for (const item of invoiceData.items) {
			if (!item.name || item.quantity <= 0 || item.unitPrice <= 0) {
				toast.error('Please fill in all required item fields with valid values');
				return;
			}
		}

		// Submit the invoice
		createInvoiceMutation.mutate(invoiceData);
	};

	// Format currency
	const formatCurrency = (amount, currency = invoiceData.currency) => {
		if (amount === undefined || amount === null) return '0.00';

		const currencySymbols = {
			USD: '$',
			EUR: '€',
			GBP: '£',
			BDT: '৳',
		};

		return `${currencySymbols[currency] || '$'}${Number.parseFloat(amount).toFixed(2)}`;
	};

	return (
		<div>
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center gap-2'>
					<Button variant='outline' size='icon' onClick={() => navigate('/admin/invoices')}>
						<ArrowLeft className='h-4 w-4' />
					</Button>
					<h1 className='text-3xl font-bold'>Create Invoice</h1>
				</div>

				<Button onClick={handleSubmit} disabled={createInvoiceMutation.isPending} className='flex items-center gap-2'>
					{createInvoiceMutation.isPending ? (
						<>
							<Loader2 className='h-4 w-4 animate-spin' />
							Saving...
						</>
					) : (
						<>
							<Save className='h-4 w-4' />
							Save Invoice
						</>
					)}
				</Button>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Main Invoice Form */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Customer Information */}
					<Card>
						<CardHeader>
							<CardTitle>Customer Information</CardTitle>
							<CardDescription>Enter the customer details for this invoice</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='name'>
										Customer Name <span className='text-red-500'>*</span>
									</Label>
									<Input
										id='name'
										name='name'
										value={invoiceData.customer.name}
										onChange={handleCustomerChange}
										placeholder='Enter customer name'
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										name='email'
										type='email'
										value={invoiceData.customer.email}
										onChange={handleCustomerChange}
										placeholder='Enter customer email'
									/>
								</div>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='phone'>
										Phone <span className='text-red-500'>*</span>
									</Label>
									<Input
										id='phone'
										name='phone'
										value={invoiceData.customer.phone}
										onChange={handleCustomerChange}
										placeholder='Enter customer phone'
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='address'>Address</Label>
									<Input
										id='address'
										name='address'
										value={invoiceData.customer.address}
										onChange={handleCustomerChange}
										placeholder='Enter customer address'
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Invoice Items */}
					<Card>
						<CardHeader>
							<CardTitle>Invoice Items</CardTitle>
							<CardDescription>Add the items to be included in this invoice</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							{invoiceData.items.map((item, index) => (
								<div key={index} className='space-y-4 p-4 border rounded-lg'>
									<div className='flex justify-between items-center'>
										<h3 className='font-medium'>Item #{index + 1}</h3>
										<Button
											variant='ghost'
											size='icon'
											onClick={() => handleRemoveItem(index)}
											disabled={invoiceData.items.length === 1}>
											<Trash2 className='h-4 w-4 text-red-500' />
										</Button>
									</div>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor={`item-name-${index}`}>
												Item Name <span className='text-red-500'>*</span>
											</Label>
											<Input
												id={`item-name-${index}`}
												value={item.name}
												onChange={(e) => handleItemChange(index, 'name', e.target.value)}
												placeholder='Enter item name'
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor={`item-description-${index}`}>Description</Label>
											<Input
												id={`item-description-${index}`}
												value={item.description}
												onChange={(e) => handleItemChange(index, 'description', e.target.value)}
												placeholder='Enter item description'
											/>
										</div>
									</div>
									<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor={`item-quantity-${index}`}>
												Quantity <span className='text-red-500'>*</span>
											</Label>
											<Input
												id={`item-quantity-${index}`}
												type='number'
												min='1'
												step='1'
												value={item.quantity}
												onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
												required
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor={`item-price-${index}`}>
												Unit Price <span className='text-red-500'>*</span>
											</Label>
											<div className='relative'>
												<DollarSign className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
												<Input
													id={`item-price-${index}`}
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
											<Label htmlFor={`item-discount-${index}`}>Discount Amount</Label>
											<div className='relative'>
												<DollarSign className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
												<Input
													id={`item-discount-${index}`}
													type='number'
													min='0'
													step='10'
													className='pl-9'
													value={item.discount}
													onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
												/>
											</div>
										</div>
										<div className='space-y-2'>
											<Label htmlFor={`item-tax-${index}`}>Tax (%)</Label>
											<div className='relative'>
												<Percent className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
												<Input
													id={`item-tax-${index}`}
													type='number'
													min='0'
													step='0.01'
													className='pl-9'
													value={item.tax}
													onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
												/>
											</div>
										</div>
									</div>
									<div className='flex justify-end'>
										<div className='text-right'>
											<Label>Item Total</Label>
											<div className='text-lg font-medium'>{formatCurrency(item.total)}</div>
										</div>
									</div>
								</div>
							))}

							<Button variant='outline' className='w-full' onClick={handleAddItem}>
								<Plus className='h-4 w-4 mr-2' />
								Add Item
							</Button>
						</CardContent>
					</Card>

					{/* Notes and Terms */}
					<Card>
						<CardHeader>
							<CardTitle>Additional Information</CardTitle>
							<CardDescription>Add notes and terms for this invoice</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='notes'>Notes</Label>
								<Textarea
									id='notes'
									value={invoiceData.notes}
									onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
									placeholder='Add any notes for the customer'
									rows={3}
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='terms'>Terms and Conditions</Label>
								<Textarea
									id='terms'
									value={invoiceData.terms}
									onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
									placeholder='Add terms and conditions for the invoice'
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Invoice Summary */}
				<div className='space-y-6'>
					{/* Invoice Settings */}
					<Card>
						<CardHeader>
							<CardTitle>Invoice Settings</CardTitle>
							<CardDescription>Configure invoice details and dates</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='currency'>Currency</Label>
								<Select
									value={invoiceData.currency}
									onValueChange={(value) => setInvoiceData({ ...invoiceData, currency: value })}>
									<SelectTrigger id='currency'>
										<SelectValue placeholder='Select currency' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='USD'>USD - US Dollar</SelectItem>
										<SelectItem value='EUR'>EUR - Euro</SelectItem>
										<SelectItem value='GBP'>GBP - British Pound</SelectItem>
										<SelectItem value='BDT'>BDT - Bangladeshi Taka</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='issueDate'>Issue Date</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button variant='outline' className='w-full justify-start text-left font-normal' id='issueDate'>
											<Calendar className='mr-2 h-4 w-4' />
											{invoiceData.issueDate ? format(invoiceData.issueDate, 'PPP') : 'Select date'}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0'>
										<CalendarComponent
											mode='single'
											selected={invoiceData.issueDate}
											onSelect={(date) => setInvoiceData({ ...invoiceData, issueDate: date })}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='dueDate'>Due Date</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button variant='outline' className='w-full justify-start text-left font-normal' id='dueDate'>
											<Calendar className='mr-2 h-4 w-4' />
											{invoiceData.dueDate ? format(invoiceData.dueDate, 'PPP') : 'Select date'}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0'>
										<CalendarComponent
											mode='single'
											selected={invoiceData.dueDate}
											onSelect={(date) => setInvoiceData({ ...invoiceData, dueDate: date })}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</CardContent>
					</Card>

					{/* Invoice Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Invoice Summary</CardTitle>
							<CardDescription>Review the invoice totals</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Subtotal:</span>
								<span>{formatCurrency(invoiceData.subtotal)}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Item Discounts:</span>
								<span>{formatCurrency(invoiceData.totalDiscount)}</span>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='additionalDiscount'>Additional Discount Amount</Label>
								<div className='relative'>
									<DollarSign className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
									<Input
										id='additionalDiscount'
										type='number'
										min='0'
										step='10'
										className='pl-9'
										value={invoiceData.additionalDiscount}
										onChange={(e) =>
											setInvoiceData({
												...invoiceData,
												additionalDiscount: e.target.value === '' ? 0 : Number(e.target.value),
											})
										}
									/>
								</div>
							</div>
							{invoiceData.additionalDiscount > 0 && (
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Additional Discount Amount:</span>
									<span>{formatCurrency(invoiceData.additionalDiscount)}</span>
								</div>
							)}
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Tax:</span>
								<span>{formatCurrency(invoiceData.totalTax)}</span>
							</div>
							<div className='flex justify-between pt-2 border-t'>
								<span className='font-medium'>Total:</span>
								<span className='font-medium'>{formatCurrency(invoiceData.totalAmount)}</span>
							</div>

							<div className='pt-4 space-y-4'>
								<div className='flex items-center space-x-2'>
									<Checkbox id='isPaid' checked={isPaid} onCheckedChange={handlePaidChange} />
									<Label htmlFor='isPaid' className='font-medium flex items-center'>
										<CreditCard className='mr-2 h-4 w-4' />
										Mark as Paid
									</Label>
								</div>

								{!isPaid && (
									<div className='space-y-2'>
										<Label htmlFor='paidAmount'>Paid Amount</Label>
										<div className='relative'>
											<DollarSign className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
											<Input
												id='paidAmount'
												type='number'
												min='0'
												max={invoiceData.totalAmount}
												step='0.01'
												className='pl-9'
												value={invoiceData.paidAmount}
												onChange={handlePaidAmountChange}
											/>
										</div>
									</div>
								)}

								<div className='flex justify-between pt-2 border-t'>
									<span className='font-medium'>Due Amount:</span>
									<span className='font-medium'>{formatCurrency(invoiceData.dueAmount)}</span>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button onClick={handleSubmit} disabled={createInvoiceMutation.isPending} className='w-full'>
								{createInvoiceMutation.isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Creating Invoice...
									</>
								) : (
									<>
										<Check className='mr-2 h-4 w-4' />
										Create Invoice
									</>
								)}
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default CreateInvoice;
