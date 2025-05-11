import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';

export const useVisaBookingQuery = (id, params = {}) => {
	const axiosSecure = useAxiosSecure();

	// Get all visa bookings for the current user
	const userVisaBookingsQuery = useQuery({
		queryKey: ['user-visa-bookings'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/visa-bookings/my-bookings');
			return response.data;
		},
	});

	// Get all visa bookings (admin only)
	const allVisaBookingsQuery = useQuery({
		queryKey: ['admin-visa-bookings', params],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/visa-bookings', { params });
			return response.data;
		},
	});

	// Get a specific visa booking by ID
	const visaBookingByIdQuery = useQuery({
		queryKey: ['visa-booking', id],
		queryFn: async () => {
			if (!id) return null;
			const response = await axiosSecure.get(`/api/visa-bookings/${id}`);
			return response.data.booking;
		},
		enabled: !!id,
	});

	return {
		userVisaBookingsQuery,
		allVisaBookingsQuery,
		visaBookingByIdQuery,
	};
};

export default useVisaBookingQuery;
