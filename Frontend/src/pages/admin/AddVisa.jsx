import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useVisaMutation from '@/hooks/useVisaMutation';
import { toast } from 'sonner';
import { Upload, X, ImageIcon, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AddVisa = () => {
	const navigate = useNavigate();
	const { createVisa } = useVisaMutation();

	const [formData, setFormData] = useState({
		title: '',
		shortDescription: '',
		longDescription: '',
		price: '',
		currency: 'BDT',
		from: '',
		to: '',
		requirements: '',
		processingTime: '',
		specialRequests: '',
		featured: false,
	});

	const [photos, setPhotos] = useState([]);
	const [previewUrls, setPreviewUrls] = useState([]);
	const [coverImageIndex, setCoverImageIndex] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handleSelectChange = (value, name) => {
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSwitchChange = (name, checked) => {
		setFormData({
			...formData,
			[name]: checked,
		});
	};

	const handlePhotoChange = (e) => {
		const selectedFiles = Array.from(e.target.files);

		if (selectedFiles.length > 0) {
			// Create preview URLs for the selected images
			const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

			setPhotos([...photos, ...selectedFiles]);
			setPreviewUrls([...previewUrls, ...newPreviewUrls]);

			// Set the first uploaded image as cover if no cover is selected yet
			if (coverImageIndex === null) {
				setCoverImageIndex(0);
			}
		}
	};

	const removePhoto = (index) => {
		const updatedPhotos = [...photos];
		const updatedPreviews = [...previewUrls];

		// Revoke the object URL to avoid memory leaks
		URL.revokeObjectURL(previewUrls[index]);

		updatedPhotos.splice(index, 1);
		updatedPreviews.splice(index, 1);

		setPhotos(updatedPhotos);
		setPreviewUrls(updatedPreviews);

		// Update cover image index if needed
		if (coverImageIndex === index) {
			setCoverImageIndex(updatedPhotos.length > 0 ? 0 : null);
		} else if (coverImageIndex > index) {
			setCoverImageIndex(coverImageIndex - 1);
		}
	};

	const setCoverImage = (index) => {
		setCoverImageIndex(index);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!formData.title ||
			!formData.shortDescription ||
			!formData.longDescription ||
			!formData.price ||
			!formData.from ||
			!formData.to
		) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (photos.length === 0) {
			toast.error('Please upload at least one photo');
			return;
		}

		setIsSubmitting(true);

		try {
			await createVisa.mutateAsync({
				...formData,
				photos,
				coverImageIndex,
			});

			// Cleanup preview URLs
			previewUrls.forEach((url) => URL.revokeObjectURL(url));

			navigate('/admin/visas');
		} catch (error) {
			console.error('Error creating visa:', error);
			toast.error('Failed to create visa');
			setIsSubmitting(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className='px-2 sm:px-4 md:px-6'>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
				<div>
					<h1 className='text-2xl sm:text-3xl font-bold'>Add New Visa Package</h1>
					<p className='text-muted-foreground'>Create a new visa package for your customers</p>
				</div>
				<Button variant='outline' onClick={() => navigate('/admin/visas')}>
					Cancel
				</Button>
			</div>

			<form onSubmit={handleSubmit}>
				<Tabs defaultValue='basic' className='mb-6'>
					<TabsList className='w-full overflow-x-auto flex flex-nowrap sm:grid sm:grid-cols-2 md:grid-cols-3 mb-4 no-scrollbar'>
						<TabsTrigger value='basic' className='whitespace-nowrap'>
							Basic Info
						</TabsTrigger>
						<TabsTrigger value='details' className='whitespace-nowrap'>
							Details
						</TabsTrigger>
						<TabsTrigger value='media' className='whitespace-nowrap'>
							Media
						</TabsTrigger>
					</TabsList>

					{/* Basic Info Tab */}
					<TabsContent value='basic' className='space-y-6'>
						<Card>
							<CardHeader className='pb-3'>
								<CardTitle>Visa Package Details</CardTitle>
								<CardDescription>Enter the basic information about this visa package.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='title'>
										Title <span className='text-red-500'>*</span>
									</Label>
									<Input
										id='title'
										name='title'
										placeholder='e.g. USA Tourist Visa'
										value={formData.title}
										onChange={handleChange}
										required
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='shortDescription'>
										Short Description <span className='text-red-500'>*</span>
									</Label>
									<Input
										id='shortDescription'
										name='shortDescription'
										placeholder='Brief description of the visa package'
										value={formData.shortDescription}
										onChange={handleChange}
										required
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='longDescription'>
										Long Description <span className='text-red-500'>*</span>
									</Label>
									<Textarea
										id='longDescription'
										name='longDescription'
										placeholder='Detailed description of the visa package'
										value={formData.longDescription}
										onChange={handleChange}
										required
										className='min-h-[150px] sm:min-h-[200px]'
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='pb-3'>
								<CardTitle>Location & Pricing</CardTitle>
								<CardDescription>Specify the origin, destination, and pricing details</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='from'>
											From <span className='text-red-500'>*</span>
										</Label>
										<Input
											id='from'
											name='from'
											placeholder='e.g. Bangladesh'
											value={formData.from}
											onChange={handleChange}
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='to'>
											To <span className='text-red-500'>*</span>
										</Label>
										<Input
											id='to'
											name='to'
											placeholder='e.g. United States'
											value={formData.to}
											onChange={handleChange}
											required
										/>
									</div>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='price'>
											Price <span className='text-red-500'>*</span>
										</Label>
										<Input
											id='price'
											name='price'
											type='number'
											min='0'
											step='0.01'
											placeholder='e.g. 15000'
											value={formData.price}
											onChange={handleChange}
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='currency'>Currency</Label>
										<Select value={formData.currency} onValueChange={(value) => handleSelectChange(value, 'currency')}>
											<SelectTrigger>
												<SelectValue placeholder='Select currency' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='BDT'>BDT - Bangladesh Taka</SelectItem>
												<SelectItem value='USD'>USD - US Dollar</SelectItem>
												<SelectItem value='EUR'>EUR - Euro</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Details Tab */}
					<TabsContent value='details' className='space-y-6'>
						<Card>
							<CardHeader className='pb-3'>
								<CardTitle>Processing Information</CardTitle>
								<CardDescription>Specify processing time and special requirements</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='processingTime'>Processing Time</Label>
									<Input
										id='processingTime'
										name='processingTime'
										placeholder='e.g. 7-14 business days'
										value={formData.processingTime}
										onChange={handleChange}
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='specialRequests'>Special Requests</Label>
									<Input
										id='specialRequests'
										name='specialRequests'
										placeholder='e.g. Medical certificate, Travel insurance'
										value={formData.specialRequests}
										onChange={handleChange}
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='requirements'>Requirements (comma separated)</Label>
									<Textarea
										id='requirements'
										name='requirements'
										placeholder='e.g. Valid passport, 2 passport-sized photos, Completed application form'
										value={formData.requirements}
										onChange={handleChange}
										className='min-h-[100px]'
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='pb-3'>
								<CardTitle>Visibility Settings</CardTitle>
								<CardDescription>Control how this visa package appears on the website</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='flex items-center justify-between'>
									<div className='space-y-0.5'>
										<Label htmlFor='featured'>Featured Visa</Label>
										<p className='text-sm text-muted-foreground'>Display this visa in featured sections</p>
									</div>
									<Switch
										id='featured'
										checked={formData.featured}
										onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Media Tab */}
					<TabsContent value='media' className='space-y-6'>
						<Card>
							<CardHeader className='pb-3'>
								<CardTitle>Photos</CardTitle>
								<CardDescription>
									Upload high-quality images for your visa package. Click the star icon to set a cover image.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='border-2 border-dashed border-border rounded-lg p-4 mb-4'>
									<div className='flex flex-wrap gap-4 mb-3'>
										{previewUrls.map((url, index) => (
											<div key={index} className='relative group'>
												<img
													src={url || '/placeholder.svg'}
													alt={`Preview ${index}`}
													className={`h-24 w-24 object-cover rounded-lg ${
														coverImageIndex === index ? 'ring-2 ring-yellow-400' : ''
													}`}
												/>
												<div className='absolute top-1 right-1 flex gap-1'>
													<Button
														type='button'
														size='icon'
														variant='secondary'
														className={`h-6 w-6 bg-yellow-400 text-white hover:bg-yellow-500 ${
															coverImageIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
														} transition-opacity`}
														onClick={() => setCoverImage(index)}
														title='Set as cover image'>
														<Star size={12} />
													</Button>
													<Button
														type='button'
														size='icon'
														variant='destructive'
														className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
														onClick={() => removePhoto(index)}
														title='Remove image'>
														<X size={12} />
													</Button>
												</div>
												{coverImageIndex === index && (
													<div className='absolute bottom-1 left-1 bg-yellow-400 text-xs text-white px-1.5 py-0.5 rounded'>
														Cover
													</div>
												)}
											</div>
										))}

										{previewUrls.length === 0 && (
											<div className='flex flex-col items-center justify-center text-muted-foreground h-24 w-full'>
												<ImageIcon size={32} />
												<span className='text-sm mt-2'>No photos selected</span>
											</div>
										)}
									</div>

									<Label htmlFor='photo-upload' className='cursor-pointer'>
										<div className='flex items-center justify-center gap-2 py-3 px-4 bg-muted hover:bg-muted/80 rounded-md transition-colors'>
											<Upload size={20} />
											<span>Select Photos</span>
										</div>
										<Input
											id='photo-upload'
											type='file'
											multiple
											accept='image/*'
											onChange={handlePhotoChange}
											className='hidden'
										/>
									</Label>
									<p className='text-xs text-muted-foreground mt-2'>
										Upload up to 5 high-quality images. Maximum size: 5MB per image.
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<div className='flex flex-col sm:flex-row justify-end gap-4 mt-6'>
					<Button type='button' variant='outline' onClick={() => navigate('/admin/visas')} className='w-full sm:w-auto'>
						Cancel
					</Button>
					<Button type='submit' disabled={isSubmitting} className='w-full sm:w-auto min-w-[120px]'>
						{isSubmitting ? (
							<div className='flex items-center justify-center'>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								<span>Creating...</span>
							</div>
						) : (
							<span>Create Visa</span>
						)}
					</Button>
				</div>
			</form>
		</motion.div>
	);
};

export default AddVisa;
