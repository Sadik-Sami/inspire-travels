import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminLayout from './components/Admin/AdminLayout';
import UserLayout from './components/Layout/UserLayout';
import Home from './pages/Home';
import AdminHome from './components/Admin/AdminHome';
import { ThemeProvider } from './components/Theme/theme-provider';
import About from './pages/About';
import Contact from './pages/Contact';
import Destinations from './pages/Destinations';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDestinations from './pages/admin/AdminDestinations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddDestination from './pages/admin/AddDestination';
import EditDestination from './pages/admin/EditDestination';
import DestinationDetails from './pages/DestinationDetails';
import AdminRoute from './routes/AdminRoute';
import AddBlog from './pages/admin/AddBlog';
import AdminBlogs from './pages/admin/AdminBlogs';
import Blogs from './pages/Blogs';
import BlogDetails from './pages/BlogDetails';
import EditBlog from './pages/admin/EditBlog';
import MyBookings from './pages/MyBookings';
import AdminBookings from './pages/admin/AdminBookings';

const App = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5,
				retry: 1,
			},
		},
	});
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
				<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
					<AuthProvider>
						<Toaster richColors position='top-right' />
						<Routes>
							<Route path='/' element={<UserLayout />}>
								<Route index element={<Home />} />
								<Route path='about' element={<About />} />
								<Route path='contact' element={<Contact />} />
								<Route path='destinations' element={<Destinations />} />
								<Route path='destinations/:id' element={<DestinationDetails />} />
								<Route path='blogs' element={<Blogs />} />
								<Route path='blogs/:slug' element={<BlogDetails />} />
								<Route path='login' element={<Login />} />
								<Route path='signup' element={<Signup />} />
								<Route path='my-bookings' element={<MyBookings />} />
							</Route>
							<Route
								path='/admin'
								element={
									<AdminRoute>
										<AdminLayout />
									</AdminRoute>
								}>
								<Route index element={<AdminHome />} />
								<Route path='users' element={<AdminUsers />} />
								<Route path='destinations' element={<AdminDestinations />} />
								<Route path='destinations/new' element={<AddDestination />} />
								<Route path='destinations/edit/:id' element={<EditDestination />} />
								<Route path='blogs' element={<AdminBlogs />} />
								<Route path='blogs/new' element={<AddBlog />} />
								<Route path='blogs/edit/:id' element={<EditBlog />} />
								<Route path='bookings' element={<AdminBookings />} />
							</Route>
						</Routes>
					</AuthProvider>
				</BrowserRouter>
			</ThemeProvider>
		</QueryClientProvider>
	);
};

export default App;
