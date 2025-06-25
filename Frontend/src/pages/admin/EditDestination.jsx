import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Star, Loader2, Calendar, Plus, Wifi, Car, Utensils, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useDestinationDetail } from '@/hooks/useDestinationQuery';
import { useUpdateDestination, useDeleteDestinationImage } from '@/hooks/useDestinationMutation';
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
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

// Replace the formatDate function that uses date-fns with a native JS implementation
const formatDate = (date) => {
	if (!date) return '';
	const d = new Date(date);
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

// Add a function to format date as YYYY-MM-DD
const formatDateForStorage = (date) => {
	if (!date) return '';
	const d = new Date(date);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const EditDestination = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageToDelete, setImageToDelete] = useState(null);
	const [newAvailableDate, setNewAvailableDate] = useState(null);
	const axiosSecure = useAxiosSecure();

	// Default form state
	const defaultFormData = {
		title: '',
		summary: '',
		description: '',
		location: {
			from: '',
			to: '',
			address: '',
			mapLink: '',
		},
		pricing: {
			basePrice: '',
			discountedPrice: '',
			currency: 'USD',
			priceType: 'perPerson',
		},
		duration: {
			days: 1,
			nights: 0,
			flexible: false,
		},
		dates: {
			startDate: '',
			endDate: '',
			availableDates: [],
			bookingDeadline: '',
		},
		transportation: {
			included: true,
			type: 'flight',
			details: '',
		},
		accommodation: {
			type: 'hotel',
			rating: 3,
			details: '',
		},
		meals: {
			included: true,
			details: 'Breakfast included',
		},
		groupSize: {
			min: 1,
			max: 20,
			privateAvailable: false,
		},
		activities: [''],
		advantages: [''],
		features: [''],
		amenities: {
			wifi: false,
			airConditioning: false,
			parking: false,
			pool: false,
			spa: false,
			gym: false,
			restaurant: false,
			bar: false,
			roomService: false,
			laundry: false,
			accessibility: false,
		},
		categories: [],
		isFeatured: false,
		isPopular: false,
		status: 'draft',
		images: [],
	};

	const [formData, setFormData] = useState(defaultFormData);

	// Fetch destination data
	const { data: destination, isLoading, isError, error } = useDestinationDetail(id);

	// Update mutation
	const updateMutation = useUpdateDestination(axiosSecure);

	// Delete image mutation
	const deleteImageMutation = useDeleteDestinationImage(axiosSecure);

	// Static categories
	const categories = [
		{ id: 'beach', label: 'Beach' },
		{ id: 'mountain', label: 'Mountain' },
		{ id: 'city', label: 'City' },
		{ id: 'cultural', label: 'Cultural' },
		{ id: 'adventure', label: 'Adventure' },
		{ id: 'romantic', label: 'Romantic' },
		{ id: 'family-friendly', label: 'Family-friendly' },
		{ id: 'luxury', label: 'Luxury' },
		{ id: 'budget', label: 'Budget' },
		{ id: 'wildlife', label: 'Wildlife' },
		{ id: 'historical', label: 'Historical' },
		{ id: 'foodie', label: 'Food & Wine' },
	];

	// Populate form with destination data when it loads
	useEffect(() => {
		if (destination) {
			// Format dates for input fields
			const formatDateForInput = (dateString) => {
				if (!dateString) return '';
				const date = new Date(dateString);
				return date.toISOString().split('T')[0];
			};

			// Prepare form data from destination
			const preparedData = {
				...destination,
				dates: {
					...destination.dates,
					startDate: formatDateForInput(destination.dates?.startDate),
					endDate: formatDateForInput(destination.dates?.endDate),
					bookingDeadline: formatDateForInput(destination.dates?.bookingDeadline),
				},
			};

			// Ensure arrays have at least one empty item
			if (!preparedData.activities || preparedData.activities.length === 0) {
				preparedData.activities = [''];
			}
			if (!preparedData.advantages || preparedData.advantages.length === 0) {
				preparedData.advantages = [''];
			}
			if (!preparedData.features || preparedData.features.length === 0) {
				preparedData.features = [''];
			}

			setFormData(preparedData);
		}
	}, [destination]);

	// Handle form input changes
	const handleChange = (e) => {
		const { name, value } = e.target;

		// Handle nested objects with dot notation in name
		if (name.includes('.')) {
			const [parent, child] = name.split('.');
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	// Handle number input changes
	const handleNumberChange = (e) => {
		const { name, value } = e.target;
		const numValue = value === '' ? '' : Number(value);

		if (name.includes('.')) {
			const [parent, child] = name.split('.');
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: numValue,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	// Handle select changes
	const handleSelectChange = (value, name) => {
		if (name.includes('.')) {
			const [parent, child] = name.split('.');
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	// Handle switch toggles
	const handleSwitchChange = (name, checked) => {
		if (name.includes('.')) {
			const [parent, child] = name.split('.');
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: checked,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: checked,
			}));
		}
	};

	// Handle checkbox changes for amenities
	const handleAmenityChange = (amenity, checked) => {
		setFormData((prev) => ({
			...prev,
			amenities: {
				...prev.amenities,
				[amenity]: checked,
			},
		}));
	};

	// Handle category selection
	const handleCategoryChange = (category, checked) => {
		setFormData((prev) => {
			if (checked) {
				return {
					...prev,
					categories: [...prev.categories, category],
				};
			} else {
				return {
					...prev,
					categories: prev.categories.filter((c) => c !== category),
				};
			}
		});
	};

	// Handle array fields (advantages, features, activities)
	const handleArrayChange = (index, value, field) => {
		setFormData((prev) => {
			const newArray = [...prev[field]];
			newArray[index] = value;
			return {
				...prev,
				[field]: newArray,
			};
		});
	};

	// Add new item to array fields
	const handleAddItem = (field) => {
		setFormData((prev) => ({
			...prev,
			[field]: [...prev[field], ''],
		}));
	};

	// Remove item from array fields
	const handleRemoveItem = (index, field) => {
		setFormData((prev) => {
			const newArray = [...prev[field]];
			newArray.splice(index, 1);
			return {
				...prev,
				[field]: newArray,
			};
		});
	};

	// Handle image uploads
	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);

		if (formData.images.length + files.length > 4) {
			toast.error('Maximum 4 images allowed. Please remove some images before adding more.');
			return;
		}

		// Create preview URLs for the images
		const newImages = files.map((file) => ({
			file,
			preview: URL.createObjectURL(file),
		}));

		setFormData((prev) => ({
			...prev,
			images: [...prev.images, ...newImages],
		}));
	};

	// Remove image
	const handleRemoveImage = (index) => {
		const image = formData.images[index];

		// If it's an existing image (has _id), confirm deletion
		if (image._id) {
			setImageToDelete({ index, id: image._id });
			return;
		}

		// Otherwise just remove from state
		setFormData((prev) => {
			const newImages = [...prev.images];
			// Revoke the object URL to avoid memory leaks
			if (image.preview) {
				URL.revokeObjectURL(image.preview);
			}
			newImages.splice(index, 1);
			return {
				...prev,
				images: newImages,
			};
		});
	};

	// Delete image from server
	const handleDeleteImage = async () => {
		if (!imageToDelete) return;

		try {
			await deleteImageMutation.mutateAsync({
				destinationId: id,
				imageId: imageToDelete.id,
			});

			// Remove from local state
			setFormData((prev) => {
				const newImages = [...prev.images];
				newImages.splice(imageToDelete.index, 1);
				return {
					...prev,
					images: newImages,
				};
			});

			toast.success('Image deleted successfully');
		} catch (error) {
			toast.error('Failed to delete image: ' + (error.message || 'Unknown error'));
		} finally {
			setImageToDelete(null);
		}
	};

	// Fix the date picker timezone issue by ensuring we preserve the local date
	const handleDateChange = (date, field) => {
		if (!date) {
			if (field.includes('.')) {
				const [parent, child] = field.split('.');
				setFormData((prev) => ({
					...prev,
					[parent]: {
						...prev[parent],
						[child]: '',
					},
				}));
			} else {
				setFormData((prev) => ({
					...prev,
					[field]: '',
				}));
			}
			return;
		}

		// Format the date as YYYY-MM-DD to avoid timezone issues
		const formattedDate = formatDateForStorage(date);

		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: formattedDate,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[field]: formattedDate,
			}));
		}
	};

	// Add available date to the list
	const handleAddAvailableDate = () => {
		if (!newAvailableDate) return;

		// Format the date as YYYY-MM-DD to avoid timezone issues
		const dateString = formatDateForStorage(newAvailableDate);

		// Check if date already exists
		if (formData.dates.availableDates.includes(dateString)) {
			toast.error('This date is already added');
			return;
		}

		setFormData((prev) => ({
			...prev,
			dates: {
				...prev.dates,
				availableDates: [...prev.dates.availableDates, dateString].sort(),
			},
		}));

		setNewAvailableDate(null);
	};

	// Remove date from available dates
	const handleRemoveAvailableDate = (dateToRemove) => {
		setFormData((prev) => ({
			...prev,
			dates: {
				...prev.dates,
				availableDates: prev.dates.availableDates.filter((date) => date !== dateToRemove),
			},
		}));
	};

	// Form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate form
		if (!formData.title || !formData.summary || !formData.description) {
			toast.error('Please fill in all required fields.');
			return;
		}

		if (!formData.location.from || !formData.location.to) {
			toast.error('Please specify both origin and destination locations.');
			return;
		}

		if (!formData.pricing.basePrice) {
			toast.error('Please specify the base price for this destination.');
			return;
		}

		// Filter out empty advantages, features, and activities
		const filteredAdvantages = formData.advantages.filter((item) => item.trim() !== '');
		const filteredFeatures = formData.features.filter((item) => item.trim() !== '');
		const filteredActivities = formData.activities.filter((item) => item.trim() !== '');

		if (filteredAdvantages.length === 0) {
			toast.error('Please add at least one advantage.');
			return;
		}

		if (filteredFeatures.length === 0) {
			toast.error('Please add at least one feature.');
			return;
		}

		setIsSubmitting(true);

		try {
			// Prepare data for submission
			const submissionData = {
				...formData,
				advantages: filteredAdvantages,
				features: filteredFeatures,
				activities: filteredActivities,
			};

			await updateMutation.mutateAsync({
				id,
				formData: submissionData,
			});

			toast.success(`${formData.title} has been updated successfully.`);

			// Navigate back to destinations list
			navigate('/admin/destinations');
		} catch (error) {
			console.error('Error updating destination:', error);
			toast.error('There was an error updating the destination. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Clean up object URLs when component unmounts
	useEffect(() => {
		return () => {
			formData.images.forEach((image) => {
				if (image.preview) {
					URL.revokeObjectURL(image.preview);
				}
			});
		};
	}, []);

	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px]'>
				<Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
				<p className='text-muted-foreground'>Loading destination data...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px]'>
				<h2 className='text-2xl font-bold mb-4'>Error Loading Destination</h2>
				<p className='text-muted-foreground mb-6'>{error?.message || 'Failed to load destination data'}</p>
				<Button onClick={() => navigate('/admin/destinations')}>Return to Destinations</Button>
			</div>
		);
	}

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
			<div className='flex items-center justify-between mb-6'>
				<h1 className='text-3xl font-bold'>Edit Destination</h1>
				<Button variant='outline' onClick={() => navigate('/admin/destinations')}>
					Cancel
				</Button>
			</div>

			<form onSubmit={handleSubmit}>
				<Tabs defaultValue='basic' className='mb-6'>
					<TabsList className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-4'>
						<TabsTrigger value='basic'>Basic Info</TabsTrigger>
						<TabsTrigger value='details'>Details</TabsTrigger>
						<TabsTrigger value='pricing'>Pricing & Dates</TabsTrigger>
						<TabsTrigger value='amenities'>Amenities</TabsTrigger>
						<TabsTrigger value='media'>Media</TabsTrigger>
						<TabsTrigger value='seo'>SEO & Visibility</TabsTrigger>
					</TabsList>

					{/* Basic Info Tab */}
					<TabsContent value='basic' className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Destination Details</CardTitle>
								<CardDescription>Enter the basic information about this travel destination.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='title'>
										Title <span className='text-red-500'>*</span>
									</Label>
									<Input
										id='title'
										name='title'
										placeholder='e.g. Bali Paradise Tour'
										value={formData.title}
										onChange={handleChange}
										required
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='summary'>
										Summary <span className='text-red-500'>*</span>
									</Label>
									<Textarea
										id='summary'
										name='summary'
										placeholder='A brief summary of the destination (100-150 characters)'
										value={formData.summary}
										onChange={handleChange}
										required
										className='resize-none h-20'
									/>
									<p className='text-xs text-muted-foreground'>{formData.summary.length}/150 characters</p>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='description'>
										Full Description <span className='text-red-500'>*</span>
									</Label>
									<Textarea
										id='description'
										name='description'
										placeholder='Detailed description of the destination'
										value={formData.description}
										onChange={handleChange}
										required
										className='min-h-[200px]'
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Location</CardTitle>
								<CardDescription>Specify the origin and destination locations</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='location.from'>
											From <span className='text-red-500'>*</span>
										</Label>
										<Input
											id='location.from'
											name='location.from'
											placeholder='e.g. New York'
											value={formData.location.from}
											onChange={handleChange}
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='location.to'>
											To <span className='text-red-500'>*</span>
										</Label>
										<Input
											id='location.to'
											name='location.to'
											placeholder='e.g. Bali, Indonesia'
											value={formData.location.to}
											onChange={handleChange}
											required
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='location.address'>Detailed Address</Label>
									<Input
										id='location.address'
										name='location.address'
										placeholder='e.g. Jl. Raya Kuta No.99, Kuta, Bali, Indonesia'
										value={formData.location.address}
										onChange={handleChange}
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='location.mapLink'>Google Maps Link</Label>
									<Input
										id='location.mapLink'
										name='location.mapLink'
										placeholder='e.g. https://goo.gl/maps/...'
										value={formData.location.mapLink}
										onChange={handleChange}
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Categories</CardTitle>
								<CardDescription>Select categories that best describe this destination</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
									{categories.map((category) => (
										<div key={category.id} className='flex items-center space-x-2'>
											<Checkbox
												id={`category-${category.id}`}
												checked={formData.categories.includes(category.id)}
												onCheckedChange={(checked) => handleCategoryChange(category.id, checked)}
											/>
											<label
												htmlFor={`category-${category.id}`}
												className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
												{category.label}
											</label>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Details Tab */}
					<TabsContent value='details' className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Duration</CardTitle>
								<CardDescription>Specify the duration of the trip</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='duration.days'>
											Days <span className='text-red-500'>*</span>
										</Label>
										<Input
											id='duration.days'
											name='duration.days'
											type='number'
											min='1'
											value={formData.duration.days}
											onChange={handleNumberChange}
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='duration.nights'>Nights</Label>
										<Input
											id='duration.nights'
											name='duration.nights'
											type='number'
											min='0'
											value={formData.duration.nights}
											onChange={handleNumberChange}
										/>
									</div>
								</div>

								<div className='flex items-center space-x-2'>
									<Checkbox
										id='duration.flexible'
										checked={formData.duration.flexible}
										onCheckedChange={(checked) => handleSwitchChange('duration.flexible', checked)}
									/>
									<label htmlFor='duration.flexible' className='text-sm font-medium leading-none'>
										Flexible duration (can be customized by travelers)
									</label>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Transportation</CardTitle>
								<CardDescription>Specify transportation details</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='transportation.included'>Transportation Included</Label>
									<Switch
										id='transportation.included'
										checked={formData.transportation.included}
										onCheckedChange={(checked) => handleSwitchChange('transportation.included', checked)}
									/>
								</div>

								{formData.transportation.included && (
									<>
										<div className='space-y-2'>
											<Label htmlFor='transportation.type'>Transportation Type</Label>
											<Select
												value={formData.transportation.type}
												onValueChange={(value) => handleSelectChange(value, 'transportation.type')}>
												<SelectTrigger>
													<SelectValue placeholder='Select transportation type' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='flight'>Flight</SelectItem>
													<SelectItem value='train'>Train</SelectItem>
													<SelectItem value='bus'>Bus</SelectItem>
													<SelectItem value='cruise'>Cruise</SelectItem>
													<SelectItem value='self'>Self-drive</SelectItem>
													<SelectItem value='mixed'>Mixed (Multiple types)</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className='space-y-2'>
											<Label htmlFor='transportation.details'>Transportation Details</Label>
											<Textarea
												id='transportation.details'
												name='transportation.details'
												placeholder='e.g. Round-trip flights from New York to Bali with one stopover in Singapore'
												value={formData.transportation.details}
												onChange={handleChange}
												className='h-20'
											/>
										</div>
									</>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Accommodation</CardTitle>
								<CardDescription>Specify accommodation details</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='accommodation.type'>Accommodation Type</Label>
									<Select
										value={formData.accommodation.type}
										onValueChange={(value) => handleSelectChange(value, 'accommodation.type')}>
										<SelectTrigger>
											<SelectValue placeholder='Select accommodation type' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='hotel'>Hotel</SelectItem>
											<SelectItem value='resort'>Resort</SelectItem>
											<SelectItem value='villa'>Villa</SelectItem>
											<SelectItem value='apartment'>Apartment</SelectItem>
											<SelectItem value='hostel'>Hostel</SelectItem>
											<SelectItem value='mixed'>Mixed (Multiple types)</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='accommodation.rating'>Star Rating</Label>
									<div className='flex items-center space-x-2'>
										{[1, 2, 3, 4, 5].map((rating) => (
											<button
												key={rating}
												type='button'
												onClick={() => handleSelectChange(rating, 'accommodation.rating')}
												className={`p-1 rounded-full ${
													formData.accommodation.rating >= rating ? 'text-yellow-400' : 'text-gray-300'
												}`}>
												<Star className='h-6 w-6 fill-current' />
											</button>
										))}
										<span className='ml-2 text-sm'>{formData.accommodation.rating} Star</span>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='accommodation.details'>Accommodation Details</Label>
									<Textarea
										id='accommodation.details'
										name='accommodation.details'
										placeholder='e.g. 6 nights in a deluxe room with ocean view at the Grand Bali Resort & Spa'
										value={formData.accommodation.details}
										onChange={handleChange}
										className='h-20'
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Meals</CardTitle>
								<CardDescription>Specify meal inclusions</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='flex items-center justify-between'>
									<Label htmlFor='meals.included'>Meals Included</Label>
									<Switch
										id='meals.included'
										checked={formData.meals.included}
										onCheckedChange={(checked) => handleSwitchChange('meals.included', checked)}
									/>
								</div>

								{formData.meals.included && (
									<div className='space-y-2'>
										<Label htmlFor='meals.details'>Meal Details</Label>
										<Textarea
											id='meals.details'
											name='meals.details'
											placeholder='e.g. Daily breakfast, 3 lunches, and 2 dinners included'
											value={formData.meals.details}
											onChange={handleChange}
											className='h-20'
										/>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Group Size</CardTitle>
								<CardDescription>Specify group size limitations</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='groupSize.min'>Minimum Group Size</Label>
										<Input
											id='groupSize.min'
											name='groupSize.min'
											type='number'
											min='1'
											value={formData.groupSize.min}
											onChange={handleNumberChange}
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='groupSize.max'>Maximum Group Size</Label>
										<Input
											id='groupSize.max'
											name='groupSize.max'
											type='number'
											min='1'
											value={formData.groupSize.max}
											onChange={handleNumberChange}
										/>
									</div>
								</div>

								<div className='flex items-center space-x-2'>
									<Checkbox
										id='groupSize.privateAvailable'
										checked={formData.groupSize.privateAvailable}
										onCheckedChange={(checked) => handleSwitchChange('groupSize.privateAvailable', checked)}
									/>
									<label htmlFor='groupSize.privateAvailable' className='text-sm font-medium leading-none'>
										Private tour option available (additional cost)
									</label>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					{/* Pricing & Dates Tab */}
					<TabsContent value='pricing' className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Pricing</CardTitle>
								<CardDescription>Set pricing details for this destination</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='pricing.basePrice'>
											Base Price <span className='text-red-500'>*</span>
										</Label>
										<div className='relative'>
											<Input
												id='pricing.basePrice'
												name='pricing.basePrice'
												type='number'
												min='0'
												step='0.01'
												placeholder='e.g. 1299.99'
												value={formData.pricing.basePrice}
												onChange={handleNumberChange}
												required
												className='pl-8'
											/>
											<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
												<span className='text-muted-foreground'>$</span>
											</div>
										</div>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='pricing.discountedPrice'>Discounted Price (Optional)</Label>
										<div className='relative'>
											<Input
												id='pricing.discountedPrice'
												name='pricing.discountedPrice'
												type='number'
												min='0'
												step='0.01'
												placeholder='e.g. 999.99'
												value={formData.pricing.discountedPrice}
												onChange={handleNumberChange}
												className='pl-8'
											/>
											<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
												<span className='text-muted-foreground'>$</span>
											</div>
										</div>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='pricing.currency'>Currency</Label>
									<Select
										value={formData.pricing.currency}
										onValueChange={(value) => handleSelectChange(value, 'pricing.currency')}>
										<SelectTrigger>
											<SelectValue placeholder='Select currency' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='USD'>USD - US Dollar</SelectItem>
											<SelectItem value='EUR'>EUR - Euro</SelectItem>
											<SelectItem value='GBP'>GBP - British Pound</SelectItem>
											<SelectItem value='JPY'>JPY - Japanese Yen</SelectItem>
											<SelectItem value='AUD'>AUD - Australian Dollar</SelectItem>
											<SelectItem value='CAD'>CAD - Canadian Dollar</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='pricing.priceType'>Price Type</Label>
									<RadioGroup
										value={formData.pricing.priceType}
										onValueChange={(value) => handleSelectChange(value, 'pricing.priceType')}
										className='flex flex-col space-y-1'>
										<div className='flex items-center space-x-2'>
											<RadioGroupItem value='perPerson' id='price-per-person' />
											<Label htmlFor='price-per-person'>Per Person</Label>
										</div>
										<div className='flex items-center space-x-2'>
											<RadioGroupItem value='perCouple' id='price-per-couple' />
											<Label htmlFor='price-per-couple'>Per Couple</Label>
										</div>
										<div className='flex items-center space-x-2'>
											<RadioGroupItem value='perGroup' id='price-per-group' />
											<Label htmlFor='price-per-group'>Per Group</Label>
										</div>
									</RadioGroup>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Dates</CardTitle>
								<CardDescription>Set available dates for this destination</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='dates.startDate'>Start Date</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button variant='outline' className='w-full justify-start text-left font-normal'>
													<Calendar className='mr-2 h-4 w-4' />
													{formData.dates.startDate ? formatDate(formData.dates.startDate) : <span>Pick a date</span>}
												</Button>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0'>
												<CalendarComponent
													mode='single'
													selected={formData.dates.startDate ? new Date(formData.dates.startDate) : undefined}
													onSelect={(date) => handleDateChange(date, 'dates.startDate')}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='dates.endDate'>End Date</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button variant='outline' className='w-full justify-start text-left font-normal'>
													<Calendar className='mr-2 h-4 w-4' />
													{formData.dates.endDate ? formatDate(formData.dates.endDate) : <span>Pick a date</span>}
												</Button>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0'>
												<CalendarComponent
													mode='single'
													selected={formData.dates.endDate ? new Date(formData.dates.endDate) : undefined}
													onSelect={(date) => handleDateChange(date, 'dates.endDate')}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='dates.bookingDeadline'>Booking Deadline</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button variant='outline' className='w-full justify-start text-left font-normal'>
												<Calendar className='mr-2 h-4 w-4' />
												{formData.dates.bookingDeadline ? (
													formatDate(formData.dates.bookingDeadline)
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0'>
											<CalendarComponent
												mode='single'
												selected={formData.dates.bookingDeadline ? new Date(formData.dates.bookingDeadline) : undefined}
												onSelect={(date) => handleDateChange(date, 'dates.bookingDeadline')}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<p className='text-xs text-muted-foreground'>Last date when customers can book this trip</p>
								</div>

								<div className='space-y-2 mt-4'>
									<Label>Available Dates</Label>
									<div className='flex flex-wrap gap-2 mb-2'>
										{formData.dates.availableDates.map((date) => (
											<Badge key={date} variant='secondary' className='flex items-center gap-1'>
												{formatDate(date)}
												<button
													type='button'
													onClick={(e) => {
														e.preventDefault();
														handleRemoveAvailableDate(date);
													}}
													className='ml-1 h-3 w-3 rounded-full inline-flex items-center justify-center hover:bg-muted'>
													<X className='h-3 w-3' />
												</button>
											</Badge>
										))}
										{formData.dates.availableDates.length === 0 && (
											<p className='text-sm text-muted-foreground'>No available dates added yet</p>
										)}
									</div>

									<div className='flex gap-2'>
										<Popover>
											<PopoverTrigger asChild>
												<Button variant='outline' className='flex-1 justify-start text-left font-normal'>
													<Calendar className='mr-2 h-4 w-4' />
													{newAvailableDate ? formatDate(newAvailableDate) : <span>Select date to add</span>}
												</Button>
											</PopoverTrigger>
											<PopoverContent className='w-auto p-0'>
												<CalendarComponent
													mode='single'
													selected={newAvailableDate}
													onSelect={setNewAvailableDate}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<Button type='button' onClick={handleAddAvailableDate} disabled={!newAvailableDate}>
											Add Date
										</Button>
									</div>
									<p className='text-xs text-muted-foreground'>
										Add specific dates when this trip is available for booking
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Amenities Tab */}
					<TabsContent value='amenities' className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Advantages & Features</CardTitle>
								<CardDescription>What makes this destination special?</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<Label>
											Advantages <span className='text-red-500'>*</span>
										</Label>
										<Button type='button' variant='outline' size='sm' onClick={() => handleAddItem('advantages')}>
											<Plus className='h-4 w-4 mr-1' />
											Add Advantage
										</Button>
									</div>

									{formData.advantages.map((advantage, index) => (
										<div key={`advantage-${index}`} className='flex items-center gap-2'>
											<Input
												placeholder={`Advantage ${index + 1}`}
												value={advantage}
												onChange={(e) => handleArrayChange(index, e.target.value, 'advantages')}
											/>
											{formData.advantages.length > 1 && (
												<Button
													type='button'
													variant='ghost'
													size='icon'
													onClick={() => handleRemoveItem(index, 'advantages')}>
													<Trash2 className='h-4 w-4 text-red-500' />
												</Button>
											)}
										</div>
									))}
								</div>

								<Separator />

								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<Label>
											Features <span className='text-red-500'>*</span>
										</Label>
										<Button type='button' variant='outline' size='sm' onClick={() => handleAddItem('features')}>
											<Plus className='h-4 w-4 mr-1' />
											Add Feature
										</Button>
									</div>

									{formData.features.map((feature, index) => (
										<div key={`feature-${index}`} className='flex items-center gap-2'>
											<Input
												placeholder={`Feature ${index + 1}`}
												value={feature}
												onChange={(e) => handleArrayChange(index, e.target.value, 'features')}
											/>
											{formData.features.length > 1 && (
												<Button
													type='button'
													variant='ghost'
													size='icon'
													onClick={() => handleRemoveItem(index, 'features')}>
													<Trash2 className='h-4 w-4 text-red-500' />
												</Button>
											)}
										</div>
									))}
								</div>

								<Separator />

								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<Label>Activities</Label>
										<Button type='button' variant='outline' size='sm' onClick={() => handleAddItem('activities')}>
											<Plus className='h-4 w-4 mr-1' />
											Add Activity
										</Button>
									</div>

									{formData.activities.map((activity, index) => (
										<div key={`activity-${index}`} className='flex items-center gap-2'>
											<Input
												placeholder={`Activity ${index + 1}`}
												value={activity}
												onChange={(e) => handleArrayChange(index, e.target.value, 'activities')}
											/>
											{formData.activities.length > 1 && (
												<Button
													type='button'
													variant='ghost'
													size='icon'
													onClick={() => handleRemoveItem(index, 'activities')}>
													<Trash2 className='h-4 w-4 text-red-500' />
												</Button>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Amenities</CardTitle>
								<CardDescription>Select amenities available at this destination</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-wifi'
											checked={formData.amenities.wifi}
											onCheckedChange={(checked) => handleAmenityChange('wifi', checked)}
										/>
										<label
											htmlFor='amenities-wifi'
											className='flex items-center text-sm font-medium leading-none gap-1.5'>
											<Wifi className='h-4 w-4' />
											Wi-Fi
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-airConditioning'
											checked={formData.amenities.airConditioning}
											onCheckedChange={(checked) => handleAmenityChange('airConditioning', checked)}
										/>
										<label htmlFor='amenities-airConditioning' className='text-sm font-medium leading-none'>
											Air Conditioning
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-parking'
											checked={formData.amenities.parking}
											onCheckedChange={(checked) => handleAmenityChange('parking', checked)}
										/>
										<label
											htmlFor='amenities-parking'
											className='flex items-center text-sm font-medium leading-none gap-1.5'>
											<Car className='h-4 w-4' />
											Parking
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-pool'
											checked={formData.amenities.pool}
											onCheckedChange={(checked) => handleAmenityChange('pool', checked)}
										/>
										<label htmlFor='amenities-pool' className='text-sm font-medium leading-none'>
											Swimming Pool
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-spa'
											checked={formData.amenities.spa}
											onCheckedChange={(checked) => handleAmenityChange('spa', checked)}
										/>
										<label htmlFor='amenities-spa' className='text-sm font-medium leading-none'>
											Spa
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-gym'
											checked={formData.amenities.gym}
											onCheckedChange={(checked) => handleAmenityChange('gym', checked)}
										/>
										<label htmlFor='amenities-gym' className='text-sm font-medium leading-none'>
											Gym
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-restaurant'
											checked={formData.amenities.restaurant}
											onCheckedChange={(checked) => handleAmenityChange('restaurant', checked)}
										/>
										<label
											htmlFor='amenities-restaurant'
											className='flex items-center text-sm font-medium leading-none gap-1.5'>
											<Utensils className='h-4 w-4' />
											Restaurant
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-bar'
											checked={formData.amenities.bar}
											onCheckedChange={(checked) => handleAmenityChange('bar', checked)}
										/>
										<label htmlFor='amenities-bar' className='text-sm font-medium leading-none'>
											Bar
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-roomService'
											checked={formData.amenities.roomService}
											onCheckedChange={(checked) => handleAmenityChange('roomService', checked)}
										/>
										<label htmlFor='amenities-roomService' className='text-sm font-medium leading-none'>
											Room Service
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-laundry'
											checked={formData.amenities.laundry}
											onCheckedChange={(checked) => handleAmenityChange('laundry', checked)}
										/>
										<label htmlFor='amenities-laundry' className='text-sm font-medium leading-none'>
											Laundry
										</label>
									</div>

									<div className='flex items-center space-x-2'>
										<Checkbox
											id='amenities-accessibility'
											checked={formData.amenities.accessibility}
											onCheckedChange={(checked) => handleAmenityChange('accessibility', checked)}
										/>
										<label htmlFor='amenities-accessibility' className='text-sm font-medium leading-none'>
											Accessibility Features
										</label>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					{/* Media Tab */}
					<TabsContent value='media' className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Images</CardTitle>
								<CardDescription>Upload up to 4 high-quality images</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='grid grid-cols-2 gap-4 mb-4'>
									{formData.images.map((image, index) => (
										<div
											key={`image-${index}`}
											className='relative aspect-video bg-muted rounded-md overflow-hidden group'>
											<img
												src={image.url || image.preview || '/placeholder.svg'}
												alt={`Preview ${index + 1}`}
												className='w-full h-full object-cover'
											/>
											<button
												type='button'
												onClick={() => handleRemoveImage(index)}
												className='absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'>
												<X className='h-4 w-4' />
											</button>
										</div>
									))}

									{Array.from({ length: 4 - formData.images.length }).map((_, index) => (
										<div
											key={`empty-${index}`}
											className='aspect-video bg-muted rounded-md flex items-center justify-center border-2 border-dashed border-muted-foreground/20'>
											<span className='text-xs text-muted-foreground'>Empty</span>
										</div>
									))}
								</div>

								<div className='mt-4'>
									<Label htmlFor='image-upload' className='block mb-2'>
										Upload Images
									</Label>
									<div className='flex items-center justify-center w-full'>
										<label
											htmlFor='image-upload'
											className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors'>
											<div className='flex flex-col items-center justify-center pt-5 pb-6'>
												<Upload className='w-8 h-8 mb-2 text-muted-foreground' />
												<p className='mb-1 text-sm text-muted-foreground'>
													<span className='font-semibold'>Click to upload</span> or drag and drop
												</p>
												<p className='text-xs text-muted-foreground'>PNG, JPG or WEBP (MAX. 4)</p>
											</div>
											<input
												id='image-upload'
												type='file'
												accept='image/*'
												multiple
												className='hidden'
												onChange={handleImageUpload}
											/>
										</label>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* SEO & Visibility Tab */}
					<TabsContent value='seo' className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Visibility Settings</CardTitle>
								<CardDescription>Control how this destination appears on the website</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='flex items-center justify-between'>
									<div className='space-y-0.5'>
										<Label htmlFor='featured'>Featured Destination</Label>
										<p className='text-sm text-muted-foreground'>Show on homepage featured section</p>
									</div>
									<Switch
										id='featured'
										checked={formData.isFeatured}
										onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
									/>
								</div>

								<Separator />

								<div className='flex items-center justify-between'>
									<div className='space-y-0.5'>
										<Label htmlFor='popular'>Popular Destination</Label>
										<p className='text-sm text-muted-foreground'>Mark as popular for search ranking</p>
									</div>
									<Switch
										id='popular'
										checked={formData.isPopular}
										onCheckedChange={(checked) => handleSwitchChange('isPopular', checked)}
									/>
								</div>

								<Separator />

								<div className='space-y-2'>
									<Label htmlFor='status'>Status</Label>
									<Select value={formData.status} onValueChange={(value) => handleSelectChange(value, 'status')}>
										<SelectTrigger>
											<SelectValue placeholder='Select status' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='draft'>Draft</SelectItem>
											<SelectItem value='active'>Active</SelectItem>
											<SelectItem value='inactive'>Inactive</SelectItem>
										</SelectContent>
									</Select>
									<p className='text-sm text-muted-foreground'>
										Draft: Not visible on the website
										<br />
										Active: Visible and bookable
										<br />
										Inactive: Visible but not bookable
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<div className='mt-6 flex justify-end gap-4'>
					<Button type='button' variant='outline' onClick={() => navigate('/admin/destinations')}>
						Cancel
					</Button>
					<Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
						{isSubmitting ? (
							<div className='flex items-center'>
								<div className='animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full'></div>
								<span>Saving...</span>
							</div>
						) : (
							<span>Update Destination</span>
						)}
					</Button>
				</div>
			</form>

			{/* Delete Image Confirmation Dialog */}
			<AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Image</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this image? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteImage} className='bg-red-500 hover:bg-red-600'>
							{deleteImageMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</motion.div>
	);
};

export default EditDestination;
