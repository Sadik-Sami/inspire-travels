import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Search,
	Trash2,
	Eye,
	Mail,
	MailOpen,
	Reply,
	Archive,
	Calendar,
	MessageSquare,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	RefreshCw,
	SortAsc,
	SortDesc,
	MoreVertical,
	Save,
	AlertTriangle,
	Clock,
	User,
	AtSign,
	FileText,
	Flag,
	Edit3,
	X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import useAxiosSecure from '@/hooks/use-AxiosSecure';

const AdminMessages = () => {
	const axiosSecure = useAxiosSecure();

	// State management
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [statusStats, setStatusStats] = useState({});
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [isEditingNotes, setIsEditingNotes] = useState(false);
	const [tempNotes, setTempNotes] = useState('');
	const [isSavingNotes, setIsSavingNotes] = useState(false);

	// Filters and pagination
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		sortBy: 'createdAt',
		sortOrder: 'desc',
		status: 'all',
		priority: 'all',
		search: '',
	});

	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalCount: 0,
		hasNextPage: false,
		hasPrevPage: false,
	});

	// Fetch messages
	const fetchMessages = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();

			Object.entries(filters).forEach(([key, value]) => {
				if (value && value !== 'all') {
					params.append(key, value);
				}
			});

			const response = await axiosSecure.get(`/api/support/messages?${params}`);

			if (response.data.success) {
				setMessages(response.data.data.messages);
				setPagination(response.data.data.pagination);
				setStatusStats(response.data.data.statusStats);
			}
		} catch (error) {
			console.error('Error fetching messages:', error);
			toast.error('Failed to fetch messages');
		} finally {
			setLoading(false);
		}
	};

	// Update message status
	const updateMessageStatus = async (messageId, status, adminNotes = '') => {
		try {
			const response = await axiosSecure.put(`/api/support/messages/${messageId}/status`, {
				status,
				adminNotes,
			});

			if (response.data.success) {
				toast.success('Message status updated successfully');
				fetchMessages();
				if (selectedMessage && selectedMessage._id === messageId) {
					setSelectedMessage(response.data.data);
				}
			}
		} catch (error) {
			console.error('Error updating message status:', error);
			toast.error('Failed to update message status');
		}
	};

	// Update message priority
	const updateMessagePriority = async (messageId, priority) => {
		try {
			const response = await axiosSecure.put(`/api/support/messages/${messageId}/priority`, {
				priority,
			});

			if (response.data.success) {
				toast.success('Priority updated successfully');
				fetchMessages();
				if (selectedMessage && selectedMessage._id === messageId) {
					setSelectedMessage(response.data.data);
				}
			}
		} catch (error) {
			console.error('Error updating priority:', error);
			toast.error('Failed to update priority');
		}
	};

	// Save admin notes
	const saveAdminNotes = async () => {
		if (!selectedMessage) return;

		try {
			setIsSavingNotes(true);
			const response = await axiosSecure.put(`/api/support/messages/${selectedMessage._id}/notes`, {
				adminNotes: tempNotes,
			});

			if (response.data.success) {
				toast.success('Notes saved successfully');
				setSelectedMessage(response.data.data);
				setIsEditingNotes(false);
				fetchMessages();
			}
		} catch (error) {
			console.error('Error saving notes:', error);
			toast.error('Failed to save notes');
		} finally {
			setIsSavingNotes(false);
		}
	};

	// Delete message
	const deleteMessage = async (messageId) => {
		if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await axiosSecure.delete(`/api/support/messages/${messageId}`);

			if (response.data.success) {
				toast.success('Message deleted successfully');
				fetchMessages();
				if (selectedMessage && selectedMessage._id === messageId) {
					setIsDetailModalOpen(false);
					setSelectedMessage(null);
				}
			}
		} catch (error) {
			console.error('Error deleting message:', error);
			toast.error('Failed to delete message');
		}
	};

	// Handle filter changes
	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
			page: 1, // Reset to first page when filters change
		}));
	};

	// Handle pagination
	const handlePageChange = (newPage) => {
		setFilters((prev) => ({ ...prev, page: newPage }));
	};

	// Handle sorting
	const handleSort = (sortBy) => {
		const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
		setFilters((prev) => ({
			...prev,
			sortBy,
			sortOrder: newSortOrder,
			page: 1,
		}));
	};

	// View message details
	const viewMessageDetails = async (messageId) => {
		try {
			const response = await axiosSecure.get(`/api/support/messages/${messageId}`);
			if (response.data.success) {
				setSelectedMessage(response.data.data);
				setTempNotes(response.data.data.adminNotes || '');
				setIsDetailModalOpen(true);
				console.log(response.data.data);
				// Mark as read if unread
				if (response.data.data.status === 'unread') {
					updateMessageStatus(messageId, 'read');
				}
			}
		} catch (error) {
			console.error('Error fetching message details:', error);
			toast.error('Failed to fetch message details');
		}
	};

	// Handle notes editing
	const startEditingNotes = () => {
		setIsEditingNotes(true);
		setTempNotes(selectedMessage?.adminNotes || '');
	};

	const cancelEditingNotes = () => {
		setIsEditingNotes(false);
		setTempNotes(selectedMessage?.adminNotes || '');
	};

	// Effect to fetch messages when filters change
	useEffect(() => {
		fetchMessages();
	}, [filters]);

	// Status badge component
	const StatusBadge = ({ status }) => {
		const statusConfig = {
			unread: { color: 'bg-red-100 text-red-800 border-red-200', icon: Mail, label: 'Unread' },
			read: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: MailOpen, label: 'Read' },
			replied: { color: 'bg-green-100 text-green-800 border-green-200', icon: Reply, label: 'Replied' },
			archived: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Archive, label: 'Archived' },
		};

		const config = statusConfig[status] || statusConfig.unread;
		const IconComponent = config.icon;

		return (
			<Badge className={`${config.color} border font-body`}>
				<IconComponent className='w-3 h-3 mr-1' />
				{config.label}
			</Badge>
		);
	};

	// Priority badge component
	const PriorityBadge = ({ priority, onClick, showIcon = true }) => {
		const priorityConfig = {
			low: { color: 'bg-gray-100 text-gray-800 hover:bg-gray-200', label: 'Low', icon: Clock },
			medium: { color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', label: 'Medium', icon: Flag },
			high: { color: 'bg-red-100 text-red-800 hover:bg-red-200', label: 'High', icon: AlertTriangle },
		};

		const config = priorityConfig[priority] || priorityConfig.medium;
		const IconComponent = config.icon;

		return (
			<Badge
				className={`${config.color} font-body transition-colors ${onClick ? 'cursor-pointer' : ''}`}
				onClick={onClick}>
				{showIcon && <IconComponent className='w-3 h-3 mr-1' />}
				{config.label}
			</Badge>
		);
	};

	return (
		<div className='min-h-screen bg-background p-4 sm:p-6 lg:p-8'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
					<div>
						<h1 className='text-3xl font-heading font-bold text-foreground'>Contact Messages</h1>
						<p className='text-muted-foreground mt-1'>Manage and respond to customer inquiries and support requests</p>
					</div>
					<Button onClick={fetchMessages} disabled={loading} className='w-fit'>
						<RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
					{Object.entries(statusStats).map(([status, count]) => {
						const statusConfig = {
							unread: { color: 'border-chart-1 bg-chart-1/30', icon: Mail, label: 'Unread' },
							read: { color: 'border-chart-2 bg-chart-2/30', icon: MailOpen, label: 'Read' },
							replied: { color: 'border-chart-3 bg-chart-3/30', icon: CheckCircle, label: 'Replied' },
							archived: { color: 'border-chart-4 bg-chart-4/30', icon: Archive, label: 'Archived' },
						};

						const config = statusConfig[status];
						const IconComponent = config.icon;

						return (
							<Card key={status} className={`${config.color} border-2`}>
								<CardContent className='p-4'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium'>{config.label}</p>
											<p className='text-2xl font-bold'>{count}</p>
										</div>
										<IconComponent className='w-8 h-8' />
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Filters */}
			<Card className='mb-6 border-none shadow-md'>
				<CardContent className='p-6'>
					<div className='flex flex-wrap gap-4'>
						{/* Search */}
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
							<Input
								placeholder='Search'
								value={filters.search}
								onChange={(e) => handleFilterChange('search', e.target.value)}
								className='pl-10'
							/>
						</div>

						{/* Status Filter */}
						<Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
							<SelectTrigger>
								<SelectValue placeholder='Filter by status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='unread'>Unread</SelectItem>
								<SelectItem value='read'>Read</SelectItem>
								<SelectItem value='replied'>Replied</SelectItem>
								<SelectItem value='archived'>Archived</SelectItem>
							</SelectContent>
						</Select>

						{/* Priority Filter */}
						<Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
							<SelectTrigger>
								<SelectValue placeholder='Filter by priority' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Priority</SelectItem>
								<SelectItem value='low'>Low</SelectItem>
								<SelectItem value='medium'>Medium</SelectItem>
								<SelectItem value='high'>High</SelectItem>
							</SelectContent>
						</Select>

						{/* Items per page */}
						<Select
							value={filters.limit.toString()}
							onValueChange={(value) => handleFilterChange('limit', Number.parseInt(value))}>
							<SelectTrigger>
								<SelectValue placeholder='Items per page' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='5'>5 per page</SelectItem>
								<SelectItem value='10'>10 per page</SelectItem>
								<SelectItem value='25'>25 per page</SelectItem>
								<SelectItem value='50'>50 per page</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Messages Table */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center justify-between'>
						<span>Messages ({pagination.totalCount})</span>
						<div className='flex items-center gap-2'>
							<Button variant='outline' size='sm' onClick={() => handleSort('name')} className='hidden sm:flex'>
								Name
								{filters.sortBy === 'name' &&
									(filters.sortOrder === 'desc' ? (
										<SortDesc className='w-4 h-4 ml-1' />
									) : (
										<SortAsc className='w-4 h-4 ml-1' />
									))}
							</Button>
							<Button variant='outline' size='sm' onClick={() => handleSort('createdAt')} className='hidden sm:flex'>
								Date
								{filters.sortBy === 'createdAt' &&
									(filters.sortOrder === 'desc' ? (
										<SortDesc className='w-4 h-4 ml-1' />
									) : (
										<SortAsc className='w-4 h-4 ml-1' />
									))}
							</Button>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent className='p-0'>
					{loading ? (
						<div className='flex items-center justify-center py-12 overflow-hidden'>
							<RefreshCw className='w-8 h-8 animate-spin text-primary' />
							<span className='ml-2 text-muted-foreground'>Loading messages...</span>
						</div>
					) : messages.length === 0 ? (
						<div className='text-center py-12 overflow-hidden'>
							<MessageSquare className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
							<h3 className='text-lg font-semibold text-foreground mb-2'>No messages found</h3>
							<p className='text-muted-foreground'>
								{filters.search || filters.status !== 'all' || filters.priority !== 'all'
									? 'Try adjusting your filters to see more results.'
									: 'No contact messages have been received yet.'}
							</p>
						</div>
					) : (
						<div className='overflow-x-auto overflow-y-hidden'>
							<table className='w-full'>
								<thead className='border-b bg-muted/50'>
									<tr>
										<th className='text-left p-4 font-semibold'>Sender</th>
										<th className='text-left p-4 font-semibold hidden md:table-cell'>Subject</th>
										<th className='text-left p-4 font-semibold hidden sm:table-cell'>Status</th>
										<th className='text-left p-4 font-semibold hidden lg:table-cell'>Priority</th>
										<th className='text-left p-4 font-semibold hidden sm:table-cell'>Date</th>
										<th className='text-right p-4 font-semibold'>Actions</th>
									</tr>
								</thead>
								<tbody>
									<AnimatePresence>
										{messages.map((message, index) => (
											<motion.tr
												key={message._id}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -20 }}
												transition={{ duration: 0.2, delay: index * 0.05 }}
												className='border-b hover:bg-muted/30 transition-colors'>
												<td className='p-4'>
													<div className='flex items-center gap-3'>
														<div
															className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
																message.status === 'unread' ? 'bg-red-500' : 'bg-primary'
															}`}>
															{message.name.charAt(0).toUpperCase()}
														</div>
														<div className='min-w-0 flex-1'>
															<p className='font-semibold text-foreground truncate'>{message.name}</p>
															<p className='text-sm text-muted-foreground truncate'>{message.email}</p>
														</div>
													</div>
												</td>
												<td className='p-4 hidden md:table-cell'>
													<p className='font-medium text-foreground truncate max-w-xs' title={message.subject}>
														{message.subject}
													</p>
												</td>
												<td className='p-4 hidden sm:table-cell'>
													<StatusBadge status={message.status} />
												</td>
												<td className='p-4 hidden lg:table-cell'>
													<PriorityBadge priority={message.priority} />
												</td>
												<td className='p-4 hidden sm:table-cell'>
													<div className='flex items-center gap-2 text-sm text-muted-foreground'>
														<Calendar className='w-4 h-4' />
														{new Date(message.createdAt).toLocaleDateString()}
													</div>
												</td>
												<td className='p-4'>
													<div className='flex items-center justify-end gap-2'>
														<Button
															variant='ghost'
															size='sm'
															onClick={() => viewMessageDetails(message._id)}
															className='text-primary hover:text-primary/80'>
															<Eye className='w-4 h-4' />
														</Button>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant='ghost' size='sm'>
																	<MoreVertical className='w-4 h-4' />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align='end'>
																<DropdownMenuItem onClick={() => updateMessageStatus(message._id, 'read')}>
																	<MailOpen className='w-4 h-4 mr-2' />
																	Mark as Read
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => updateMessageStatus(message._id, 'replied')}>
																	<Reply className='w-4 h-4 mr-2' />
																	Mark as Replied
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => updateMessageStatus(message._id, 'archived')}>
																	<Archive className='w-4 h-4 mr-2' />
																	Archive
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem onClick={() => updateMessagePriority(message._id, 'high')}>
																	<AlertTriangle className='w-4 h-4 mr-2 text-red-500' />
																	Set High Priority
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => updateMessagePriority(message._id, 'medium')}>
																	<Flag className='w-4 h-4 mr-2 text-yellow-500' />
																	Set Medium Priority
																</DropdownMenuItem>
																<DropdownMenuItem onClick={() => updateMessagePriority(message._id, 'low')}>
																	<Clock className='w-4 h-4 mr-2 text-gray-500' />
																	Set Low Priority
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() => deleteMessage(message._id)}
																	className='text-destructive focus:text-destructive'>
																	<Trash2 className='w-4 h-4 mr-2' />
																	Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</td>
											</motion.tr>
										))}
									</AnimatePresence>
								</tbody>
							</table>
						</div>
					)}

					{/* Pagination */}
					{pagination.totalPages > 1 && (
						<div className='flex items-center justify-between p-4 border-t'>
							<div className='text-sm text-muted-foreground'>
								Showing {(pagination.currentPage - 1) * filters.limit + 1} to{' '}
								{Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of {pagination.totalCount}{' '}
								messages
							</div>
							<div className='flex items-center gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handlePageChange(pagination.currentPage - 1)}
									disabled={!pagination.hasPrevPage}>
									<ChevronLeft className='w-4 h-4' />
									Previous
								</Button>
								<span className='text-sm font-medium px-3 py-1 bg-muted rounded'>
									{pagination.currentPage} of {pagination.totalPages}
								</span>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handlePageChange(pagination.currentPage + 1)}
									disabled={!pagination.hasNextPage}>
									Next
									<ChevronRight className='w-4 h-4' />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Enhanced Message Detail Modal */}
			<Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
				<DialogContent className='sm:min-w-3xl lg:min-w-4xl max-h-[95vh] p-0'>
					<DialogHeader className='p-6 pb-0'>
						<DialogTitle className='flex flex-col items-start gap-5'>
							<span className='flex items-center gap-2'>
								<MessageSquare className='w-5 h-5' />
								Message Details
							</span>
							{selectedMessage && (
								<div className='flex items-center gap-2'>
									<StatusBadge status={selectedMessage.status} />
									{/* <PriorityBadge priority={selectedMessage.priority} /> */}
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<div>
												<PriorityBadge priority={selectedMessage.priority} onClick={() => {}} />
											</div>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem onClick={() => updateMessagePriority(selectedMessage._id, 'high')}>
												<AlertTriangle className='w-4 h-4 mr-2 text-red-500' />
												High Priority
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => updateMessagePriority(selectedMessage._id, 'medium')}>
												<Flag className='w-4 h-4 mr-2 text-yellow-500' />
												Medium Priority
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => updateMessagePriority(selectedMessage._id, 'low')}>
												<Clock className='w-4 h-4 mr-2 text-gray-500' />
												Low Priority
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							)}
						</DialogTitle>
						<DialogDescription className='sr-only'>Reply to {selectedMessage?.name || 'message'}</DialogDescription>
					</DialogHeader>

					{selectedMessage && (
						<ScrollArea className='max-h-[calc(90vh-120px)]'>
							<div className='p-6 space-y-6'>
								{/* Sender Information Card */}
								<Card className='border-2 border-primary/20'>
									<CardHeader className='pb-3'>
										<CardTitle className='text-lg flex items-center gap-2'>
											<User className='w-5 h-5' />
											Sender Information
										</CardTitle>
									</CardHeader>
									<CardContent className='space-y-4'>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
											<div className='space-y-2'>
												<Label className='text-sm font-semibold text-muted-foreground flex items-center gap-1'>
													<User className='w-4 h-4' />
													Name
												</Label>
												<p className='text-foreground font-medium text-lg'>{selectedMessage.name}</p>
											</div>
											<div className='space-y-2'>
												<Label className='text-sm font-semibold text-muted-foreground flex items-center gap-1'>
													<AtSign className='w-4 h-4' />
													Email Address
												</Label>
												<p className='text-foreground font-mono text-sm bg-muted/50 p-2 rounded break-all'>
													{selectedMessage.email}
												</p>
											</div>
											<div className='space-y-2'>
												<Label className='text-sm font-semibold text-muted-foreground flex items-center gap-1'>
													<Calendar className='w-4 h-4' />
													Date Sent
												</Label>
												<p className='text-foreground'>{new Date(selectedMessage.createdAt).toLocaleString()}</p>
											</div>
											<div className='space-y-2'>
												<Label className='text-sm font-semibold text-muted-foreground flex items-center gap-1'>
													<Clock className='w-4 h-4' />
													Message Age
												</Label>
												<p className='text-foreground'>{selectedMessage.messageAge}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Message Content Card */}
								<Card>
									<CardHeader className='pb-3'>
										<CardTitle className='text-lg flex items-center gap-2'>
											<FileText className='w-5 h-5' />
											Message Content
										</CardTitle>
									</CardHeader>
									<CardContent className='space-y-4'>
										{/* Subject */}
										<div className='space-y-2'>
											<Label className='text-sm font-semibold text-muted-foreground'>Subject</Label>
											<div className='p-3 bg-muted/30 rounded-lg border'>
												<p className='text-foreground font-semibold text-lg leading-relaxed'>
													{selectedMessage.subject}
												</p>
											</div>
										</div>

										{/* Message Body */}
										<div className='space-y-2'>
											<Label className='text-sm font-semibold text-muted-foreground'>Message</Label>
											<div className='p-4 bg-muted/30 rounded-lg border min-h-[120px]'>
												<p className='text-foreground whitespace-pre-wrap leading-relaxed'>{selectedMessage.message}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Admin Notes Card */}
								<Card>
									<CardHeader className='pb-3'>
										<CardTitle className='text-lg flex items-center justify-between'>
											<span className='flex items-center gap-2'>
												<Edit3 className='w-5 h-5' />
												Admin Notes
											</span>
											{!isEditingNotes && (
												<Button variant='outline' size='sm' onClick={startEditingNotes}>
													<Edit3 className='w-4 h-4 mr-2' />
													Edit Notes
												</Button>
											)}
										</CardTitle>
									</CardHeader>
									<CardContent>
										{isEditingNotes ? (
											<div className='space-y-4'>
												<Textarea
													value={tempNotes}
													onChange={(e) => setTempNotes(e.target.value)}
													placeholder='Add internal notes about this message...'
													rows={4}
													className='resize-none'
													maxLength={1000}
												/>
												<div className='flex items-center justify-between'>
													<span className='text-sm text-muted-foreground'>{tempNotes.length}/1000 characters</span>
													<div className='flex gap-2'>
														<Button variant='outline' size='sm' onClick={cancelEditingNotes} disabled={isSavingNotes}>
															<X className='w-4 h-4 mr-2' />
															Cancel
														</Button>
														<Button size='sm' onClick={saveAdminNotes} disabled={isSavingNotes}>
															{isSavingNotes ? (
																<RefreshCw className='w-4 h-4 mr-2 animate-spin' />
															) : (
																<Save className='w-4 h-4 mr-2' />
															)}
															Save Notes
														</Button>
													</div>
												</div>
											</div>
										) : (
											<div className='p-4 bg-muted/30 rounded-lg border min-h-[80px]'>
												{selectedMessage.adminNotes ? (
													<p className='text-foreground whitespace-pre-wrap leading-relaxed'>
														{selectedMessage.adminNotes}
													</p>
												) : (
													<p className='text-muted-foreground italic'>No admin notes added yet.</p>
												)}
											</div>
										)}
									</CardContent>
								</Card>

								<Separator />

								{/* Action Buttons */}
								<div className='flex flex-wrap gap-3 pt-2'>
									<Button
										onClick={() => updateMessageStatus(selectedMessage._id, 'read', selectedMessage.adminNotes)}
										disabled={selectedMessage.status === 'read'}
										variant='outline'>
										<MailOpen className='w-4 h-4 mr-2' />
										Mark as Read
									</Button>
									<Button
										onClick={() => updateMessageStatus(selectedMessage._id, 'replied', selectedMessage.adminNotes)}
										disabled={selectedMessage.status === 'replied'}
										variant='outline'>
										<Reply className='w-4 h-4 mr-2' />
										Mark as Replied
									</Button>
									<Button
										onClick={() => updateMessageStatus(selectedMessage._id, 'archived', selectedMessage.adminNotes)}
										disabled={selectedMessage.status === 'archived'}
										variant='outline'>
										<Archive className='w-4 h-4 mr-2' />
										Archive
									</Button>
									<Button onClick={() => deleteMessage(selectedMessage._id)} variant='destructive' className='ml-auto'>
										<Trash2 className='w-4 h-4 mr-2' />
										Delete Message
									</Button>
								</div>
							</div>
						</ScrollArea>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AdminMessages;
