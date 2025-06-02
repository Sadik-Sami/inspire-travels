import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const axiosSecureInstance = axios.create({
	baseURL: 'http://localhost:9000',
	// baseURL: 'https://inspire-self.vercel.app',
});

const useAxiosSecure = () => {
	const { accessToken, refreshAccessToken, logout } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		// Request interceptor
		const requestInterceptor = axiosSecureInstance.interceptors.request.use(
			function (config) {
				// If we have an access token, add it to the request
				if (accessToken) {
					config.headers.authorization = `Bearer ${accessToken}`;
				}
				return config;
			},
			function (error) {
				return Promise.reject(error);
			}
		);

		// Response interceptor
		const responseInterceptor = axiosSecureInstance.interceptors.response.use(
			function (response) {
				return response;
			},
			async function (error) {
				const originalRequest = error.config;

				// If the error is due to an expired token and we haven't tried to refresh yet
				if (error.response?.status === 401 && error.response?.data?.tokenExpired && !originalRequest._retry) {
					originalRequest._retry = true;

					try {
						// Try to refresh the token
						const newToken = await refreshAccessToken();

						if (newToken) {
							// Update the authorization header
							originalRequest.headers.authorization = `Bearer ${newToken}`;
							// Retry the original request
							return axiosSecureInstance(originalRequest);
						} else {
							// If refresh failed, logout and redirect
							logout();
							navigate('/login');
							return Promise.reject(error);
						}
					} catch (refreshError) {
						// If refresh throws an error, logout and redirect
						logout();
						navigate('/login');
						return Promise.reject(refreshError);
					}
				}

				// For other errors (403, etc.), logout and redirect
				if (error.response?.status === 403) {
					logout();
					navigate('/login');
				}

				return Promise.reject(error);
			}
		);

		// Cleanup function to eject interceptors when component unmounts
		return () => {
			axiosSecureInstance.interceptors.request.eject(requestInterceptor);
			axiosSecureInstance.interceptors.response.eject(responseInterceptor);
		};
	}, [accessToken, refreshAccessToken, logout, navigate]);

	return axiosSecureInstance;
};

export default useAxiosSecure;
