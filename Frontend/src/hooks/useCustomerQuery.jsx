import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './use-AxiosSecure';

export const useCustomers = (page = 1, searchQuery = '', sortField = 'createdAt', sortDirection = 'desc') => {
	const axiosSecure = useAxiosSecure();

	return useQuery({
		queryKey: ['customers', page, searchQuery, sortField, sortDirection],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: '10',
				sort: sortField,
				direction: sortDirection,
			});

			if (searchQuery) {
				params.append('search', searchQuery);
			}

			const response = await axiosSecure.get(`/api/customers?${params.toString()}`);
			return response.data;
		},
		keepPreviousData: true,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useCustomer = (customerId) => {
	const axiosSecure = useAxiosSecure();

	return useQuery({
		queryKey: ['customer', customerId],
		queryFn: async () => {
			const response = await axiosSecure.get(`/api/customers/${customerId}`);
			return response.data;
		},
		enabled: !!customerId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useCustomerStats = () => {
	const axiosSecure = useAxiosSecure();

	return useQuery({
		queryKey: ['customer-stats'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/customers/stats/overview');
			return response.data;
		},
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
};
