import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	sendPasswordResetEmail,
	onAuthStateChanged,
	updateProfile,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import useAxiosPublic from '@/hooks/use-AxiosPublic';
import { toast } from 'sonner';

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	// Memory-only state for full user data (including sensitive info)
	const [user, setUser] = useState(null);
	const [firebaseUser, setFirebaseUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [accessToken, setAccessToken] = useState(null);
	const navigate = useNavigate();
	const axiosPublic = useAxiosPublic();

	// Function to sync Firebase user with backend
	const syncUserWithBackend = async (firebaseUser, additionalData = {}) => {
		setLoading(true);
		try {
			const idToken = await firebaseUser.getIdToken();
			const { data } = await axiosPublic.post(
				'/api/users/firebase-auth',
				{
					...additionalData,
				},
				{
					headers: {
						Authorization: `Bearer ${idToken}`,
					},
					withCredentials: true,
				}
			);

			if (data.success) {
				// Store ONLY minimal, non-sensitive data in localStorage
				const minimalUserData = {
					_id: data.user._id,
					name: data.user.name,
					email: data.user.email,
					profileImage: data.user.profileImage,
					// NO sensitive data: role, passportNumber, phone, address
				};

				// Store minimal data in localStorage and access token
				localStorage.setItem('accessToken', data.accessToken);
				localStorage.setItem('user', JSON.stringify(minimalUserData));

				// Store FULL user data in memory-only state (secure)
				setUser(data.user);
				setAccessToken(data.accessToken);

				return { success: true, user: data.user };
			}

			return { success: false };
		} catch (error) {
			console.error('Error syncing user with backend:', error);
			return {
				success: false,
				error: error.response?.data?.message || error.message || 'Failed to authenticate with server',
			};
		} finally {
			setLoading(false);
		}
	};

	// Function to fetch full user data from server (when needed)
	const fetchUserData = async () => {
		try {
			const currentAccessToken = accessToken || localStorage.getItem('accessToken');

			if (!currentAccessToken) {
				return null;
			}

			const { data } = await axiosPublic.get('/api/users/profile', {
				headers: {
					Authorization: `Bearer ${currentAccessToken}`,
				},
				withCredentials: true,
			});

			if (data) {
				// Update memory-only state with full user data
				setUser(data);
				return data;
			}
		} catch (error) {
			console.error('Error fetching user data:', error);
			// If token is invalid, clear auth data
			if (error.response?.status === 401) {
				clearAuthData();
			}
			return null;
		}
	};

	// Check if user is already logged in on mount
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setLoading(true);
			setFirebaseUser(currentUser);

			try {
				if (currentUser?.email) {
					// Check if we have minimal user data in localStorage
					const storedUser = localStorage.getItem('user');
					const storedToken = localStorage.getItem('accessToken');

					if (storedUser && storedToken) {
						// Set minimal data from localStorage for immediate UI rendering
						const minimalUser = JSON.parse(storedUser);
						setUser(minimalUser); // Temporary minimal data
						setAccessToken(storedToken);

						// Fetch full user data in background (including role, passport, etc.)
						const fullUserData = await fetchUserData();
						if (fullUserData) {
							console.log(fullUserData);
							setUser(fullUserData); // Replace with full data
						}
					} else {
						// No stored data, sync with backend
						await syncUserWithBackend(currentUser);
					}
				} else {
					clearAuthData();
				}
			} catch (error) {
				console.error('Error in auth state change:', error);
				clearAuthData();
			} finally {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, []);

	// Helper to clear all auth data
	const clearAuthData = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('user');
		setUser(null);
		setAccessToken(null);
	};

	// Email/Password Signup
	const signup = async (name, email, phone, password, address = '') => {
		setLoading(true);
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			await updateProfile(userCredential.user, { displayName: name });

			const result = await syncUserWithBackend(userCredential.user, { name, phone, address });

			if (result.success) {
				toast.success('Account created successfully!');
			}
			return result;
		} catch (error) {
			console.error('Signup error:', error);
			let errorMessage = 'Failed to create account. Please try again.';

			if (error.code === 'auth/email-already-in-use') {
				errorMessage = 'Email is already in use. Please use a different email or try logging in.';
			} else if (error.code === 'auth/weak-password') {
				errorMessage = 'Password is too weak. Please use a stronger password.';
			} else if (error.code === 'auth/invalid-email') {
				errorMessage = 'Invalid email address. Please check and try again.';
			}

			return {
				success: false,
				error: errorMessage,
			};
		} finally {
			setLoading(false);
		}
	};

	// Email/Password Login
	const login = async (email, password) => {
		setLoading(true);
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const result = await syncUserWithBackend(userCredential.user);

			if (result.success) {
				toast.success('Logged in successfully!');
			}

			return result;
		} catch (error) {
			console.error('Login error:', error);
			let errorMessage = 'Failed to login. Please check your credentials and try again.';

			if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
				errorMessage = 'Invalid email or password. Please try again.';
			} else if (error.code === 'auth/too-many-requests') {
				errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
			}

			return {
				success: false,
				error: errorMessage,
			};
		} finally {
			setLoading(false);
		}
	};

	// Google Login
	const googleLogin = async () => {
		setLoading(true);
		try {
			const provider = new GoogleAuthProvider();
			const userCredential = await signInWithPopup(auth, provider);

			const result = await syncUserWithBackend(userCredential.user);

			if (result.success) {
				toast.success('Logged in with Google successfully!');
			}

			return result;
		} catch (error) {
			console.error('Google login error:', error);
			return {
				success: false,
				error: error.message || 'Failed to login with Google. Please try again.',
			};
		} finally {
			setLoading(false);
		}
	};

	// Password Reset
	const resetPassword = async (email) => {
		try {
			await sendPasswordResetEmail(auth, email);
			toast.success('Password reset email sent! Check your inbox.');
			return { success: true };
		} catch (error) {
			console.error('Password reset error:', error);
			let errorMessage = 'Failed to send password reset email. Please try again.';

			if (error.code === 'auth/user-not-found') {
				errorMessage = 'No account found with this email address.';
			} else if (error.code === 'auth/invalid-email') {
				errorMessage = 'Invalid email address. Please check and try again.';
			}

			return {
				success: false,
				error: errorMessage,
			};
		}
	};

	// Update user profile
	const updateUserProfile = async (profileData) => {
		try {
			const currentAccessToken = accessToken || localStorage.getItem('accessToken');

			if (!currentAccessToken) {
				throw new Error('No access token available');
			}

			const { data } = await axiosPublic.put('/api/users/profile', profileData, {
				headers: {
					Authorization: `Bearer ${currentAccessToken}`,
				},
				withCredentials: true,
			});

			if (data.success) {
				// Update memory-only state with full user data
				setUser(data.user);

				// Update ONLY minimal data in localStorage
				const minimalUserData = {
					_id: data.user._id,
					name: data.user.name,
					email: data.user.email,
					profileImage: data.user.profileImage,
				};
				localStorage.setItem('user', JSON.stringify(minimalUserData));

				toast.success('Profile updated successfully!');
				return { success: true, user: data.user };
			}

			return { success: false };
		} catch (error) {
			console.error('Profile update error:', error);
			return {
				success: false,
				error: error.response?.data?.message || error.message || 'Failed to update profile',
			};
		}
	};

	// Upload profile image
	const uploadProfileImage = async (imageFile) => {
		try {
			const currentAccessToken = accessToken || localStorage.getItem('accessToken');

			if (!currentAccessToken) {
				throw new Error('No access token available');
			}

			const formData = new FormData();
			formData.append('profileImage', imageFile);

			const { data } = await axiosPublic.post('/api/users/upload-profile-image', formData, {
				headers: {
					Authorization: `Bearer ${currentAccessToken}`,
					'Content-Type': 'multipart/form-data',
				},
				withCredentials: true,
			});

			if (data.success) {
				// Update memory-only state
				const updatedUser = { ...user, profileImage: data.profileImage };
				setUser(updatedUser);

				// Update minimal data in localStorage
				const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
				const updatedMinimalUser = { ...storedUser, profileImage: data.profileImage };
				localStorage.setItem('user', JSON.stringify(updatedMinimalUser));

				toast.success('Profile image updated successfully!');
				return { success: true, profileImage: data.profileImage };
			}

			return { success: false, error: data.message || 'Failed to upload image' };
		} catch (error) {
			console.error('Profile image upload error:', error);
			return {
				success: false,
				error: error.response?.data?.message || error.message || 'Failed to upload profile image',
			};
		}
	};

	// Delete profile image
	const deleteProfileImage = async () => {
		try {
			const currentAccessToken = accessToken || localStorage.getItem('accessToken');

			if (!currentAccessToken) {
				throw new Error('No access token available');
			}

			const { data } = await axiosPublic.delete('/api/users/delete-profile-image', {
				headers: {
					Authorization: `Bearer ${currentAccessToken}`,
				},
				withCredentials: true,
			});

			if (data.success) {
				// Update memory-only state
				const updatedUser = { ...user, profileImage: { url: '', publicId: '' } };
				setUser(updatedUser);

				// Update minimal data in localStorage
				const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
				const updatedMinimalUser = { ...storedUser, profileImage: { url: '', publicId: '' } };
				localStorage.setItem('user', JSON.stringify(updatedMinimalUser));

				toast.success('Profile image deleted successfully!');
				return { success: true };
			}

			return { success: false, error: data.message || 'Failed to delete image' };
		} catch (error) {
			console.error('Profile image deletion error:', error);
			return {
				success: false,
				error: error.response?.data?.message || error.message || 'Failed to delete profile image',
			};
		}
	};

	// Logout function
	const logout = async () => {
		try {
			const currentAccessToken = accessToken || localStorage.getItem('accessToken');

			if (currentAccessToken) {
				await axiosPublic.post(
					'/api/users/logout',
					{},
					{
						headers: {
							Authorization: `Bearer ${currentAccessToken}`,
						},
						withCredentials: true,
					}
				);
			}

			await signOut(auth);
			toast.success('Logged out successfully!');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			clearAuthData();
			navigate('/login');
		}
	};

	// Check if user is authenticated
	const isAuthenticated = !!user && !!accessToken;

	const value = {
		user,
		firebaseUser,
		loading,
		accessToken,
		login,
		signup,
		googleLogin,
		logout,
		resetPassword,
		updateUserProfile,
		uploadProfileImage,
		deleteProfileImage,
		fetchUserData,
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
