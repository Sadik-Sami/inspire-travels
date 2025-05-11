import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '@/hooks/use-AxiosPublic';
import useAxiosSecure from '@/hooks/use-AxiosSecure';

export const useVisaQuery = () => {
	const axiosPublic = useAxiosPublic();
	const axiosSecure = useAxiosSecure();

	// Get all visas with pagination and filters
	const useGetVisas = (params = {}) => {
		return useQuery({
			queryKey: ['visas', params],
			queryFn: async () => {
				const response = await axiosPublic.get('/api/visas', { params });
				return response.data;
			},
			keepPreviousData: true,
		});
	};

	// Get a single visa by ID
	const useGetVisaById = (id) => {
		return useQuery({
			queryKey: ['visa', id],
			queryFn: async () => {
				if (!id) return null;
				const response = await axiosPublic.get(`/api/visas/${id}`);
				return response.data.visa;
			},
			enabled: !!id,
		});
	};

	// Get a single visa by slug
	const useGetVisaBySlug = (slug) => {
		return useQuery({
			queryKey: ['visa', 'slug', slug],
			queryFn: async () => {
				if (!slug) return null;
				const response = await axiosPublic.get(`/api/visas/slug/${slug}`);
				return response.data.visa;
			},
			enabled: !!slug,
		});
	};

	// Get admin visas with pagination and filters
	const useGetAdminVisas = (params = {}) => {
		return useQuery({
			queryKey: ['admin-visas', params],
			queryFn: async () => {
				const response = await axiosSecure.get('/api/visas/admin/all', { params });
				return response.data;
			},
			keepPreviousData: true,
		});
	};

	return {
		useGetVisas,
		useGetVisaById,
		useGetVisaBySlug,
		useGetAdminVisas,
	};
};

export default useVisaQuery;
