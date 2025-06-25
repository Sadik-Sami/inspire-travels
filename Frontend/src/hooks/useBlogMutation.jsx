import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from './use-AxiosSecure';
import { toast } from 'sonner';

export const useBlogMutation = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	// Create a new blog
	const createBlog = useMutation({
		mutationFn: async (formData) => {
			const response = await axiosSecure.post('/api/blogs', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blogs'] });
			toast.success('Blog created successfully!');
		},
		onError: (error) => {
			toast.error(`Failed to create blog: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Update an existing blog
	const updateBlog = useMutation({
		mutationFn: async ({ id, formData }) => {
			const response = await axiosSecure.put(`/api/blogs/${id}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['blogs'] });
			queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
			toast.success('Blog updated successfully!');
		},
		onError: (error) => {
			toast.error(`Failed to update blog: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Delete a blog
	const deleteBlog = useMutation({
		mutationFn: async (id) => {
			const response = await axiosSecure.delete(`/api/blogs/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['blogs'] });
			toast.success('Blog deleted successfully!');
		},
		onError: (error) => {
			toast.error(`Failed to delete blog: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Change blog status
	const updateBlogStatus = useMutation({
		mutationFn: async ({ id, status }) => {
			if (!id) throw new Error('Blog ID is required');
			if (!status) throw new Error('Status is required');
			console.log('Calling updateBlogStatus with ID:', id, 'and status:', status);
			const response = await axiosSecure.patch(`/api/blogs/${id}/status`, { status });
			return response.data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['blogs'] });
			queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
			toast.success(`Blog status changed to ${variables.status}`);
		},
		onError: (error) => {
			toast.error(`Failed to change blog status: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Toggle featured status
	const toggleFeatured = useMutation({
		mutationFn: async (blogId) => {
			if (!blogId) throw new Error('Blog ID is required');
			console.log('Calling toggleFeatured with ID:', blogId);
			const response = await axiosSecure.patch(`/api/blogs/${blogId}/featured`);
			return response.data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['blogs'] });
			queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
			toast.success(`Blog ${variables.isFeatured ? 'marked as featured' : 'removed from featured'}`);
		},
		onError: (error) => {
			toast.error(`Failed to update featured status: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	return {
		createBlog,
		updateBlog,
		deleteBlog,
		changeBlogStatus: updateBlogStatus,
		toggleFeatured,
	};
};
