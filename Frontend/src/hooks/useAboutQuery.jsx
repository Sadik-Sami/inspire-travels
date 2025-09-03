import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from '@/hooks/use-AxiosPublic';
import useAxiosSecure from '@/hooks/use-AxiosSecure';

// Hook for public about page content
export const useAboutQuery = () => {
	const axiosPublic = useAxiosPublic();

	return useQuery({
		queryKey: ['about'],
		queryFn: async () => {
			const response = await axiosPublic.get('/api/about');
			return response.data.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		cacheTime: 10 * 60 * 1000, // 10 minutes
		retry: 2,
	});
};

// Hook for admin about page content (includes inactive)
export const useAboutAdminQuery = () => {
	const axiosSecure = useAxiosSecure();

	return useQuery({
		queryKey: ['about-admin'],
		queryFn: async () => {
			const response = await axiosSecure.get('/api/about/admin');
			return response.data.data;
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
		cacheTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
	});
};
