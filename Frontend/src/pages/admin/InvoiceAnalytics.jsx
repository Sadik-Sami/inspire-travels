'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { format } from 'date-fns';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from 'recharts';
import {
	DollarSign,
	FileText,
	TrendingUp,
	Calendar,
	ArrowUpRight,
	ArrowDownRight,
	Loader2,
	AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const InvoiceAnalytics = () => {
	const axiosSecure = useAxiosSecure();
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

	// Fetch summary analytics data
	const {
		data: summaryData,
		isLoading: isSummaryLoading,
		isError: isSummaryError,
	} = useQuery({
		queryKey: ['invoiceAnalytics', 'summary'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/invoices/analytics/summary');
			return response.data.data;
		},
	});

	// Fetch monthly revenue data
	const {
		data: monthlyData,
		isLoading: isMonthlyLoading,
		isError: isMonthlyError,
	} = useQuery({
		queryKey: ['invoiceAnalytics', 'monthly', selectedYear],
		queryFn: async () => {
			const response = await axiosSecure.get(`/api/invoices/analytics/monthly-revenue?year=${selectedYear}`);
			return response.data.data;
		},
	});

	// Fetch top customers data
	const {
		data: topCustomersData,
		isLoading: isCustomersLoading,
		isError: isCustomersError,
	} = useQuery({
		queryKey: ['invoiceAnalytics', 'topCustomers'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/invoices/analytics/top-customers?limit=5');
			return response.data.data;
		},
	});

	// Format currency
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	// Status colors for pie chart
	const STATUS_COLORS = {
		paid: '#10b981', // green
		partially_paid: '#f59e0b', // amber
		draft: '#64748b', // slate
		sent: '#3b82f6', // blue
		overdue: '#ef4444', // red
		cancelled: '#6b7280', // gray
		void: '#1f2937', // dark gray
	};

	// Prepare data for status distribution pie chart
	const prepareStatusData = () => {
		if (!summaryData || !summaryData.statusCounts) return [];

		return Object.entries(summaryData.statusCounts).map(([status, count]) => ({
			name: status.charAt(0).toUpperCase() + status.slice(1),
			value: count,
		}));
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

	// Loading state
	if (isSummaryLoading || isMonthlyLoading || isCustomersLoading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		);
	}

	// Error state
	if (isSummaryError || isMonthlyError || isCustomersError) {
		return (
			<div className='text-center py-8'>
				<AlertCircle className='h-10 w-10 text-red-500 mx-auto mb-2' />
				<h3 className='text-lg font-medium'>Failed to load analytics data</h3>
				<p className='text-muted-foreground'>Please try again later</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
				<h1 className='text-3xl font-bold'>Invoice Analytics</h1>

				<div className='flex items-center gap-2 mt-4 sm:mt-0'>
					<span className='text-sm font-medium'>Year:</span>
					<Select value={selectedYear} onValueChange={setSelectedYear}>
						<SelectTrigger className='w-32'>
							<SelectValue placeholder='Select Year' />
						</SelectTrigger>
						<SelectContent>
							{Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
								<SelectItem key={year} value={year.toString()}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
						<DollarSign className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{formatCurrency(summaryData.totalRevenue)}</div>
						<p className='text-xs text-muted-foreground'>Collection rate: {summaryData.collectionRate.toFixed(1)}%</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Outstanding Amount</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{formatCurrency(summaryData.totalDue)}</div>
						<p className='text-xs text-muted-foreground'>
							{((summaryData.totalDue / summaryData.totalAmount) * 100).toFixed(1)}% of total invoiced
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Total Invoices</CardTitle>
						<FileText className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{summaryData.totalInvoices}</div>
						<p className='text-xs text-muted-foreground'>{summaryData.statusCounts.paid || 0} paid invoices</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Overdue Invoices</CardTitle>
						<Calendar className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{summaryData.statusCounts.overdue || 0}</div>
						<p className='text-xs text-muted-foreground'>{formatCurrency(summaryData.totalDue)} outstanding</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts */}
			<div className='grid gap-4 md:grid-cols-2'>
				{/* Monthly Revenue Chart */}
				<Card className='col-span-1'>
					<CardHeader>
						<CardTitle>Monthly Revenue ({selectedYear})</CardTitle>
						<CardDescription>Monthly invoice amounts and payments</CardDescription>
					</CardHeader>
					<CardContent className='h-80'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart
								data={monthlyData}
								margin={{
									top: 20,
									right: 30,
									left: 20,
									bottom: 5,
								}}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='monthName' />
								<YAxis />
								<Tooltip
									formatter={(value) => formatCurrency(value)}
									labelFormatter={(label) => `${label} ${selectedYear}`}
								/>
								<Legend />
								<Bar dataKey='totalAmount' name='Total Amount' fill='#3b82f6' />
								<Bar dataKey='paidAmount' name='Paid Amount' fill='#10b981' />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Invoice Status Distribution */}
				<Card className='col-span-1'>
					<CardHeader>
						<CardTitle>Invoice Status Distribution</CardTitle>
						<CardDescription>Breakdown of invoices by status</CardDescription>
					</CardHeader>
					<CardContent className='h-80'>
						<ResponsiveContainer width='100%' height='100%'>
							<PieChart>
								<Pie
									data={prepareStatusData()}
									cx='50%'
									cy='50%'
									labelLine={false}
									label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
									outerRadius={80}
									fill='#8884d8'
									dataKey='value'>
									{prepareStatusData().map((entry, index) => (
										<Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#8884d8'} />
									))}
								</Pie>
								<Tooltip formatter={(value, name) => [`${value} invoices`, name]} />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Top Customers */}
			<Card>
				<CardHeader>
					<CardTitle>Top Customers</CardTitle>
					<CardDescription>Customers with highest invoice amounts</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Customer</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Invoices</TableHead>
								<TableHead className='text-right'>Total Amount</TableHead>
								<TableHead className='text-right'>Paid Amount</TableHead>
								<TableHead className='text-right'>Payment Rate</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{topCustomersData.map((customer) => (
								<TableRow key={customer._id}>
									<TableCell className='font-medium'>{customer.customerName}</TableCell>
									<TableCell>{customer.customerEmail}</TableCell>
									<TableCell>{customer.invoiceCount}</TableCell>
									<TableCell className='text-right'>{formatCurrency(customer.totalSpent)}</TableCell>
									<TableCell className='text-right'>{formatCurrency(customer.paidAmount)}</TableCell>
									<TableCell className='text-right'>
										<div className='flex items-center justify-end'>
											{customer.paidAmount / customer.totalSpent >= 0.8 ? (
												<ArrowUpRight className='mr-1 h-4 w-4 text-green-500' />
											) : (
												<ArrowDownRight className='mr-1 h-4 w-4 text-red-500' />
											)}
											{((customer.paidAmount / customer.totalSpent) * 100).toFixed(1)}%
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Recent Invoices */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Invoices</CardTitle>
					<CardDescription>Latest invoice activity</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice #</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className='text-right'>Amount</TableHead>
								<TableHead className='text-right'>Paid</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{summaryData.recentInvoices.map((invoice) => (
								<TableRow key={invoice._id}>
									<TableCell className='font-medium'>{invoice.invoiceNumber}</TableCell>
									<TableCell>{invoice.customer.name}</TableCell>
									<TableCell>{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</TableCell>
									<TableCell>{getStatusBadge(invoice.status)}</TableCell>
									<TableCell className='text-right'>{formatCurrency(invoice.totalAmount)}</TableCell>
									<TableCell className='text-right'>{formatCurrency(invoice.paidAmount)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default InvoiceAnalytics;
