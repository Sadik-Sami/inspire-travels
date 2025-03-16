import { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronDown, MoreHorizontal, Edit, Trash, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddUserDialog from '@/components/Admin/AddUserDialog';

const AdminUsers = () => {
	const [users, setUsers] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [userRole, setUserRole] = useState('all');
	const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

	useEffect(() => {
		// Simulate API call to fetch users
		const fetchUsers = async () => {
			try {
				// In a real app, this would be an API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Mock data
				const mockUsers = [
					{
						id: 1,
						name: 'John Doe',
						email: 'john@example.com',
						phone: '+1 (555) 123-4567',
						role: 'admin',
						status: 'active',
						lastLogin: '2023-09-15T10:30:00',
						avatar: '/placeholder.svg?height=40&width=40',
					},
					{
						id: 2,
						name: 'Jane Smith',
						email: 'jane@example.com',
						phone: '+1 (555) 987-6543',
						role: 'customer',
						status: 'active',
						lastLogin: '2023-09-14T14:45:00',
						avatar: '/placeholder.svg?height=40&width=40',
					},
					{
						id: 3,
						name: 'Robert Johnson',
						email: 'robert@example.com',
						phone: '+1 (555) 456-7890',
						role: 'customer',
						status: 'inactive',
						lastLogin: '2023-08-30T09:15:00',
						avatar: '/placeholder.svg?height=40&width=40',
					},
					{
						id: 4,
						name: 'Emily Davis',
						email: 'emily@example.com',
						phone: '+1 (555) 234-5678',
						role: 'moderator',
						status: 'active',
						lastLogin: '2023-09-15T08:20:00',
						avatar: '/placeholder.svg?height=40&width=40',
					},
					{
						id: 5,
						name: 'Michael Brown',
						email: 'michael@example.com',
						phone: '+1 (555) 876-5432',
						role: 'employee',
						status: 'active',
						lastLogin: '2023-09-13T16:10:00',
						avatar: '/placeholder.svg?height=40&width=40',
					},
				];

				setUsers(mockUsers);
			} catch (error) {
				console.error('Error fetching users:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUsers();
	}, []);

	// Handle adding a new user
	const handleAddUser = (newUser) => {
		setUsers((prevUsers) => [...prevUsers, newUser]);
	};

	// Filter users based on search query and role
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.phone.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesRole = userRole === 'all' || user.role === userRole;

		return matchesSearch && matchesRole;
	});

	// Format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	};

	// Get status badge color
	const getStatusColor = (status) => {
		switch (status) {
			case 'active':
				return 'bg-green-500';
			case 'inactive':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-500';
		}
	};

	// Get role badge variant
	const getRoleBadge = (role) => {
		switch (role) {
			case 'admin':
				return <Badge variant='default'>{role}</Badge>;
			case 'moderator':
				return <Badge variant='secondary'>{role}</Badge>;
			default:
				return <Badge variant='outline'>{role}</Badge>;
		}
	};

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
							onChange={(e) => setSearchQuery(e.target.value)}
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
							<DropdownMenuItem onClick={() => setUserRole('all')}>All Roles</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setUserRole('admin')}>Admin</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setUserRole('customer')}>Customer</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setUserRole('employee')}>Employee</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setUserRole('moderator')}>Moderator</DropdownMenuItem>
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
					<CardDescription>Manage your users and their permissions.</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className='flex justify-center py-8'>
							<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
						</div>
					) : filteredUsers.length === 0 ? (
						<div className='text-center py-8 text-muted-foreground'>No users found. Try adjusting your search.</div>
					) : (
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>User</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Last Login</TableHead>
										<TableHead className='text-right'>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredUsers.map((user) => (
										<TableRow key={user.id}>
											<TableCell>
												<div className='flex items-center gap-3'>
													<Avatar>
														<AvatarImage src={user.avatar} alt={user.name} />
														<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
											<TableCell>
												<div className='flex items-center gap-2'>
													<div className={`h-2 w-2 rounded-full ${getStatusColor(user.status)}`}></div>
													<span className='capitalize'>{user.status}</span>
												</div>
											</TableCell>
											<TableCell>{formatDate(user.lastLogin)}</TableCell>
											<TableCell className='text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='icon'>
															<MoreHorizontal className='h-4 w-4' />
															<span className='sr-only'>Actions</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuItem className='flex items-center gap-2'>
															<Edit className='h-4 w-4' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem className='flex items-center gap-2 text-red-500 focus:text-red-500'>
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
				</CardContent>
			</Card>
		</div>
	);
};

export default AdminUsers;
