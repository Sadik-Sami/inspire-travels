import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './use-AxiosSecure';
import useAxiosPublic from './use-AxiosPublic';

// Hook for fetching gallery items with filters and pagination
export const useGalleryQuery = (filters = {}) => {
	const axiosPublic = useAxiosPublic();

	const {
		page = 1,
		limit = 12,
		category = 'all',
		search = '',
		sortBy = 'createdAt',
		sortOrder = 'desc',
		isActive = 'all',
	} = filters;

	return useQuery({
		queryKey: ['gallery', { page, limit, category, search, sortBy, sortOrder, isActive }],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				category,
				search,
				sortBy,
				sortOrder,
				isActive,
			});

			const { data } = await axiosPublic.get(`/api/gallery?${params}`);
			return data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		cacheTime: 10 * 60 * 1000, // 10 minutes
		keepPreviousData: true, // Keep previous data while fetching new data
	});
};

// Hook for fetching a single gallery item
export const useGalleryItemQuery = (id) => {
	const axiosPublic = useAxiosPublic();

	return useQuery({
		queryKey: ['gallery', id],
		queryFn: async () => {
			const { data } = await axiosPublic.get(`/api/gallery/${id}`);
			return data;
		},
		enabled: !!id, // Only run query if id is provided
		staleTime: 5 * 60 * 1000, // 5 minutes
		cacheTime: 10 * 60 * 1000, // 10 minutes
	});
};

// Hook for getting gallery categories with counts
export const useGalleryCategoriesQuery = () => {
	const axiosSecure = useAxiosSecure();

	return useQuery({
		queryKey: ['gallery-categories'],
		queryFn: async () => {
			const { data } = await axiosSecure.get('/api/gallery?limit=1'); // Get minimal data just for category stats
			return data.data.categoryStats || {};
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
		cacheTime: 15 * 60 * 1000, // 15 minutes
	});
};
