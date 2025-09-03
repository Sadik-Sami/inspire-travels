'use client';

import React, { useState, useRef } from 'react';
import {
	FileText,
	Upload,
	Save,
	Eye,
	EyeOff,
	Users,
	MapPin,
	Calendar,
	Star,
	Heart,
	Trash2,
	Plus,
	ImageIcon,
	AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAboutAdminQuery } from '@/hooks/useAboutQuery';
import { useAboutMutation } from '@/hooks/useAboutMutation';

const AdminAbout = () => {
	const { data: aboutData, isLoading, error } = useAboutAdminQuery();
	const { createAbout, updateAbout, deleteAbout } = useAboutMutation();

	const [formData, setFormData] = useState({
		title: '',
		content: '',
		happyTravelers: '',
		destinations: '',
		yearsOfExperience: '',
		averageRating: '',
		satisfiedCustomers: '',
		isActive: true,
	});

	const [selectedImage, setSelectedImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const fileInputRef = useRef(null);

	// Initialize form data when about data is loaded
	React.useEffect(() => {
		if (aboutData) {
			setFormData({
				title: aboutData.title || '',
				content: aboutData.content || '',
				happyTravelers: aboutData.happyTravelers?.toString() || '',
				destinations: aboutData.destinations?.toString() || '',
				yearsOfExperience: aboutData.yearsOfExperience?.toString() || '',
				averageRating: aboutData.averageRating?.toString() || '',
				satisfiedCustomers: aboutData.satisfiedCustomers?.toString() || '',
				isActive: aboutData.isActive ?? true,
			});
			setImagePreview(aboutData.image?.url || null);
			setIsEditing(true);
		}
	}, [aboutData]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const submitFormData = new FormData();
		Object.keys(formData).forEach((key) => {
			submitFormData.append(key, formData[key]);
		});

		if (selectedImage) {
			submitFormData.append('image', selectedImage);
		}

		try {
			if (isEditing && aboutData) {
				await updateAbout.mutateAsync({ id: aboutData._id, formData: submitFormData });
			} else {
				await createAbout.mutateAsync(submitFormData);
			}
		} catch (error) {
			console.error('Error submitting form:', error);
		}
	};

	const handleDelete = async () => {
		if (
			aboutData &&
			window.confirm('Are you sure you want to delete the about page content? This action cannot be undone.')
		) {
			try {
				await deleteAbout.mutateAsync(aboutData._id);
				setFormData({
					title: '',
					content: '',
					happyTravelers: '',
					destinations: '',
					yearsOfExperience: '',
					averageRating: '',
					satisfiedCustomers: '',
					isActive: true,
				});
				setImagePreview(null);
				setSelectedImage(null);
				setIsEditing(false);
			} catch (error) {
				console.error('Error deleting about content:', error);
			}
		}
	};

	const stats = [
		{
			label: 'Happy Travelers',
			value: formData.happyTravelers,
			icon: Users,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
		},
		{
			label: 'Destinations',
			value: formData.destinations,
			icon: MapPin,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
		},
		{
			label: 'Years Experience',
			value: formData.yearsOfExperience,
			icon: Calendar,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
		},
		{
			label: 'Average Rating',
			value: formData.averageRating,
			icon: Star,
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50',
		},
		{
			label: 'Satisfied Customers',
			value: formData.satisfiedCustomers,
			icon: Heart,
			color: 'text-red-600',
			bgColor: 'bg-red-50',
		},
	];

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>About Page Editor</h1>
					<p className='text-muted-foreground mt-1'>Manage your about page content and company statistics</p>
				</div>
				<div className='flex items-center gap-2'>
					{aboutData && (
						<Badge variant={aboutData.isActive ? 'default' : 'secondary'}>
							{aboutData.isActive ? 'Active' : 'Inactive'}
						</Badge>
					)}
					{isEditing ? (
						<Badge variant='outline'>
							<FileText className='w-3 h-3 mr-1' />
							Editing
						</Badge>
					) : (
						<Badge variant='outline'>
							<Plus className='w-3 h-3 mr-1' />
							Creating
						</Badge>
					)}
				</div>
			</div>

			{error && (
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error.message || 'Failed to load about page content'}</AlertDescription>
				</Alert>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Main Form */}
				<div className='lg:col-span-2 space-y-6'>
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<FileText className='w-5 h-5' />
								Content Information
							</CardTitle>
							<CardDescription>Update your about page title and main content</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<form onSubmit={handleSubmit} className='space-y-4'>
								<div className='space-y-2'>
									<Label htmlFor='title'>Page Title</Label>
									<Input
										id='title'
										name='title'
										value={formData.title}
										onChange={handleInputChange}
										placeholder='Enter about page title'
										maxLength={200}
										required
									/>
									<p className='text-xs text-muted-foreground'>{formData.title.length}/200 characters</p>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='content'>Content</Label>
									<Textarea
										id='content'
										name='content'
										value={formData.content}
										onChange={handleInputChange}
										placeholder='Enter about page content'
										rows={8}
										maxLength={5000}
										required
									/>
									<p className='text-xs text-muted-foreground'>{formData.content.length}/5000 characters</p>
								</div>

								<div className='flex items-center space-x-2'>
									<Switch
										id='isActive'
										checked={formData.isActive}
										onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
									/>
									<Label htmlFor='isActive' className='flex items-center gap-2'>
										{formData.isActive ? <Eye className='w-4 h-4' /> : <EyeOff className='w-4 h-4' />}
										{formData.isActive ? 'Published' : 'Draft'}
									</Label>
								</div>
							</form>
						</CardContent>
					</Card>

					{/* Statistics */}
					<Card>
						<CardHeader>
							<CardTitle>Company Statistics</CardTitle>
							<CardDescription>Update your company's key performance metrics</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='happyTravelers'>Happy Travelers</Label>
									<Input
										id='happyTravelers'
										name='happyTravelers'
										type='number'
										value={formData.happyTravelers}
										onChange={handleInputChange}
										placeholder='0'
										min='0'
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='destinations'>Number of Destinations</Label>
									<Input
										id='destinations'
										name='destinations'
										type='number'
										value={formData.destinations}
										onChange={handleInputChange}
										placeholder='0'
										min='0'
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='yearsOfExperience'>Years of Experience</Label>
									<Input
										id='yearsOfExperience'
										name='yearsOfExperience'
										type='number'
										value={formData.yearsOfExperience}
										onChange={handleInputChange}
										placeholder='0'
										min='0'
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='averageRating'>Average Rating</Label>
									<Input
										id='averageRating'
										name='averageRating'
										type='number'
										step='0.1'
										value={formData.averageRating}
										onChange={handleInputChange}
										placeholder='0.0'
										min='0'
										max='5'
									/>
								</div>

								<div className='space-y-2 md:col-span-2'>
									<Label htmlFor='satisfiedCustomers'>Satisfied Customers</Label>
									<Input
										id='satisfiedCustomers'
										name='satisfiedCustomers'
										type='number'
										value={formData.satisfiedCustomers}
										onChange={handleInputChange}
										placeholder='0'
										min='0'
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className='space-y-6'>
					{/* Image Upload */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<ImageIcon className='w-5 h-5' />
								Hero Image
							</CardTitle>
							<CardDescription>Upload a hero image for the about page</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-4'>
								{imagePreview && (
									<div className='relative'>
										<img
											src={imagePreview || '/placeholder.svg'}
											alt='Preview'
											className='w-full h-48 object-cover rounded-lg border'
										/>
									</div>
								)}

								<div className='flex flex-col gap-2'>
									<input
										ref={fileInputRef}
										type='file'
										accept='image/*'
										onChange={handleImageChange}
										className='hidden'
									/>
									<Button
										type='button'
										variant='outline'
										onClick={() => fileInputRef.current?.click()}
										className='w-full'>
										<Upload className='w-4 h-4 mr-2' />
										{imagePreview ? 'Change Image' : 'Upload Image'}
									</Button>
									{!isEditing && (
										<p className='text-xs text-muted-foreground text-center'>Image is required for new about page</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Statistics Preview */}
					<Card>
						<CardHeader>
							<CardTitle>Statistics Preview</CardTitle>
							<CardDescription>Preview of your company statistics</CardDescription>
						</CardHeader>
						<CardContent className='space-y-3'>
							{stats.map((stat, index) => {
								const IconComponent = stat.icon;
								return (
									<div key={index} className='flex items-center gap-3 p-3 rounded-lg border'>
										<div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
											<IconComponent className={`w-5 h-5 ${stat.color}`} />
										</div>
										<div className='flex-1'>
											<p className='text-sm font-medium text-foreground'>{stat.value || '0'}</p>
											<p className='text-xs text-muted-foreground'>{stat.label}</p>
										</div>
									</div>
								);
							})}
						</CardContent>
					</Card>

					{/* Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Actions</CardTitle>
						</CardHeader>
						<CardContent className='space-y-3'>
							<Button
								onClick={handleSubmit}
								className='w-full'
								disabled={createAbout.isPending || updateAbout.isPending}>
								<Save className='w-4 h-4 mr-2' />
								{createAbout.isPending || updateAbout.isPending
									? 'Saving...'
									: isEditing
									? 'Update About Page'
									: 'Create About Page'}
							</Button>

							{isEditing && aboutData && (
								<Button
									variant='destructive'
									onClick={handleDelete}
									className='w-full'
									disabled={deleteAbout.isPending}>
									<Trash2 className='w-4 h-4 mr-2' />
									{deleteAbout.isPending ? 'Deleting...' : 'Delete About Page'}
								</Button>
							)}
						</CardContent>
					</Card>

					{/* Meta Information */}
					{aboutData && (
						<Card>
							<CardHeader>
								<CardTitle>Page Information</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3 text-sm'>
								<div>
									<p className='text-muted-foreground'>Created by</p>
									<p className='font-medium'>{aboutData.createdBy?.name || 'Unknown'}</p>
								</div>
								<Separator />
								<div>
									<p className='text-muted-foreground'>Created at</p>
									<p className='font-medium'>{new Date(aboutData.createdAt).toLocaleDateString()}</p>
								</div>
								{aboutData.updatedBy && (
									<>
										<Separator />
										<div>
											<p className='text-muted-foreground'>Last updated by</p>
											<p className='font-medium'>{aboutData.updatedBy?.name || 'Unknown'}</p>
										</div>
										<div>
											<p className='text-muted-foreground'>Updated at</p>
											<p className='font-medium'>{new Date(aboutData.updatedAt).toLocaleDateString()}</p>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminAbout;
