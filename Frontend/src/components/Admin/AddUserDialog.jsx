import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AddUserDialog = ({ open, onOpenChange, onAddUser }) => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		role: '',
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');

	// Role options
	const roleOptions = [
		{ value: 'admin', label: 'Admin' },
		{ value: 'customer', label: 'Customer' },
		{ value: 'employee', label: 'Employee' },
		{ value: 'moderator', label: 'Moderator' },
	];

	// Handle input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear error when field is edited
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}
	};

	// Handle role selection
	const handleRoleChange = (value) => {
		setFormData((prev) => ({ ...prev, role: value }));
		if (errors.role) {
			setErrors((prev) => ({ ...prev, role: '' }));
		}
	};

	// Validate email format
	const isValidEmail = (email) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!isValidEmail(formData.email)) {
			newErrors.email = 'Invalid email format';
		}

		if (!formData.phone.trim()) {
			newErrors.phone = 'Phone number is required';
		}

		if (!formData.role) {
			newErrors.role = 'Role is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitError('');

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// In a real app, this would be an API call
			// For now, we'll simulate a delay and success
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Create user object with password same as email
			const newUser = {
				...formData,
				password: formData.email, // Setting password same as email
				id: Date.now(), // Temporary ID
				status: 'active',
				lastLogin: new Date().toISOString(),
				avatar: '/placeholder.svg?height=40&width=40',
			};

			onAddUser(newUser);
			onOpenChange(false);

			// Reset form
			setFormData({
				name: '',
				email: '',
				phone: '',
				role: '',
			});
		} catch (error) {
			console.error('Error adding user:', error);
			setSubmitError('Failed to add user. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Add New User</DialogTitle>
					<DialogDescription>
						Create a new user account. The password will be set to match the email address.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					{submitError && (
						<Alert variant='destructive' className='mb-4'>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>{submitError}</AlertDescription>
						</Alert>
					)}

					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Label htmlFor='name' className='flex items-center justify-between'>
								Full Name
								{errors.name && <span className='text-xs text-red-500'>{errors.name}</span>}
							</Label>
							<Input
								id='name'
								name='name'
								value={formData.name}
								onChange={handleChange}
								className={errors.name ? 'border-red-500' : ''}
							/>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='email' className='flex items-center justify-between'>
								Email Address
								{errors.email && <span className='text-xs text-red-500'>{errors.email}</span>}
							</Label>
							<Input
								id='email'
								name='email'
								type='email'
								value={formData.email}
								onChange={handleChange}
								className={errors.email ? 'border-red-500' : ''}
							/>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='phone' className='flex items-center justify-between'>
								Phone Number
								{errors.phone && <span className='text-xs text-red-500'>{errors.phone}</span>}
							</Label>
							<Input
								id='phone'
								name='phone'
								value={formData.phone}
								onChange={handleChange}
								className={errors.phone ? 'border-red-500' : ''}
							/>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='role' className='flex items-center justify-between'>
								Role
								{errors.role && <span className='text-xs text-red-500'>{errors.role}</span>}
							</Label>
							<Select onValueChange={handleRoleChange} value={formData.role}>
								<SelectTrigger id='role' className={errors.role ? 'border-red-500' : ''}>
									<SelectValue placeholder='Select a role' />
								</SelectTrigger>
								<SelectContent>
									{roleOptions.map((role) => (
										<SelectItem key={role.value} value={role.value}>
											{role.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
							<X className='mr-2 h-4 w-4' />
							Cancel
						</Button>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
									Adding...
								</>
							) : (
								<>
									<Check className='mr-2 h-4 w-4' />
									Add User
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddUserDialog;
