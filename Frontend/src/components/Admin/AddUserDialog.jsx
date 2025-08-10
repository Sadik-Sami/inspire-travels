import { useState } from 'react';
import { X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { useMutation } from '@tanstack/react-query';

const AddUserDialog = ({ open, onOpenChange, onAddUser, userType = 'customer' }) => {
	const axiosSecure = useAxiosSecure();

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		phone: '',
		address: '',
		passportNumber: '',
		role: userType === 'staff' ? 'employee' : 'customer',
	});

	const [errors, setErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);

	// Create user mutation
	const createUserMutation = useMutation({
		mutationFn: async (userData) => {
			const response = await axiosSecure.post('/api/users/create-user', userData);
			return response.data;
		},
		onSuccess: (data) => {
			onAddUser(data.user);
			onOpenChange(false);
			resetForm();
		},
		onError: (error) => {
			console.error('Error creating user:', error);
		},
	});

	// Reset form
	const resetForm = () => {
		setFormData({
			name: '',
			email: '',
			password: '',
			phone: '',
			address: '',
			passportNumber: '',
			role: userType === 'staff' ? 'employee' : 'customer',
		});
		setErrors({});
		setShowPassword(false);
	};

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

	// Validate phone format (basic validation)
	const isValidPhone = (phone) => {
		return /^[+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-$$$$]/g, ''));
	};

	// Validate password strength
	const isValidPassword = (password) => {
		return password.length >= 6;
	};

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		// Required fields
		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!isValidEmail(formData.email)) {
			newErrors.email = 'Invalid email format';
		}

		if (!formData.password.trim()) {
			newErrors.password = 'Password is required';
		} else if (!isValidPassword(formData.password)) {
			newErrors.password = 'Password must be at least 6 characters long';
		}

		if (!formData.phone.trim()) {
			newErrors.phone = 'Phone number is required';
		} else if (!isValidPhone(formData.phone)) {
			newErrors.phone = 'Invalid phone number format';
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

		if (!validateForm()) {
			return;
		}

		createUserMutation.mutate(formData);
	};

	// Handle dialog close
	const handleClose = () => {
		if (!createUserMutation.isPending) {
			resetForm();
			onOpenChange(false);
		}
	};

	// Get role options based on user type
	const getRoleOptions = () => {
		if (userType === 'staff') {
			return [
				{ value: 'employee', label: 'Employee' },
				{ value: 'moderator', label: 'Moderator' },
				{ value: 'admin', label: 'Admin' },
			];
		}
		return [{ value: 'customer', label: 'Customer' }];
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Add New {userType === 'staff' ? 'Staff Member' : 'Customer'}</DialogTitle>
					<DialogDescription>
						Create a new {userType === 'staff' ? 'staff' : 'customer'} account. The user will be able to login using the
						provided email and password.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit}>
					{createUserMutation.error && (
						<Alert variant='destructive' className='mb-4'>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>
								{createUserMutation.error.response?.data?.message || 'Failed to create user. Please try again.'}
							</AlertDescription>
						</Alert>
					)}

					<div className='grid gap-4 py-4'>
						{/* Required Fields */}
						<div className='grid gap-2'>
							<Label htmlFor='name' className='flex items-center justify-between'>
								Full Name <span className='text-red-500'>*</span>
								{errors.name && <span className='text-xs text-red-500'>{errors.name}</span>}
							</Label>
							<Input
								id='name'
								name='name'
								value={formData.name}
								onChange={handleChange}
								className={errors.name ? 'border-red-500' : ''}
								placeholder='Enter full name'
							/>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='email' className='flex items-center justify-between'>
								Email Address <span className='text-red-500'>*</span>
								{errors.email && <span className='text-xs text-red-500'>{errors.email}</span>}
							</Label>
							<Input
								id='email'
								name='email'
								type='email'
								value={formData.email}
								onChange={handleChange}
								className={errors.email ? 'border-red-500' : ''}
								placeholder='Enter email address'
							/>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='password' className='flex items-center justify-between'>
								Password <span className='text-red-500'>*</span>
								{errors.password && <span className='text-xs text-red-500'>{errors.password}</span>}
							</Label>
							<div className='relative'>
								<Input
									id='password'
									name='password'
									type={showPassword ? 'text' : 'password'}
									value={formData.password}
									onChange={handleChange}
									className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
									placeholder='Enter password (min. 6 characters)'
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
									onClick={() => setShowPassword(!showPassword)}>
									{showPassword ? (
										<EyeOff className='h-4 w-4 text-gray-400' />
									) : (
										<Eye className='h-4 w-4 text-gray-400' />
									)}
								</Button>
							</div>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='phone' className='flex items-center justify-between'>
								Phone Number <span className='text-red-500'>*</span>
								{errors.phone && <span className='text-xs text-red-500'>{errors.phone}</span>}
							</Label>
							<Input
								id='phone'
								name='phone'
								value={formData.phone}
								onChange={handleChange}
								className={errors.phone ? 'border-red-500' : ''}
								placeholder='Enter phone number'
							/>
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='role' className='flex items-center justify-between'>
								Role <span className='text-red-500'>*</span>
								{errors.role && <span className='text-xs text-red-500'>{errors.role}</span>}
							</Label>
							<Select onValueChange={handleRoleChange} value={formData.role}>
								<SelectTrigger id='role' className={errors.role ? 'border-red-500' : ''}>
									<SelectValue placeholder='Select a role' />
								</SelectTrigger>
								<SelectContent>
									{getRoleOptions().map((role) => (
										<SelectItem key={role.value} value={role.value}>
											{role.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Optional Fields */}
						<div className='border-t pt-4'>
							<h4 className='text-sm font-medium text-gray-700 mb-3'>Optional Information</h4>

							<div className='grid gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='address'>Address</Label>
									<Textarea
										id='address'
										name='address'
										value={formData.address}
										onChange={handleChange}
										placeholder='Enter address (optional)'
										rows={2}
									/>
								</div>

								<div className='grid gap-2'>
									<Label htmlFor='passportNumber'>Passport Number</Label>
									<Input
										id='passportNumber'
										name='passportNumber'
										value={formData.passportNumber}
										onChange={handleChange}
										placeholder='Enter passport number (optional)'
									/>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button type='button' variant='outline' onClick={handleClose} disabled={createUserMutation.isPending}>
							<X className='mr-2 h-4 w-4' />
							Cancel
						</Button>
						<Button type='submit' disabled={createUserMutation.isPending}>
							{createUserMutation.isPending ? (
								<>
									<div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
									Creating...
								</>
							) : (
								<>
									<Check className='mr-2 h-4 w-4' />
									Create {userType === 'staff' ? 'Staff' : 'User'}
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
