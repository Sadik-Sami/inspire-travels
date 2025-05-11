import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { toast } from 'sonner';

export const useVisaBookingMutation = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	// Create a new visa booking
	const createVisaBooking = useMutation({
		mutationFn: async (bookingData) => {
			const response = await axiosSecure.post('/api/visa-bookings', bookingData);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-visa-bookings'] });
			toast.success('Visa booking created successfully!');
		},
		onError: (error) => {
			toast.error(`Failed to create visa booking: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Cancel a visa booking
	const cancelVisaBooking = useMutation({
		mutationFn: async (id) => {
			const response = await axiosSecure.patch(`/api/visa-bookings/${id}/cancel`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-visa-bookings'] });
			toast.success('Visa booking cancelled successfully!');
		},
		onError: (error) => {
			toast.error(`Failed to cancel visa booking: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Update visa booking status (admin only)
	const updateVisaBookingStatus = useMutation({
		mutationFn: async ({ id, updates }) => {
			const response = await axiosSecure.patch(`/api/visa-bookings/${id}/status`, updates);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-visa-bookings'] });
			toast.success('Visa booking status updated successfully!');
		},
		onError: (error) => {
			toast.error(`Failed to update visa booking status: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	return {
		createVisaBooking,
		cancelVisaBooking,
		updateVisaBookingStatus,
	};
};

export default useVisaBookingMutation;
