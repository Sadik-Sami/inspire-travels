'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { useBlogMutation } from '@/hooks/useBlogMutation';

// Blog categories to match the BlogsFilter component
const BLOG_CATEGORIES = [
	'Travel Tips',
	'Destination Guides',
	'Adventure',
	'Food & Dining',
	'Culture',
	'Budget Travel',
	'Luxury Travel',
	'Family Travel',
	'Solo Travel',
	'Photography',
	'Sustainable Travel',
	'Travel Stories',
];

const EditBlog = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const axiosSecure = useAxiosSecure();
	const { updateBlog } = useBlogMutation();

	// State for form data
	const [formData, setFormData] = useState({
		title: '',
		summary: '',
		content: '',
		categories: [],
		tags: [],
		status: 'draft',
		isFeatured: false,
	});

	// State for images
	const [coverImage, setCoverImage] = useState(null);
	const [coverImagePreview, setCoverImagePreview] = useState(null);
	const [images, setImages] = useState([]);
	const [imagesPreviews, setImagesPreviews] = useState([]);
	const [existingImages, setExistingImages] = useState([]);
	const [deleteCoverImage, setDeleteCoverImage] = useState(false);
	const [deleteImages, setDeleteImages] = useState([]);

	// State for category and tag input
	const [categoryInput, setCategoryInput] = useState('');
	const [tagInput, setTagInput] = useState('');

	// Fetch blog data
	const {
		data: blogData,
		isLoading: isFetchingBlog,
		isError: fetchError,
	} = useQuery({
		queryKey: ['blog', id],
		queryFn: async () => {
			const response = await axiosSecure.get(`/api/blogs/${id}`);
			return response.data;
		},
		enabled: !!id,
	});

	// Update form data when blog data is fetched
	useEffect(() => {
		if (blogData) {
			// Set form data
			const newFormData = {
				title: blogData.title || '',
				summary: blogData.summary || '',
				content: blogData.content || '',
				categories: blogData.categories || [],
				tags: blogData.tags || [],
				status: blogData.status || 'draft',
				isFeatured: blogData.isFeatured || false,
			};
			setFormData(newFormData);

			// Set cover image preview
			if (blogData.coverImage?.url) {
				setCoverImagePreview(blogData.coverImage.url);
			}

			// Set existing images
			if (blogData.images && blogData.images.length > 0) {
				setExistingImages(blogData.images);
			}
		}
	}, [blogData]);

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle switch changes
	const handleSwitchChange = (name, checked) => {
		setFormData((prev) => ({ ...prev, [name]: checked }));
	};

	// Handle cover image change
	const handleCoverImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setCoverImage(file);
			setDeleteCoverImage(false);
			const reader = new FileReader();
			reader.onloadend = () => {
				setCoverImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle additional images change
	const handleImagesChange = (e) => {
		const files = Array.from(e.target.files);
		if (files.length > 0) {
			setImages((prev) => [...prev, ...files]);

			// Create previews
			const newPreviews = [];
			files.forEach((file) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					newPreviews.push({ file: file, preview: reader.result });
					if (newPreviews.length === files.length) {
						setImagesPreviews((prev) => [...prev, ...newPreviews]);
					}
				};
				reader.readAsDataURL(file);
			});
		}
	};

	// Handle remove cover image
	const handleRemoveCoverImage = () => {
		setCoverImage(null);
		setCoverImagePreview(null);
		setDeleteCoverImage(true);
	};

	// Handle remove additional image
	const handleRemoveImage = (index) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
		setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
	};

	// Handle remove existing image
	const handleRemoveExistingImage = (imageId) => {
		setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
		setDeleteImages((prev) => [...prev, imageId]);
	};

	// Handle category selection
	const handleCategorySelect = (category) => {
		if (!formData.categories.includes(category)) {
			setFormData((prev) => ({
				...prev,
				categories: [...prev.categories, category],
			}));
		} else {
			handleRemoveCategory(category);
		}
	};

	// Handle custom category
	const handleAddCustomCategory = () => {
		if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
			setFormData((prev) => ({
				...prev,
				categories: [...prev.categories, categoryInput.trim()],
			}));
			setCategoryInput('');
		}
	};

	// Handle remove category
	const handleRemoveCategory = (category) => {
		setFormData((prev) => ({
			...prev,
			categories: prev.categories.filter((c) => c !== category),
		}));
	};

	// Handle add tag
	const handleAddTag = () => {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, tagInput.trim()],
			}));
			setTagInput('');
		}
	};

	// Handle remove tag
	const handleRemoveTag = (tag) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((t) => t !== tag),
		}));
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		// Validate form
		if (!formData.title.trim()) {
			toast.error('Title is required');
			return;
		}

		if (!formData.summary.trim()) {
			toast.error('Summary is required');
			return;
		}

		if (!formData.content.trim()) {
			toast.error('Content is required');
			return;
		}

		// Create form data for submission
		const formDataToSend = new FormData();

		// Append basic fields
		formDataToSend.append('title', formData.title);
		formDataToSend.append('summary', formData.summary);
		formDataToSend.append('content', formData.content);
		formDataToSend.append('status', formData.status || 'draft');
		formDataToSend.append('isFeatured', formData.isFeatured);

		// Append arrays as JSON strings
		formDataToSend.append('categories', JSON.stringify(formData.categories));
		formDataToSend.append('tags', JSON.stringify(formData.tags));

		// Append cover image if exists
		if (coverImage) {
			formDataToSend.append('coverImage', coverImage);
		}

		// Append additional images if exist
		if (images && images.length > 0) {
			images.forEach((image) => {
				formDataToSend.append('images', image);
			});
		}

		// Append delete cover image flag
		if (deleteCoverImage) {
			formDataToSend.append('deleteCoverImage', 'true');
		}

		// Append delete images array
		if (deleteImages.length > 0) {
			formDataToSend.append('deleteImages', JSON.stringify(deleteImages));
		}

		// Submit form
		updateBlog.mutate(
			{ id, formData: formDataToSend },
			{
				onSuccess: () => {
					toast.success('Blog updated successfully');
					navigate('/admin/blogs');
				},
				onError: (error) => {
					toast.error(`Failed to update blog: ${error.response?.data?.message || 'Unknown error'}`);
				},
			}
		);
	};

	if (isFetchingBlog) {
		return (
			<div className='flex justify-center items-center h-96'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (fetchError) {
		return (
			<div className='text-center py-10'>
				<h3 className='text-lg font-medium text-red-500'>Error loading blog</h3>
				<p className='mt-2 text-sm text-gray-400'>Please try again later</p>
				<Button className='mt-4' onClick={() => navigate('/admin/blogs')}>
					Back to Blogs
				</Button>
			</div>
		);
	}

	return (
		<div>
			<div className='flex items-center justify-between mb-6'>
				<h1 className='text-3xl font-bold'>Edit Blog</h1>
				<div className='flex gap-2'>
					<Button variant='outline' onClick={() => navigate('/admin/blogs')}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={updateBlog.isPending}>
						{updateBlog.isPending ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Saving...
							</>
						) : (
							<>Save Changes</>
						)}
					</Button>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Main content - 2/3 width */}
					<div className='lg:col-span-2 space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Blog Content</CardTitle>
								<CardDescription>Enter the main content and details for your blog post.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='title'>Title</Label>
										<Input
											id='title'
											name='title'
											value={formData.title}
											onChange={handleInputChange}
											placeholder='Enter blog title'
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='summary'>Summary</Label>
										<Textarea
											id='summary'
											name='summary'
											value={formData.summary}
											onChange={handleInputChange}
											placeholder='Enter a brief summary of your blog'
											rows={3}
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='content'>Content</Label>
										<Textarea
											id='content'
											name='content'
											value={formData.content}
											onChange={handleInputChange}
											placeholder='Enter the full content of your blog'
											rows={15}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Media</CardTitle>
								<CardDescription>Upload images for your blog post.</CardDescription>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue='cover'>
									<TabsList className='mb-4'>
										<TabsTrigger value='cover'>Cover Image</TabsTrigger>
										<TabsTrigger value='gallery'>Additional Images</TabsTrigger>
									</TabsList>

									<TabsContent value='cover'>
										<div className='space-y-4'>
											<div className='border-2 border-dashed rounded-lg p-6 text-center'>
												{coverImagePreview ? (
													<div className='relative'>
														<img
															src={coverImagePreview || '/placeholder.svg'}
															alt='Cover preview'
															className='max-h-[300px] mx-auto rounded-md'
														/>
														<Button
															type='button'
															variant='destructive'
															size='icon'
															className='absolute top-2 right-2'
															onClick={handleRemoveCoverImage}>
															<X className='h-4 w-4' />
														</Button>
													</div>
												) : (
													<div>
														<ImageIcon className='h-10 w-10 mx-auto mb-2 text-muted-foreground' />
														<Label htmlFor='coverImage' className='cursor-pointer text-primary hover:underline'>
															Upload cover image
														</Label>
														<p className='text-sm text-muted-foreground mt-1'>Recommended size: 1200 x 630 pixels</p>
														<Input
															id='coverImage'
															type='file'
															accept='image/*'
															className='hidden'
															onChange={handleCoverImageChange}
														/>
													</div>
												)}
											</div>
										</div>
									</TabsContent>

									<TabsContent value='gallery'>
										<div className='space-y-4'>
											<div className='border-2 border-dashed rounded-lg p-6 text-center'>
												<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4'>
													{/* Existing images */}
													{existingImages.map((image) => (
														<div key={image._id} className='relative'>
															<img
																src={image.url || '/placeholder.svg'}
																alt='Blog image'
																className='h-40 w-full object-cover rounded-md'
															/>
															<Button
																type='button'
																variant='destructive'
																size='icon'
																className='absolute top-2 right-2'
																onClick={() => handleRemoveExistingImage(image._id)}>
																<X className='h-4 w-4' />
															</Button>
														</div>
													))}

													{/* New images */}
													{imagesPreviews.map((image, index) => (
														<div key={index} className='relative'>
															<img
																src={image.preview || '/placeholder.svg'}
																alt={`Preview ${index}`}
																className='h-40 w-full object-cover rounded-md'
															/>
															<Button
																type='button'
																variant='destructive'
																size='icon'
																className='absolute top-2 right-2'
																onClick={() => handleRemoveImage(index)}>
																<X className='h-4 w-4' />
															</Button>
														</div>
													))}
												</div>

												<Label htmlFor='images' className='cursor-pointer text-primary hover:underline'>
													<Plus className='h-6 w-6 mx-auto mb-2' />
													Add more images
												</Label>
												<p className='text-sm text-muted-foreground mt-1'>You can upload up to 5 additional images</p>
												<Input
													id='images'
													type='file'
													accept='image/*'
													multiple
													className='hidden'
													onChange={handleImagesChange}
													disabled={existingImages.length + images.length >= 5}
												/>
											</div>
										</div>
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar - 1/3 width */}
					<div className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Publishing</CardTitle>
								<CardDescription>Control how and when your blog is published.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='status'>Status</Label>
										<div className='relative'>
											<select
												id='status'
												name='status'
												value={formData.status}
												onChange={(e) => {
													setFormData((prev) => ({ ...prev, status: e.target.value }));
												}}
												className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
												<option value='draft'>Draft</option>
												<option value='published'>Published</option>
												<option value='archived'>Archived</option>
											</select>
										</div>
										<div className='text-xs text-muted-foreground mt-1'>
											Current status: {formData.status || 'draft'}
										</div>
									</div>

									<div className='flex items-center justify-between'>
										<div className='space-y-0.5'>
											<Label htmlFor='featured'>Featured</Label>
											<p className='text-sm text-muted-foreground'>Display this blog in featured sections</p>
										</div>
										<Switch
											id='featured'
											checked={formData.isFeatured}
											onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Categories</CardTitle>
								<CardDescription>Categorize your blog for better organization.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{/* Predefined categories */}
									<div className='flex flex-wrap gap-2 mb-4'>
										{BLOG_CATEGORIES.map((category) => (
											<Badge
												key={category}
												variant={formData.categories.includes(category) ? 'default' : 'outline'}
												className='cursor-pointer'
												onClick={() => handleCategorySelect(category)}>
												{category}
											</Badge>
										))}
									</div>

									{/* Custom category input */}
									<div className='flex gap-2'>
										<Input
											value={categoryInput}
											onChange={(e) => setCategoryInput(e.target.value)}
											placeholder='Add a custom category'
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													handleAddCustomCategory();
												}
											}}
										/>
										<Button type='button' onClick={handleAddCustomCategory}>
											<Plus className='h-4 w-4' />
										</Button>
									</div>

									{/* Selected categories */}
									<div className='flex flex-wrap gap-2 mt-4'>
										<Label className='w-full mb-1'>Selected Categories:</Label>
										{formData.categories.map((category, index) => (
											<Badge key={index} variant='secondary' className='flex items-center gap-1'>
												<span>{category}</span>
												<button
													type='button'
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleRemoveCategory(category);
													}}
													className='ml-1 focus:outline-none'>
													<X className='h-3 w-3 cursor-pointer' />
												</button>
											</Badge>
										))}
										{formData.categories.length === 0 && (
											<p className='text-sm text-muted-foreground'>No categories selected</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Tags</CardTitle>
								<CardDescription>Add tags to make your blog more discoverable.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									<div className='flex gap-2'>
										<Input
											value={tagInput}
											onChange={(e) => setTagInput(e.target.value)}
											placeholder='Add a tag'
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													handleAddTag();
												}
											}}
										/>
										<Button type='button' onClick={handleAddTag}>
											<Plus className='h-4 w-4' />
										</Button>
									</div>

									<div className='flex flex-wrap gap-2 mt-2'>
										{formData.tags.map((tag, index) => (
											<Badge key={index} variant='outline' className='flex items-center gap-1'>
												<span>{tag}</span>
												<button
													type='button'
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleRemoveTag(tag);
													}}
													className='ml-1 focus:outline-none'>
													<X className='h-3 w-3 cursor-pointer' />
												</button>
											</Badge>
										))}
										{formData.tags.length === 0 && <p className='text-sm text-muted-foreground'>No tags added yet</p>}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</form>
		</div>
	);
};

export default EditBlog;
