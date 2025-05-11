import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { toast } from 'sonner';

export const useVisaMutation = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	// Create a new visa
	const createVisa = useMutation({
		mutationFn: async (formData) => {
			// Create a FormData object for file uploads
			const data = new FormData();

			// Map longDescription to description for the server
			const mappedData = {
				...formData,
				description: formData.longDescription,
				basePrice: formData.price,
			};
			delete mappedData.longDescription;
			delete mappedData.price;
			delete mappedData.photos;
			delete mappedData.coverImageIndex;

			// Add text fields
			Object.keys(mappedData).forEach((key) => {
				if (typeof mappedData[key] === 'object' && mappedData[key] !== null) {
					data.append(key, JSON.stringify(mappedData[key]));
				} else {
					data.append(key, mappedData[key]);
				}
			});

			// Add photos
			if (formData.photos && formData.photos.length > 0) {
				formData.photos.forEach((photo, index) => {
					data.append('photos', photo);

					// Mark the cover image
					if (index === formData.coverImageIndex) {
						data.append('coverImageIndex', index.toString());
					}
				});
			}

			const response = await axiosSecure.post('/api/visas', data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['visas'] });
			queryClient.invalidateQueries({ queryKey: ['admin-visas'] });
			toast.success('Visa created successfully!');
		},
		onError: (error) => {
			toast.error(`Failed to create visa: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Update an existing visa
	const updateVisa = useMutation({
		mutationFn: async ({ id, visaData }) => {
			// Create a FormData object for file uploads
			const data = new FormData();

			// Map longDescription to description for the server
			const mappedData = {
				...visaData,
				description: visaData.longDescription,
				basePrice: visaData.price,
			};
			delete mappedData.longDescription;
			delete mappedData.price;
			delete mappedData.newPhotos;
			delete mappedData.removedPhotos;
			delete mappedData.coverImageId;
			delete mappedData.newCoverImageIndex;

			// Add text fields
			Object.keys(mappedData).forEach((key) => {
				if (typeof mappedData[key] === 'object' && mappedData[key] !== null) {
					data.append(key, JSON.stringify(mappedData[key]));
				} else {
					data.append(key, mappedData[key]);
				}
			});

			// Add cover image ID if it exists
			if (visaData.coverImageId) {
				data.append('coverImageId', visaData.coverImageId);
			}

			// Add new photos
			if (visaData.newPhotos && visaData.newPhotos.length > 0) {
				visaData.newPhotos.forEach((photo, index) => {
					data.append('newPhotos', photo);

					// Mark the new cover image
					if (index === visaData.newCoverImageIndex) {
						data.append('newCoverImageIndex', index.toString());
					}
				});
			}

			// Add removed photos
			if (visaData.removedPhotos && visaData.removedPhotos.length > 0) {
				visaData.removedPhotos.forEach((publicId) => {
					data.append('deletedImages', publicId);
				});
			}

			const response = await axiosSecure.put(`/api/visas/${id}`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['visas'] });
			queryClient.invalidateQueries({ queryKey: ['admin-visas'] });
			queryClient.invalidateQueries({ queryKey: ['visa', variables.id] });
			toast.success('Visa updated successfully!');
		},
		onError: (error) => {
			toast.error(`Failed to update visa: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Delete a visa
	const deleteVisa = useMutation({
		mutationFn: async (id) => {
			const response = await axiosSecure.delete(`/api/visas/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['visas'] });
			queryClient.invalidateQueries({ queryKey: ['admin-visas'] });
			toast.success('Visa deleted successfully!');
		},
		onError: (error) => {
			toast.error(`Failed to delete visa: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Toggle visa active status
	const toggleVisaStatus = useMutation({
		mutationFn: async (id) => {
			const response = await axiosSecure.patch(`/api/visas/${id}/toggle-status`);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['visas'] });
			queryClient.invalidateQueries({ queryKey: ['admin-visas'] });
			toast.success(`Visa ${data.isActive ? 'activated' : 'deactivated'} successfully!`);
		},
		onError: (error) => {
			toast.error(`Failed to update visa status: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	// Toggle visa featured status
	const toggleFeatured = useMutation({
		mutationFn: async (id) => {
			const response = await axiosSecure.patch(`/api/visas/${id}/toggle-featured`);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['visas'] });
			queryClient.invalidateQueries({ queryKey: ['admin-visas'] });
			toast.success(`Visa ${data.featured ? 'featured' : 'unfeatured'} successfully!`);
		},
		onError: (error) => {
			toast.error(`Failed to update featured status: ${error.response?.data?.message || 'Unknown error'}`);
		},
	});

	return {
		createVisa,
		updateVisa,
		deleteVisa,
		toggleVisaStatus,
		toggleFeatured,
	};
};

export default useVisaMutation;
