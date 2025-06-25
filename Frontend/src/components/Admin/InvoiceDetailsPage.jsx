'use client';
import { useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
	ArrowLeft,
	Download,
	Printer,
	DollarSign,
	Calendar,
	Mail,
	Phone,
	MapPin,
	XCircle,
	AlertCircle,
	Loader2,
	Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const InvoiceDetailsPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	// State for dialogs
	const [isRecordPaymentDialogOpen, setIsRecordPaymentDialogOpen] = useState(false);
	const [paymentAmount, setPaymentAmount] = useState('');
	const [paymentNotes, setPaymentNotes] = useState('');

	// Fetch invoice details
	const {
		data: invoice,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['invoice', id],
		queryFn: async () => {
			const response = await axiosSecure.get(`/api/invoices/${id}`);
			return response.data.invoice;
		},
		enabled: !!id,
	});

	// Record payment mutation
	const recordPaymentMutation = useMutation({
		mutationFn: async ({ invoiceId, amount, notes }) => {
			const response = await axiosSecure.post(`/api/invoices/${invoiceId}/payment`, {
				amount: Number.parseFloat(amount),
				notes,
			});
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoice', id] });
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
			toast.success('Payment recorded successfully');
			setIsRecordPaymentDialogOpen(false);
			setPaymentAmount('');
			setPaymentNotes('');
		},
		onError: (error) => {
			toast.error(`Failed to record payment: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Cancel invoice mutation
	const cancelInvoiceMutation = useMutation({
		mutationFn: async ({ invoiceId, notes }) => {
			const response = await axiosSecure.post(`/api/invoices/${invoiceId}/cancel`, { notes });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoice', id] });
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
			toast.success('Invoice cancelled successfully');
			navigate('/admin/invoices');
		},
		onError: (error) => {
			toast.error(`Failed to cancel invoice: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Handle recording a payment
	const handleRecordPayment = () => {
		if (!invoice) return;

		if (!paymentAmount || Number.parseFloat(paymentAmount) <= 0) {
			toast.error('Please enter a valid payment amount');
			return;
		}

		if (Number.parseFloat(paymentAmount) > invoice.dueAmount) {
			toast.error(`Payment amount cannot exceed due amount (${formatCurrency(invoice.dueAmount, invoice.currency)})`);
			return;
		}

		recordPaymentMutation.mutate({
			invoiceId: invoice._id,
			amount: paymentAmount,
			notes: paymentNotes,
		});
	};

	// Handle cancelling an invoice
	const handleCancelInvoice = () => {
		if (!invoice) return;

		if (window.confirm(`Are you sure you want to cancel invoice ${invoice.invoiceNumber}?`)) {
			cancelInvoiceMutation.mutate({
				invoiceId: invoice._id,
				notes: 'Cancelled by admin',
			});
		}
	};

	// Handle downloading invoice PDF
	const handleDownloadPdf = async () => {
		if (!invoice) return;

		try {
			const response = await axiosSecure.get(`/api/invoices/${invoice._id}/pdf`, {
				responseType: 'blob',
			});

			// Create a blob URL for the PDF
			const blob = new Blob([response.data], { type: 'application/pdf' });
			const url = window.URL.createObjectURL(blob);

			// Create a temporary link and trigger download
			const link = document.createElement('a');
			link.href = url;
			link.download = `invoice-${invoice.invoiceNumber}.pdf`;
			document.body.appendChild(link);
			link.click();

			// Clean up
			window.URL.revokeObjectURL(url);
			document.body.removeChild(link);
		} catch (error) {
			toast.error('Failed to download PDF');
			console.error('PDF download error:', error);
		}
	};

	// Handle print
	const handlePrint = () => {
		window.print();
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		return format(new Date(dateString), 'MMMM d, yyyy');
	};

	// Format currency
	const formatCurrency = (amount, currency = 'USD') => {
		if (amount === undefined || amount === null) return 'N/A';

		const currencySymbols = {
			USD: '$',
			EUR: '€',
			GBP: '£',
			BDT: '৳',
		};

		return `${currencySymbols[currency] || '$'}${Number.parseFloat(amount).toFixed(2)}`;
	};

	// Get status badge
	const getStatusBadge = (status) => {
		switch (status) {
			case 'draft':
				return (
					<Badge variant='outline' className='bg-gray-100 text-gray-800'>
						Draft
					</Badge>
				);
			case 'sent':
				return (
					<Badge variant='outline' className='bg-blue-100 text-blue-800'>
						Sent
					</Badge>
				);
			case 'paid':
				return (
					<Badge variant='outline' className='bg-green-100 text-green-800'>
						Paid
					</Badge>
				);
			case 'partially_paid':
				return (
					<Badge variant='outline' className='bg-yellow-100 text-yellow-800'>
						Partially Paid
					</Badge>
				);
			case 'overdue':
				return (
					<Badge variant='outline' className='bg-red-100 text-red-800'>
						Overdue
					</Badge>
				);
			case 'cancelled':
				return (
					<Badge variant='outline' className='bg-gray-100 text-gray-800'>
						Cancelled
					</Badge>
				);
			case 'void':
				return (
					<Badge variant='outline' className='bg-gray-100 text-gray-800'>
						Void
					</Badge>
				);
			default:
				return <Badge variant='outline'>{status}</Badge>;
		}
	};

	if (isLoading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	if (isError || !invoice) {
		return (
			<div className='text-center py-8'>
				<AlertCircle className='h-10 w-10 text-red-500 mx-auto mb-2' />
				<h3 className='text-lg font-medium'>Failed to load invoice details</h3>
				<p className='text-muted-foreground'>Please try again later</p>
				<div className='flex justify-center gap-4 mt-4'>
					<Button onClick={() => refetch()}>Retry</Button>
					<Button variant='outline' onClick={() => navigate('/admin/invoices')}>
						Back to Invoices
					</Button>
				</div>
			</div>
		);
	}

	// Calculate additional discount amount if present
	const additionalDiscountAmount = invoice.additionalDiscount
		? (invoice.subtotal - invoice.totalDiscount) * (invoice.additionalDiscount / 100)
		: 0;

	return (
		<div className='container mx-auto max-w-6xl py-6 space-y-6 print:p-0'>
			{/* Header with back button and actions */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden'>
				<div className='flex items-center gap-2'>
					<Button variant='outline' size='icon' onClick={() => navigate('/admin/invoices')}>
						<ArrowLeft className='h-4 w-4' />
					</Button>
					<h1 className='text-2xl font-bold'>Invoice #{invoice.invoiceNumber}</h1>
				</div>

				<div className='flex flex-wrap gap-2'>
					<Button variant='outline' onClick={handlePrint}>
						<Printer className='h-4 w-4 mr-2' />
						Print
					</Button>
					<Button variant='outline' onClick={handleDownloadPdf}>
						<Download className='h-4 w-4 mr-2' />
						Download PDF
					</Button>
					{['draft', 'sent', 'partially_paid', 'overdue'].includes(invoice.status) && (
						<Button onClick={() => setIsRecordPaymentDialogOpen(true)}>
							<DollarSign className='h-4 w-4 mr-2' />
							Record Payment
						</Button>
					)}
					{['draft', 'sent', 'partially_paid', 'overdue'].includes(invoice.status) && (
						<Button variant='destructive' onClick={handleCancelInvoice}>
							<XCircle className='h-4 w-4 mr-2' />
							Cancel Invoice
						</Button>
					)}
				</div>
			</div>

			{/* Invoice Header */}
			<div className='flex flex-col md:flex-row md:justify-between md:items-start gap-4 print:flex-row print:justify-between'>
				<div>
					<h2 className='text-3xl font-bold'>INVOICE</h2>
					<p className='text-muted-foreground'>#{invoice.invoiceNumber}</p>
				</div>

				<div className='text-right'>
					<div className='flex items-center gap-2 justify-end'>
						<Calendar className='h-4 w-4 text-muted-foreground' />
						<span>Issue Date: {formatDate(invoice.issueDate)}</span>
					</div>
					<div className='flex items-center gap-2 justify-end'>
						<Calendar className='h-4 w-4 text-muted-foreground' />
						<span>Due Date: {formatDate(invoice.dueDate)}</span>
					</div>
					<div className='mt-2'>{getStatusBadge(invoice.status)}</div>
				</div>
			</div>

			{/* Company and Customer Information */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2'>
				{/* Company Information */}
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-lg'>From</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-1'>
							<h3 className='font-bold'>Travel Agency</h3>
							<p>123 Travel Street</p>
							<p>City, Country</p>
							<p>Phone: +1 234 567 890</p>
							<p>Email: info@travelagency.com</p>
						</div>
					</CardContent>
				</Card>

				{/* Customer Information */}
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-lg'>Bill To</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-1'>
							<h3 className='font-bold'>{invoice.customer.name}</h3>
							<div className='flex items-center gap-2'>
								<Mail className='h-4 w-4 text-muted-foreground' />
								<span>{invoice.customer.email}</span>
							</div>
							<div className='flex items-center gap-2'>
								<Phone className='h-4 w-4 text-muted-foreground' />
								<span>{invoice.customer.phone}</span>
							</div>
							{invoice.customer.address && (
								<div className='flex items-center gap-2'>
									<MapPin className='h-4 w-4 text-muted-foreground' />
									<span>{invoice.customer.address}</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Invoice Items */}
			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-lg'>Invoice Items</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='overflow-x-auto'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Item</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className='text-right'>Qty</TableHead>
									<TableHead className='text-right'>Unit Price</TableHead>
									<TableHead className='text-right'>Discount</TableHead>
									<TableHead className='text-right'>Tax</TableHead>
									<TableHead className='text-right'>Total</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoice.items.map((item, index) => (
									<TableRow key={index}>
										<TableCell className='font-medium'>{item.name}</TableCell>
										<TableCell>{item.description || '-'}</TableCell>
										<TableCell className='text-right'>{item.quantity}</TableCell>
										<TableCell className='text-right'>{formatCurrency(item.unitPrice, invoice.currency)}</TableCell>
										<TableCell className='text-right'>{item.discount > 0 ? `${item.discount}%` : '-'}</TableCell>
										<TableCell className='text-right'>{item.tax > 0 ? `${item.tax}%` : '-'}</TableCell>
										<TableCell className='text-right'>{formatCurrency(item.total, invoice.currency)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Invoice Totals */}
					<div className='mt-6 flex justify-end'>
						<div className='w-full md:w-1/3 space-y-2'>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Subtotal:</span>
								<span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Item Discounts:</span>
								<span>{formatCurrency(invoice.totalDiscount, invoice.currency)}</span>
							</div>
							{invoice.additionalDiscount > 0 && (
								<div className='flex justify-between'>
									<div className='flex items-center'>
										<span className='text-muted-foreground'>Additional Discount:</span>
										<Badge variant='outline' className='ml-2 bg-blue-50 text-blue-700'>
											<Percent className='h-3 w-3 mr-1' />
											{invoice.additionalDiscount}%
										</Badge>
									</div>
									<span>{formatCurrency(additionalDiscountAmount, invoice.currency)}</span>
								</div>
							)}
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Tax:</span>
								<span>{formatCurrency(invoice.totalTax, invoice.currency)}</span>
							</div>
							<Separator className='my-2' />
							<div className='flex justify-between font-medium'>
								<span>Total:</span>
								<span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Amount Paid:</span>
								<span>{formatCurrency(invoice.paidAmount, invoice.currency)}</span>
							</div>
							<div className='flex justify-between font-medium'>
								<span>Balance Due:</span>
								<span>{formatCurrency(invoice.dueAmount, invoice.currency)}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Notes and Terms */}
			{(invoice.notes || invoice.terms) && (
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-lg'>Additional Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{invoice.notes && (
								<div>
									<h3 className='font-medium mb-2'>Notes</h3>
									<p className='text-muted-foreground'>{invoice.notes}</p>
								</div>
							)}
							{invoice.terms && (
								<div>
									<h3 className='font-medium mb-2'>Terms and Conditions</h3>
									<p className='text-muted-foreground'>{invoice.terms}</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Payment History */}
			{invoice.updateHistory && invoice.updateHistory.length > 0 && (
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-lg'>Payment History</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Updated By</TableHead>
										<TableHead>Notes</TableHead>
										<TableHead className='text-right'>Amount</TableHead>
										<TableHead>Status Change</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{invoice.updateHistory.map((update, index) => (
										<TableRow key={index}>
											<TableCell>{formatDate(update.createdAt)}</TableCell>
											<TableCell>{update.updaterName}</TableCell>
											<TableCell>{update.updateNotes || '-'}</TableCell>
											<TableCell className='text-right'>
												{update.previousPaidAmount !== undefined && update.newPaidAmount !== undefined
													? formatCurrency(update.newPaidAmount - update.previousPaidAmount, invoice.currency)
													: '-'}
											</TableCell>
											<TableCell>
												{update.previousStatus !== update.newStatus
													? `${update.previousStatus || '-'} → ${update.newStatus || '-'}`
													: '-'}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Record Payment Dialog */}
			<Dialog open={isRecordPaymentDialogOpen} onOpenChange={setIsRecordPaymentDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Record Payment</DialogTitle>
						<DialogDescription>
							Record a payment for invoice #{invoice.invoiceNumber}.
							<div className='mt-2'>
								<span className='font-medium'>Due Amount:</span> {formatCurrency(invoice.dueAmount, invoice.currency)}
							</div>
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4 py-4'>
						<div className='space-y-2'>
							<Label htmlFor='amount'>Payment Amount</Label>
							<div className='relative'>
								<DollarSign className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
								<Input
									id='amount'
									type='number'
									step='0.01'
									min='0.01'
									max={invoice.dueAmount}
									placeholder='0.00'
									className='pl-9'
									value={paymentAmount}
									onChange={(e) => setPaymentAmount(e.target.value)}
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='notes'>Notes (Optional)</Label>
							<Input
								id='notes'
								placeholder='Payment notes'
								value={paymentNotes}
								onChange={(e) => setPaymentNotes(e.target.value)}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={() => setIsRecordPaymentDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleRecordPayment}
							disabled={recordPaymentMutation.isPending || !paymentAmount || Number.parseFloat(paymentAmount) <= 0}>
							{recordPaymentMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Processing...
								</>
							) : (
								'Record Payment'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default InvoiceDetailsPage;
