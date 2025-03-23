import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './use-AxiosPublic';

/**
 * Custom hook for fetching blogs with advanced filtering, searching, and pagination
 *
 * @param {Object} options - Query options
 * @param {number} options.page - Current page number
 * @param {number} options.limit - Number of items per page
 * @param {string} options.search - Search query
 * @param {string} options.sortBy - Sort field and direction (e.g., "createdAt-desc", "viewCount-desc")
 * @param {Object} options.filters - Filter criteria
 * @param {boolean} options.enabled - Whether the query should run
 * @returns {Object} Query result object
 */
export const useBlogQuery = ({
	page = 1,
	limit = 10,
	search = '',
	sortBy = 'createdAt-desc',
	filters = {},
	enabled = true,
}) => {
	const axiosPublic = useAxiosPublic();
	return useQuery({
		queryKey: ['blogs', page, limit, search, sortBy, filters],
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
			console.log(params.toString());
			const response = await axiosPublic.get(`/api/blogs?${params.toString()}`);
			return response.data;
		},
		enabled,
		keepPreviousData: true,
		staleTime: 1000 * 60 * 5,
	});
};

/**
 * Custom hook for fetching a single blog by slug
 *
 * @param {string} slug - Blog slug
 * @param {boolean} enabled - Whether the query should run
 * @returns {Object} Query result object
 */
export const useBlogDetail = (slug, enabled = true) => {
	const axiosPublic = useAxiosPublic();
	return useQuery({
		queryKey: ['blog', slug],
		queryFn: async () => {
			const response = await axiosPublic(`/api/blogs/slug/${slug}`);
			return response.data;
		},
		enabled: !!slug && enabled,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
	});
};

/**
 * Custom hook for fetching blog categories
 *
 * @returns {Object} Query result object
 */
export const useBlogCategories = () => {
	const axiosPublic = useAxiosPublic();
	return useQuery({
		queryKey: ['blogCategories'],
		queryFn: async () => {
			const response = await axiosPublic('/api/blogs/categories');
			return response.data.categories;
		},
		staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
	});
};

/**
 * Custom hook for fetching blog tags
 *
 * @returns {Object} Query result object
 */
export const useBlogTags = () => {
	const axiosPublic = useAxiosPublic();
	return useQuery({
		queryKey: ['blogTags'],
		queryFn: async () => {
			const response = await axiosPublic('/api/blogs/tags');
			return response.data.tags;
		},
		staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
	});
};

/**
 * Custom hook for fetching featured blogs
 *
 * @param {number} limit - Number of blogs to fetch
 * @returns {Object} Query result object
 */
export const useFeaturedBlogs = (limit = 6) => {
	const axiosPublic = useAxiosPublic();
	return useQuery({
		queryKey: ['featuredBlogs', limit],
		queryFn: async () => {
			const response = await axiosPublic(`/api/blogs/featured?limit=${limit}`);
			return response.data.blogs;
		},
		staleTime: 1000 * 60 * 15, // Consider data fresh for 15 minutes
	});
};
