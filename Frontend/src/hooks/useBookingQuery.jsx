import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './use-AxiosSecure';

export const useBookingQuery = (id, params = {}) => {
	const axiosSecure = useAxiosSecure();
	const { page = 1, limit = 10, status, paymentStatus, search, destination } = params;

	let queryString = `?page=${page}&limit=${limit}`;
	if (status) queryString += `&status=${status}`;
	if (paymentStatus) queryString += `&paymentStatus=${paymentStatus}`;
	if (search) queryString += `&search=${search}`;
	if (destination) queryString += `&destination=${destination}`;
	// Get user's bookings
	const userBookingsQuery = useQuery({
		queryKey: ['bookings', 'user'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/bookings/my-bookings');
			return response.data;
		},
	});

	// Get a specific booking by ID
	const bookingByIdQuery = useQuery({
		queryKey: ['bookings', id],
		queryFn: async () => {
			const response = await axiosSecure.get(`/api/bookings/${id}`);
			return response.data;
		},
		enabled: !!id,
	});

	// Get all bookings (admin only)
	const allBookingsQuery = useQuery({
		queryKey: ['bookings', 'all', page, limit, status, paymentStatus, search, destination],
		queryFn: async () => {
			const response = await axiosSecure.get(`/api/bookings${queryString}`);
			return response.data;
		},
	});

	return {
		userBookingsQuery,
		bookingByIdQuery,
		allBookingsQuery,
	};
};
