import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import useAxiosSecure from './use-AxiosSecure';

const useRole = () => {
	const { user } = useAuth();
	const axiosSecure = useAxiosSecure();

	const {
		data: userData,
		isPending,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['userRole'],
		queryFn: async () => {
			const { data } = await axiosSecure.get('/api/users/role');
			return data.user;
		},
		enabled: !!user,
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
		isLoading,
		isError,
		refetch,
	};
};

export default useRole;
