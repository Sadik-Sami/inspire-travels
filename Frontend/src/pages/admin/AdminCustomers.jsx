'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Search,
	Plus,
	MoreHorizontal,
	Trash,
	Mail,
	Phone,
	ArrowUpDown,
	FileIcon as FileInvoice,
	Edit,
	User,
} from 'lucide-react';
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
import AddCustomerDialog from '@/components/admin/AddCustomerDialog';
import EditCustomerDialog from '@/components/admin/EditCustomerDialog';
import PaginationControls from '@/components/Destination/PaginationControls';
import { useCustomers } from '@/hooks/useCustomerQuery';
import { useDeleteCustomer } from '@/hooks/useCustomerMutation';
import { useDebounce } from '@/hooks/useDebounce';

const AdminCustomers = () => {
	const navigate = useNavigate();

	// State for pagination, filtering, and sorting
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [sortField, setSortField] = useState('createdAt');
	const [sortDirection, setSortDirection] = useState('desc');

	// State for dialogs
	const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
	const [customerToDelete, setCustomerToDelete] = useState(null);
	const [customerToEdit, setCustomerToEdit] = useState(null);
	const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);

	// Debounce search to avoid too many API calls
	const debouncedSearch = useDebounce(searchQuery, 500);

	// Fetch customers with filtering, sorting, and pagination
	const { data, isLoading, isError } = useCustomers(page, debouncedSearch, sortField, sortDirection);

	// Delete customer mutation
	const deleteCustomerMutation = useDeleteCustomer();

	// Handle adding a new customer
	const handleAddCustomer = (newCustomer) => {
		// The mutation already invalidates queries, so we don't need to do anything here
		console.log('Customer added:', newCustomer);
	};

	// Handle deleting a customer
	const handleDeleteCustomer = () => {
		if (customerToDelete) {
			deleteCustomerMutation.mutate(customerToDelete._id, {
				onSuccess: () => {
					setCustomerToDelete(null);
				},
			});
		}
	};

	// Handle creating invoice for a customer
	const handleCreateInvoice = (customer) => {
		navigate('/admin/invoices/new', {
			state: {
				customer: {
					name: customer.name,
					email: customer.email,
					phone: customer.phone,
					address: customer.address,
					passportNumber: customer.passportNumber,
				},
			},
		});
	};

	// Handle editing a customer
	const handleEditCustomer = (customer) => {
		setCustomerToEdit(customer);
		setIsEditCustomerDialogOpen(true);
	};

	// Handle customer update
	const handleUpdateCustomer = (updatedCustomer) => {
		console.log('Customer updated:', updatedCustomer);
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

	// Extract customers array and pagination data safely
	const customers = data?.customers || [];
	const pagination = data?.pagination || { totalPages: 1, currentPage: 1, total: 0 };

	return (
		<div>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
				<div>
					<h1 className='text-3xl font-bold'>Customer Management</h1>
					<p className='text-muted-foreground mt-1'>Manage customers who don't have login accounts</p>
				</div>

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

					<Button
						variant='default'
						className='flex items-center gap-2'
						onClick={() => setIsAddCustomerDialogOpen(true)}>
						<Plus className='h-4 w-4' />
						Add Customer
					</Button>
				</div>
			</div>

			{/* Add Customer Dialog */}
			<AddCustomerDialog
				open={isAddCustomerDialogOpen}
				onOpenChange={setIsAddCustomerDialogOpen}
				onAddCustomer={handleAddCustomer}
			/>

			{/* Edit Customer Dialog */}
			<EditCustomerDialog
				open={isEditCustomerDialogOpen}
				onOpenChange={setIsEditCustomerDialogOpen}
				customer={customerToEdit}
				onUpdateCustomer={handleUpdateCustomer}
			/>

			<Card>
				<CardHeader className='pb-2'>
					<CardTitle>Customers</CardTitle>
					<CardDescription>
						Manage customer records and create invoices for them.
						{!isLoading && (
							<span className='ml-2 text-sm'>
								Showing {customers.length} of {pagination.total} customers
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
					) : customers.length === 0 ? (
						<div className='text-center py-8 text-muted-foreground'>
							{searchQuery
								? 'No customers found matching your search.'
								: 'No customers found. Add your first customer to get started.'}
						</div>
					) : (
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader className='h-20'>
									<TableRow>
										<TableHead>
											<Button
												variant='outline'
												className='p-2 font-bold flex items-center rounded bg-transparent'
												onClick={() => handleSort('name')}>
												Customer {getSortIcon('name')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='outline'
												className='p-2 font-bold flex items-center rounded bg-transparent'
												onClick={() => handleSort('phone')}>
												Contact {getSortIcon('phone')}
											</Button>
										</TableHead>
										<TableHead>
											<Button
												variant='outline'
												className='p-2 font-bold flex items-center rounded bg-transparent'
												onClick={() => handleSort('createdAt')}>
												Added {getSortIcon('createdAt')}
											</Button>
										</TableHead>
										<TableHead>Added By</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{customers.map((customer) => (
										<TableRow key={customer._id}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<Avatar>
														<AvatarImage
															src={customer.profileImage?.url || '/placeholder.svg?height=32&width=32'}
															alt={customer.name}
														/>
														<AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
													</Avatar>
													<div>
														<div className='font-medium'>{customer.name}</div>
														<Badge variant='outline' className='bg-blue-100 text-blue-800 w-20 mt-1'>
															Customer
														</Badge>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className='flex flex-col gap-1'>
													<div className='flex items-center gap-1'>
														<Phone className='h-3 w-3 text-muted-foreground' />
														<span className='text-sm font-medium'>{customer.phone}</span>
													</div>
													{customer.email && (
														<div className='flex items-center gap-1'>
															<Mail className='h-3 w-3 text-muted-foreground' />
															<span className='text-sm text-muted-foreground'>{customer.email}</span>
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<span className='text-sm text-muted-foreground'>
													{new Date(customer.createdAt).toLocaleDateString()}
												</span>
											</TableCell>
											<TableCell>
												<div className='flex items-center gap-2'>
													<User className='h-3 w-3 text-muted-foreground' />
													<span className='text-sm text-muted-foreground'>{customer.createdBy?.name || 'Unknown'}</span>
												</div>
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
															onClick={() => handleCreateInvoice(customer)}>
															<FileInvoice className='h-4 w-4' />
															Create Invoice
														</DropdownMenuItem>
														<DropdownMenuItem
															className='flex items-center gap-2'
															onClick={() => handleEditCustomer(customer)}>
															<Edit className='h-4 w-4' />
															Edit Customer
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className='flex items-center gap-2 text-red-500 focus:text-red-500'
															onClick={() => setCustomerToDelete(customer)}>
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
					{!isLoading && customers.length > 0 && (
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

			{/* Delete Customer Confirmation Dialog */}
			<AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the customer record
							{customerToDelete?.name ? ` for ${customerToDelete.name}` : ''} and all associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteCustomer}
							className='bg-red-500 hover:bg-red-600'
							disabled={deleteCustomerMutation.isPending}>
							{deleteCustomerMutation.isPending ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default AdminCustomers;
