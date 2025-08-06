import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
	Search,
	Plus,
	Filter,
	MoreHorizontal,
	Download,
	FileText,
	DollarSign,
	FileSpreadsheet,
	Loader2,
	AlertCircle,
	XCircle,
	ArrowUpDown,
	CalendarIcon,
	ChevronDown,
	Trash2,
	AlertTriangle,
	TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import PaginationControls from '@/components/Destination/PaginationControls';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const AdminInvoices = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// State for pagination, filtering, and sorting
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
	const [sortField, setSortField] = useState('createdAt');
	const [sortDirection, setSortDirection] = useState('desc');

	// State for dialogs
	const [isRecordPaymentDialogOpen, setIsRecordPaymentDialogOpen] = useState(false);
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [paymentAmount, setPaymentAmount] = useState('');
	const [paymentNotes, setPaymentNotes] = useState('');

	// Debounce search to avoid too many API calls
	const debouncedSearch = useDebounce(searchQuery, 500);

	// Fetch invoices with filtering, sorting, and pagination
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['invoices', page, debouncedSearch, statusFilter, dateRange, sortField, sortDirection],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: '10',
				sortBy: sortField,
				sortOrder: sortDirection,
			});

			if (debouncedSearch) {
				params.append('search', debouncedSearch);
			}

			if (statusFilter !== 'all') {
				params.append('status', statusFilter);
			}

			if (dateRange.startDate) {
				params.append('startDate', dateRange.startDate.toISOString());
			}

			if (dateRange.endDate) {
				params.append('endDate', dateRange.endDate.toISOString());
			}

			const response = await axiosSecure.get(`/api/invoices?${params.toString()}`);
			return response.data;
		},
		keepPreviousData: true,
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
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
			if (selectedInvoice) {
				queryClient.invalidateQueries({ queryKey: ['invoice', selectedInvoice._id] });
			}
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
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
			if (selectedInvoice) {
				queryClient.invalidateQueries({ queryKey: ['invoice', selectedInvoice._id] });
			}
			toast.success('Invoice cancelled successfully');
			setIsCancelDialogOpen(false);
		},
		onError: (error) => {
			toast.error(`Failed to cancel invoice: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Delete invoice mutation
	const deleteInvoiceMutation = useMutation({
		mutationFn: async (invoiceId) => {
			const response = await axiosSecure.delete(`/api/invoices/${invoiceId}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['invoices'] });
			toast.success('Invoice deleted successfully');
			setIsDeleteDialogOpen(false);
		},
		onError: (error) => {
			toast.error(`Failed to delete invoice: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Handle recording a payment
	const handleRecordPayment = () => {
		if (!selectedInvoice) return;

		if (!paymentAmount || Number.parseFloat(paymentAmount) <= 0) {
			toast.error('Please enter a valid payment amount');
			return;
		}

		if (Number.parseFloat(paymentAmount) > selectedInvoice.dueAmount) {
			toast.error(
				`Payment amount cannot exceed due amount (${formatCurrency(
					selectedInvoice.dueAmount,
					selectedInvoice.currency
				)})`
			);
			return;
		}

		recordPaymentMutation.mutate({
			invoiceId: selectedInvoice._id,
			amount: paymentAmount,
			notes: paymentNotes,
		});
	};

	// Handle cancelling an invoice
	const handleCancelInvoice = () => {
		if (!selectedInvoice) return;

		cancelInvoiceMutation.mutate({
			invoiceId: selectedInvoice._id,
			notes: 'Cancelled by admin',
		});
	};

	// Handle deleting an invoice
	const handleDeleteInvoice = () => {
		if (!selectedInvoice) return;

		deleteInvoiceMutation.mutate(selectedInvoice._id);
	};

	// Handle opening record payment dialog
	const handleOpenRecordPaymentDialog = (invoice) => {
		setSelectedInvoice(invoice);
		setPaymentAmount('');
		setPaymentNotes('');
		setIsRecordPaymentDialogOpen(true);
	};

	// Handle opening cancel dialog
	const handleOpenCancelDialog = (invoice) => {
		setSelectedInvoice(invoice);
		setIsCancelDialogOpen(true);
	};

	// Handle opening delete dialog
	const handleOpenDeleteDialog = (invoice) => {
		setSelectedInvoice(invoice);
		setIsDeleteDialogOpen(true);
	};

	// Handle downloading invoice PDF
	const handleDownloadPdf = async (invoice) => {
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

	// Handle exporting invoices as CSV
	const handleExportCsv = async () => {
		try {
			const params = new URLSearchParams();

			if (statusFilter !== 'all') {
				params.append('status', statusFilter);
			}

			if (dateRange.startDate) {
				params.append('startDate', dateRange.startDate.toISOString());
			}

			if (dateRange.endDate) {
				params.append('endDate', dateRange.endDate.toISOString());
			}

			const response = await axiosSecure.get(`/api/invoices/export/csv?${params.toString()}`, {
				responseType: 'blob',
			});

			// Create a blob URL for the CSV
			const blob = new Blob([response.data], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);

			// Create a temporary link and trigger download
			const link = document.createElement('a');
			link.href = url;
			link.download = 'invoices.csv';
			document.body.appendChild(link);
			link.click();

			// Clean up
			window.URL.revokeObjectURL(url);
			document.body.removeChild(link);
		} catch (error) {
			toast.error('Failed to export CSV');
			console.error('CSV export error:', error);
		}
	};

	// Handle sorting
	const handleSort = (field) => {
		if (sortField === field) {
			// Toggle direction if clicking the same field
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			// Set new field and default to ascending
			setSortField(field);
			setSortDirection('asc');
		}
		// Reset to first page when sorting changes
		setPage(1);
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPage(newPage);
		// Scroll to top of the page
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		return format(new Date(dateString), 'MMM d, yyyy');
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

	// Get sort icon
	const getSortIcon = (field) => {
		if (sortField !== field) return null;

		return sortDirection === 'asc' ? (
			<ArrowUpDown className='h-4 w-4 ml-1 rotate-180' />
		) : (
			<ArrowUpDown className='h-4 w-4 ml-1' />
		);
	};

	// Extract invoices array and pagination data safely
	const invoices = data?.invoices || [];
	const pagination = data?.pagination || { totalPages: 1, currentPage: 1, total: 0 };

	const [startDate, setStartDate] = useState(dateRange.startDate);
	const [endDate, setEndDate] = useState(dateRange.endDate);

	// Clear all filters
	const clearFilters = () => {
		setSearchQuery('');
		setStatusFilter('all');
		setDateRange({ startDate: null, endDate: null });
		setStartDate(null);
		setEndDate(null);
		setPage(1);
	};

	return (
		<div>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
				<h1 className='text-3xl font-bold'>Invoices</h1>

				<div className='flex flex-col sm:flex-row gap-4'>
					<Button variant='outline' className='flex items-center gap-2' onClick={handleExportCsv}>
						<FileSpreadsheet className='h-4 w-4' />
						Export CSV
					</Button>

					<Button
						variant='outline'
						className='flex items-center gap-2'
						onClick={() => navigate('/admin/invoices/analytics')}>
						<TrendingUp className='h-4 w-4' />
						Analytics
					</Button>

					<Button className='flex items-center gap-2' onClick={() => navigate('/admin/invoices/new')}>
						<Plus className='h-4 w-4' />
						Create Invoice
					</Button>
				</div>
			</div>

			{/* Filters - Improved Layout */}
			<Card className='mb-6'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-md font-medium'>Filters & Search</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col md:flex-row gap-4'>
						{/* Search */}
						<div className='relative flex-1'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
							<Input
								type='search'
								placeholder='Search invoices...'
								className='pl-8 w-full'
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setPage(1); // Reset to first page on search
								}}
							/>
						</div>

						{/* Status filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='outline' className='flex items-center gap-2 min-w-[150px]'>
									<Filter className='h-4 w-4' />
									Status: {statusFilter === 'all' ? 'All' : statusFilter}
									<ChevronDown className='h-4 w-4 ml-auto' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem
									onClick={() => {
										setStatusFilter('all');
										setPage(1);
									}}>
									All Statuses
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setStatusFilter('draft');
										setPage(1);
									}}>
									Draft
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setStatusFilter('sent');
										setPage(1);
									}}>
									Sent
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setStatusFilter('paid');
										setPage(1);
									}}>
									Paid
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setStatusFilter('partially_paid');
										setPage(1);
									}}>
									Partially Paid
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setStatusFilter('overdue');
										setPage(1);
									}}>
									Overdue
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setStatusFilter('cancelled');
										setPage(1);
									}}>
									Cancelled
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setStatusFilter('void');
										setPage(1);
									}}>
									Void
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Date range - Start date */}
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									className={cn(
										'min-w-[150px] justify-start text-left font-normal',
										!startDate && 'text-muted-foreground'
									)}>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{startDate ? format(startDate, 'PPP') : 'Start date'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0'>
								<Calendar
									mode='single'
									selected={startDate}
									onSelect={(date) => {
										setStartDate(date);
										setDateRange({ ...dateRange, startDate: date });
										setPage(1);
									}}
									initialFocus
								/>
							</PopoverContent>
						</Popover>

						{/* Date range - End date */}
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									className={cn(
										'min-w-[150px] justify-start text-left font-normal',
										!endDate && 'text-muted-foreground'
									)}>
									<CalendarIcon className='mr-2 h-4 w-4' />
									{endDate ? format(endDate, 'PPP') : 'End date'}
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0'>
								<Calendar
									mode='single'
									selected={endDate}
									onSelect={(date) => {
										setEndDate(date);
										setDateRange({ ...dateRange, endDate: date });
										setPage(1);
									}}
									initialFocus
								/>
							</PopoverContent>
						</Popover>

						{/* Clear filters */}
						<Button variant='outline' onClick={clearFilters} className='min-w-[120px]'>
							<Filter className='mr-2 h-4 w-4' />
							Clear Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Invoices Table */}
			<Card>
				<CardHeader className='pb-2'>
					<CardTitle>Invoices</CardTitle>
					<CardDescription>
						Manage your invoices and payments.
						{!isLoading && (
							<span className='ml-2 text-sm'>
								Showing {invoices.length} of {pagination.total} invoices
							</span>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className='flex justify-center py-8'>
							<Loader2 className='h-8 w-8 animate-spin text-primary' />
						</div>
					) : isError ? (
						<div className='text-center py-8'>
							<AlertCircle className='h-10 w-10 text-red-500 mx-auto mb-2' />
							<h3 className='text-lg font-medium'>Failed to load invoices</h3>
							<p className='text-muted-foreground'>Please try again later</p>
							<Button onClick={() => refetch()} className='mt-4'>
								Retry
							</Button>
						</div>
					) : invoices.length === 0 ? (
						<div className='text-center py-12 space-y-4'>
							<div className='text-muted-foreground text-lg'>No invoices found</div>
							<p className='text-muted-foreground'>Try adjusting your search or create a new invoice</p>
							<Button onClick={() => navigate('/admin/invoices/create')} className='mt-2'>
								<Plus className='h-4 w-4 mr-2' />
								Create Invoice
							</Button>
						</div>
					) : (
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											<Button
												variant='ghost'
												className='p-0 font-bold flex items-center'
												onClick={() => handleSort('invoiceNumber')}>
												Invoice # {getSortIcon('invoiceNumber')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='ghost'
												className='p-0 font-bold flex items-center'
												onClick={() => handleSort('customer.name')}>
												Customer {getSortIcon('customer.name')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='ghost'
												className='p-0 font-bold flex items-center'
												onClick={() => handleSort('issueDate')}>
												Issue Date {getSortIcon('issueDate')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='ghost'
												className='p-0 font-bold flex items-center'
												onClick={() => handleSort('dueDate')}>
												Due Date {getSortIcon('dueDate')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='ghost'
												className='p-0 font-bold flex items-center'
												onClick={() => handleSort('totalAmount')}>
												Amount {getSortIcon('totalAmount')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='ghost'
												className='p-0 font-bold flex items-center'
												onClick={() => handleSort('status')}>
												Status {getSortIcon('status')}
											</Button>
										</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{invoices.map((invoice) => (
										<TableRow key={invoice._id}>
											<TableCell className='font-medium'>{invoice.invoiceNumber}</TableCell>
											<TableCell>
												<div className='flex flex-col'>
													<div className='font-medium'>{invoice.customer.name}</div>
													<div className='text-sm text-muted-foreground'>{invoice.customer.email}</div>
												</div>
											</TableCell>
											<TableCell>{formatDate(invoice.issueDate)}</TableCell>
											<TableCell>{formatDate(invoice.dueDate)}</TableCell>
											<TableCell>{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
											<TableCell>{getStatusBadge(invoice.status)}</TableCell>
											<TableCell className='text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='icon'>
															<MoreHorizontal className='h-4 w-4' />
															<span className='sr-only'>Actions</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => navigate(`/admin/invoices/${invoice._id}`)}>
															<FileText className='h-4 w-4' />
															View Details
														</DropdownMenuItem>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleDownloadPdf(invoice)}>
															<Download className='h-4 w-4' />
															Download PDF
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														{['draft', 'sent', 'partially_paid', 'overdue'].includes(invoice.status) && (
															<DropdownMenuItem
																className='flex items-center gap-2'
																onClick={() => handleOpenRecordPaymentDialog(invoice)}>
																<DollarSign className='h-4 w-4' />
																Record Payment
															</DropdownMenuItem>
														)}
														{['draft', 'sent', 'partially_paid', 'overdue'].includes(invoice.status) && (
															<DropdownMenuItem
																className='flex items-center gap-2 text-amber-500 focus:text-amber-500'
																onClick={() => handleOpenCancelDialog(invoice)}>
																<XCircle className='h-4 w-4' />
																Cancel Invoice
															</DropdownMenuItem>
														)}
														<DropdownMenuItem
															className='flex items-center gap-2 text-red-500 focus:text-red-500'
															onClick={() => handleOpenDeleteDialog(invoice)}>
															<Trash2 className='h-4 w-4' />
															Delete Invoice
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}

					{/* Pagination */}
					{!isLoading && invoices.length > 0 && (
						<div className='mt-4'>
							<PaginationControls
								currentPage={page}
								totalPages={pagination.totalPages}
								onPageChange={handlePageChange}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Record Payment Dialog */}
			<Dialog open={isRecordPaymentDialogOpen} onOpenChange={setIsRecordPaymentDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Record Payment</DialogTitle>
						<DialogDescription>
							{selectedInvoice && (
								<>
									Record a payment for invoice #{selectedInvoice.invoiceNumber}.
									<div className='mt-2'>
										<span className='font-medium'>Due Amount:</span>{' '}
										{formatCurrency(selectedInvoice.dueAmount, selectedInvoice.currency)}
									</div>
								</>
							)}
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
									max={selectedInvoice?.dueAmount}
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

			{/* Cancel Invoice Alert Dialog */}
			<AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Invoice</AlertDialogTitle>
						<AlertDialogDescription>
							{selectedInvoice && (
								<>
									Are you sure you want to cancel invoice{' '}
									<span className='font-medium'>{selectedInvoice.invoiceNumber}</span>?
									<div className='mt-2'>
										This action cannot be undone. The invoice will be marked as cancelled and no further payments can be
										recorded.
									</div>
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>No, keep invoice</AlertDialogCancel>
						<AlertDialogAction onClick={handleCancelInvoice} className='bg-amber-600 hover:bg-amber-700'>
							{cancelInvoiceMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Cancelling...
								</>
							) : (
								<>
									<XCircle className='mr-2 h-4 w-4' />
									Yes, cancel invoice
								</>
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Invoice Alert Dialog */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className='flex items-center gap-2 text-red-600'>
							<AlertTriangle className='h-5 w-5' />
							Delete Invoice
						</AlertDialogTitle>
						<AlertDialogDescription>
							{selectedInvoice && (
								<>
									Are you sure you want to permanently delete invoice{' '}
									<span className='font-medium'>{selectedInvoice.invoiceNumber}</span>?
									<div className='mt-2 text-red-500 font-medium'>
										This action cannot be undone. This will permanently delete the invoice and all associated data.
									</div>
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteInvoice} className='bg-red-600 hover:bg-red-700'>
							{deleteInvoiceMutation.isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className='mr-2 h-4 w-4' />
									Yes, delete invoice
								</>
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default AdminInvoices;
