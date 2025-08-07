import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import useAxiosPublic from './use-AxiosPublic';

const useRole = () => {
	const { user } = useAuth();
	const axiosPublic = useAxiosPublic();
	const currentAccessToken = localStorage.getItem('accessToken');

	const {
		data: userData,
		isPending,
		isLoading: roleLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['userRole', user?.email],
		queryFn: async () => {
			if (!user?.email) {
				return { role: 'customer' };
			}
			const { data } = await axiosPublic('/api/users/role', {
				headers: {
					Authorization: `Bearer ${currentAccessToken}`,
				},
			});
			return data.user;
		},
		enabled: !!user?.email,
		retry: 1,
		staleTime: 1000 * 60 * 5,
	});

	return {
		role: userData?.role || 'customer',
		isAdmin: userData?.role === 'admin',
		isModerator: userData?.role === 'moderator',
		isEmployee: userData?.role === 'employee',
		isCustomer: userData?.role === 'customer',
		isPending,
		roleLoading,
		isError,
		refetch,
	};
};

export default useRole;
