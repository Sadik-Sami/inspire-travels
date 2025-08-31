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
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useGalleryQuery } from '@/hooks/useGalleryQuery';
import { useGalleryMutation } from '@/hooks/useGalleryMutation';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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

	// Handle delete
	const handleDelete = async (id) => {
		if (window.confirm('Are you sure you want to delete this gallery item?')) {
			deleteGalleryItem.mutate(id);
		}
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
				<div className='text-center p-8 bg-card rounded-xl border shadow-lg max-w-md'>
					<div className='w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4'>
						<AlertTriangle className='w-8 h-8 text-destructive' />
					</div>
					<h3 className='text-xl font-heading font-semibold text-foreground mb-2'>Error Loading Gallery</h3>
					<p className='text-muted-foreground'>{error.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background'>
			<div className='bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b'>
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
						<button
							onClick={() => setShowCreateModal(true)}
							className='cta-primary px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover-lift'>
							<Plus className='w-5 h-5' />
							Add New Story
						</button>
					</div>
				</div>
			</div>

			<div className='container mx-auto px-4 md:px-6 py-8 space-y-8'>
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
					<div className='lg:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow'>
						<div className='flex items-center gap-4'>
							<div className='w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center'>
								<TrendingUp className='w-6 h-6 text-primary' />
							</div>
							<div>
								<p className='text-sm font-medium text-muted-foreground'>Total Stories</p>
								<p className='text-2xl font-bold text-foreground'>{totalItems}</p>
								<p className='text-xs text-muted-foreground'>Across all categories</p>
							</div>
						</div>
					</div>
					{categories.slice(1).map((category) => {
						const IconComponent = category.icon;
						return (
							<div
								key={category.value}
								className='bg-card p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 hover-lift'>
								<div className='text-center space-y-2'>
									<div className='w-8 h-8 mx-auto text-primary'>
										<IconComponent className='w-full h-full' />
									</div>
									<div>
										<p className='text-lg font-semibold text-foreground'>{categoryStats[category.value] || 0}</p>
										<p className='text-xs text-muted-foreground font-medium'>{category.label}</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				<div className='bg-card p-6 rounded-xl border shadow-sm'>
					<div className='flex items-center gap-2 mb-4'>
						<Filter className='w-5 h-5 text-primary' />
						<h3 className='font-heading font-semibold text-foreground'>Filters & Search</h3>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
						{/* Search */}
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
							<Input
								type='text'
								placeholder='Search stories...'
								value={filters.search}
								onChange={(e) => handleFilterChange('search', e.target.value)}
								className='w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-body'
							/>
						</div>

						{/* Category Filter */}
						<Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
							<SelectTrigger className='w-full px-4 py-3 font-body'>
								<SelectValue placeholder='Select a category' />
							</SelectTrigger>
							<SelectContent>
								{categories.map((category) => (
									<SelectItem key={category.value} value={category.value} className='flex items-center gap-2'>
										<category.icon className='w-4 h-4' />
										{category.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Status Filter */}
						<Select value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Select status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='true'>Active</SelectItem>
								<SelectItem value='false'>Inactive</SelectItem>
							</SelectContent>
						</Select>

						{/* Sort */}
						<Select
							value={`${filters.sortBy}-${filters.sortOrder}`}
							onValueChange={(value) => {
								const [sortBy, sortOrder] = value.split('-');
								handleFilterChange('sortBy', sortBy);
								handleFilterChange('sortOrder', sortOrder);
							}}>
							<SelectTrigger className='w-full'>
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
				</div>

				{isLoading ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{[...Array(8)].map((_, i) => (
							<div key={i} className='bg-card rounded-xl border overflow-hidden animate-pulse'>
								<div className='w-full h-48 bg-muted'></div>
								<div className='p-4 space-y-3'>
									<div className='h-4 bg-muted rounded'></div>
									<div className='h-3 bg-muted rounded'></div>
									<div className='h-3 bg-muted rounded w-2/3'></div>
								</div>
							</div>
						))}
					</div>
				) : galleryData?.data?.items?.length === 0 ? (
					<div className='text-center py-16'>
						<div className='w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6'>
							<ImageIcon className='w-12 h-12 text-muted-foreground' />
						</div>
						<h3 className='text-xl font-heading font-semibold text-foreground mb-2'>No gallery items found</h3>
						<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
							Get started by adding your first success story to showcase your achievements
						</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className='cta-primary px-6 py-3 rounded-xl inline-flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200'>
							<Plus className='w-5 h-5' />
							Add First Story
						</button>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
						{galleryData.data.items.map((item) => {
							const CategoryIcon = getCategoryIcon(item.category);
							return (
								<div
									key={item._id}
									className='bg-card rounded-xl border overflow-hidden group hover:shadow-lg transition-all duration-300 hover-lift'>
									{/* Image */}
									<div className='relative w-full h-48 overflow-hidden'>
										<img
											src={item.image.url || '/placeholder.svg'}
											alt={item.title}
											className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
										/>
										<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4'>
											<div className='flex gap-2'>
												<button
													onClick={() => {
														setSelectedItem(item);
														setShowViewModal(true);
													}}
													className='bg-white/90 backdrop-blur-sm text-foreground p-2 rounded-lg hover:bg-white transition-all duration-200 shadow-lg'>
													<Eye className='w-4 h-4' />
												</button>
												<button
													onClick={() => {
														setSelectedItem(item);
														setShowEditModal(true);
													}}
													className='bg-white/90 backdrop-blur-sm text-foreground p-2 rounded-lg hover:bg-white transition-all duration-200 shadow-lg'>
													<Edit className='w-4 h-4' />
												</button>
												<button
													onClick={() => handleDelete(item._id)}
													className='bg-white/90 backdrop-blur-sm text-destructive p-2 rounded-lg hover:bg-white transition-all duration-200 shadow-lg'>
													<Trash2 className='w-4 h-4' />
												</button>
											</div>
										</div>
										{/* Status Badge */}
										<div className='absolute top-3 left-3'>
											<span
												className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
													item.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
												}`}>
												{item.isActive ? 'Active' : 'Inactive'}
											</span>
										</div>
										{/* Category Badge */}
										<div className='absolute top-3 right-3'>
											<span className='bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1'>
												<CategoryIcon className='w-3 h-3' />
												{item.category}
											</span>
										</div>
									</div>

									{/* Content */}
									<div className='p-5 space-y-3'>
										<h3 className='font-heading font-semibold text-foreground line-clamp-2 text-lg leading-tight'>
											{item.title}
										</h3>
										<p className='text-muted-foreground text-sm line-clamp-2 leading-relaxed'>{item.content}</p>

										{/* Tags */}
										{item.tags && item.tags.length > 0 && (
											<div className='flex flex-wrap gap-1'>
												{item.tags.slice(0, 2).map((tag, index) => (
													<span
														key={index}
														className='bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium'>
														{tag}
													</span>
												))}
												{item.tags.length > 2 && (
													<span className='text-xs text-muted-foreground font-medium'>
														+{item.tags.length - 2} more
													</span>
												)}
											</div>
										)}

										{/* Footer */}
										<div className='flex items-center justify-between text-xs text-muted-foreground pt-2 border-t'>
											<span className='font-medium'>By {item.createdBy?.name}</span>
											<span>{new Date(item.createdAt).toLocaleDateString()}</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{galleryData?.data?.pagination && galleryData.data.pagination.totalPages > 1 && (
					<div className='flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card rounded-xl border'>
						<div className='text-sm text-muted-foreground font-medium'>
							Showing {(galleryData.data.pagination.currentPage - 1) * galleryData.data.pagination.limit + 1} to{' '}
							{Math.min(
								galleryData.data.pagination.currentPage * galleryData.data.pagination.limit,
								galleryData.data.pagination.totalCount
							)}{' '}
							of {galleryData.data.pagination.totalCount} results
						</div>
						<div className='flex items-center gap-2'>
							<button
								onClick={() => handlePageChange(galleryData.data.pagination.currentPage - 1)}
								disabled={!galleryData.data.pagination.hasPrevPage}
								className='px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
								Previous
							</button>
							<span className='px-4 py-2 text-sm font-medium bg-primary/10 text-primary rounded-lg'>
								Page {galleryData.data.pagination.currentPage} of {galleryData.data.pagination.totalPages}
							</span>
							<button
								onClick={() => handlePageChange(galleryData.data.pagination.currentPage + 1)}
								disabled={!galleryData.data.pagination.hasNextPage}
								className='px-4 py-2 text-sm font-medium border border-input rounded-lg hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
								Next
							</button>
						</div>
					</div>
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
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-heading font-bold'>Add New Success Story</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label className='block text-sm font-medium text-foreground mb-3'>Image *</label>
						<div className='relative border-2 border-dashed border-input rounded-xl p-8 text-center hover:border-primary/50 transition-colors'>
							{imagePreview ? (
								<div className='relative'>
									<img
										src={imagePreview || '/placeholder.svg'}
										alt='Preview'
										className='max-w-full h-48 object-cover mx-auto rounded-lg shadow-md'
									/>
									<button
										type='button'
										onClick={() => {
											setImagePreview(null);
											setFormData((prev) => ({ ...prev, image: null }));
										}}
										className='absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90 shadow-lg transition-colors'>
										<Trash2 className='w-4 h-4' />
									</button>
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
							<input
								type='file'
								accept='image/*'
								onChange={handleImageChange}
								className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-foreground mb-2'>Title *</label>
						<input
							type='text'
							value={formData.title}
							onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
							className='w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-body'
							placeholder='Enter story title...'
							maxLength={100}
							required
						/>
						<p className='text-xs text-muted-foreground mt-1'>{formData.title.length}/100 characters</p>
					</div>

					<div>
						<label className='block text-sm font-medium text-foreground mb-2'>Content *</label>
						<textarea
							value={formData.content}
							onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
							rows={4}
							className='w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-body resize-none'
							placeholder='Tell the success story...'
							maxLength={500}
							required
						/>
						<p className='text-xs text-muted-foreground mt-1'>{formData.content.length}/500 characters</p>
					</div>

					<div>
						<label className='block text-sm font-medium text-foreground mb-2'>Category *</label>
						<select
							value={formData.category}
							onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
							className='w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-body'
							required>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-sm font-medium text-foreground mb-2'>Tags</label>
						<input
							type='text'
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							onKeyDown={handleAddTag}
							className='w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-body'
							placeholder='Type and press Enter or comma to add tags...'
						/>
						{formData.tags.length > 0 && (
							<div className='flex flex-wrap gap-2 mt-3'>
								{formData.tags.map((tag, index) => (
									<span
										key={index}
										className='bg-primary/10 text-primary text-sm px-3 py-1 rounded-lg flex items-center gap-2 font-medium'>
										{tag}
										<button
											type='button'
											onClick={() => handleRemoveTag(tag)}
											className='text-primary hover:text-primary/70 transition-colors'>
											<X className='w-3 h-3' />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					<DialogFooter className='gap-3'>
						<button
							type='button'
							onClick={() => onOpenChange(false)}
							className='px-6 py-3 text-foreground border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium'>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='cta-primary px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg'>
							{isSubmitting ? (
								<>
									<div className='w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin'></div>
									Creating...
								</>
							) : (
								'Create Story'
							)}
						</button>
					</DialogFooter>
				</form>
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
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-heading font-bold'>Edit Success Story</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label className='block text-sm font-medium text-foreground mb-3'>Current Image</label>
						<div className='relative'>
							<img
								src={item.image.url || '/placeholder.svg'}
								alt={item.title}
								className='w-full h-48 object-cover rounded-lg shadow-md'
							/>
							<div className='absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity'>
								<p className='text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-md'>Current Image</p>
							</div>
						</div>
						<p className='text-xs text-muted-foreground mt-2'>
							To change the image, please delete and create a new story
						</p>
					</div>

					<div>
						<label className='block text-sm font-medium text-foreground mb-2'>Title *</label>
						<input
							type='text'
							value={formData.title}
							onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
							className='w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-body'
							placeholder='Enter story title...'
							maxLength={100}
							required
						/>
						<p className='text-xs text-muted-foreground mt-1'>{formData.title.length}/100 characters</p>
					</div>

					<div>
						<label className='block text-sm font-medium text-foreground mb-2'>Content *</label>
						<textarea
							value={formData.content}
							onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
							rows={4}
							className='w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-body resize-none'
							placeholder='Tell the success story...'
							maxLength={500}
							required
						/>
						<p className='text-xs text-muted-foreground mt-1'>{formData.content.length}/500 characters</p>
					</div>

					<div>
						<label className='block text-sm font-medium text-foreground mb-2'>Category *</label>
						<select
							value={formData.category}
							onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
							className='w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-body'
							required>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-sm font-medium text-foreground mb-2'>Tags</label>
						<input
							type='text'
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							onKeyDown={handleAddTag}
							className='w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-body'
							placeholder='Type and press Enter or comma to add tags...'
						/>
						{formData.tags.length > 0 && (
							<div className='flex flex-wrap gap-2 mt-3'>
								{formData.tags.map((tag, index) => (
									<span
										key={index}
										className='bg-primary/10 text-primary text-sm px-3 py-1 rounded-lg flex items-center gap-2 font-medium'>
										{tag}
										<button
											type='button'
											onClick={() => handleRemoveTag(tag)}
											className='text-primary hover:text-primary/70 transition-colors'>
											<X className='w-3 h-3' />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					<div className='bg-accent/50 p-4 rounded-lg'>
						<label className='flex items-center gap-3'>
							<input
								type='checkbox'
								checked={formData.isActive}
								onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
								className='w-4 h-4 text-primary border-input rounded focus:ring-ring'
							/>
							<span className='text-sm font-medium text-foreground'>Active (visible to users)</span>
						</label>
					</div>

					<DialogFooter className='gap-3'>
						<button
							type='button'
							onClick={() => onOpenChange(false)}
							className='px-6 py-3 text-foreground border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium'>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='cta-primary px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg'>
							{isSubmitting ? (
								<>
									<div className='w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin'></div>
									Updating...
								</>
							) : (
								'Update Story'
							)}
						</button>
					</DialogFooter>
				</form>
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
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-heading font-bold pr-4'>{item.title}</DialogTitle>
				</DialogHeader>

				<div className='space-y-6'>
					<div>
						<img
							src={item.image.url || '/placeholder.svg'}
							alt={item.title}
							className='w-full max-h-96 object-cover rounded-xl shadow-lg'
						/>
					</div>

					<div className='bg-accent/30 p-4 rounded-lg'>
						<h3 className='text-lg font-heading font-semibold text-foreground mb-3'>Story</h3>
						<p className='text-foreground leading-relaxed font-body'>{item.content}</p>
					</div>

					{/* Meta Information */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t'>
						<div className='space-y-4'>
							<h4 className='font-heading font-semibold text-foreground'>Details</h4>
							<div className='space-y-3 text-sm'>
								<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
									<span className='text-muted-foreground font-medium'>Category:</span>
									<span className='font-semibold text-foreground flex items-center gap-2'>
										<CategoryIcon className='w-4 h-4' />
										{item.category}
									</span>
								</div>
								<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
									<span className='text-muted-foreground font-medium'>Status:</span>
									<span
										className={`font-semibold px-2 py-1 rounded-md text-xs ${
											item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
										}`}>
										{item.isActive ? 'Active' : 'Inactive'}
									</span>
								</div>
								<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
									<span className='text-muted-foreground font-medium'>Created:</span>
									<span className='font-semibold text-foreground'>{new Date(item.createdAt).toLocaleDateString()}</span>
								</div>
								{item.updatedAt !== item.createdAt && (
									<div className='flex justify-between items-center p-2 bg-accent/20 rounded-md'>
										<span className='text-muted-foreground font-medium'>Updated:</span>
										<span className='font-semibold text-foreground'>
											{new Date(item.updatedAt).toLocaleDateString()}
										</span>
									</div>
								)}
							</div>
						</div>

						<div className='space-y-4'>
							<h4 className='font-heading font-semibold text-foreground'>People</h4>
							<div className='space-y-3 text-sm'>
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
							</div>
						</div>
					</div>

					{/* Tags */}
					{item.tags && item.tags.length > 0 && (
						<div className='pt-4 border-t'>
							<h4 className='font-heading font-semibold text-foreground mb-3'>Tags</h4>
							<div className='flex flex-wrap gap-2'>
								{item.tags.map((tag, index) => (
									<span key={index} className='bg-primary/10 text-primary text-sm px-3 py-2 rounded-lg font-medium'>
										{tag}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AdminGallery;
