'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
	Users,
	Briefcase,
	FileText,
	CreditCard,
	BookOpen,
	Calendar,
	DollarSign,
	StampIcon as Passport,
	Eye,
	Clock,
	ArrowUpRight,
	Loader2,
	AlertCircle,
	RefreshCw,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart as RechartsPieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';

const AdminHome = () => {
	const axiosSecure = useAxiosSecure();
	const navigate = useNavigate();
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

	// Fetch dashboard summary data
	const {
		data: summaryData,
		isLoading: isSummaryLoading,
		isError: isSummaryError,
		refetch: refetchSummary,
	} = useQuery({
		queryKey: ['dashboardSummary'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/analytics/dashboard-summary');
			return response.data.data;
		},
	});

	// Fetch monthly revenue data
	const {
		data: monthlyRevenueData,
		isLoading: isRevenueLoading,
		isError: isRevenueError,
		refetch: refetchRevenue,
	} = useQuery({
		queryKey: ['monthlyRevenue', selectedYear],
		queryFn: async () => {
			const response = await axiosSecure.get(`/api/analytics/monthly-revenue?year=${selectedYear}`);
			return response.data.data;
		},
	});

	// Fetch user growth data
	const {
		data: userGrowthData,
		isLoading: isUserGrowthLoading,
		isError: isUserGrowthError,
		refetch: refetchUserGrowth,
	} = useQuery({
		queryKey: ['userGrowth', selectedYear],
		queryFn: async () => {
			const response = await axiosSecure.get(`/api/analytics/user-growth?year=${selectedYear}`);
			return response.data.data;
		},
	});

	// Fetch blog performance data
	const {
		data: blogPerformanceData,
		isLoading: isBlogLoading,
		isError: isBlogError,
		refetch: refetchBlogData,
	} = useQuery({
		queryKey: ['blogPerformance'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/analytics/blog-performance');
			return response.data.data;
		},
	});

	// Fetch recent activity data
	const {
		data: recentActivityData,
		isLoading: isActivityLoading,
		isError: isActivityError,
		refetch: refetchActivity,
	} = useQuery({
		queryKey: ['recentActivity'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/analytics/recent-activity');
			return response.data.data;
		},
	});

	// Handle refetch all data
	const handleRefreshData = () => {
		refetchSummary();
		refetchRevenue();
		refetchUserGrowth();
		refetchBlogData();
		refetchActivity();
	};

	// Format currency
	const formatCurrency = (amount, currency = 'USD') => {
		if (amount === undefined || amount === null) return '$0.00';

		const currencySymbols = {
			USD: '$',
			EUR: '€',
			GBP: '£',
			BDT: '৳',
		};

		return `${currencySymbols[currency] || '$'}${Number(amount).toFixed(2)}`;
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		try {
			return format(new Date(dateString), 'MMM d, yyyy');
		} catch (error) {
			return 'Invalid date';
		}
	};

	// Calculate percentage change
	const calculatePercentChange = (current, previous) => {
		if (!previous) return 100;
		return ((current - previous) / previous) * 100;
	};

	// Pie chart colors
	const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#6B66FF'];

	// Loading state
	if (isSummaryLoading || isRevenueLoading || isUserGrowthLoading || isBlogLoading || isActivityLoading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[60vh]'>
				<Loader2 className='h-12 w-12 animate-spin text-primary mb-4' />
				<h3 className='text-xl font-medium'>Loading dashboard data...</h3>
				<p className='text-muted-foreground'>Please wait while we fetch the latest information</p>
			</div>
		);
	}

	// Error state
	if (isSummaryError || isRevenueError || isUserGrowthError || isBlogError || isActivityError) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[60vh]'>
				<AlertCircle className='h-12 w-12 text-destructive mb-4' />
				<h3 className='text-xl font-medium'>Failed to load dashboard data</h3>
				<p className='text-muted-foreground mb-4'>There was an error fetching the dashboard information</p>
				<Button onClick={handleRefreshData}>
					<RefreshCw className='mr-2 h-4 w-4' />
					Retry
				</Button>
			</div>
		);
	}

	// Prepare data for charts
	const prepareInvoiceStatusData = () => {
		if (!summaryData?.invoices?.byStatus) return [];

		return Object.entries(summaryData.invoices.byStatus).map(([status, count]) => ({
			name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
			value: count,
		}));
	};

	const prepareBookingStatusData = () => {
		if (!summaryData?.bookings?.byStatus) return [];

		return Object.entries(summaryData.bookings.byStatus).map(([status, count]) => ({
			name: status.charAt(0).toUpperCase() + status.slice(1),
			value: count,
		}));
	};

	const prepareVisaStatusData = () => {
		if (!summaryData?.visaBookings?.byStatus) return [];

		return Object.entries(summaryData.visaBookings.byStatus).map(([status, count]) => ({
			name: status.charAt(0).toUpperCase() + status.slice(1),
			value: count,
		}));
	};

	const prepareUserRoleData = () => {
		if (!summaryData?.users?.byRole) return [];

		return Object.entries(summaryData.users.byRole).map(([role, count]) => ({
			name: role.charAt(0).toUpperCase() + role.slice(1),
			value: count,
		}));
	};

	return (
		<div className='flex flex-col gap-6'>
			{/* Dashboard Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
					<p className='text-muted-foreground'>Welcome to your admin dashboard. Here's an overview of your business.</p>
				</div>
				<div className='flex items-center gap-2'>
					<Select value={selectedYear} onValueChange={setSelectedYear}>
						<SelectTrigger className='w-[120px]'>
							<SelectValue placeholder='Select Year' />
						</SelectTrigger>
						<SelectContent>
							{yearOptions.map((year) => (
								<SelectItem key={year} value={year}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button variant='outline' onClick={handleRefreshData}>
						<RefreshCw className='h-4 w-4 mr-2' />
						Refresh
					</Button>
				</div>
			</div>

			{/* Key Metrics */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{/* Total Revenue */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
						<DollarSign className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{formatCurrency(summaryData?.invoices?.revenue?.paidAmount || 0)}</div>
						<p className='text-xs text-muted-foreground'>
							{formatCurrency(summaryData?.invoices?.revenue?.totalAmount || 0)} invoiced
						</p>
						<div className='mt-2 flex items-center text-xs'>
							<Badge variant='outline' className='bg-green-100 text-green-800'>
								<ArrowUpRight className='h-3 w-3 mr-1' />
								{monthlyRevenueData && monthlyRevenueData.length > 0
									? `+${monthlyRevenueData[monthlyRevenueData.length - 1].collectedAmount.toFixed(2)} this month`
									: 'No data'}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Total Bookings */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Total Bookings</CardTitle>
						<Briefcase className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{(summaryData?.bookings?.total || 0) + (summaryData?.visaBookings?.total || 0)}
						</div>
						<p className='text-xs text-muted-foreground'>
							{summaryData?.bookings?.total || 0} trips, {summaryData?.visaBookings?.total || 0} visas
						</p>
						<div className='mt-2 flex items-center text-xs'>
							<Badge variant='outline' className='bg-green-100 text-green-800'>
								<ArrowUpRight className='h-3 w-3 mr-1' />
								{summaryData?.bookings?.recent + summaryData?.visaBookings?.recent || 0} new in 30 days
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Total Users */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Total Users</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{summaryData?.users?.total || 0}</div>
						<p className='text-xs text-muted-foreground'>{summaryData?.users?.byRole?.customer || 0} customers</p>
						<div className='mt-2 flex items-center text-xs'>
							<Badge variant='outline' className='bg-green-100 text-green-800'>
								<ArrowUpRight className='h-3 w-3 mr-1' />
								{summaryData?.users?.new || 0} new in 30 days
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Blog Performance */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Blog Performance</CardTitle>
						<BookOpen className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{summaryData?.blogs?.totalViews || 0}</div>
						<p className='text-xs text-muted-foreground'>
							{summaryData?.blogs?.published || 0} published, {summaryData?.blogs?.draft || 0} drafts
						</p>
						<div className='mt-2 flex items-center text-xs'>
							<Badge variant='outline' className='bg-blue-100 text-blue-800'>
								<Eye className='h-3 w-3 mr-1' />
								{summaryData?.blogs?.totalViews > 0
									? (summaryData?.blogs?.totalViews / summaryData?.blogs?.published).toFixed(0)
									: 0}{' '}
								avg. views per post
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Dashboard Content */}
			<Tabs defaultValue='overview' className='w-full'>
				<TabsList className='mb-4'>
					<TabsTrigger value='overview'>Overview</TabsTrigger>
					<TabsTrigger value='revenue'>Revenue</TabsTrigger>
					<TabsTrigger value='bookings'>Bookings</TabsTrigger>
					<TabsTrigger value='users'>Users</TabsTrigger>
					<TabsTrigger value='content'>Content</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value='overview' className='space-y-4'>
					{/* Revenue Chart */}
					<Card>
						<CardHeader>
							<CardTitle>Revenue Overview</CardTitle>
							<CardDescription>Monthly revenue breakdown for {selectedYear}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='h-[300px]'>
								<ResponsiveContainer width='100%' height='100%'>
									<BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis dataKey='monthName' />
										<YAxis />
										<Tooltip formatter={(value) => formatCurrency(value)} />
										<Legend />
										<Bar dataKey='bookingRevenue' name='Trip Bookings' fill='#0088FE' />
										<Bar dataKey='visaRevenue' name='Visa Bookings' fill='#00C49F' />
										<Bar dataKey='collectedAmount' name='Invoice Payments' fill='#FFBB28' />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Status Distribution and Recent Activity */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
						{/* Status Distribution */}
						<Card className='lg:col-span-1'>
							<CardHeader>
								<CardTitle>Status Distribution</CardTitle>
								<CardDescription>Current status of bookings and invoices</CardDescription>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue='invoices' className='w-full'>
									<TabsList className='mb-4 w-full'>
										<TabsTrigger value='invoices' className='flex-1'>
											Invoices
										</TabsTrigger>
										<TabsTrigger value='bookings' className='flex-1'>
											Bookings
										</TabsTrigger>
										<TabsTrigger value='visas' className='flex-1'>
											Visas
										</TabsTrigger>
									</TabsList>

									<TabsContent value='invoices'>
										<div className='h-[300px]'>
											<ResponsiveContainer width='100%' height='100%'>
												<RechartsPieChart>
													<Pie
														data={prepareInvoiceStatusData()}
														cx='50%'
														cy='50%'
														labelLine={false}
														label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
														outerRadius={80}
														fill='#8884d8'
														dataKey='value'>
														{prepareInvoiceStatusData().map((entry, index) => (
															<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
														))}
													</Pie>
													<Tooltip formatter={(value, name) => [value, name]} />
												</RechartsPieChart>
											</ResponsiveContainer>
										</div>
									</TabsContent>

									<TabsContent value='bookings'>
										<div className='h-[300px]'>
											<ResponsiveContainer width='100%' height='100%'>
												<RechartsPieChart>
													<Pie
														data={prepareBookingStatusData()}
														cx='50%'
														cy='50%'
														labelLine={false}
														label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
														outerRadius={80}
														fill='#8884d8'
														dataKey='value'>
														{prepareBookingStatusData().map((entry, index) => (
															<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
														))}
													</Pie>
													<Tooltip formatter={(value, name) => [value, name]} />
												</RechartsPieChart>
											</ResponsiveContainer>
										</div>
									</TabsContent>

									<TabsContent value='visas'>
										<div className='h-[300px]'>
											<ResponsiveContainer width='100%' height='100%'>
												<RechartsPieChart>
													<Pie
														data={prepareVisaStatusData()}
														cx='50%'
														cy='50%'
														labelLine={false}
														label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
														outerRadius={80}
														fill='#8884d8'
														dataKey='value'>
														{prepareVisaStatusData().map((entry, index) => (
															<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
														))}
													</Pie>
													<Tooltip formatter={(value, name) => [value, name]} />
												</RechartsPieChart>
											</ResponsiveContainer>
										</div>
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card className='lg:col-span-2'>
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>Latest bookings and invoices</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className='h-[300px] pr-4'>
									<div className='space-y-6'>
										{/* Recent Bookings */}
										{recentActivityData?.recentBookings?.map((booking, index) => (
											<div key={`booking-${index}`} className='flex items-start space-x-4'>
												<div className='bg-primary/10 p-2 rounded-full'>
													<Briefcase className='h-4 w-4 text-primary' />
												</div>
												<div className='space-y-1 flex-1'>
													<p className='text-sm font-medium leading-none'>New booking from {booking.fullName}</p>
													<p className='text-sm text-muted-foreground'>
														{formatCurrency(booking.pricing?.totalPrice)} - {booking.status}
													</p>
													<p className='text-xs text-muted-foreground'>{formatDate(booking.createdAt)}</p>
												</div>
												<Badge
													variant='outline'
													className={
														booking.status === 'confirmed'
															? 'bg-green-100 text-green-800'
															: booking.status === 'cancelled'
															? 'bg-red-100 text-red-800'
															: 'bg-yellow-100 text-yellow-800'
													}>
													{booking.status}
												</Badge>
											</div>
										))}

										{/* Recent Invoices */}
										{recentActivityData?.recentInvoices?.map((invoice, index) => (
											<div key={`invoice-${index}`} className='flex items-start space-x-4'>
												<div className='bg-primary/10 p-2 rounded-full'>
													<FileText className='h-4 w-4 text-primary' />
												</div>
												<div className='space-y-1 flex-1'>
													<p className='text-sm font-medium leading-none'>
														Invoice {invoice.invoiceNumber} for {invoice.customer?.name}
													</p>
													<p className='text-sm text-muted-foreground'>
														{formatCurrency(invoice.totalAmount)} - {invoice.status}
													</p>
													<p className='text-xs text-muted-foreground'>{formatDate(invoice.createdAt)}</p>
												</div>
												<Badge
													variant='outline'
													className={
														invoice.status === 'paid'
															? 'bg-green-100 text-green-800'
															: invoice.status === 'cancelled' || invoice.status === 'void'
															? 'bg-red-100 text-red-800'
															: 'bg-yellow-100 text-yellow-800'
													}>
													{invoice.status}
												</Badge>
											</div>
										))}

										{/* Recent Users */}
										{recentActivityData?.recentUsers?.map((user, index) => (
											<div key={`user-${index}`} className='flex items-start space-x-4'>
												<div className='bg-primary/10 p-2 rounded-full'>
													<Users className='h-4 w-4 text-primary' />
												</div>
												<div className='space-y-1 flex-1'>
													<p className='text-sm font-medium leading-none'>New user: {user.name}</p>
													<p className='text-sm text-muted-foreground'>{user.email}</p>
													<p className='text-xs text-muted-foreground'>{formatDate(user.createdAt)}</p>
												</div>
												<Badge variant='outline' className='bg-blue-100 text-blue-800'>
													{user.role}
												</Badge>
											</div>
										))}
									</div>
								</ScrollArea>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/bookings')}>
									View All Activity
								</Button>
							</CardFooter>
						</Card>
					</div>

					{/* User Growth and Top Blogs */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
						{/* User Growth */}
						<Card>
							<CardHeader>
								<CardTitle>User Growth</CardTitle>
								<CardDescription>New user registrations for {selectedYear}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='h-[300px]'>
									<ResponsiveContainer width='100%' height='100%'>
										<LineChart data={userGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
											<CartesianGrid strokeDasharray='3 3' />
											<XAxis dataKey='monthName' />
											<YAxis yAxisId='left' />
											<YAxis yAxisId='right' orientation='right' />
											<Tooltip />
											<Legend />
											<Line
												yAxisId='left'
												type='monotone'
												dataKey='newUsers'
												name='New Users'
												stroke='#8884d8'
												activeDot={{ r: 8 }}
											/>
											<Line
												yAxisId='right'
												type='monotone'
												dataKey='cumulativeUsers'
												name='Total Users'
												stroke='#82ca9d'
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						{/* Top Blogs */}
						<Card>
							<CardHeader>
								<CardTitle>Top Performing Blogs</CardTitle>
								<CardDescription>Most viewed blog posts</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{blogPerformanceData?.topBlogs?.map((blog, index) => (
										<div key={index} className='flex items-start space-x-4'>
											<div className='bg-primary/10 p-2 rounded-full'>
												<BookOpen className='h-4 w-4 text-primary' />
											</div>
											<div className='space-y-1 flex-1'>
												<p className='text-sm font-medium leading-none'>{blog.title}</p>
												<div className='flex items-center text-xs text-muted-foreground space-x-2'>
													<div className='flex items-center'>
														<Eye className='h-3 w-3 mr-1' />
														{blog.viewCount} views
													</div>
													<div className='flex items-center'>
														<Clock className='h-3 w-3 mr-1' />
														{blog.readTime} min read
													</div>
												</div>
											</div>
											<Button
												variant='ghost'
												size='sm'
												className='text-xs'
												onClick={() => navigate(`/blog/${blog.slug}`)}>
												View
											</Button>
										</div>
									))}
								</div>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/blogs')}>
									Manage Blogs
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				{/* Revenue Tab */}
				<TabsContent value='revenue' className='space-y-4'>
					{/* Revenue Overview Cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
								<DollarSign className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{formatCurrency(summaryData?.invoices?.revenue?.paidAmount || 0)}
								</div>
								<p className='text-xs text-muted-foreground'>From all sources</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Outstanding Amount</CardTitle>
								<CreditCard className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{formatCurrency(summaryData?.invoices?.revenue?.dueAmount || 0)}
								</div>
								<p className='text-xs text-muted-foreground'>Pending payments</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Trip Booking Revenue</CardTitle>
								<Briefcase className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{formatCurrency(summaryData?.bookings?.revenue?.paid || 0)}</div>
								<p className='text-xs text-muted-foreground'>
									{formatCurrency(summaryData?.bookings?.revenue?.total || 0)} total
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Visa Revenue</CardTitle>
								<Passport className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{formatCurrency(summaryData?.visaBookings?.revenue?.paid || 0)}
								</div>
								<p className='text-xs text-muted-foreground'>
									{formatCurrency(summaryData?.visaBookings?.revenue?.total || 0)} total
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Monthly Revenue Chart */}
					<Card>
						<CardHeader>
							<CardTitle>Monthly Revenue Breakdown</CardTitle>
							<CardDescription>Revenue by source for {selectedYear}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='h-[400px]'>
								<ResponsiveContainer width='100%' height='100%'>
									<BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis dataKey='monthName' />
										<YAxis />
										<Tooltip formatter={(value) => formatCurrency(value)} />
										<Legend />
										<Bar dataKey='bookingRevenue' name='Trip Bookings' fill='#0088FE' stackId='a' />
										<Bar dataKey='visaRevenue' name='Visa Bookings' fill='#00C49F' stackId='a' />
										<Bar dataKey='collectedAmount' name='Invoice Payments' fill='#FFBB28' stackId='a' />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Invoice Status Distribution */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
						<Card>
							<CardHeader>
								<CardTitle>Invoice Status Distribution</CardTitle>
								<CardDescription>Current status of all invoices</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='h-[300px]'>
									<ResponsiveContainer width='100%' height='100%'>
										<RechartsPieChart>
											<Pie
												data={prepareInvoiceStatusData()}
												cx='50%'
												cy='50%'
												labelLine={false}
												label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
												outerRadius={100}
												fill='#8884d8'
												dataKey='value'>
												{prepareInvoiceStatusData().map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(value, name) => [value, name]} />
											<Legend />
										</RechartsPieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/invoices')}>
									Manage Invoices
								</Button>
							</CardFooter>
						</Card>

						{/* Collection Rate */}
						<Card>
							<CardHeader>
								<CardTitle>Collection Rate</CardTitle>
								<CardDescription>Payment collection performance</CardDescription>
							</CardHeader>
							<CardContent className='flex flex-col items-center justify-center h-[300px]'>
								<div className='text-5xl font-bold mb-4'>
									{(
										(summaryData?.invoices?.revenue?.paidAmount / summaryData?.invoices?.revenue?.totalAmount) * 100 ||
										0
									).toFixed(1)}
									%
								</div>
								<p className='text-muted-foreground mb-6'>of total invoiced amount collected</p>
								<div className='w-full max-w-md bg-secondary h-4 rounded-full overflow-hidden'>
									<div
										className='bg-primary h-full'
										style={{
											width: `${
												(summaryData?.invoices?.revenue?.paidAmount / summaryData?.invoices?.revenue?.totalAmount) *
													100 || 0
											}%`,
										}}></div>
								</div>
								<div className='flex justify-between w-full max-w-md mt-2 text-sm'>
									<span>{formatCurrency(summaryData?.invoices?.revenue?.paidAmount || 0)} collected</span>
									<span>{formatCurrency(summaryData?.invoices?.revenue?.dueAmount || 0)} outstanding</span>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/invoices')}>
									View Payment Details
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				{/* Bookings Tab */}
				<TabsContent value='bookings' className='space-y-4'>
					{/* Booking Overview Cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Bookings</CardTitle>
								<Briefcase className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.bookings?.total || 0}</div>
								<p className='text-xs text-muted-foreground'>Trip bookings</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Visa Bookings</CardTitle>
								<Passport className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.visaBookings?.total || 0}</div>
								<p className='text-xs text-muted-foreground'>Visa applications</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Recent Bookings</CardTitle>
								<Calendar className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{summaryData?.bookings?.recent + summaryData?.visaBookings?.recent || 0}
								</div>
								<p className='text-xs text-muted-foreground'>In the last 30 days</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Booking Revenue</CardTitle>
								<DollarSign className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{formatCurrency(
										(summaryData?.bookings?.revenue?.total || 0) + (summaryData?.visaBookings?.revenue?.total || 0)
									)}
								</div>
								<p className='text-xs text-muted-foreground'>Total booking value</p>
							</CardContent>
						</Card>
					</div>

					{/* Booking Status Charts */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
						<Card>
							<CardHeader>
								<CardTitle>Trip Booking Status</CardTitle>
								<CardDescription>Current status of all trip bookings</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='h-[300px]'>
									<ResponsiveContainer width='100%' height='100%'>
										<RechartsPieChart>
											<Pie
												data={prepareBookingStatusData()}
												cx='50%'
												cy='50%'
												labelLine={false}
												label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
												outerRadius={100}
												fill='#8884d8'
												dataKey='value'>
												{prepareBookingStatusData().map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(value, name) => [value, name]} />
											<Legend />
										</RechartsPieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/bookings')}>
									Manage Trip Bookings
								</Button>
							</CardFooter>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Visa Booking Status</CardTitle>
								<CardDescription>Current status of all visa applications</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='h-[300px]'>
									<ResponsiveContainer width='100%' height='100%'>
										<RechartsPieChart>
											<Pie
												data={prepareVisaStatusData()}
												cx='50%'
												cy='50%'
												labelLine={false}
												label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
												outerRadius={100}
												fill='#8884d8'
												dataKey='value'>
												{prepareVisaStatusData().map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(value, name) => [value, name]} />
											<Legend />
										</RechartsPieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/visa-bookings')}>
									Manage Visa Bookings
								</Button>
							</CardFooter>
						</Card>
					</div>

					{/* Monthly Booking Trends */}
					<Card>
						<CardHeader>
							<CardTitle>Monthly Booking Trends</CardTitle>
							<CardDescription>Number of bookings by month for {selectedYear}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='h-[300px]'>
								<ResponsiveContainer width='100%' height='100%'>
									<LineChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis dataKey='monthName' />
										<YAxis />
										<Tooltip />
										<Legend />
										<Line
											type='monotone'
											dataKey='bookingCount'
											name='Trip Bookings'
											stroke='#0088FE'
											activeDot={{ r: 8 }}
										/>
										<Line
											type='monotone'
											dataKey='visaCount'
											name='Visa Applications'
											stroke='#00C49F'
											activeDot={{ r: 8 }}
										/>
										<Line
											type='monotone'
											dataKey='invoiceCount'
											name='Invoices'
											stroke='#FFBB28'
											activeDot={{ r: 8 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Users Tab */}
				<TabsContent value='users' className='space-y-4'>
					{/* User Overview Cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Users</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.users?.total || 0}</div>
								<p className='text-xs text-muted-foreground'>Registered accounts</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>New Users</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.users?.new || 0}</div>
								<p className='text-xs text-muted-foreground'>In the last 30 days</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Customers</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.users?.byRole?.customer || 0}</div>
								<p className='text-xs text-muted-foreground'>Regular users</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Staff</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{(summaryData?.users?.byRole?.admin || 0) +
										(summaryData?.users?.byRole?.employee || 0) +
										(summaryData?.users?.byRole?.moderator || 0)}
								</div>
								<p className='text-xs text-muted-foreground'>Admin and employees</p>
							</CardContent>
						</Card>
					</div>

					{/* User Growth Chart */}
					<Card>
						<CardHeader>
							<CardTitle>User Growth</CardTitle>
							<CardDescription>New user registrations for {selectedYear}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='h-[300px]'>
								<ResponsiveContainer width='100%' height='100%'>
									<LineChart data={userGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
										<CartesianGrid strokeDasharray='3 3' />
										<XAxis dataKey='monthName' />
										<YAxis yAxisId='left' />
										<YAxis yAxisId='right' orientation='right' />
										<Tooltip />
										<Legend />
										<Line
											yAxisId='left'
											type='monotone'
											dataKey='newUsers'
											name='New Users'
											stroke='#8884d8'
											activeDot={{ r: 8 }}
										/>
										<Line
											yAxisId='right'
											type='monotone'
											dataKey='cumulativeUsers'
											name='Total Users'
											stroke='#82ca9d'
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* User Role Distribution */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
						<Card>
							<CardHeader>
								<CardTitle>User Role Distribution</CardTitle>
								<CardDescription>Breakdown of users by role</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='h-[300px]'>
									<ResponsiveContainer width='100%' height='100%'>
										<RechartsPieChart>
											<Pie
												data={prepareUserRoleData()}
												cx='50%'
												cy='50%'
												labelLine={false}
												label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
												outerRadius={100}
												fill='#8884d8'
												dataKey='value'>
												{prepareUserRoleData().map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(value, name) => [value, name]} />
											<Legend />
										</RechartsPieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/users')}>
									Manage Users
								</Button>
							</CardFooter>
						</Card>

						{/* Recent Users */}
						<Card>
							<CardHeader>
								<CardTitle>Recent Users</CardTitle>
								<CardDescription>Latest user registrations</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className='h-[300px] pr-4'>
									<div className='space-y-6'>
										{recentActivityData?.recentUsers?.map((user, index) => (
											<div key={index} className='flex items-start space-x-4'>
												<div className='bg-primary/10 p-2 rounded-full'>
													<Users className='h-4 w-4 text-primary' />
												</div>
												<div className='space-y-1 flex-1'>
													<p className='text-sm font-medium leading-none'>{user.name}</p>
													<p className='text-sm text-muted-foreground'>{user.email}</p>
													<p className='text-xs text-muted-foreground'>{formatDate(user.createdAt)}</p>
												</div>
												<Badge variant='outline' className='bg-blue-100 text-blue-800'>
													{user.role}
												</Badge>
											</div>
										))}
									</div>
								</ScrollArea>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/users')}>
									View All Users
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				{/* Content Tab */}
				<TabsContent value='content' className='space-y-4'>
					{/* Blog Overview Cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Blogs</CardTitle>
								<BookOpen className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.blogs?.total || 0}</div>
								<p className='text-xs text-muted-foreground'>Blog posts</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Published Blogs</CardTitle>
								<BookOpen className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.blogs?.published || 0}</div>
								<p className='text-xs text-muted-foreground'>Live blog posts</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Draft Blogs</CardTitle>
								<BookOpen className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.blogs?.draft || 0}</div>
								<p className='text-xs text-muted-foreground'>Unpublished posts</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Views</CardTitle>
								<Eye className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.blogs?.totalViews || 0}</div>
								<p className='text-xs text-muted-foreground'>Blog post views</p>
							</CardContent>
						</Card>
					</div>

					{/* Top Blogs and Category Performance */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
						{/* Top Blogs */}
						<Card>
							<CardHeader>
								<CardTitle>Top Performing Blogs</CardTitle>
								<CardDescription>Most viewed blog posts</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{blogPerformanceData?.topBlogs?.map((blog, index) => (
										<div key={index} className='flex items-start space-x-4'>
											<div className='bg-primary/10 p-2 rounded-full'>
												<BookOpen className='h-4 w-4 text-primary' />
											</div>
											<div className='space-y-1 flex-1'>
												<p className='text-sm font-medium leading-none'>{blog.title}</p>
												<div className='flex items-center text-xs text-muted-foreground space-x-2'>
													<div className='flex items-center'>
														<Eye className='h-3 w-3 mr-1' />
														{blog.viewCount} views
													</div>
													<div className='flex items-center'>
														<Clock className='h-3 w-3 mr-1' />
														{blog.readTime} min read
													</div>
												</div>
											</div>
											<Button
												variant='ghost'
												size='sm'
												className='text-xs'
												onClick={() => navigate(`/blog/${blog.slug}`)}>
												View
											</Button>
										</div>
									))}
								</div>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/blogs')}>
									Manage Blogs
								</Button>
							</CardFooter>
						</Card>

						{/* Category Performance */}
						<Card>
							<CardHeader>
								<CardTitle>Category Performance</CardTitle>
								<CardDescription>Blog views by category</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='h-[300px]'>
									<ResponsiveContainer width='100%' height='100%'>
										<BarChart
											data={blogPerformanceData?.viewsByCategory || []}
											layout='vertical'
											margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
											<CartesianGrid strokeDasharray='3 3' />
											<XAxis type='number' />
											<YAxis dataKey='_id' type='category' tick={{ fontSize: 12 }} width={100} />
											<Tooltip />
											<Legend />
											<Bar dataKey='totalViews' name='Total Views' fill='#8884d8' />
											<Bar dataKey='count' name='Number of Posts' fill='#82ca9d' />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full' onClick={() => navigate('/admin/blogs')}>
									View Categories
								</Button>
							</CardFooter>
						</Card>
					</div>

					{/* Recent Blogs */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Blog Posts</CardTitle>
							<CardDescription>Latest blog content</CardDescription>
						</CardHeader>
						<CardContent>
							<ScrollArea className='h-[300px] pr-4'>
								<div className='space-y-6'>
									{recentActivityData?.recentBlogs?.map((blog, index) => (
										<div key={index} className='flex items-start space-x-4'>
											<div className='bg-primary/10 p-2 rounded-full'>
												<BookOpen className='h-4 w-4 text-primary' />
											</div>
											<div className='space-y-1 flex-1'>
												<p className='text-sm font-medium leading-none'>{blog.title}</p>
												<div className='flex items-center text-xs text-muted-foreground space-x-2'>
													<div className='flex items-center'>
														<Eye className='h-3 w-3 mr-1' />
														{blog.viewCount} views
													</div>
													<p className='text-xs text-muted-foreground'>{formatDate(blog.createdAt)}</p>
												</div>
											</div>
											<Badge
												variant='outline'
												className={
													blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
												}>
												{blog.status}
											</Badge>
										</div>
									))}
								</div>
							</ScrollArea>
						</CardContent>
						<CardFooter>
							<Button variant='outline' className='w-full' onClick={() => navigate('/admin/blogs')}>
								View All Blogs
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default AdminHome;
