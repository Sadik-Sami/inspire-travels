'use client';

import { useState } from 'react';
import {
	Plus,
	Search,
	Eye,
	Edit,
	Trash2,
	ImageIcon,
	Filter,
	TrendingUp,
	FolderOpen,
	CheckCircle,
	Users,
	MapPin,
	Calendar,
	Camera,
	AlertTriangle,
	X,
	MoreVertical,
	Loader2,
} from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from '@/components/ui/dialog';
import { useGalleryQuery } from '@/hooks/useGalleryQuery';
import { useGalleryMutation } from '@/hooks/useGalleryMutation';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

const AdminGallery = () => {
	// State for filters and pagination
	const [filters, setFilters] = useState({
		page: 1,
		limit: 12,
		category: 'all',
		search: '',
		sortBy: 'createdAt',
		sortOrder: 'desc',
		isActive: 'all',
	});

	// State for modals
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showViewModal, setShowViewModal] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);

	// Queries and mutations
	const { data: galleryData, isLoading, error } = useGalleryQuery(filters);
	const { createGalleryItem, updateGalleryItem, deleteGalleryItem } = useGalleryMutation();

	const categories = [
		{ value: 'all', label: 'All Categories', icon: FolderOpen },
		{ value: 'Visa Success', label: 'Visa Success', icon: CheckCircle },
		{ value: 'Happy Clients', label: 'Happy Clients', icon: Users },
		{ value: 'Tours', label: 'Tours', icon: MapPin },
		{ value: 'Destinations', label: 'Destinations', icon: MapPin },
		{ value: 'Events', label: 'Events', icon: Calendar },
		{ value: 'Other', label: 'Other', icon: Camera },
	];

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

	const handleDelete = async (id) => {
		deleteGalleryItem.mutate(id);
	};

	const getCategoryIcon = (category) => {
		const cat = categories.find((c) => c.value === category);
		return cat ? cat.icon : Camera;
	};

	// Get category stats for dashboard cards
	const categoryStats = galleryData?.data?.categoryStats || {};
	const totalItems = galleryData?.data?.pagination?.totalCount || 0;

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-background'>
				<Card className='max-w-md'>
					<CardContent className='text-center p-8'>
						<div className='w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4'>
							<AlertTriangle className='w-8 h-8 text-destructive' />
						</div>
						<h3 className='text-xl font-heading font-semibold text-foreground mb-2'>Error Loading Gallery</h3>
						<p className='text-muted-foreground'>{error.message}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 md:px-6 py-8'>
				<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
					<div className='space-y-2'>
						<div className='flex items-center gap-3'>
							<div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
								<ImageIcon className='w-6 h-6 text-primary' />
							</div>
							<div>
								<h1 className='text-3xl lg:text-4xl font-heading font-bold text-foreground'>
									Gallery & Success Stories
								</h1>
								<p className='text-muted-foreground font-body'>
									Manage your gallery images and success stories with ease
								</p>
							</div>
						</div>
					</div>
					<Button
						onClick={() => setShowCreateModal(true)}
						className='shadow-lg hover:shadow-xl transition-all duration-200'
						size='lg'>
						<Plus className='w-5 h-5 mr-2' />
						Add New Story
					</Button>
				</div>
			</div>

			<div className='container mx-auto px-4 md:px-6 py-8 space-y-8'>
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
					<Card className='lg:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5'>
						<CardContent className='p-6'>
							<div className='flex flex-col items-center gap-4'>
								<div className='w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center'>
									<TrendingUp className='w-6 h-6 text-primary' />
								</div>
								<div className='text-center'>
									<p className='text-sm font-medium text-muted-foreground'>Total Stories</p>
									<p className='text-2xl font-bold text-foreground'>{totalItems}</p>
									<p className='text-xs text-muted-foreground'>Across all categories</p>
								</div>
							</div>
						</CardContent>
					</Card>
					{categories.slice(1).map((category) => {
						const IconComponent = category.icon;
						return (
							<Card
								key={category.value}
								className='hover:shadow-md items-center justify-center transition-all duration-200'>
								<CardContent className='p-4 flex flex-col items-center gap-4'>
									<div className='text-center space-y-2'>
										<div className='w-8 h-8 mx-auto text-primary'>
											<IconComponent className='w-full h-full' />
										</div>
										<div>
											<p className='text-lg font-semibold text-foreground'>{categoryStats[category.value] || 0}</p>
											<p className='text-xs text-muted-foreground font-medium'>{category.label}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Filter className='w-5 h-5 text-primary' />
							Filters & Search
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid lg:flex lg:flex-wrap gap-4'>
							<div className='relative lg:flex-1 w-full'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
								<Input
									type='text'
									placeholder='Search stories...'
									value={filters.search}
									onChange={(e) => handleFilterChange('search', e.target.value)}
									className='pl-10'
								/>
							</div>

							<Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
								<SelectTrigger className='w-full lg:w-fit'>
									<SelectValue placeholder='Select category' />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category.value} value={category.value}>
											<div className='flex items-center gap-2'>
												<category.icon className='w-4 h-4' />
												{category.label}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
								<SelectTrigger className='w-full lg:w-fit'>
									<SelectValue placeholder='Select status' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Status</SelectItem>
									<SelectItem value='true'>Active</SelectItem>
									<SelectItem value='false'>Inactive</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={`${filters.sortBy}-${filters.sortOrder}`}
								onValueChange={(value) => {
									const [sortBy, sortOrder] = value.split('-');
									handleFilterChange('sortBy', sortBy);
									handleFilterChange('sortOrder', sortOrder);
								}}>
								<SelectTrigger className='w-full lg:w-fit'>
									<SelectValue placeholder='Sort by' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='createdAt-desc'>Newest First</SelectItem>
									<SelectItem value='createdAt-asc'>Oldest First</SelectItem>
									<SelectItem value='title-asc'>Title A-Z</SelectItem>
									<SelectItem value='title-desc'>Title Z-A</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{isLoading ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{[...Array(8)].map((_, i) => (
							<Card key={i} className='overflow-hidden'>
								<Skeleton className='w-full h-48' />
								<CardContent className='p-4 space-y-3'>
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-3 w-full' />
									<Skeleton className='h-3 w-2/3' />
								</CardContent>
							</Card>
						))}
					</div>
				) : galleryData?.data?.items?.length === 0 ? (
					<Card>
						<CardContent className='text-center py-16'>
							<div className='w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6'>
								<ImageIcon className='w-12 h-12 text-muted-foreground' />
							</div>
							<h3 className='text-xl font-heading font-semibold text-foreground mb-2'>No gallery items found</h3>
							<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
								Get started by adding your first success story to showcase your achievements
							</p>
							<Button onClick={() => setShowCreateModal(true)} size='lg'>
								<Plus className='w-5 h-5 mr-2' />
								Add First Story
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{galleryData.data.items.map((item) => {
							const CategoryIcon = getCategoryIcon(item.category);
							return (
								<Card
									key={item._id}
									className='overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col py-0'>
									{/* --- Card Header (Image + Badges + Dropdown) --- */}
									<CardHeader className='relative w-full p-0 h-48 overflow-hidden'>
										<img
											src={item.image.url || '/placeholder.svg'}
											alt={item.title}
											className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
										/>

										{/* Actions Dropdown */}
										<div className='absolute top-3 right-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant='secondary' size='sm' className='h-8 w-8 p-0'>
														<MoreVertical className='h-4 w-4' />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align='end'>
													<DropdownMenuItem
														onClick={() => {
															setSelectedItem(item);
															setShowViewModal(true);
														}}>
														<Eye className='mr-2 h-4 w-4' />
														View
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															setSelectedItem(item);
															setShowEditModal(true);
														}}>
														<Edit className='mr-2 h-4 w-4' />
														Edit
													</DropdownMenuItem>

													{/* Delete with AlertDialog */}
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
																<Trash2 className='mr-2 h-4 w-4' />
																Delete
															</DropdownMenuItem>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle className='flex items-center gap-2'>
																	<AlertTriangle className='h-5 w-5 text-destructive' />
																	Delete Story
																</AlertDialogTitle>
																<AlertDialogDescription>
																	Are you sure you want to delete "{item.title}"? This action cannot be undone.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => handleDelete(item._id)}
																	className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
																	disabled={deleteGalleryItem.isPending}>
																	{deleteGalleryItem.isPending ? (
																		<>
																			<Loader2 className='mr-2 h-4 w-4 animate-spin' />
																			Deleting...
																		</>
																	) : (
																		<>
																			<Trash2 className='mr-2 h-4 w-4' />
																			Delete Story
																		</>
																	)}
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										{/* Top-left Status Badge */}
										<div className='absolute top-3 left-3'>
											<Badge variant={item.isActive ? 'default' : 'destructive'} className='backdrop-blur-sm'>
												{item.isActive ? 'Active' : 'Inactive'}
											</Badge>
										</div>

										{/* Bottom-left Category Badge */}
										<div className='absolute bottom-3 left-3'>
											<Badge variant='secondary'>
												<CategoryIcon className='w-3 h-3 mr-1' />
												{item.category}
											</Badge>
										</div>
									</CardHeader>

									{/* --- Card Content --- */}
									<CardContent className='p-5 flex-1 space-y-3'>
										<h3 className='font-heading font-semibold text-foreground line-clamp-2 text-lg leading-tight'>
											{item.title}
										</h3>
										<p className='text-muted-foreground text-sm line-clamp-2 leading-relaxed'>{item.content}</p>

										{item.tags && item.tags.length > 0 && (
											<div className='flex flex-wrap gap-1'>
												{item.tags.slice(0, 2).map((tag, index) => (
													<Badge key={index} variant='outline' className='text-xs'>
														{tag}
													</Badge>
												))}
												{item.tags.length > 2 && (
													<Badge variant='outline' className='text-xs'>
														+{item.tags.length - 2} more
													</Badge>
												)}
											</div>
										)}
									</CardContent>

									{/* --- Card Footer (Meta Info) --- */}
									<CardFooter className='flex items-center justify-between text-xs text-muted-foreground border-t px-5 py-3'>
										<span className='font-medium'>By {item.createdBy?.name}</span>
										<span>{new Date(item.createdAt).toLocaleDateString()}</span>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				)}

				{galleryData?.data?.pagination && galleryData.data.pagination.totalPages > 1 && (
					<Card>
						<CardContent className='flex flex-col sm:flex-row items-center justify-between gap-4 p-6'>
							<div className='text-sm text-muted-foreground font-medium'>
								Showing {(galleryData.data.pagination.currentPage - 1) * galleryData.data.pagination.limit + 1} to{' '}
								{Math.min(
									galleryData.data.pagination.currentPage * galleryData.data.pagination.limit,
									galleryData.data.pagination.totalCount
								)}{' '}
								of {galleryData.data.pagination.totalCount} results
							</div>
							<div className='flex items-center gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handlePageChange(galleryData.data.pagination.currentPage - 1)}
									disabled={!galleryData.data.pagination.hasPrevPage}>
									Previous
								</Button>
								<Badge variant='secondary' className='px-4 py-2'>
									Page {galleryData.data.pagination.currentPage} of {galleryData.data.pagination.totalPages}
								</Badge>
								<Button
									variant='outline'
									size='sm'
									onClick={() => handlePageChange(galleryData.data.pagination.currentPage + 1)}
									disabled={!galleryData.data.pagination.hasNextPage}>
									Next
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			<CreateGalleryDialog open={showCreateModal} onOpenChange={setShowCreateModal} onSubmit={createGalleryItem} />

			{selectedItem && (
				<EditGalleryDialog
					open={showEditModal}
					onOpenChange={setShowEditModal}
					item={selectedItem}
					onSubmit={updateGalleryItem}
				/>
			)}

			{selectedItem && <ViewGalleryDialog open={showViewModal} onOpenChange={setShowViewModal} item={selectedItem} />}
		</div>
	);
};

const CreateGalleryDialog = ({ open, onOpenChange, onSubmit }) => {
	const [formData, setFormData] = useState({
		title: '',
		content: '',
		category: 'Visa Success',
		tags: [],
		image: null,
	});
	const [tagInput, setTagInput] = useState('');
	const [imagePreview, setImagePreview] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const categories = ['Visa Success', 'Happy Clients', 'Tours', 'Destinations', 'Events', 'Other'];

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData((prev) => ({ ...prev, image: file }));
			const reader = new FileReader();
			reader.onloadend = () => setImagePreview(reader.result);
			reader.readAsDataURL(file);
		}
	};

	const handleAddTag = (e) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			const tag = tagInput.trim();
			if (tag && !formData.tags.includes(tag)) {
				setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
				setTagInput('');
			}
		}
	};

	const handleRemoveTag = (tagToRemove) => {
		setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.image) {
			toast.error('Please select an image');
			return;
		}

		setIsSubmitting(true);
		const submitData = new FormData();
		submitData.append('title', formData.title);
		submitData.append('content', formData.content);
		submitData.append('category', formData.category);
		submitData.append('tags', JSON.stringify(formData.tags));
		submitData.append('image', formData.image);

		try {
			await onSubmit.mutateAsync(submitData);
			onOpenChange(false);
			// Reset form
			setFormData({
				title: '',
				content: '',
				category: 'Visa Success',
				tags: [],
				image: null,
			});
			setImagePreview(null);
			setTagInput('');
		} catch (error) {
			// Error is handled by the mutation
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-heading font-bold'>Add New Success Story</DialogTitle>
					<DialogDescription>Create a new success story to showcase your achievements</DialogDescription>
				</DialogHeader>

				<ScrollArea className='max-h-[calc(90vh-120px)] pr-4'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<Label className='text-sm font-medium'>Image *</Label>
							<div className='relative border-2 border-dashed border-input rounded-xl p-8 text-center hover:border-primary/50 transition-colors mt-2'>
								{imagePreview ? (
									<div className='relative'>
										<img
											src={imagePreview || '/placeholder.svg'}
											alt='Preview'
											className='max-w-full h-48 object-cover mx-auto rounded-lg shadow-md'
										/>
										<Button
											type='button'
											variant='destructive'
											size='sm'
											onClick={() => {
												setImagePreview(null);
												setFormData((prev) => ({ ...prev, image: null }));
											}}
											className='absolute top-2 right-2'>
											<Trash2 className='w-4 h-4' />
										</Button>
									</div>
								) : (
									<div className='space-y-4'>
										<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto'>
											<ImageIcon className='w-8 h-8 text-primary' />
										</div>
										<div>
											<p className='text-foreground font-medium mb-1'>Click to upload or drag and drop</p>
											<p className='text-sm text-muted-foreground'>PNG, JPG, WEBP up to 5MB</p>
										</div>
									</div>
								)}
								<Input
									type='file'
									accept='image/*'
									onChange={handleImageChange}
									className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
								/>
							</div>
						</div>

						<div>
							<Label htmlFor='title'>Title *</Label>
							<Input
								id='title'
								type='text'
								value={formData.title}
								onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
								placeholder='Enter story title...'
								maxLength={100}
								required
								className='mt-2'
							/>
							<p className='text-xs text-muted-foreground mt-1'>{formData.title.length}/100 characters</p>
						</div>

						<div>
							<Label htmlFor='content'>Content *</Label>
							<Textarea
								id='content'
								value={formData.content}
								onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
								rows={4}
								placeholder='Tell the success story...'
								maxLength={500}
								required
								className='mt-2 resize-none'
							/>
							<p className='text-xs text-muted-foreground mt-1'>{formData.content.length}/500 characters</p>
						</div>

						<div>
							<Label htmlFor='category'>Category *</Label>
							<Select
								value={formData.category}
								onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
								required>
								<SelectTrigger className='mt-2'>
									<SelectValue placeholder='Select category' />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor='tags'>Tags</Label>
							<Input
								id='tags'
								type='text'
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={handleAddTag}
								placeholder='Type and press Enter or comma to add tags...'
								className='mt-2'
							/>
							{formData.tags.length > 0 && (
								<div className='flex flex-wrap gap-2 mt-3'>
									{formData.tags.map((tag, index) => (
										<Badge key={index} variant='secondary' className='flex items-center gap-2'>
											{tag}
											<Button
												type='button'
												variant='ghost'
												size='sm'
												onClick={() => handleRemoveTag(tag)}
												className='h-auto p-0 hover:bg-transparent'>
												<X className='w-3 h-3' />
											</Button>
										</Badge>
									))}
								</div>
							)}
						</div>
					</form>
				</ScrollArea>

				<DialogFooter className='gap-3'>
					<Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button type='submit' disabled={isSubmitting} onClick={handleSubmit}>
						{isSubmitting ? (
							<>
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								Creating...
							</>
						) : (
							'Create Story'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const EditGalleryDialog = ({ open, onOpenChange, item, onSubmit }) => {
	const [formData, setFormData] = useState({
		title: item.title,
		content: item.content,
		category: item.category,
		tags: item.tags || [],
		isActive: item.isActive,
	});
	const [tagInput, setTagInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const categories = ['Visa Success', 'Happy Clients', 'Tours', 'Destinations', 'Events', 'Other'];

	const handleAddTag = (e) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			const tag = tagInput.trim();
			if (tag && !formData.tags.includes(tag)) {
				setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
				setTagInput('');
			}
		}
	};

	const handleRemoveTag = (tagToRemove) => {
		setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await onSubmit.mutateAsync({ id: item._id, data: formData });
			onOpenChange(false);
		} catch (error) {
			// Error is handled by the mutation
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-heading font-bold'>Edit Success Story</DialogTitle>
					<DialogDescription>Update the details of your success story</DialogDescription>
				</DialogHeader>

				<ScrollArea className='max-h-[calc(90vh-120px)] pr-4'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<Label>Current Image</Label>
							<div className='relative mt-2'>
								<img
									src={item.image.url || '/placeholder.svg'}
									alt={item.title}
									className='w-full h-48 object-cover rounded-lg shadow-md'
								/>
								<div className='absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity'>
									<Badge variant='secondary' className='bg-black/50 text-white'>
										Current Image
									</Badge>
								</div>
							</div>
							<p className='text-xs text-muted-foreground mt-2'>
								To change the image, please delete and create a new story
							</p>
						</div>

						<div>
							<Label htmlFor='edit-title'>Title *</Label>
							<Input
								id='edit-title'
								type='text'
								value={formData.title}
								onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
								placeholder='Enter story title...'
								maxLength={100}
								required
								className='mt-2'
							/>
							<p className='text-xs text-muted-foreground mt-1'>{formData.title.length}/100 characters</p>
						</div>

						<div>
							<Label htmlFor='edit-content'>Content *</Label>
							<Textarea
								id='edit-content'
								value={formData.content}
								onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
								rows={4}
								placeholder='Tell the success story...'
								maxLength={500}
								required
								className='mt-2 resize-none'
							/>
							<p className='text-xs text-muted-foreground mt-1'>{formData.content.length}/500 characters</p>
						</div>

						<div>
							<Label htmlFor='edit-category'>Category *</Label>
							<Select
								value={formData.category}
								onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
								required>
								<SelectTrigger className='mt-2'>
									<SelectValue placeholder='Select category' />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor='edit-tags'>Tags</Label>
							<Input
								id='edit-tags'
								type='text'
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={handleAddTag}
								placeholder='Type and press Enter or comma to add tags...'
								className='mt-2'
							/>
							{formData.tags.length > 0 && (
								<div className='flex flex-wrap gap-2 mt-3'>
									{formData.tags.map((tag, index) => (
										<Badge key={index} variant='secondary' className='flex items-center gap-2'>
											{tag}
											<Button
												type='button'
												variant='ghost'
												size='sm'
												onClick={() => handleRemoveTag(tag)}
												className='h-auto p-0 hover:bg-transparent'>
												<X className='w-3 h-3' />
											</Button>
										</Badge>
									))}
								</div>
							)}
						</div>

						<Card className='bg-accent/50'>
							<CardContent className='p-4'>
								<div className='flex items-center space-x-2'>
									<Checkbox
										id='active'
										checked={formData.isActive}
										onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
									/>
									<Label htmlFor='active' className='text-sm font-medium'>
										Active (visible to users)
									</Label>
								</div>
							</CardContent>
						</Card>
					</form>
				</ScrollArea>

				<DialogFooter className='gap-3'>
					<Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button type='submit' disabled={isSubmitting} onClick={handleSubmit}>
						{isSubmitting ? (
							<>
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								Updating...
							</>
						) : (
							'Update Story'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const ViewGalleryDialog = ({ open, onOpenChange, item }) => {
	const CategoryIcon =
		item.category === 'Visa Success'
			? CheckCircle
			: item.category === 'Happy Clients'
			? Users
			: item.category === 'Tours'
			? MapPin
			: item.category === 'Destinations'
			? MapPin
			: item.category === 'Events'
			? Calendar
			: Camera;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-4xl'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-heading font-bold pr-4'>{item.title}</DialogTitle>
					<DialogDescription>View the complete details of this success story</DialogDescription>
				</DialogHeader>

				<ScrollArea className='max-h-[calc(90vh-120px)] pr-4'>
					<div className='space-y-6'>
						<div>
							<img
								src={item.image.url || '/placeholder.svg'}
								alt={item.title}
								className='w-full max-h-96 object-cover rounded-xl shadow-lg'
							/>
						</div>

						<Card className='bg-accent/30'>
							<CardHeader>
								<CardTitle className='text-lg'>Story</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-foreground leading-relaxed font-body'>{item.content}</p>
							</CardContent>
						</Card>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<Card>
								<CardHeader>
									<CardTitle className='text-base'>Details</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
										<span className='text-muted-foreground font-medium'>Category:</span>
										<Badge variant='secondary' className='flex items-center gap-2'>
											<CategoryIcon className='w-4 h-4' />
											{item.category}
										</Badge>
									</div>
									<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
										<span className='text-muted-foreground font-medium'>Status:</span>
										<Badge variant={item.isActive ? 'default' : 'destructive'}>
											{item.isActive ? 'Active' : 'Inactive'}
										</Badge>
									</div>
									<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
										<span className='text-muted-foreground font-medium'>Created:</span>
										<span className='font-semibold text-foreground'>
											{new Date(item.createdAt).toLocaleDateString()}
										</span>
									</div>
									{item.updatedAt !== item.createdAt && (
										<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
											<span className='text-muted-foreground font-medium'>Updated:</span>
											<span className='font-semibold text-foreground'>
												{new Date(item.updatedAt).toLocaleDateString()}
											</span>
										</div>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='text-base'>People</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
										<span className='text-muted-foreground font-medium'>Created by:</span>
										<span className='font-semibold text-foreground'>{item.createdBy?.name}</span>
									</div>
									{item.updatedBy && (
										<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
											<span className='text-muted-foreground font-medium'>Updated by:</span>
											<span className='font-semibold text-foreground'>{item.updatedBy?.name}</span>
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{item.tags && item.tags.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className='text-base'>Tags</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='flex flex-wrap gap-2'>
										{item.tags.map((tag, index) => (
											<Badge key={index} variant='outline'>
												{tag}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

export default AdminGallery;
