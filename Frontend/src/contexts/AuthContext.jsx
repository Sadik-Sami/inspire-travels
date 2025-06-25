import useAxiosPublic from '@/hooks/use-AxiosPublic';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [accessToken, setAccessToken] = useState(null);
	const [refreshToken, setRefreshToken] = useState(null);
	const navigate = useNavigate();
	const axiosPublic = useAxiosPublic();

	// Function to refresh the access token
	const refreshAccessToken = async () => {
		try {
			// Get refresh token from state or localStorage
			const currentRefreshToken = refreshToken || localStorage.getItem('refreshToken');

			if (!currentRefreshToken) {
				return null;
			}

			const { data } = await axiosPublic.post('/api/users/refresh-token', {
				refreshToken: currentRefreshToken,
			});

			if (data.success && data.accessToken) {
				localStorage.setItem('accessToken', data.accessToken);
				setAccessToken(data.accessToken);
				return data.accessToken;
			}

			return null;
		} catch (error) {
			console.error('Failed to refresh token:', error);
			// If refresh fails, log the user out
			logout();
			return null;
		}
	};

	// Check if user is already logged in on mount
	useEffect(() => {
		const checkLoggedIn = async () => {
			try {
				// Check if there are tokens in localStorage
				const storedAccessToken = localStorage.getItem('accessToken');
				const storedRefreshToken = localStorage.getItem('refreshToken');

				if (storedAccessToken && storedRefreshToken) {
					setAccessToken(storedAccessToken);
					setRefreshToken(storedRefreshToken);

					// Get user data from localStorage for immediate UI update
					const userData = JSON.parse(localStorage.getItem('user'));
					if (userData) {
						setUser(userData);
					}

					// Verify token with backend (optional but recommended)
					try {
						const { data } = await axiosPublic.get('/api/users/profile', {
							headers: {
								Authorization: `Bearer ${storedAccessToken}`,
							},
						});

						// Update user data from server
						setUser(data);
						localStorage.setItem('user', JSON.stringify(data));
					} catch (error) {
						// If token verification fails, try to refresh
						if (error.response && (error.response.status === 401 || error.response.status === 403)) {
							const newToken = await refreshAccessToken();
							if (!newToken) {
								// If refresh fails, clear everything
								clearAuthData();
							}
						}
					}
				}
			} catch (error) {
				console.error('Authentication error:', error);
				clearAuthData();
			} finally {
				setLoading(false);
			}
		};

		checkLoggedIn();
	}, []);

	// Helper to clear all auth data
	const clearAuthData = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('user');
		setUser(null);
		setAccessToken(null);
		setRefreshToken(null);
	};

	// Login function
	const login = async (email, password) => {
		setLoading(true);
		try {
			const { data } = await axiosPublic.post('/api/users/login', { email, password });

			if (!data.success) return { success: false };

			// Store tokens and user data
			localStorage.setItem('accessToken', data.accessToken);
			localStorage.setItem('refreshToken', data.refreshToken);
			localStorage.setItem('user', JSON.stringify(data.user));

			setUser(data.user);
			setAccessToken(data.accessToken);
			setRefreshToken(data.refreshToken);

			return { success: true };
		} catch (error) {
			console.error('Login error:', error);
			return {
				success: false,
				error: error.response?.data?.message || error.message || 'Failed to login. Please try again.',
			};
		} finally {
			setLoading(false);
		}
	};

	// Signup function
	const signup = async (name, email, phone, password) => {
		setLoading(true);
		try {
			const { data } = await axiosPublic.post('/api/users/register', { email, password, phone, name });

			if (!data.success) return { success: false };

			// Store tokens and user data
			localStorage.setItem('accessToken', data.accessToken);
			localStorage.setItem('refreshToken', data.refreshToken);
			localStorage.setItem('user', JSON.stringify(data.user));

			setUser(data.user);
			setAccessToken(data.accessToken);
			setRefreshToken(data.refreshToken);

			return { success: true };
		} catch (error) {
			console.error('Signup error:', error);
			return {
				success: false,
				error: error.response?.data?.message || error.message || 'Failed to create account. Please try again.',
			};
		} finally {
			setLoading(false);
		}
	};

	// Logout function
	const logout = async () => {
		try {
			// Call logout endpoint to invalidate refresh token
			const currentRefreshToken = refreshToken || localStorage.getItem('refreshToken');

			if (accessToken && currentRefreshToken) {
				await axiosPublic.post(
					'/api/users/logout',
					{ refreshToken: currentRefreshToken },
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);
			}
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			// Clear local storage and state regardless of server response
			clearAuthData();
			navigate('/login');
		}
	};

	// Logout from all devices
	const logoutAll = async () => {
		try {
			if (accessToken) {
				await axiosPublic.post(
					'/api/users/logout-all',
					{},
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);
			}
		} catch (error) {
			console.error('Logout all error:', error);
		} finally {
			clearAuthData();
			navigate('/login');
		}
	};

	// Check if user is authenticated
	const isAuthenticated = !!user && !!accessToken;

	const value = {
		user,
		loading,
		accessToken,
		refreshToken,
		login,
		signup,
		logout,
		logoutAll,
		refreshAccessToken,
		isAuthenticated,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// hook to use the auth context
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
