import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for creating a new destination
 *
 * @returns {Object} Mutation result object
 */
export const useCreateDestination = (axiosSecure) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (formData) => {
			// Create a FormData object for file uploads
			const data = new FormData();

			// Handle nested objects and arrays
			const appendFormData = (obj, prefix = '') => {
				for (const [key, value] of Object.entries(obj)) {
					const formKey = prefix ? `${prefix}.${key}` : key;

					if (value === null || value === undefined) {
						continue;
					}

					if (key === 'images' && Array.isArray(value)) {
						// Handle file uploads
						value.forEach((image) => {
							if (image.file) {
								data.append('images', image.file);
							}
						});
					} else if (typeof value === 'object' && !(value instanceof File) && !Array.isArray(value)) {
						// Recursively handle nested objects
						appendFormData(value, formKey);
					} else if (Array.isArray(value)) {
						// Handle arrays
						if (value.length > 0) {
							value.forEach((item, index) => {
								if (typeof item === 'object' && !(item instanceof File)) {
									appendFormData(item, `${formKey}[${index}]`);
								} else {
									data.append(`${formKey}[${index}]`, item);
								}
							});
						} else {
							data.append(formKey, JSON.stringify(value));
						}
					} else {
						// Handle primitive values
						data.append(formKey, value);
					}
				}
			};

			appendFormData(formData);

			const response = await axiosSecure.post('/api/destinations', data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			return response.data;
		},
		onSuccess: () => {
			// Invalidate destinations queries to refetch the data
			queryClient.invalidateQueries({ queryKey: ['destinations'] });
		},
	});
};

/**
 * Custom hook for updating an existing destination
 *
 * @returns {Object} Mutation result object
 */
export const useUpdateDestination = (axiosSecure) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, formData }) => {
			// Create a FormData object for file uploads
			const data = new FormData();

			// Handle nested objects and arrays
			const appendFormData = (obj, prefix = '') => {
				for (const [key, value] of Object.entries(obj)) {
					const formKey = prefix ? `${prefix}.${key}` : key;

					if (value === null || value === undefined) {
						continue;
					}

					if (key === 'images' && Array.isArray(value)) {
						// Handle file uploads - only append new files
						value.forEach((image) => {
							if (image.file) {
								data.append('images', image.file);
							} else if (image._id && image.url) {
								// Existing images - add to formData as JSON
								data.append('existingImages', JSON.stringify(image));
							}
						});
					} else if (typeof value === 'object' && !(value instanceof File) && !Array.isArray(value)) {
						// Recursively handle nested objects
						appendFormData(value, formKey);
					} else if (Array.isArray(value)) {
						// Handle arrays
						if (value.length > 0) {
							value.forEach((item, index) => {
								if (typeof item === 'object' && !(item instanceof File)) {
									appendFormData(item, `${formKey}[${index}]`);
								} else {
									data.append(`${formKey}[${index}]`, item);
								}
							});
						} else {
							data.append(formKey, JSON.stringify(value));
						}
					} else {
						// Handle primitive values
						data.append(formKey, value);
					}
				}
			};

			appendFormData(formData);

			const response = await axiosSecure.put(`/api/destinations/${id}`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			return response.data;
		},
		onSuccess: (_, variables) => {
			// Invalidate specific destination query
			queryClient.invalidateQueries({ queryKey: ['destination', variables.id] });
			// Invalidate destinations list
			queryClient.invalidateQueries({ queryKey: ['destinations'] });
		},
	});
};

/**
 * Custom hook for deleting a destination
 *
 * @returns {Object} Mutation result object
 */
export const useDeleteDestination = (axiosSecure) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id) => {
			const response = await axiosSecure.delete(`/api/destinations/${id}`);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate destinations queries to refetch the data
			queryClient.invalidateQueries({ queryKey: ['destinations'] });
		},
	});
};

/**
 * Custom hook for deleting a destination image
 *
 * @returns {Object} Mutation result object
 */
export const useDeleteDestinationImage = (axiosSecure) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ destinationId, imageId }) => {
			const response = await axiosSecure.delete(`/api/destinations/${destinationId}/images/${imageId}`);
			return response.data;
		},
		onSuccess: (_, variables) => {
			// Invalidate specific destination query
			queryClient.invalidateQueries({ queryKey: ['destination', variables.destinationId] });
		},
	});
};
