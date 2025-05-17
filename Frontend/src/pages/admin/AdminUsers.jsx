'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Search,
	Plus,
	Filter,
	ChevronDown,
	MoreHorizontal,
	Trash,
	Mail,
	Phone,
	UserCog,
	ArrowUpDown,
	FileIcon as FileInvoice,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import AddUserDialog from '@/components/Admin/AddUserDialog';
import PaginationControls from '@/components/Destination/PaginationControls';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';

const AdminUsers = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// State for pagination, filtering, and sorting
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [userRole, setUserRole] = useState('all');
	const [sortField, setSortField] = useState('createdAt');
	const [sortDirection, setSortDirection] = useState('desc');

	// State for dialogs
	const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);
	const [userToEdit, setUserToEdit] = useState(null);
	const [selectedRole, setSelectedRole] = useState('');

	// Debounce search to avoid too many API calls
	const debouncedSearch = useDebounce(searchQuery, 500);

	// Fetch users with filtering, sorting, and pagination
	const { data, isLoading, isError } = useQuery({
		queryKey: ['users', page, debouncedSearch, userRole, sortField, sortDirection],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: '10',
				sort: sortField,
				direction: sortDirection,
			});

			if (debouncedSearch) {
				params.append('search', debouncedSearch);
			}

			if (userRole !== 'all') {
				params.append('role', userRole);
			}

			const response = await axiosSecure.get(`/api/users?${params.toString()}`);
			return response.data;
		},
		keepPreviousData: true,
	});

	// Delete user mutation
	const deleteMutation = useMutation({
		mutationFn: async (userId) => {
			const response = await axiosSecure.delete(`/api/users/${userId}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('User deleted successfully');
			setUserToDelete(null);
		},
		onError: (error) => {
			toast.error(`Failed to delete user: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Update user role mutation
	const updateRoleMutation = useMutation({
		mutationFn: async ({ userId, role }) => {
			const response = await axiosSecure.patch(`/api/users/${userId}/role`, { role });
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('User role updated successfully');
			setUserToEdit(null);
		},
		onError: (error) => {
			toast.error(`Failed to update user role: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Handle adding a new user
	const handleAddUser = (newUser) => {
		queryClient.invalidateQueries({ queryKey: ['users'] });
		toast.success('User added successfully');
	};

	// Handle deleting a user
	const handleDeleteUser = () => {
		if (userToDelete) {
			deleteMutation.mutate(userToDelete._id);
		}
	};

	// Handle updating user role
	const handleUpdateRole = () => {
		if (userToEdit && selectedRole) {
			updateRoleMutation.mutate({
				userId: userToEdit._id,
				role: selectedRole,
			});
		}
	};

	// Handle creating invoice for a user
	const handleCreateInvoice = (user) => {
		navigate('/admin/invoices/new', {
			state: {
				customer: {
					name: user.name,
					email: user.email,
					phone: user.phone,
				},
			},
		});
	};

	// Handle sorting
	const handleSort = (field) => {
		if (sortField === field) {
			// Toggle direction if clicking the same field
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			// Set new field and default to ascending
			setSortField(field);
			setSortDirection('asc');
		}
		// Reset to first page when sorting changes
		setPage(1);
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPage(newPage);
		// Scroll to top of the page
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Get role badge variant
	const getRoleBadge = (role) => {
		switch (role) {
			case 'admin':
				return <Badge variant='default'>{role}</Badge>;
			case 'moderator':
				return <Badge variant='secondary'>{role}</Badge>;
			case 'employee':
				return (
					<Badge variant='outline' className='bg-blue-100'>
						{role}
					</Badge>
				);
			default:
				return <Badge variant='outline'>{role}</Badge>;
		}
	};

	// Get initials for avatar fallback
	const getInitials = (name) => {
		if (!name) return '?';
		return name
			.split(' ')
			.map((part) => part[0])
			.join('')
			.toUpperCase()
			.substring(0, 2);
	};

	// Get sort icon
	const getSortIcon = (field) => {
		if (sortField !== field) return null;

		return sortDirection === 'asc' ? (
			<ArrowUpDown className='h-4 w-4 ml-1 rotate-180' />
		) : (
			<ArrowUpDown className='h-4 w-4 ml-1' />
		);
	};

	// Extract users array and pagination data safely
	const users = data?.users || [];
	const pagination = data?.pagination || { totalPages: 1, currentPage: 1, total: 0 };

	return (
		<div>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
				<h1 className='text-3xl font-bold'>Users Management</h1>

				<div className='flex flex-col sm:flex-row gap-4'>
					<div className='relative'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							type='search'
							placeholder='Search users...'
							className='pl-8 w-full sm:w-[250px]'
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setPage(1); // Reset to first page on search
							}}
						/>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='outline' className='flex items-center gap-2'>
								<Filter className='h-4 w-4' />
								Role: {userRole === 'all' ? 'All' : userRole}
								<ChevronDown className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem
								onClick={() => {
									setUserRole('all');
									setPage(1); // Reset to first page on filter change
								}}>
								All Roles
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									setUserRole('admin');
									setPage(1);
								}}>
								Admin
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									setUserRole('customer');
									setPage(1);
								}}>
								Customer
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									setUserRole('employee');
									setPage(1);
								}}>
								Employee
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									setUserRole('moderator');
									setPage(1);
								}}>
								Moderator
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button className='flex items-center gap-2' onClick={() => setIsAddUserDialogOpen(true)}>
						<Plus className='h-4 w-4' />
						Add User
					</Button>
				</div>
			</div>

			{/* Add User Dialog */}
			<AddUserDialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen} onAddUser={handleAddUser} />

			<Card>
				<CardHeader className='pb-2'>
					<CardTitle>Users</CardTitle>
					<CardDescription>
						Manage your users and their permissions.
						{!isLoading && (
							<span className='ml-2 text-sm'>
								Showing {users.length} of {pagination.total} users
							</span>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className='flex justify-center py-8'>
							<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
						</div>
					) : isError ? (
						<div className='text-center py-8 text-red-500'>Error loading users. Please try again.</div>
					) : users.length === 0 ? (
						<div className='text-center py-8 text-muted-foreground'>No users found. Try adjusting your search.</div>
					) : (
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											<Button
												variant='ghost'
												className='p-0 font-bold flex items-center'
												onClick={() => handleSort('name')}>
												User {getSortIcon('name')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='ghost'
												className='p-0 font-bold flex items-center'
												onClick={() => handleSort('email')}>
												Contact {getSortIcon('email')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='ghost'
												className='p-0 font-bold flex items-center'
												onClick={() => handleSort('role')}>
												Role {getSortIcon('role')}
											</Button>
										</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{users.map((user) => (
										<TableRow key={user._id}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<Avatar>
														<AvatarImage
															src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
																user.name
															)}&background=random`}
															alt={user.name}
														/>
														<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
													</Avatar>
													<div>
														<div className='font-medium'>{user.name}</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<Mail className='h-3 w-3 text-muted-foreground' />
														<span className='text-sm'>{user.email}</span>
													</div>
													<div className='flex items-center gap-1'>
														<Phone className='h-3 w-3 text-muted-foreground' />
														<span className='text-sm'>{user.phone}</span>
													</div>
												</div>
											</TableCell>
											<TableCell>{getRoleBadge(user.role)}</TableCell>
											<TableCell className='text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='icon'>
															<MoreHorizontal className='h-4 w-4' />
															<span className='sr-only'>Actions</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => {
																setUserToEdit(user);
																setSelectedRole(user.role);
															}}>
															<UserCog className='h-4 w-4' />
															Change Role
														</DropdownMenuItem>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleCreateInvoice(user)}>
															<FileInvoice className='h-4 w-4' />
															Create Invoice
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className='flex items-center gap-2 text-red-500 focus:text-red-500'
															onClick={() => setUserToDelete(user)}>
															<Trash className='h-4 w-4' />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}

					{/* Pagination */}
					{!isLoading && users.length > 0 && (
						<div className='mt-4'>
							<PaginationControls
								currentPage={page}
								totalPages={pagination.totalPages}
								onPageChange={handlePageChange}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Delete User Confirmation Dialog */}
			<AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the user account
							{userToDelete?.name ? ` for ${userToDelete.name}` : ''}.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteUser} className='bg-red-500 hover:bg-red-600'>
							{deleteMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Edit User Role Dialog */}
			<Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change User Role</DialogTitle>
						<DialogDescription>
							Update the role for {userToEdit?.name}. This will change their permissions in the system.
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4 py-4'>
						<div className='space-y-2'>
							<Label htmlFor='role'>Role</Label>
							<Select value={selectedRole} onValueChange={setSelectedRole}>
								<SelectTrigger>
									<SelectValue placeholder='Select a role' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='customer'>Customer</SelectItem>
									<SelectItem value='employee'>Employee</SelectItem>
									<SelectItem value='moderator'>Moderator</SelectItem>
									<SelectItem value='admin'>Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={() => setUserToEdit(null)}>
							Cancel
						</Button>
						<Button
							onClick={handleUpdateRole}
							disabled={updateRoleMutation.isPending || selectedRole === userToEdit?.role}>
							{updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AdminUsers;
