import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useAxiosSecure from './use-AxiosSecure';

export const useCreateCustomer = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (customerData) => {
			const response = await axiosSecure.post('/api/customers', customerData);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['customers'] });
			queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
			toast.success('Customer created successfully');
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to create customer';
			toast.error(message);
		},
	});
};

export const useUpdateCustomer = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ customerId, customerData }) => {
			const response = await axiosSecure.put(`/api/customers/${customerId}`, customerData);
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['customers'] });
			queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
			queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
			toast.success('Customer updated successfully');
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to update customer';
			toast.error(message);
		},
	});
};

export const useDeleteCustomer = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (customerId) => {
			const response = await axiosSecure.delete(`/api/customers/${customerId}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['customers'] });
			queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
			toast.success('Customer deleted successfully');
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to delete customer';
			toast.error(message);
		},
	});
};

export const useUploadCustomerImage = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ customerId, imageFile }) => {
			const formData = new FormData();
			formData.append('image', imageFile);

			const response = await axiosSecure.post(`/api/customers/${customerId}/image`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['customers'] });
			queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
			toast.success('Profile image updated successfully');
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to upload image';
			toast.error(message);
		},
	});
};

export const useDeleteCustomerImage = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (customerId) => {
			const response = await axiosSecure.delete(`/api/customers/${customerId}/image`);
			return response.data;
		},
		onSuccess: (data, customerId) => {
			queryClient.invalidateQueries({ queryKey: ['customers'] });
			queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
			toast.success('Profile image deleted successfully');
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to delete image';
			toast.error(message);
		},
	});
};
