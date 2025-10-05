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
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';

import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	XAxis,
	YAxis,
	CartesianGrid,
	Legend,
	AreaChart,
	Area,
	LabelList,
} from 'recharts';
import { ArrowDownRight } from 'lucide-react';

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
			// console.log(response.data.data[response.data.data.length - 1]);
			// monthlyRevenueData[monthlyRevenueData.length - 1]
			console.log(response.data.data);
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
	const formatCurrency = (amount, currency = 'BDT') => {
		if (amount === undefined || amount === null) return '$0.00';

		const currencySymbols = {
			USD: '$',
			EUR: '€',
			GBP: '£',
			BDT: '৳',
		};

		return `${currencySymbols[currency] || '$'}${Number(amount / 1000).toFixed(3)}k`;
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

	function calculateMonthlyChange(monthlyRevenueData) {
		const now = new Date();
		const currentMonth = now.getMonth() + 1; // 1–12

		const currentMonthData = monthlyRevenueData?.find((m) => m.month === currentMonth);
		const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
		const prevMonthData = monthlyRevenueData?.find((m) => m.month === prevMonth);

		const currentCollected = currentMonthData?.totalRevenue || 0;
		const prevCollected = prevMonthData?.totalRevenue || 0;
		const diff = currentCollected - prevCollected;
		const isIncrease = diff >= 0;

		return { currentCollected, prevCollected, diff, isIncrease };
	}

	const { diff, isIncrease } = calculateMonthlyChange(monthlyRevenueData);

	// Chart configurations
	const chartConfig = {
		bookingRevenue: {
			label: 'Trip Bookings',
			color: 'var(--chart-1)',
		},
		visaRevenue: {
			label: 'Visa Bookings',
			color: 'var(--chart-2)',
		},
		collectedAmount: {
			label: 'Invoice Payments',
			color: 'var(--chart-3)',
		},
		newUsers: {
			label: 'New Users',
			color: 'var(--chart-4)',
		},
		cumulativeUsers: {
			label: 'Total Users',
			color: 'var(--chart-5)',
		},
		bookingCount: {
			label: 'Trip Bookings',
			color: 'var(--chart-1)',
		},
		visaCount: {
			label: 'Visa Applications',
			color: 'var(--chart-2)',
		},
		invoiceCount: {
			label: 'Invoices',
			color: 'var(--chart-3)',
		},
		totalViews: {
			label: 'Total Views',
			color: 'var(--chart-2)',
		},
		count: {
			label: 'Number of Posts',
			color: 'var(--chart-1)',
		},
	};

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
			fill: `var(--chart-${(Object.keys(summaryData.invoices.byStatus).indexOf(status) % 5) + 1})`,
		}));
	};

	const prepareBookingStatusData = () => {
		if (!summaryData?.bookings?.byStatus) return [];

		return Object.entries(summaryData.bookings.byStatus).map(([status, count]) => ({
			name: status.charAt(0).toUpperCase() + status.slice(1),
			value: count,
			fill: `var(--chart-${(Object.keys(summaryData.bookings.byStatus).indexOf(status) % 5) + 1})`,
		}));
	};

	const prepareVisaStatusData = () => {
		if (!summaryData?.visaBookings?.byStatus) return [];

		return Object.entries(summaryData.visaBookings.byStatus).map(([status, count]) => ({
			name: status.charAt(0).toUpperCase() + status.slice(1),
			value: count,
			fill: `var(--chart-${(Object.keys(summaryData.visaBookings.byStatus).indexOf(status) % 5) + 1})`,
		}));
	};

	const prepareUserRoleData = () => {
		if (!summaryData?.users?.byRole) return [];

		return Object.entries(summaryData.users.byRole).map(([role, count]) => ({
			name: role.charAt(0).toUpperCase() + role.slice(1),
			value: count,
			fill: `var(--chart-${(Object.keys(summaryData.users.byRole).indexOf(role) % 5) + 1})`,
		}));
	};

	return (
		<div className='flex flex-col gap-6 p-4 md:p-6'>
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
				<Card className='transition-all duration-200 hover:shadow-md'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
						<DollarSign className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{formatCurrency(
								(summaryData?.invoices?.revenue?.paidAmount || 0) +
									(summaryData?.bookings?.revenue?.paid || 0) +
									(summaryData?.visaBookings?.revenue?.paid || 0)
							)}
						</div>
						<p className='text-xs text-muted-foreground'>
							{formatCurrency(summaryData?.invoices?.revenue?.totalAmount || 0)} invoiced
						</p>
						<p className='text-xs text-muted-foreground'>
							{formatCurrency(
								(summaryData?.bookings?.revenue?.paid || 0) + (summaryData?.visaBookings?.revenue?.paid || 0)
							)}{' '}
							booked
						</p>
						<div className='mt-2 flex items-center text-xs'>
							<Badge variant='outline' className='bg-chart-1/10 text-chart-1 border-chart-1/20'>
								{isIncrease ? <ArrowUpRight className='h-3 w-3' /> : <ArrowDownRight className='h-3 w-3' />}
								{isIncrease ? `+${diff.toFixed(3) / 1000}k this month` : `${diff.toFixed(3) / 1000}k this month`}
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Total Bookings */}
				<Card className='transition-all duration-200 hover:shadow-md'>
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
							<Badge variant='outline' className='bg-chart-2/10 text-chart-2 border-chart-2/20'>
								<ArrowUpRight className='h-3 w-3 mr-1' />
								{summaryData?.bookings?.recent + summaryData?.visaBookings?.recent || 0} new in 30 days
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Total Users */}
				<Card className='transition-all duration-200 hover:shadow-md'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Total Users</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{summaryData?.users?.total || 0}</div>
						<p className='text-xs text-muted-foreground'>{summaryData?.users?.byRole?.customer || 0} customers</p>
						<div className='mt-2 flex items-center text-xs'>
							<Badge variant='outline' className='bg-chart-4/10 text-chart-4 border-chart-4/20'>
								<ArrowUpRight className='h-3 w-3 mr-1' />
								{summaryData?.users?.new || 0} new in 30 days
							</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Blog Performance */}
				<Card className='transition-all duration-200 hover:shadow-md'>
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
							<Badge variant='outline' className='bg-chart-5/10 text-chart-5 border-chart-5/20'>
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
				<TabsList className='mb-6 grid w-full grid-cols-5'>
					<TabsTrigger value='overview'>Overview</TabsTrigger>
					<TabsTrigger value='revenue'>Revenue</TabsTrigger>
					<TabsTrigger value='bookings'>Bookings</TabsTrigger>
					<TabsTrigger value='users'>Users</TabsTrigger>
					<TabsTrigger value='content'>Content</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value='overview' className='space-y-6'>
					{/* Revenue Chart */}
					<Card className='transition-all duration-200 hover:shadow-md'>
						<CardHeader>
							<CardTitle>Revenue Overview</CardTitle>
							<CardDescription>Monthly revenue breakdown for {selectedYear}</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartContainer config={chartConfig} className='w-full h-[40rem]'>
								<BarChart accessibilityLayer data={monthlyRevenueData}>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey='monthName'
										tickLine={false}
										tickMargin={10}
										axisLine={false}
										tickFormatter={(value) => value.slice(0, 3)}
									/>
									<ChartTooltip
										cursor={false}
										content={<ChartTooltipContent hideLabel={false} formatter={(value) => formatCurrency(value)} />}
									/>
									<Legend />
									<Bar dataKey='bookingRevenue' name='Trips' fill='var(--color-bookingRevenue)' radius={[5, 5, 0, 0]} />
									<Bar dataKey='visaRevenue' name='Visas' fill='var(--color-visaRevenue)' radius={[5, 5, 0, 0]} />
									<Bar
										dataKey='collectedAmount'
										name='Invoices'
										fill='var(--color-collectedAmount)'
										radius={[5, 5, 0, 0]}
									/>
								</BarChart>
							</ChartContainer>
						</CardContent>
					</Card>

					{/* Status Distribution and Recent Activity */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						{/* Status Distribution */}
						<Card className='lg:col-span-1 transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Status Distribution</CardTitle>
								<CardDescription>Current status of bookings and invoices</CardDescription>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue='invoices' className='w-full'>
									<TabsList className='mb-4 w-full grid grid-cols-3'>
										<TabsTrigger value='invoices' className='text-xs'>
											Invoices
										</TabsTrigger>
										<TabsTrigger value='bookings' className='text-xs'>
											Bookings
										</TabsTrigger>
										<TabsTrigger value='visas' className='text-xs'>
											Visas
										</TabsTrigger>
									</TabsList>

									<TabsContent value='invoices'>
										<ChartContainer config={chartConfig} className='w-full min-h-[300px]'>
											<PieChart>
												<Pie data={prepareInvoiceStatusData()} cx='50%' cy='50%' labelLine={false} dataKey='value' />
												<Legend />
												<ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
											</PieChart>
										</ChartContainer>
									</TabsContent>

									<TabsContent value='bookings'>
										<ChartContainer config={chartConfig} className='w-full min-h-[300px]'>
											<PieChart>
												<Pie data={prepareBookingStatusData()} cx='50%' cy='50%' labelLine={false} dataKey='value' />
												<Legend />
												<ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
											</PieChart>
										</ChartContainer>
									</TabsContent>

									<TabsContent value='visas'>
										<ChartContainer config={chartConfig} className='w-full min-h-[300px]'>
											<PieChart>
												<Pie data={prepareVisaStatusData()} cx='50%' cy='50%' labelLine={false} dataKey='value' />
												<Legend />
												<ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
											</PieChart>
										</ChartContainer>
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card className='lg:col-span-2 transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
								<CardDescription>Latest bookings and invoices</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className='h-[350px] pr-4'>
									<div className='space-y-6'>
										{/* Recent Bookings */}
										{recentActivityData?.recentBookings?.map((booking, index) => (
											<div
												key={`booking-${index}`}
												className='flex items-start space-x-4 p-3 rounded-lg bg-muted/20 transition-colors hover:bg-muted/40'>
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
															? 'bg-chart-1/10 text-chart-1 border-chart-1/20'
															: booking.status === 'cancelled'
															? 'bg-destructive/10 text-destructive border-destructive/20'
															: 'bg-chart-5/10 text-chart-5 border-chart-5/20'
													}>
													{booking.status}
												</Badge>
											</div>
										))}

										{/* Recent Invoices */}
										{recentActivityData?.recentInvoices?.map((invoice, index) => (
											<div
												key={`invoice-${index}`}
												className='flex items-start space-x-4 p-3 rounded-lg bg-muted/20 transition-colors hover:bg-muted/40'>
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
															? 'bg-chart-1/10 text-chart-1 border-chart-1/20'
															: invoice.status === 'cancelled' || invoice.status === 'void'
															? 'bg-destructive/10 text-destructive border-destructive/20'
															: 'bg-chart-5/10 text-chart-5 border-chart-5/20'
													}>
													{invoice.status}
												</Badge>
											</div>
										))}

										{/* Recent Users */}
										{recentActivityData?.recentUsers?.map((user, index) => (
											<div
												key={`user-${index}`}
												className='flex items-start space-x-4 p-3 rounded-lg bg-muted/20 transition-colors hover:bg-muted/40'>
												<div className='bg-primary/10 p-2 rounded-full'>
													<Users className='h-4 w-4 text-primary' />
												</div>
												<div className='space-y-1 flex-1'>
													<p className='text-sm font-medium leading-none'>New user: {user.name}</p>
													<p className='text-sm text-muted-foreground'>{user.email}</p>
													<p className='text-xs text-muted-foreground'>{formatDate(user.createdAt)}</p>
												</div>
												<Badge variant='outline' className='bg-chart-2/10 text-chart-2 border-chart-2/20'>
													{user.role}
												</Badge>
											</div>
										))}
									</div>
								</ScrollArea>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/bookings')}>
									View All Activity
								</Button>
							</CardFooter>
						</Card>
					</div>

					{/* User Growth and Top Blogs */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{/* User Growth */}
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>User Growth</CardTitle>
								<CardDescription>New user registrations for {selectedYear}</CardDescription>
							</CardHeader>
							<CardContent>
								<ChartContainer config={chartConfig}>
									<LineChart accessibilityLayer data={userGrowthData}>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey='monthName'
											tickLine={false}
											axisLine={false}
											tickFormatter={(value) => value.slice(0, 3)}
										/>
										<ChartTooltip content={<ChartTooltipContent hideLabel />} />
										<Line
											yAxisId='left'
											type='monotone'
											dataKey='newUsers'
											name='New Users'
											stroke='var(--color-newUsers)'
											dot={false}
											strokeWidth={2}
										/>
										<Line
											yAxisId='right'
											type='monotone'
											dataKey='cumulativeUsers'
											name='Total Users'
											stroke='var(--color-cumulativeUsers)'
											dot={false}
											strokeWidth={2}
										/>
									</LineChart>
								</ChartContainer>
							</CardContent>
						</Card>

						{/* Top Blogs */}
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Top Performing Blogs</CardTitle>
								<CardDescription>Most viewed blog posts</CardDescription>
							</CardHeader>
							<CardContent className='h-full'>
								<div className='space-y-4'>
									{blogPerformanceData?.topBlogs?.map((blog, index) => (
										<div
											key={index}
											className='flex items-start space-x-4 p-3 rounded-lg bg-muted/20 transition-colors hover:bg-muted/40'>
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
								<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/blogs')}>
									Manage Blogs
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				{/* Revenue Tab */}
				<TabsContent value='revenue' className='space-y-6'>
					{/* Revenue Overview Cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						<Card className='transition-all duration-200 hover:shadow-md'>
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

						<Card className='transition-all duration-200 hover:shadow-md'>
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

						<Card className='transition-all duration-200 hover:shadow-md'>
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

						<Card className='transition-all duration-200 hover:shadow-md'>
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
					<Card className='transition-all duration-200 hover:shadow-md'>
						<CardHeader>
							<CardTitle>Monthly Revenue Breakdown</CardTitle>
							<CardDescription>Revenue by source for {selectedYear}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='mx-auto'>
								<ChartContainer config={chartConfig} className='w-full h-[40rem]'>
									<BarChart accessibilityLayer data={monthlyRevenueData}>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey='monthName'
											tickLine={false}
											tickMargin={10}
											axisLine={false}
											tickFormatter={(value) => value.slice(0, 3)}
										/>
										<ChartTooltip
											cursor={false}
											content={<ChartTooltipContent hideLabel={false} formatter={(value) => formatCurrency(value)} />}
										/>
										<Legend />
										<Bar
											dataKey='bookingRevenue'
											name='Trip Bookings'
											fill='var(--color-bookingRevenue)'
											stackId='a'
											radius={[0, 0, 0, 0]}
										/>
										<Bar
											dataKey='visaRevenue'
											name='Visa Bookings'
											fill='var(--color-visaRevenue)'
											stackId='a'
											radius={[0, 0, 0, 0]}
										/>
										<Bar
											dataKey='collectedAmount'
											name='Invoice Payments'
											fill='var(--color-collectedAmount)'
											stackId='a'
											radius={[0, 0, 0, 0]}
										/>
									</BarChart>
								</ChartContainer>
							</div>
						</CardContent>
					</Card>

					{/* Invoice Status Distribution */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Invoice Status Distribution</CardTitle>
								<CardDescription>Current status of all invoices</CardDescription>
							</CardHeader>
							<CardContent className='flex justify-center'>
								<ChartContainer config={chartConfig} className='w-full min-h-[350px]'>
									<PieChart>
										<Pie data={prepareInvoiceStatusData()} cx='50%' cy='50%' labelLine={false} dataKey='value' />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Legend />
									</PieChart>
								</ChartContainer>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/invoices')}>
									Manage Invoices
								</Button>
							</CardFooter>
						</Card>

						{/* Collection Rate */}
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Collection Rate</CardTitle>
								<CardDescription>Payment collection performance</CardDescription>
							</CardHeader>
							<CardContent className='flex flex-col items-center justify-center h-full'>
								<div className='text-5xl font-bold mb-4 text-primary'>
									{(
										(summaryData?.invoices?.revenue?.paidAmount / summaryData?.invoices?.revenue?.totalAmount) * 100 ||
										0
									).toFixed(1)}
									%
								</div>
								<p className='text-muted-foreground mb-6 text-center'>of total invoiced amount collected</p>
								<div className='w-full max-w-md bg-secondary h-4 rounded-full overflow-hidden'>
									<div
										className='bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-1000 ease-out'
										style={{
											width: `${
												(summaryData?.invoices?.revenue?.paidAmount / summaryData?.invoices?.revenue?.totalAmount) *
													100 || 0
											}%`,
										}}></div>
								</div>
								<div className='flex justify-between w-full max-w-md mt-2 text-sm'>
									<span className='text-chart-1 font-medium'>
										{formatCurrency(summaryData?.invoices?.revenue?.paidAmount || 0)} collected
									</span>
									<span className='text-chart-5 font-medium'>
										{formatCurrency(summaryData?.invoices?.revenue?.dueAmount || 0)} outstanding
									</span>
								</div>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/invoices')}>
									View Payment Details
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				{/* Bookings Tab */}
				<TabsContent value='bookings' className='space-y-6'>
					{/* Booking Overview Cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Bookings</CardTitle>
								<Briefcase className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.bookings?.total || 0}</div>
								<p className='text-xs text-muted-foreground'>Trip bookings</p>
							</CardContent>
						</Card>

						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Visa Bookings</CardTitle>
								<Passport className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.visaBookings?.total || 0}</div>
								<p className='text-xs text-muted-foreground'>Visa applications</p>
							</CardContent>
						</Card>

						<Card className='transition-all duration-200 hover:shadow-md'>
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

						<Card className='transition-all duration-200 hover:shadow-md'>
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
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Trip Booking Status</CardTitle>
								<CardDescription>Current status of all trip bookings</CardDescription>
							</CardHeader>
							<CardContent>
								<ChartContainer config={chartConfig} className='min-h-[350px] w-full'>
									<PieChart>
										<Pie data={prepareBookingStatusData()} cx='50%' cy='50%' labelLine={false} dataKey='value' />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Legend />
									</PieChart>
								</ChartContainer>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/bookings')}>
									Manage Trip Bookings
								</Button>
							</CardFooter>
						</Card>

						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Visa Booking Status</CardTitle>
								<CardDescription>Current status of all visa applications</CardDescription>
							</CardHeader>
							<CardContent>
								<ChartContainer config={chartConfig} className='min-h-[350px] w-full'>
									<PieChart>
										<Pie data={prepareVisaStatusData()} cx='50%' cy='50%' labelLine={false} dataKey='value' />
										<ChartTooltip content={<ChartTooltipContent />} />
										<Legend />
									</PieChart>
								</ChartContainer>
							</CardContent>
							<CardFooter>
								<Button
									variant='outline'
									className='w-full bg-transparent'
									onClick={() => navigate('/admin/visa-bookings')}>
									Manage Visa Bookings
								</Button>
							</CardFooter>
						</Card>
					</div>

					{/* Monthly Booking Trends */}
					<Card className='transition-all duration-200 hover:shadow-md'>
						<CardHeader>
							<CardTitle>Monthly Booking Trends</CardTitle>
							<CardDescription>Number of bookings by month for {selectedYear}</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartContainer config={chartConfig} className='w-full h-80 lg:h-96'>
								<LineChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
									<CartesianGrid vertical={false} className='stroke-muted' />
									<XAxis dataKey='monthName' className='text-xs' />
									<ChartTooltip content={<ChartTooltipContent />} />
									<Legend />
									<Line
										type='monotone'
										dataKey='bookingCount'
										name='Trip Bookings'
										stroke='var(--color-bookingCount)'
										strokeWidth={2}
										dot={false}
									/>
									<Line
										type='monotone'
										dataKey='visaCount'
										name='Visa Applications'
										stroke='var(--color-visaCount)'
										strokeWidth={2}
										dot={false}
									/>
									<Line
										type='monotone'
										dataKey='invoiceCount'
										name='Invoices'
										stroke='var(--color-invoiceCount)'
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ChartContainer>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Users Tab */}
				<TabsContent value='users' className='space-y-6'>
					{/* User Overview Cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Users</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.users?.total || 0}</div>
								<p className='text-xs text-muted-foreground'>Registered accounts</p>
							</CardContent>
						</Card>

						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>New Users</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.users?.new || 0}</div>
								<p className='text-xs text-muted-foreground'>In the last 30 days</p>
							</CardContent>
						</Card>

						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Customers</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.users?.byRole?.customer || 0}</div>
								<p className='text-xs text-muted-foreground'>Regular users</p>
							</CardContent>
						</Card>

						<Card className='transition-all duration-200 hover:shadow-md'>
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
					{/* <Card className='transition-all duration-200 hover:shadow-md'>
						<CardHeader>
							<CardTitle>User Growth</CardTitle>
							<CardDescription>New user registrations for {selectedYear}</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartContainer config={chartConfig}>
								<LineChart data={userGrowthData}>
									<CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
									<XAxis dataKey='monthName' className='text-xs' tick={{ fontSize: 12 }} />
									<YAxis yAxisId='left' className='text-xs' tick={{ fontSize: 12 }} />
									<YAxis yAxisId='right' orientation='right' className='text-xs' tick={{ fontSize: 12 }} />
									<ChartTooltip content={<ChartTooltipContent />} />
									<Legend />
									<Line
										yAxisId='left'
										type='monotone'
										dataKey='newUsers'
										name='New Users'
										stroke='var(--color-newUsers)'
										strokeWidth={2}
										dot={{ r: 4 }}
										activeDot={{ r: 6 }}
									/>
									<Line
										yAxisId='right'
										type='monotone'
										dataKey='cumulativeUsers'
										name='Total Users'
										stroke='var(--color-cumulativeUsers)'
										strokeWidth={2}
										dot={{ r: 4 }}
										activeDot={{ r: 6 }}
									/>
								</LineChart>
							</ChartContainer>
						</CardContent>
					</Card> */}

					<Card className='transition-all duration-200 hover:shadow-md'>
						<CardHeader>
							<CardTitle>User Growth</CardTitle>
							<CardDescription>New user registrations for {selectedYear}</CardDescription>
						</CardHeader>
						<CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
							<ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
								<AreaChart data={userGrowthData}>
									<defs>
										<linearGradient id='fillNewUsers' x1='0' y1='0' x2='0' y2='1'>
											<stop offset='5%' stopColor='var(--color-newUsers)' stopOpacity={0.8} />
											<stop offset='95%' stopColor='var(--color-newUsers)' stopOpacity={0.1} />
										</linearGradient>
										<linearGradient id='fillCumulativeUsers' x1='0' y1='0' x2='0' y2='1'>
											<stop offset='5%' stopColor='var(--color-cumulativeUsers)' stopOpacity={0.8} />
											<stop offset='95%' stopColor='var(--color-cumulativeUsers)' stopOpacity={0.1} />
										</linearGradient>
									</defs>

									<CartesianGrid vertical={false} />
									<XAxis dataKey='monthName' tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />

									<ChartTooltip
										cursor={false}
										content={<ChartTooltipContent indicator='dot' labelFormatter={(value) => value} />}
									/>

									<Area
										dataKey='newUsers'
										type='monotone'
										fill='url(#fillNewUsers)'
										stroke='var(--color-newUsers)'
										stackId='a'
									/>
									<Area
										dataKey='cumulativeUsers'
										type='monotone'
										fill='url(#fillCumulativeUsers)'
										stroke='var(--color-cumulativeUsers)'
										stackId='a'
									/>

									<ChartLegend content={<ChartLegendContent />} />
								</AreaChart>
							</ChartContainer>
						</CardContent>
					</Card>

					{/* User Role Distribution */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>User Role Distribution</CardTitle>
								<CardDescription>Breakdown of users by role</CardDescription>
							</CardHeader>
							<CardContent className='flex justify-center h-full'>
								<ChartContainer config={chartConfig} className='w-full min-h-[300px]'>
									<PieChart>
										<Pie data={prepareUserRoleData()} cx='50%' cy='50%' dataKey='value' nameKey='name'>
											<LabelList
												dataKey='name'
												className='fill-background'
												stroke='none'
												fontSize={12}
												position='insideLeft'
											/>
										</Pie>
										<ChartTooltip
											content={
												<ChartTooltipContent
													hideLabel={false}
													formatter={(value, name) => `${value} ${name}${value > 1 ? 's' : ''}`}
												/>
											}
										/>
									</PieChart>
								</ChartContainer>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/users')}>
									Manage Users
								</Button>
							</CardFooter>
						</Card>

						{/* Recent Users */}
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Recent Users</CardTitle>
								<CardDescription>Latest user registrations</CardDescription>
							</CardHeader>
							<CardContent>
								<ScrollArea className='h-full pr-4'>
									<div className='space-y-4'>
										{recentActivityData?.recentUsers?.map((user, index) => (
											<div
												key={index}
												className='flex items-start space-x-4 p-3 rounded-lg bg-muted/20 transition-colors hover:bg-muted/40'>
												<div className='bg-primary/10 p-2 rounded-full'>
													<Users className='h-4 w-4 text-primary' />
												</div>
												<div className='space-y-1 flex-1'>
													<p className='text-sm font-medium leading-none'>{user.name}</p>
													<p className='text-sm text-muted-foreground'>{user.email}</p>
													<p className='text-xs text-muted-foreground'>{formatDate(user.createdAt)}</p>
												</div>
												<Badge variant='destructive' className=''>
													{user.role}
												</Badge>
											</div>
										))}
									</div>
								</ScrollArea>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/users')}>
									View All Users
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				{/* Content Tab */}
				<TabsContent value='content' className='space-y-6'>
					{/* Blog Overview Cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Total Blogs</CardTitle>
								<BookOpen className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.blogs?.total || 0}</div>
								<p className='text-xs text-muted-foreground'>Blog posts</p>
							</CardContent>
						</Card>

						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Published Blogs</CardTitle>
								<BookOpen className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.blogs?.published || 0}</div>
								<p className='text-xs text-muted-foreground'>Live blog posts</p>
							</CardContent>
						</Card>

						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader className='flex flex-row items-center justify-between pb-2'>
								<CardTitle className='text-sm font-medium'>Draft Blogs</CardTitle>
								<BookOpen className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{summaryData?.blogs?.draft || 0}</div>
								<p className='text-xs text-muted-foreground'>Unpublished posts</p>
							</CardContent>
						</Card>

						<Card className='transition-all duration-200 hover:shadow-md'>
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
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{/* Top Blogs */}
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Top Performing Blogs</CardTitle>
								<CardDescription>Most viewed blog posts</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{blogPerformanceData?.topBlogs?.map((blog, index) => (
										<div
											key={index}
											className='flex items-start space-x-4 p-3 rounded-lg bg-muted/20 transition-colors hover:bg-muted/40'>
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
								<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/blogs')}>
									Manage Blogs
								</Button>
							</CardFooter>
						</Card>

						{/* Category Performance */}
						<Card className='transition-all duration-200 hover:shadow-md'>
							<CardHeader>
								<CardTitle>Category Performance</CardTitle>
								<CardDescription>Blog views by category</CardDescription>
							</CardHeader>
							<CardContent>
								<ChartContainer config={chartConfig}>
									<BarChart data={blogPerformanceData?.viewsByCategory || []} layout='vertical'>
										<CartesianGrid vertical={false} className='stroke-muted' />
										<XAxis type='number' className='text-xs' tickLine={false} tickMargin={10} axisLine={false} />
										<YAxis
											dataKey='_id'
											type='category'
											className='text-xs'
											tickLine={false}
											tickMargin={10}
											axisLine={false}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Legend />
										<Bar dataKey='totalViews' name='Total Views' fill='var(--color-totalViews)' radius={[0, 2, 2, 0]} />
										<Bar dataKey='count' name='Number of Posts' fill='var(--color-count)' radius={[0, 2, 2, 0]} />
									</BarChart>
								</ChartContainer>
							</CardContent>
							<CardFooter>
								<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/blogs')}>
									View Categories
								</Button>
							</CardFooter>
						</Card>
					</div>

					{/* Recent Blogs */}
					<Card className='transition-all duration-200 hover:shadow-md'>
						<CardHeader>
							<CardTitle>Recent Blog Posts</CardTitle>
							<CardDescription>Latest blog content</CardDescription>
						</CardHeader>
						<CardContent>
							<ScrollArea className='h-[350px] pr-4'>
								<div className='space-y-4'>
									{recentActivityData?.recentBlogs?.map((blog, index) => (
										<div
											key={index}
											className='flex items-start space-x-4 p-3 rounded-lg bg-muted/20 transition-colors hover:bg-muted/40'>
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
													blog.status === 'published'
														? 'bg-chart-1/10 text-chart-1 border-chart-1/20'
														: 'bg-chart-5/10 text-chart-5 border-chart-5/20'
												}>
												{blog.status}
											</Badge>
										</div>
									))}
								</div>
							</ScrollArea>
						</CardContent>
						<CardFooter>
							<Button variant='outline' className='w-full bg-transparent' onClick={() => navigate('/admin/blogs')}>
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
