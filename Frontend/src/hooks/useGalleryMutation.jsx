import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { toast } from 'sonner';

export const useGalleryMutation = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	// Create gallery item mutation
	const createGalleryItem = useMutation({
		mutationFn: async (formData) => {
			const { data } = await axiosSecure.post('/api/gallery', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return data;
		},
		onSuccess: (data) => {
			toast.success(data.message || 'Gallery item created successfully!');
			// Invalidate and refetch gallery queries
			queryClient.invalidateQueries({ queryKey: ['gallery'] });
			queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to create gallery item';
			toast.error(message);
			console.error('Create gallery item error:', error);
		},
	});

	// Update gallery item mutation
	const updateGalleryItem = useMutation({
		mutationFn: async ({ id, data }) => {
			const response = await axiosSecure.put(`/api/gallery/${id}`, data);
			return response.data;
		},
		onSuccess: (data) => {
			toast.success(data.message || 'Gallery item updated successfully!');
			// Invalidate and refetch gallery queries
			queryClient.invalidateQueries({ queryKey: ['gallery'] });
			queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to update gallery item';
			toast.error(message);
			console.error('Update gallery item error:', error);
		},
	});

	// Delete gallery item mutation
	const deleteGalleryItem = useMutation({
		mutationFn: async (id) => {
			const { data } = await axiosSecure.delete(`/api/gallery/${id}`);
			return data;
		},
		onSuccess: (data) => {
			toast.success(data.message || 'Gallery item deleted successfully!');
			// Invalidate and refetch gallery queries
			queryClient.invalidateQueries({ queryKey: ['gallery'] });
			queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
		},
		onError: (error) => {
			const message = error.response?.data?.message || 'Failed to delete gallery item';
			toast.error(message);
			console.error('Delete gallery item error:', error);
		},
	});

	return {
		createGalleryItem,
		updateGalleryItem,
		deleteGalleryItem,
	};
};
