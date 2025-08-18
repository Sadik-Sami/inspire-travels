import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Trash, Mail, Phone, ArrowUpDown, FileIcon as FileInvoice } from 'lucide-react';
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
import AddUserDialog from '@/components/admin/AddUserDialog';
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
	const [sortField, setSortField] = useState('createdAt');
	const [sortDirection, setSortDirection] = useState('desc');

	// State for dialogs
	const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);

	// Debounce search to avoid too many API calls
	const debouncedSearch = useDebounce(searchQuery, 500);

	// Fetch users with filtering, sorting, and pagination (only customers)
	const { data, isLoading, isError } = useQuery({
		queryKey: ['users', page, debouncedSearch, sortField, sortDirection],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: '10',
				sort: sortField,
				direction: sortDirection,
				role: 'customer', // Only fetch customers
			});

			if (debouncedSearch) {
				params.append('search', debouncedSearch);
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

	// Handle adding a new user
	const handleAddUser = (newUser) => {
		queryClient.invalidateQueries({ queryKey: ['users'] });
		toast.success('Customer created successfully! They can now login with their credentials.');
	};

	// Handle deleting a user
	const handleDeleteUser = () => {
		if (userToDelete) {
			deleteMutation.mutate(userToDelete._id);
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
					address: user.address,
					passportNumber: user.passportNumber,
				},
			},
		});
	};

	// Handle sorting
	const handleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
		setPage(1);
	};

	// Handle page change
	const handlePageChange = (newPage) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: 'smooth' });
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
				<h1 className='text-3xl font-bold'>Customer Management</h1>

				<div className='flex flex-col sm:flex-row gap-4'>
					<div className='relative'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							type='search'
							placeholder='Search customers...'
							className='pl-8 w-full sm:w-[250px]'
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setPage(1);
							}}
						/>
					</div>

					<Button variant='default' className='flex items-center gap-2' onClick={() => setIsAddUserDialogOpen(true)}>
						<Plus className='h-4 w-4' />
						Add Customer
					</Button>
				</div>
			</div>

			{/* Add User Dialog */}
			<AddUserDialog
				open={isAddUserDialogOpen}
				onOpenChange={setIsAddUserDialogOpen}
				onAddUser={handleAddUser}
				userType='customer'
			/>

			<Card>
				<CardHeader className='pb-2'>
					<CardTitle>Customers</CardTitle>
					<CardDescription>
						Manage your customers and their information.
						{!isLoading && (
							<span className='ml-2 text-sm'>
								Showing {users.length} of {pagination.total} customers
							</span>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className='flex justify-center items-center py-8'>
							<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
						</div>
					) : isError ? (
						<div className='text-center py-8 text-red-500'>Error loading customers. Please try again.</div>
					) : users.length === 0 ? (
						<div className='text-center py-8 text-muted-foreground'>No customers found. Try adjusting your search.</div>
					) : (
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader className='h-20'>
									<TableRow>
										<TableHead>
											<Button
												variant='outline'
												className='p-2 font-bold flex items-center rounded'
												onClick={() => handleSort('name')}>
												Customer {getSortIcon('name')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='outline'
												className='p-2 font-bold flex items-center rounded'
												onClick={() => handleSort('email')}>
												Contact {getSortIcon('email')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='outline'
												className='p-2 font-bold flex items-center rounded'
												onClick={() => handleSort('createdAt')}>
												Joined {getSortIcon('createdAt')}
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
															src={user.profileImage?.url || '/placeholder.svg?height=32&width=32'}
															alt={user.name}
														/>
														<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
													</Avatar>
													<div>
														<div className='font-medium'>{user.name}</div>
														<Badge variant='outline' className='bg-green-100 text-green-800 w-20 mt-1'>
															Customer
														</Badge>
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
														<span className='text-sm'>{user.phone || 'N/A'}</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<span className='text-sm text-muted-foreground'>
													{new Date(user.createdAt).toLocaleDateString()}
												</span>
											</TableCell>
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
							This action cannot be undone. This will permanently delete the customer account
							{userToDelete?.name ? ` for ${userToDelete.name}` : ''} from both the database and Firebase.
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
		</div>
	);
};

export default AdminUsers;
