import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { toast } from 'sonner';

export const useAboutMutation = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	// Create about content
	const createAbout = useMutation({
		mutationFn: async (formData) => {
			const response = await axiosSecure.post('/api/about', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['about'] });
			queryClient.invalidateQueries({ queryKey: ['about-admin'] });
			toast.success(data.message || 'About page content created successfully');
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to create about page content';
			toast.error(message);
		},
	});

	// Update about content
	const updateAbout = useMutation({
		mutationFn: async ({ id, formData }) => {
			const response = await axiosSecure.put(`/api/about/${id}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['about'] });
			queryClient.invalidateQueries({ queryKey: ['about-admin'] });
			toast.success(data.message || 'About page content updated successfully');
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to update about page content';
			toast.error(message);
		},
	});

	// Delete about content
	const deleteAbout = useMutation({
		mutationFn: async (id) => {
			const response = await axiosSecure.delete(`/api/about/${id}`);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['about'] });
			queryClient.invalidateQueries({ queryKey: ['about-admin'] });
			toast.success(data.message || 'About page content deleted successfully');
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to delete about page content';
			toast.error(message);
		},
	});

	return {
		createAbout,
		updateAbout,
		deleteAbout,
	};
};
