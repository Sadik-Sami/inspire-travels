import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

const AdminDestinations = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [destinations, setDestinations] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [destinationToDelete, setDestinationToDelete] = useState(null);

	useEffect(() => {
		const fetchDestinations = async () => {
			try {
				// In a real app, this would be an actual API call
				// const response = await axios.get('/api/destinations');
				// setDestinations(response.data);

				// Simulate API response
				const mockDestinations = [
					{
						_id: '1',
						name: 'Bali',
						location: 'Indonesia',
						description:
							'Beautiful beaches, vibrant culture, and stunning landscapes make Bali a perfect tropical getaway.',
						price: 1299,
						featured: true,
						imageUrl: '/placeholder.svg?height=300&width=400',
					},
					{
						_id: '2',
						name: 'Paris',
						location: 'France',
						description: 'The City of Light offers iconic landmarks, world-class cuisine, and romantic ambiance.',
						price: 1599,
						featured: true,
						imageUrl: '/placeholder.svg?height=300&width=400',
					},
					{
						_id: '3',
						name: 'Tokyo',
						location: 'Japan',
						description:
							"A fascinating blend of traditional culture and cutting-edge technology in Japan's bustling capital.",
						price: 1899,
						featured: true,
						imageUrl: '/placeholder.svg?height=300&width=400',
					},
					{
						_id: '4',
						name: 'New York',
						location: 'USA',
						description:
							'The Big Apple features iconic skyscrapers, diverse neighborhoods, and world-famous attractions.',
						price: 1199,
						featured: false,
						imageUrl: '/placeholder.svg?height=300&width=400',
					},
					{
						_id: '5',
						name: 'Rome',
						location: 'Italy',
						description:
							'The Eternal City is home to ancient ruins, artistic masterpieces, and delicious Italian cuisine.',
						price: 1499,
						featured: false,
						imageUrl: '/placeholder.svg?height=300&width=400',
					},
					{
						_id: '6',
						name: 'Sydney',
						location: 'Australia',
						description:
							'Stunning harbor, iconic Opera House, and beautiful beaches make Sydney a must-visit destination.',
						price: 1799,
						featured: false,
						imageUrl: '/placeholder.svg?height=300&width=400',
					},
				];

				setDestinations(mockDestinations);
			} catch (error) {
				console.error('Error fetching destinations:', error);
				toast({
					title: 'Error loading destinations',
					description: 'There was a problem loading your destinations.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchDestinations();
	}, [toast]);

	const filteredDestinations = destinations.filter(
		(destination) =>
			destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			destination.location.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const confirmDeleteDestination = (destination) => {
		setDestinationToDelete(destination);
	};

	const handleDeleteDestination = async () => {
		if (!destinationToDelete) return;

		setIsLoading(true);

		try {
			// In a real app, this would be an actual API call
			// await axios.delete(`/api/destinations/${destinationToDelete._id}`);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setDestinations((prev) => prev.filter((dest) => dest._id !== destinationToDelete._id));

			toast({
				title: 'Destination deleted',
				description: `${destinationToDelete.name} has been removed.`,
			});
		} catch (error) {
			console.error('Error deleting destination:', error);
			toast({
				title: 'Error deleting destination',
				description: 'There was a problem deleting the destination.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
			setDestinationToDelete(null);
		}
	};

	const toggleFeatured = async (destination) => {
		try {
			// In a real app, this would be an actual API call
			// await axios.patch(`/api/destinations/${destination._id}/featured`, {
			//   featured: !destination.featured
			// });

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			setDestinations((prev) =>
				prev.map((dest) => (dest._id === destination._id ? { ...dest, featured: !dest.featured } : dest))
			);

			toast({
				title: destination.featured ? 'Removed from featured' : 'Added to featured',
				description: `${destination.name} has been ${
					destination.featured ? 'removed from' : 'added to'
				} featured destinations.`,
			});
		} catch (error) {
			console.error('Error updating featured status:', error);
			toast({
				title: 'Error updating destination',
				description: 'There was a problem updating the featured status.',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className='p-6'>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
				<h1 className='text-3xl font-bold'>Destinations</h1>

				<div className='flex flex-col sm:flex-row gap-4'>
					<div className='relative'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							type='search'
							placeholder='Search destinations...'
							className='pl-8 w-full sm:w-[250px]'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<Button asChild>
						<Link to='/admin/destinations/new'>
							<Plus className='mr-2 h-4 w-4' />
							Add Destination
						</Link>
					</Button>
				</div>
			</div>

			{isLoading ? (
				<div className='text-center py-8'>Loading destinations...</div>
			) : filteredDestinations.length === 0 ? (
				<Card>
					<CardContent className='text-center py-8'>
						{searchQuery ? (
							<p className='text-muted-foreground'>No destinations match your search.</p>
						) : (
							<div className='space-y-4'>
								<p className='text-muted-foreground'>
									No destinations found. Add your first destination to get started.
								</p>
								<Button asChild>
									<Link to='/admin/destinations/new'>
										<Plus className='mr-2 h-4 w-4' />
										Add Destination
									</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filteredDestinations.map((destination) => (
						<Card key={destination._id} className='overflow-hidden'>
							<div className='relative h-48'>
								<img
									src={destination.imageUrl || '/placeholder.svg'}
									alt={destination.name}
									className='w-full h-full object-cover'
								/>
								<div className='absolute top-2 right-2'>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='secondary' size='sm' className='h-8 w-8 p-0'>
												<span className='sr-only'>Open menu</span>
												<Edit className='h-4 w-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem asChild>
												<Link to={`/admin/destinations/${destination._id}`}>Edit Details</Link>
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => toggleFeatured(destination)}>
												{destination.featured ? 'Remove from Featured' : 'Add to Featured'}
											</DropdownMenuItem>
											<DropdownMenuItem
												className='text-destructive focus:text-destructive'
												onClick={() => confirmDeleteDestination(destination)}>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
								{destination.featured && (
									<div className='absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 text-xs font-medium rounded'>
										Featured
									</div>
								)}
							</div>
							<CardContent className='p-4'>
								<h2 className='text-xl font-bold mb-1'>{destination.name}</h2>
								<div className='flex items-center text-muted-foreground mb-2'>
									<MapPin size={14} className='mr-1' />
									<span className='text-sm'>{destination.location}</span>
								</div>
								<p className='text-muted-foreground mb-4 line-clamp-2'>{destination.description}</p>
								<div className='flex justify-between items-center'>
									<span className='font-bold'>${destination.price}</span>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant='outline'
												size='sm'
												className='text-destructive border-destructive hover:bg-destructive/10'>
												<Trash2 className='h-4 w-4 mr-1' />
												Delete
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Are you sure?</AlertDialogTitle>
												<AlertDialogDescription>
													This will permanently delete {destination.name} from your destinations. This action cannot be
													undone.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => {
														setDestinationToDelete(destination);
														handleDeleteDestination();
													}}>
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
};

export default AdminDestinations;
