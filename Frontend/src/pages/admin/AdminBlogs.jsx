import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, Edit, Trash, Eye, Star, TrendingUp, Calendar, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useBlogQuery } from '@/hooks/useBlogQuery';
import { useBlogMutation } from '@/hooks/useBlogMutation';
import BlogsFilter from '@/components/Blogs/BlogsFilter'
import PaginationControls from '@/components/Destination/PaginationControls';

const AdminBlogs = () => {
	const navigate = useNavigate();

	// State for pagination, filtering, and sorting
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		status: 'all',
		categories: [],
		readTimeRange: [0, 60],
	});
	const [searchQuery, setSearchQuery] = useState('');
	const [activeSort, setActiveSort] = useState('createdAt-desc');
	const [blogToDelete, setBlogToDelete] = useState(null);

	// Sort options
	const sortOptions = [
		{ value: 'createdAt-desc', label: 'Newest First' },
		{ value: 'createdAt-asc', label: 'Oldest First' },
		{ value: 'title-asc', label: 'Title: A-Z' },
		{ value: 'title-desc', label: 'Title: Z-A' },
		{ value: 'viewCount-desc', label: 'Most Viewed' },
		{ value: 'readTime-asc', label: 'Read Time: Short to Long' },
		{ value: 'readTime-desc', label: 'Read Time: Long to Short' },
	];

	// Convert filters to API parameters
	const getApiFilters = () => {
		const apiFilters = {};

		// Status
		if (filters.status && filters.status !== 'all') {
			apiFilters.status = filters.status;
		}

		// Categories
		if (filters.categories && filters.categories.length > 0) {
			apiFilters.category = filters.categories;
		}

		// Read Time Range
		if (filters.readTimeRange) {
			if (filters.readTimeRange[0] > 0) {
				apiFilters.minReadTime = filters.readTimeRange[0];
			}
			if (filters.readTimeRange[1] < 60) {
				apiFilters.maxReadTime = filters.readTimeRange[1];
			}
		}

		return apiFilters;
	};

	// Fetch blogs with TanStack Query
	const { data, isLoading, isError } = useBlogQuery({
		page,
		limit: 10,
		search: searchQuery,
		sortBy: activeSort,
		filters: getApiFilters(),
	});

	// Blog mutations
	const { deleteBlog, toggleFeatured, changeBlogStatus } = useBlogMutation();

	// Handle search
	const handleSearch = (query) => {
		setSearchQuery(query);
		setPage(1); // Reset to first page on new search
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPage(newPage);
		// Scroll to top of the page
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Handle add new blog
	const handleAddBlog = () => {
		navigate('/admin/blogs/new');
	};

	// Handle edit blog
	const handleEditBlog = (id) => {
		navigate(`/admin/blogs/edit/${id}`);
	};

	// Handle view blog
	const handleViewBlog = (slug) => {
		window.open(`/blogs/${slug}`, '_blank');
	};

	// Handle delete blog
	const handleDeleteBlog = () => {
		if (!blogToDelete) return;

		deleteBlog.mutate(blogToDelete._id, {
			onSuccess: () => {
				toast.success('Blog deleted successfully');
				setBlogToDelete(null);
			},
			onError: (error) => {
				toast.error(`Failed to delete blog: ${error.response?.data?.message || 'Unknown error'}`);
			},
		});
	};

	// Handle toggle featured
	const handleToggleFeatured = (id) => {
		console.log('Toggling featured for blog ID:', id); // Add debugging
		if (!id) {
			toast.error('Blog ID is undefined');
			return;
		}

		toggleFeatured.mutate(id, {
			onSuccess: (data) => {
				toast.success(`Blog ${data.blog.isFeatured ? 'marked as featured' : 'removed from featured'}`);
			},
			onError: (error) => {
				toast.error(`Failed to update featured status: ${error.response?.data?.message || 'Unknown error'}`);
			},
		});
	};

	// Handle update status
	const handleUpdateStatus = (id, status) => {
		console.log('Updating status for blog ID:', id, 'to', status); // Add debugging
		if (!id) {
			toast.error('Blog ID is undefined');
			return;
		}

		if (!changeBlogStatus || typeof changeBlogStatus.mutate !== 'function') {
			toast.error('Update blog status function is not available');
			console.error('updateBlogStatus:', updateBlogStatus);
			return;
		}

		changeBlogStatus.mutate(
			{ id, status },
			{
				onSuccess: () => {
					toast.success(`Blog status updated to ${status}`);
				},
				onError: (error) => {
					toast.error(`Failed to update status: ${error.response?.data?.message || 'Unknown error'}`);
				},
			}
		);
	};

	// Format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		}).format(date);
	};

	// Get status badge
	const getStatusBadge = (status) => {
		switch (status) {
			case 'published':
				return <Badge variant='success'>Published</Badge>;
			case 'draft':
				return <Badge variant='secondary'>Draft</Badge>;
			case 'archived':
				return <Badge variant='outline'>Archived</Badge>;
			default:
				return <Badge>{status}</Badge>;
		}
	};

	// Extract blogs array safely
	const blogs = data?.blogs || [];
	const pagination = data?.pagination || { totalPages: 1 };

	return (
		<div>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
				<h1 className='text-3xl font-bold'>Blogs</h1>

				<Button className='flex items-center gap-2' onClick={handleAddBlog}>
					<Plus className='h-4 w-4' />
					Add Blog
				</Button>
			</div>

			{/* Filters Section */}
			<BlogsFilter
				filters={filters}
				setFilters={setFilters}
				sortOptions={sortOptions}
				activeSort={activeSort}
				setActiveSort={setActiveSort}
				onSearch={handleSearch}
				isAdmin={true}
			/>

			<Card>
				<CardHeader className='pb-2'>
					<CardTitle>Blogs</CardTitle>
					<CardDescription>Manage your blog posts and articles.</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className='flex justify-center items-center h-40'>
							<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
						</div>
					) : isError ? (
						<div className='text-center py-10'>
							<h3 className='text-lg font-medium text-red-500'>Error loading blogs</h3>
							<p className='mt-2 text-sm text-gray-400'>Please try again later</p>
						</div>
					) : blogs.length > 0 ? (
						// Blogs table
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Blog</TableHead>
										<TableHead>Author</TableHead>
										<TableHead>Stats</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{blogs.map((blog) => (
										<TableRow key={blog._id}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<div className='h-10 w-10 rounded-md overflow-hidden bg-muted'>
														<img
															src={blog.coverImage?.url || '/placeholder.svg?height=40&width=40'}
															alt={blog.title}
															className='h-full w-full object-cover'
														/>
													</div>
													<div>
														<div className='font-medium'>{blog.title}</div>
														<div className='text-sm text-muted-foreground truncate max-w-[300px]'>{blog.summary}</div>
														<div className='flex items-center gap-1 mt-1'>
															{blog.isFeatured && (
																<Badge variant='secondary' className='text-xs'>
																	<Star className='h-3 w-3 mr-1' />
																	Featured
																</Badge>
															)}
															{blog.categories.map((category, index) => (
																<Badge key={index} variant='outline' className='text-xs'>
																	{category}
																</Badge>
															))}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className='flex items-center gap-2'>
													<User className='h-4 w-4 text-muted-foreground' />
													<span>{blog.author?.name || 'Unknown'}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className='space-y-1'>
													<div className='flex items-center gap-1 text-sm'>
														<Eye className='h-3 w-3 text-muted-foreground' />
														<span>{blog.viewCount} views</span>
													</div>
													<div className='flex items-center gap-1 text-sm'>
														<Clock className='h-3 w-3 text-muted-foreground' />
														<span>{blog.readTime} min read</span>
													</div>
												</div>
											</TableCell>
											<TableCell>{getStatusBadge(blog.status)}</TableCell>
											<TableCell>{formatDate(blog.createdAt)}</TableCell>
											<TableCell className='text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='icon'>
															<MoreHorizontal className='h-4 w-4' />
															<span className='sr-only'>Actions</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleViewBlog(blog.slug)}>
															<Eye className='h-4 w-4' />
															View
														</DropdownMenuItem>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleEditBlog(blog._id)}>
															<Edit className='h-4 w-4' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleToggleFeatured(blog._id)}>
															<Star className='h-4 w-4' />
															{blog.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														{blog.status !== 'published' && (
															<DropdownMenuItem
																className='flex items-center gap-2'
																onClick={() => handleUpdateStatus(blog._id, 'published')}>
																<TrendingUp className='h-4 w-4' />
																Publish
															</DropdownMenuItem>
														)}
														{blog.status !== 'draft' && (
															<DropdownMenuItem
																className='flex items-center gap-2'
																onClick={() => handleUpdateStatus(blog._id, 'draft')}>
																<Calendar className='h-4 w-4' />
																Move to Draft
															</DropdownMenuItem>
														)}
														{blog.status !== 'archived' && (
															<DropdownMenuItem
																className='flex items-center gap-2'
																onClick={() => handleUpdateStatus(blog._id, 'archived')}>
																<Calendar className='h-4 w-4' />
																Archive
															</DropdownMenuItem>
														)}
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className='flex items-center gap-2 text-red-500 focus:text-red-500'
															onClick={() => setBlogToDelete(blog)}>
															<Trash className='h-4 w-4' />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className='text-center py-10'>
							<h3 className='text-lg font-medium text-gray-500'>No blogs found</h3>
							<p className='mt-2 text-sm text-gray-400'>Add your first blog to get started</p>
						</div>
					)}

					{/* Pagination */}
					{!isLoading && blogs.length > 0 && pagination.totalPages > 1 && (
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

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!blogToDelete} onOpenChange={(open) => !open && setBlogToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the blog post
							{blogToDelete?.title ? ` "${blogToDelete.title}"` : ''} and all associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteBlog} className='bg-red-500 hover:bg-red-600'>
							{deleteBlog.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default AdminBlogs;
