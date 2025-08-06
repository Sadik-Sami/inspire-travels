import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, MapPin, StampIcon as Passport, Upload, Check, AlertCircle, Trash2 } from 'lucide-react';

const Profile = () => {
	const { user, updateUserProfile, uploadProfileImage, deleteProfileImage } = useAuth();

	// Form state
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		address: '',
		passportNumber: '',
	});

	// UI state
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
	const [selectedImage, setSelectedImage] = useState(null);
	const [imagePreview, setImagePreview] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

	// Initialize form data with user data
	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name || '',
				phone: user.phone || '',
				address: user.address || '',
				passportNumber: user.passportNumber || '',
			});
		}
	}, [user]);

	// Handle input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle profile update
	const handleProfileUpdate = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setUpdateStatus({ type: '', message: '' });

		try {
			const result = await updateUserProfile(formData);

			if (result.success) {
				setUpdateStatus({
					type: 'success',
					message: 'Profile updated successfully!',
				});
			} else {
				setUpdateStatus({
					type: 'error',
					message: result.error || 'Failed to update profile. Please try again.',
				});
			}
		} catch (error) {
			setUpdateStatus({
				type: 'error',
				message: 'An unexpected error occurred. Please try again.',
			});
			console.error('Profile update error:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle image selection
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file size (5MB limit)
			if (file.size > 5 * 1024 * 1024) {
				setUploadStatus({
					type: 'error',
					message: 'File size must be less than 5MB',
				});
				return;
			}

			// Validate file type
			if (!file.type.startsWith('image/')) {
				setUploadStatus({
					type: 'error',
					message: 'Please select a valid image file',
				});
				return;
			}

			setSelectedImage(file);
			setImagePreview(URL.createObjectURL(file));
			setUploadStatus({ type: '', message: '' });
		}
	};

	// Handle image upload
	const handleImageUpload = async () => {
		if (!selectedImage) return;

		setIsUploading(true);
		setUploadStatus({ type: '', message: '' });

		try {
			const result = await uploadProfileImage(selectedImage);

			if (result.success) {
				setUploadStatus({
					type: 'success',
					message: 'Profile image updated successfully!',
				});
				// Clear the selected image and preview
				setSelectedImage(null);
				setImagePreview('');
			} else {
				setUploadStatus({
					type: 'error',
					message: result.error || 'Failed to update profile image. Please try again.',
				});
			}
		} catch (error) {
			setUploadStatus({
				type: 'error',
				message: 'An unexpected error occurred. Please try again.',
			});
			console.error('Image upload error:', error);
		} finally {
			setIsUploading(false);
		}
	};

	// Handle image deletion
	const handleImageDelete = async () => {
		setIsDeleting(true);
		setUploadStatus({ type: '', message: '' });

		try {
			const result = await deleteProfileImage();

			if (result.success) {
				setUploadStatus({
					type: 'success',
					message: 'Profile image deleted successfully!',
				});
				// Clear any selected image and preview
				setSelectedImage(null);
				setImagePreview('');
			} else {
				setUploadStatus({
					type: 'error',
					message: result.error || 'Failed to delete profile image. Please try again.',
				});
			}
		} catch (error) {
			setUploadStatus({
				type: 'error',
				message: 'An unexpected error occurred. Please try again.',
			});
			console.error('Image deletion error:', error);
		} finally {
			setIsDeleting(false);
		}
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.5,
				when: 'beforeChildren',
				staggerChildren: 0.1,
			},
		},
	};

	if (!user) {
		return (
			<div className='min-h-screen flex items-center justify-center p-4'>
				<div className='text-center'>
					<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
					<p className='text-lg'>Loading profile...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8'>
			<motion.div className='max-w-4xl mx-auto' variants={containerVariants} initial='hidden' animate='visible'>
				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold'>My Profile</h1>
					<p className='text-muted-foreground mt-2'>Manage your account information and preferences</p>
				</div>

				<Tabs defaultValue='personal' className='w-full'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='personal'>Personal Information</TabsTrigger>
						<TabsTrigger value='photo'>Profile Photo</TabsTrigger>
					</TabsList>

					<TabsContent value='personal'>
						<Card>
							<CardHeader>
								<CardTitle>Personal Information</CardTitle>
								<CardDescription>Update your personal details and contact information</CardDescription>
							</CardHeader>
							<CardContent>
								{updateStatus.message && (
									<Alert
										variant={updateStatus.type === 'error' ? 'destructive' : 'default'}
										className={`mb-6 ${
											updateStatus.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : ''
										}`}>
										{updateStatus.type === 'success' ? (
											<Check className='h-4 w-4 mr-2' />
										) : (
											<AlertCircle className='h-4 w-4 mr-2' />
										)}
										<AlertDescription>{updateStatus.message}</AlertDescription>
									</Alert>
								)}

								<form onSubmit={handleProfileUpdate} className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='name' className='flex items-center'>
											<User className='h-4 w-4 mr-2' />
											Full Name
										</Label>
										<Input
											id='name'
											name='name'
											value={formData.name}
											onChange={handleChange}
											placeholder='Your full name'
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='phone' className='flex items-center'>
											<Phone className='h-4 w-4 mr-2' />
											Phone Number
										</Label>
										<Input
											id='phone'
											name='phone'
											value={formData.phone}
											onChange={handleChange}
											placeholder='Your phone number'
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='address' className='flex items-center'>
											<MapPin className='h-4 w-4 mr-2' />
											Address
										</Label>
										<Input
											id='address'
											name='address'
											value={formData.address}
											onChange={handleChange}
											placeholder='Your address'
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='passportNumber' className='flex items-center'>
											<Passport className='h-4 w-4 mr-2' />
											Passport Number (Optional)
										</Label>
										<Input
											id='passportNumber'
											name='passportNumber'
											value={formData.passportNumber}
											onChange={handleChange}
											placeholder='Your passport number'
										/>
									</div>

									<Button type='submit' className='w-full' disabled={isSubmitting}>
										{isSubmitting ? (
											<div className='flex items-center'>
												<div className='animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full'></div>
												Updating...
											</div>
										) : (
											'Update Profile'
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='photo'>
						<Card>
							<CardHeader>
								<CardTitle>Profile Photo</CardTitle>
								<CardDescription>Upload or update your profile picture (Max 5MB)</CardDescription>
							</CardHeader>
							<CardContent>
								{uploadStatus.message && (
									<Alert
										variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}
										className={`mb-6 ${
											uploadStatus.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : ''
										}`}>
										{uploadStatus.type === 'success' ? (
											<Check className='h-4 w-4 mr-2' />
										) : (
											<AlertCircle className='h-4 w-4 mr-2' />
										)}
										<AlertDescription>{uploadStatus.message}</AlertDescription>
									</Alert>
								)}

								<div className='flex flex-col items-center space-y-6'>
									<Avatar className='h-32 w-32'>
										<AvatarImage src={imagePreview || user.profileImage?.url} alt={user.name} />
										<AvatarFallback className='text-2xl'>{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
									</Avatar>

									<div className='flex flex-col items-center space-y-4 w-full'>
										<Label
											htmlFor='profile-image'
											className='cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors'>
											<Upload className='h-4 w-4 mr-2' />
											Choose New Image
										</Label>
										<Input
											id='profile-image'
											type='file'
											accept='image/*'
											onChange={handleImageChange}
											className='hidden'
										/>

										<div className='flex gap-2 w-full'>
											{selectedImage && (
												<Button onClick={handleImageUpload} className='flex-1' disabled={isUploading}>
													{isUploading ? (
														<div className='flex items-center'>
															<div className='animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full'></div>
															Uploading...
														</div>
													) : (
														'Upload Image'
													)}
												</Button>
											)}

											{user.profileImage?.url && (
												<Button
													onClick={handleImageDelete}
													variant='destructive'
													className='flex-1'
													disabled={isDeleting}>
													{isDeleting ? (
														<div className='flex items-center'>
															<div className='animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full'></div>
															Deleting...
														</div>
													) : (
														<>
															<Trash2 className='h-4 w-4 mr-2' />
															Delete Image
														</>
													)}
												</Button>
											)}
										</div>

										<p className='text-sm text-muted-foreground text-center'>
											Supported formats: JPG, PNG, GIF. Maximum file size: 5MB.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</motion.div>
		</div>
	);
};

export default Profile;
