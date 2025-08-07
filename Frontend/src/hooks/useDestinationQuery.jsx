import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './use-AxiosPublic';

/**
 * Custom hook for fetching destinations with advanced filtering, searching, and pagination
 *
 * @param {Object} options - Query options
 * @param {number} options.page - Current page number
 * @param {number} options.limit - Number of items per page
 * @param {string} options.search - Search query
 * @param {string} options.sortBy - Sort field and direction (e.g., "price-asc", "rating-desc")
 * @param {Object} options.filters - Filter criteria
 * @param {boolean} options.enabled - Whether the query should run
 * @returns {Object} Query result object
 */
export const useDestinationQuery = ({
	page = 1,
	limit = 10,
	search = '',
	sortBy = 'createdAt-desc',
	filters = {},
	enabled = true,
}) => {
	const axiosPublic = useAxiosPublic();
	return useQuery({
		queryKey: ['destinations', page, limit, search, sortBy, filters],
		queryFn: async () => {
			// Build query parameters
			const params = new URLSearchParams();
			params.append('page', page);
			params.append('limit', limit);

			if (search) params.append('search', search);
			if (sortBy) {
				const [field, direction] = sortBy.split('-');
				params.append('sort', field);
				params.append('direction', direction || 'desc');
			}

			// Add filter parameters
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== '') {
					// Handle array values (like categories)
					if (Array.isArray(value) && value.length > 0) {
						value.forEach((v) => params.append(key, v));
					} else {
						params.append(key, value);
					}
				}
			});
			const response = await axiosPublic.get(`/api/destinations?${params.toString()}`);
			return response.data;
		},
		enabled,
		keepPreviousData: true,
		staleTime: 1000 * 60 * 5,
	});
};

/**
 * Custom hook for fetching a single destination by ID
 *
 * @param {string} id - Destination ID
 * @param {boolean} enabled - Whether the query should run
 * @returns {Object} Query result object
 */
export const useDestinationDetail = (id, enabled = true) => {
	const axiosPublic = useAxiosPublic();
	return useQuery({
		queryKey: ['destination', id],
		queryFn: async () => {
			const response = await axiosPublic(`/api/destinations/${id}`);
			return response.data;
		},
		enabled: !!id && enabled,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
	});
};

/**
 * Custom hook for fetching destination categories
 *
 * @returns {Object} Query result object
 */
export const useDestinationCategories = () => {
	const axiosPublic = useAxiosPublic();
	return useQuery({
		queryKey: ['destinationCategories'],
		queryFn: async () => {
			const response = await axiosPublic('/api/destinations/categories');
			return response.data.categories;
		},
		staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
	});
};

export const useFeaturedDestinations = () => {
	const axiosPublic = useAxiosPublic();
	const {
		data: destinations = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['featured-destinations'],
		queryFn: async () => {
			const response = await axiosPublic.get('/api/destinations/featured');
			return response.data.destinations;
		},
		staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
		cacheTime: 60 * 60 * 1000, // 10 minutes
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
	return {
		destinations,
		isLoading,
		error,
	};
};
