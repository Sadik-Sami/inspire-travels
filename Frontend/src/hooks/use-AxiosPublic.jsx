import axios from 'axios';

const axiosPublicInstance = axios.create({
	baseURL: 'http://localhost:9000',
});
const useAxiosPublic = () => {
	return axiosPublicInstance;
};

export default useAxiosPublic;
