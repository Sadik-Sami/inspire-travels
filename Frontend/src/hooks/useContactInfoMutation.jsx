import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import { toast } from 'sonner';

export const useContactInfoMutation = () => {
	const axiosSecure = useAxiosSecure();
	const queryClient = useQueryClient();

	const updateContactInfo = useMutation({
		mutationFn: async (contactInfo) => {
			const { data } = await axiosSecure.put('/api/contact-info', contactInfo);
			return data;
		},
		onSuccess: () => {
			toast.success('Contact information updated successfully!');
			queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || 'Failed to update contact information.');
		},
	});

	return { updateContactInfo };
};
