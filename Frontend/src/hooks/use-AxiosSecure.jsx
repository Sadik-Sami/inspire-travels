import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const axiosSecureInstance = axios.create({
	// baseURL: 'http://localhost:9000',
	baseURL: 'https://inspire-self.vercel.app',
	withCredentials: true, //! This enables cookies to be sent with requests
});

const useAxiosSecure = () => {
	const { accessToken, logout } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// REQUEST INTERCEPTOR
		// This runs before every request is sent
		const requestInterceptor = axiosSecureInstance.interceptors.request.use(
			function (config) {
				// Add access token to Authorization header if available
				// This provides fallback authentication via headers when cookies aren't available
				if (accessToken) {
					config.headers.authorization = `Bearer ${accessToken}`;
				}
				return config;
			},
			function (error) {
				return Promise.reject(error);
			}
		);

		// RESPONSE INTERCEPTOR
		// This runs after every response is received
		const responseInterceptor = axiosSecureInstance.interceptors.response.use(
			function (response) {
				// If response is successful, just return it
				return response;
			},
			async function (error) {
				const status = error.response?.status;

				// Handle authentication errors
				if (status === 401 || status === 403) {
					// Token is invalid/expired or user doesn't have permission
					// No refresh token logic - just logout and redirect
					// TODO: Handle token refresh logic if needed
					console.log('Authentication failed, logging out...');
					logout();
					navigate('/login');
				}

				// For all other errors, just reject the promise
				return Promise.reject(error);
			}
		);

		// CLEANUP FUNCTION
		// Remove interceptors when component unmounts or dependencies change
		return () => {
			axiosSecureInstance.interceptors.request.eject(requestInterceptor);
			axiosSecureInstance.interceptors.response.eject(responseInterceptor);
		};
	}, [accessToken, logout, navigate]);

	return axiosSecureInstance;
};

export default useAxiosSecure;
