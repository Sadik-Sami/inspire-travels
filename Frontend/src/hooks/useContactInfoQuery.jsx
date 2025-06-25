import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './use-AxiosPublic';

const fetchContactInfo = async () => {
	const axiosPublic = useAxiosPublic();
	const { data } = await axiosPublic.get('/api/contact-info');
	console.log(data);
	return data.data;
};

export const useContactInfoQuery = () => {
	return useQuery({
		queryKey: ['contactInfo'],
		queryFn: fetchContactInfo,
	});
};
