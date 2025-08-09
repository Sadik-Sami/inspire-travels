import axios from 'axios';

const axiosPublicInstance = axios.create({
	// baseURL: 'http://localhost:9000',
	baseURL: 'https://inspire-self.vercel.app',
	withCredentials: true, //! This enables cookies to be sent with requests
});
const useAxiosPublic = () => {
	return axiosPublicInstance;
};

export default useAxiosPublic;
