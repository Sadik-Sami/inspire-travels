'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Trash2, Upload } from 'lucide-react';
import { useUpdateCustomer, useUploadCustomerImage, useDeleteCustomerImage } from '@/hooks/useCustomerMutation';
import { toast } from 'sonner';

const EditCustomerDialog = ({ open, onOpenChange, customer, onUpdateCustomer }) => {
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
		passportNumber: '',
		notes: '',
	});
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);

	const updateCustomerMutation = useUpdateCustomer();
	const uploadImageMutation = useUploadCustomerImage();
	const deleteImageMutation = useDeleteCustomerImage();

	// Initialize form data when customer changes
	useEffect(() => {
		if (customer) {
			setFormData({
				name: customer.name || '',
				phone: customer.phone || '',
				email: customer.email || '',
				address: customer.address || '',
				passportNumber: customer.passportNumber || '',
				notes: customer.notes || '',
			});
			setImagePreview(customer.profileImage?.url || null);
			setImageFile(null);
		}
	}, [customer]);

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
			// Validate file type
			if (!file.type.startsWith('image/')) {
				toast.error('Please select an image file');
				return;
			}

			// Validate file size (5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error('Image size should be less than 5MB');
				return;
			}

			setImageFile(file);

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleDeleteImage = async () => {
		if (!customer?.profileImage?.publicId) {
			// Just remove the preview if no image is saved
			setImagePreview(null);
			setImageFile(null);
			return;
		}

		try {
			await deleteImageMutation.mutateAsync(customer._id);
			setImagePreview(null);
			setImageFile(null);
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			// Update customer data
			const result = await updateCustomerMutation.mutateAsync({
				customerId: customer._id,
				customerData: formData,
			});

			// Upload image if a new one was selected
			if (imageFile) {
				await uploadImageMutation.mutateAsync({
					customerId: customer._id,
					imageFile,
				});
			}

			// Close dialog
			onOpenChange(false);

			// Notify parent component
			if (onUpdateCustomer) {
				onUpdateCustomer(result.customer);
			}
		} catch (error) {
			// Errors are handled by the mutations
			console.error('Error updating customer:', error);
		}
	};

	const handleCancel = () => {
		// Reset form to original values
		if (customer) {
			setFormData({
				name: customer.name || '',
				phone: customer.phone || '',
				email: customer.email || '',
				address: customer.address || '',
				passportNumber: customer.passportNumber || '',
				notes: customer.notes || '',
			});
			setImagePreview(customer.profileImage?.url || null);
			setImageFile(null);
		}
		onOpenChange(false);
	};

	const getInitials = (name) => {
		if (!name) return '?';
		return name
			.split(' ')
			.map((part) => part[0])
			.join('')
			.toUpperCase()
			.substring(0, 2);
	};

	const isLoading = updateCustomerMutation.isPending || uploadImageMutation.isPending || deleteImageMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Edit Customer</DialogTitle>
					<DialogDescription>Update customer information and profile image.</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* Profile Image Section */}
					<div className='flex flex-col items-center space-y-4'>
						<div className='relative'>
							<Avatar className='w-24 h-24'>
								<AvatarImage src={imagePreview || '/placeholder.svg?height=96&width=96'} alt={formData.name} />
								<AvatarFallback className='text-lg'>{getInitials(formData.name)}</AvatarFallback>
							</Avatar>

							{/* Camera overlay */}
							<div className='absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer'>
								<Camera className='w-6 h-6 text-white' />
							</div>
						</div>

						<div className='flex gap-2'>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => document.getElementById('image-upload').click()}
								disabled={isLoading}>
								<Upload className='w-4 h-4 mr-2' />
								Upload Image
							</Button>

							{(imagePreview || customer?.profileImage?.url) && (
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={handleDeleteImage}
									disabled={isLoading}
									className='text-red-600 hover:text-red-700 bg-transparent'>
									<Trash2 className='w-4 h-4 mr-2' />
									Remove
								</Button>
							)}
						</div>

						<input id='image-upload' type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
					</div>

					<div className='grid grid-cols-1 gap-4'>
						{/* Name - Required */}
						<div className='space-y-2'>
							<Label htmlFor='name'>
								Full Name <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='name'
								name='name'
								type='text'
								placeholder="Enter customer's full name"
								value={formData.name}
								onChange={handleInputChange}
								required
								maxLength={100}
							/>
						</div>

						{/* Phone - Required */}
						<div className='space-y-2'>
							<Label htmlFor='phone'>
								Phone Number <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='phone'
								name='phone'
								type='tel'
								placeholder='Enter phone number (e.g., +1234567890)'
								value={formData.phone}
								onChange={handleInputChange}
								required
							/>
						</div>

						{/* Email - Optional */}
						<div className='space-y-2'>
							<Label htmlFor='email'>Email Address</Label>
							<Input
								id='email'
								name='email'
								type='email'
								placeholder='Enter email address (optional)'
								value={formData.email}
								onChange={handleInputChange}
							/>
						</div>

						{/* Address - Optional */}
						<div className='space-y-2'>
							<Label htmlFor='address'>Address</Label>
							<Textarea
								id='address'
								name='address'
								placeholder="Enter customer's address (optional)"
								value={formData.address}
								onChange={handleInputChange}
								rows={2}
								maxLength={500}
							/>
						</div>

						{/* Passport Number - Optional */}
						<div className='space-y-2'>
							<Label htmlFor='passportNumber'>Passport Number</Label>
							<Input
								id='passportNumber'
								name='passportNumber'
								type='text'
								placeholder='Enter passport number (optional)'
								value={formData.passportNumber}
								onChange={handleInputChange}
								maxLength={20}
							/>
						</div>

						{/* Notes - Optional */}
						<div className='space-y-2'>
							<Label htmlFor='notes'>Notes</Label>
							<Textarea
								id='notes'
								name='notes'
								placeholder='Add any additional notes about the customer (optional)'
								value={formData.notes}
								onChange={handleInputChange}
								rows={3}
								maxLength={1000}
							/>
						</div>
					</div>

					<DialogFooter className='gap-2'>
						<Button type='button' variant='outline' onClick={handleCancel} disabled={isLoading}>
							Cancel
						</Button>
						<Button type='submit' disabled={isLoading || !formData.name || !formData.phone}>
							{isLoading ? 'Updating...' : 'Update Customer'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditCustomerDialog;
