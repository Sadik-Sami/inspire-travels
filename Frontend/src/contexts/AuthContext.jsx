import useAxiosPublic from '@/hooks/use-AxiosPublic';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const axiosPublic = useAxiosPublic();

	// Check if user is already logged in on mount
	useEffect(() => {
		const checkLoggedIn = async () => {
			try {
				// Check if there's a token in localStorage
				const token = localStorage.getItem('token');

				if (token) {
					// later verify the token from backend
					// For now, just getting the user data from localStorage
					const userData = JSON.parse(localStorage.getItem('user'));
					setUser(userData);
				}
			} catch (error) {
				console.error('Authentication error:', error);
				localStorage.removeItem('token');
				localStorage.removeItem('user');
			} finally {
				setLoading(false);
			}
		};

		checkLoggedIn();
	}, []);

	// Login function
	const login = async (email, password) => {
		setLoading(true);
		try {
			const { data } = await axiosPublic.post('/api/users/login', { email, password });
			console.log(data);
			if (!data.success) return { success: false };

			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));

			setUser(data.user);
			return { success: true };
		} catch (error) {
			console.error('Login error:', error);
			return {
				success: false,
				error: error.message || 'Failed to login. Please try again.',
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
			console.log(data);
			if (!data.success) return { success: false };

			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));

			setUser(data.user);
			return { success: true };
		} catch (error) {
			console.error('Signup error:', error);
			return {
				success: false,
				error: error.message || 'Failed to create account. Please try again.',
			};
		} finally {
			setLoading(false);
		}
	};

	// Logout function
	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setUser(null);
		navigate('/login');
	};

	// Check if user is authenticated
	const isAuthenticated = !!user;

	const value = {
		user,
		loading,
		login,
		signup,
		logout,
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
