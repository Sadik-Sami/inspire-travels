import axios from 'axios';

const axiosPublicInstance = axios.create({
	baseURL: 'http://localhost:3000',
	// baseURL: 'https://inspire-self.vercel.app',
});
const useAxiosPublic = () => {
	return axiosPublicInstance;
};

export default useAxiosPublic;
