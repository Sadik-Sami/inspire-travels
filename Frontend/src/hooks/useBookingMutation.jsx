import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './use-AxiosSecure';

export const useBookingMutation = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	// Create a new booking
	const createBooking = useMutation({
		mutationFn: async (bookingData) => {
			const response = await axiosSecure.post('/api/bookings', bookingData);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
		},
	});

	// Cancel a booking
	const cancelBooking = useMutation({
		mutationFn: async (bookingId) => {
			const response = await axiosSecure.patch(`/api/bookings/${bookingId}/cancel`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
		},
	});

	// Update booking status (admin only)
	const updateBookingStatus = useMutation({
		mutationFn: async ({ id, updates }) => {
			const response = await axiosSecure.patch(`/api/bookings/${id}/status`, updates);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
		},
	});

	return {
		createBooking,
		cancelBooking,
		updateBookingStatus,
	};
};
