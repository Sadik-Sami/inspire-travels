import { useState } from 'react';
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
import { useCreateCustomer } from '@/hooks/useCustomerMutation';

const AddCustomerDialog = ({ open, onOpenChange, onAddCustomer }) => {
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		email: '',
		address: '',
		passportNumber: '',
		notes: '',
	});

	const createCustomerMutation = useCreateCustomer();

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const result = await createCustomerMutation.mutateAsync(formData);

			// Reset form
			setFormData({
				name: '',
				phone: '',
				email: '',
				address: '',
				passportNumber: '',
				notes: '',
			});

			// Close dialog
			onOpenChange(false);

			// Notify parent component
			if (onAddCustomer) {
				onAddCustomer(result.customer);
			}
		} catch (error) {
			// Error is handled by the mutation
			console.error('Error creating customer:', error);
		}
	};

	const handleCancel = () => {
		// Reset form
		setFormData({
			name: '',
			phone: '',
			email: '',
			address: '',
			passportNumber: '',
			notes: '',
		});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Add New Customer</DialogTitle>
					<DialogDescription>Create a new customer record. Only name and phone number are required.</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
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
						<Button type='button' variant='outline' onClick={handleCancel} disabled={createCustomerMutation.isPending}>
							Cancel
						</Button>
						<Button type='submit' disabled={createCustomerMutation.isPending || !formData.name || !formData.phone}>
							{createCustomerMutation.isPending ? 'Creating...' : 'Create Customer'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddCustomerDialog;
