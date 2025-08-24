import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const axiosSecureInstance = axios.create({
	// baseURL: 'http://localhost:3000',
	baseURL: 'https://inspire-self.vercel.app',
	withCredentials: true,
});

const useAxiosSecure = () => {
	const { logout } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// REQUEST INTERCEPTOR
		// This runs before every request is sent
		const requestInterceptor = axiosSecureInstance.interceptors.request.use(
			(config) => {
				// Add access token to Authorization header if available
				// This provides fallback authentication via headers when cookies aren't available
				const accessToken = localStorage.getItem('accessToken');
				if (accessToken) {
					config.headers.authorization = `Bearer ${accessToken}`;
				}
				return config;
			},
			(error) => Promise.reject(error)
		);

		// UPDATED: Response interceptor with automatic token refresh
		const responseInterceptor = axiosSecureInstance.interceptors.response.use(
			(response) => {
				// If response is successful, just return it
				return response;
			},
			async (error) => {
				const originalRequest = error.config;
				const status = error.response?.status;

				// Handle authentication errors
				if (status === 401 && !originalRequest._retry) {
					originalRequest._retry = true;

					try {
						// Try to refresh the token using the refresh token cookie
						const refreshResponse = await axiosSecureInstance.post('/api/users/refresh-token');

						if (refreshResponse.data.success) {
							// Update access token in localStorage
							localStorage.setItem('accessToken', refreshResponse.data.accessToken);

							// Update the authorization header for the original request
							originalRequest.headers.authorization = `Bearer ${refreshResponse.data.accessToken}`;

							// Retry the original request with the new token
							return axiosSecureInstance(originalRequest);
						}
					} catch (refreshError) {
						console.log('Refresh token expired - logging out');
						logout();
						navigate('/login');
						return Promise.reject(refreshError);
					}
				}

				// Handle other 401/403 errors or if retry already attempted
				if (status === 401 || status === 403) {
					console.log('Authentication failed - logging out');
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
	}, [logout, navigate]);

	return axiosSecureInstance;
};

export default useAxiosSecure;
