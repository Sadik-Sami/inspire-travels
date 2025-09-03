import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import UserLayout from '@/components/Layout/UserLayout';
import Home from '@/pages/Home';
import AdminHome from '@/components/admin/AdminHome';
import { ThemeProvider } from '@/components/Theme/theme-provider';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Destinations from '@/pages/Destinations';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminDestinations from '@/pages/admin/AdminDestinations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddDestination from '@/pages/admin/AddDestination';
import EditDestination from '@/pages/admin/EditDestination';
import DestinationDetails from '@/pages/DestinationDetails';
import RoleBasedRoute from '@/components/rbac/RoleBasedRoute';
import { PERMISSIONS } from '@/config/rbac';
import AddBlog from '@/pages/admin/AddBlog';
import AdminBlogs from '@/pages/admin/AdminBlogs';
import Blogs from '@/pages/Blogs';
import BlogDetails from '@/pages/BlogDetails';
import EditBlog from '@/pages/admin/EditBlog';
import MyBookings from '@/pages/MyBookings';
import AdminBookings from '@/pages/admin/AdminBookings';
import AdminVisas from '@/pages/admin/AdminVisas';
import AddVisa from '@/pages/admin/AddVisa';
import EditVisa from '@/pages/admin/EditVisa';
import VisaPackages from '@/pages/VisaPackages';
import VisaDetails from '@/pages/VisaDetails';
import VisaBooking from '@/pages/VisaBooking';
import AdminInvoices from '@/pages/admin/AdminInvoices';
import CreateInvoice from '@/pages/admin/CreateInvoice';
import InvoiceDetailsPage from '@/components/admin/InvoiceDetailsPage';
import PrivateRoute from '@/routes/ProtectedRoute';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import NotFoundPage from '@/pages/NotFoundPage';
import InvoiceAnalytics from '@/pages/admin/InvoiceAnalytics';
import AdminContactInfo from '@/pages/admin/AdminContactInfo';
import Profile from '@/pages/Profile';
import ForgotPassword from '@/pages/ForgotPassword';
import AdminStaffs from '@/pages/admin/AdminStaffs';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminMessages from './pages/admin/AdminMessages';
import AdminGallery from './pages/admin/AdminGallery';
import AdminAbout from './pages/admin/AdminAbout';

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
						<Toaster expand closeButton richColors position='bottom-right' />
						<Routes>
							<Route path='/' element={<UserLayout />}>
								<Route index element={<Home />} />
								<Route path='about' element={<About />} />
								<Route path='contact' element={<Contact />} />
								<Route path='destinations' element={<Destinations />} />
								<Route path='destinations/:id' element={<DestinationDetails />} />
								<Route path='blogs' element={<Blogs />} />
								<Route path='blogs/:slug' element={<BlogDetails />} />
								<Route path='/visas' element={<VisaPackages />} />
								<Route path='/visas/details/:slug' element={<VisaDetails />} />
								<Route path='/visas/book/:slug' element={<VisaBooking />} />
								<Route path='login' element={<Login />} />
								<Route path='signup' element={<Signup />} />
								<Route path='forgot-password' element={<ForgotPassword />} />
								<Route
									path='/profile'
									element={
										<PrivateRoute>
											<Profile />
										</PrivateRoute>
									}
								/>
								<Route
									path='my-bookings'
									element={
										<PrivateRoute>
											<MyBookings />
										</PrivateRoute>
									}
								/>
							</Route>
							<Route
								path='/admin'
								element={
									<RoleBasedRoute
										requiredPermissions={[
											PERMISSIONS.VIEW_ALL_USERS,
											PERMISSIONS.MANAGE_CUSTOMERS,
											PERMISSIONS.MANAGE_DESTINATIONS,
											PERMISSIONS.MANAGE_INVOICES,
										]}>
										<AdminLayout />
									</RoleBasedRoute>
								}>
								<Route index element={<AdminHome />} />

								{/* User Management - Admin Only */}
								<Route
									path='users'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.VIEW_ALL_USERS]}>
											<AdminUsers />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='staffs'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_STAFF]}>
											<AdminStaffs />
										</RoleBasedRoute>
									}
								/>

								{/* Customer Management - Admin & Employee */}
								<Route
									path='customers'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.VIEW_CUSTOMERS]}>
											<AdminCustomers />
										</RoleBasedRoute>
									}
								/>

								{/* Destination Packages - Admin & Moderator */}
								<Route
									path='destinations'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_DESTINATIONS]}>
											<AdminDestinations />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='destinations/new'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_DESTINATIONS]}>
											<AddDestination />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='destinations/edit/:id'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_DESTINATIONS]}>
											<EditDestination />
										</RoleBasedRoute>
									}
								/>

								{/* Visa Packages - Admin & Moderator */}
								<Route
									path='visas'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_VISAS]}>
											<AdminVisas />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='visas/new'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_VISAS]}>
											<AddVisa />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='visas/edit/:id'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_VISAS]}>
											<EditVisa />
										</RoleBasedRoute>
									}
								/>

								{/* Blogs - Admin & Moderator */}
								<Route
									path='blogs'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_BLOGS]}>
											<AdminBlogs />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='blogs/new'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_BLOGS]}>
											<AddBlog />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='blogs/edit/:id'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_BLOGS]}>
											<EditBlog />
										</RoleBasedRoute>
									}
								/>

								{/* Bookings - Admin, Employee, Moderator */}
								<Route
									path='bookings'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.VIEW_BOOKINGS]}>
											<AdminBookings />
										</RoleBasedRoute>
									}
								/>

								{/* Invoices - Admin & Employee */}
								<Route
									path='invoices'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_INVOICES]}>
											<AdminInvoices />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='invoices/new'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_INVOICES]}>
											<CreateInvoice />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='invoices/analytics'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.VIEW_ANALYTICS]}>
											<InvoiceAnalytics />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='invoices/:id'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_INVOICES]}>
											<InvoiceDetailsPage />
										</RoleBasedRoute>
									}
								/>

								{/* Contact Info - Admin Only */}
								<Route
									path='contact-info'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_CONTACT_INFO]}>
											<AdminContactInfo />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='messages'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_MESSAGES]}>
											<AdminMessages />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='gallery'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_GALLERY]}>
											<AdminGallery />
										</RoleBasedRoute>
									}
								/>
								<Route
									path='about'
									element={
										<RoleBasedRoute requiredPermissions={[PERMISSIONS.MANAGE_ABOUT]}>
											<AdminAbout />
										</RoleBasedRoute>
									}
								/>
							</Route>
							{/* Error Pages */}
							<Route path='/access-denied' element={<AccessDeniedPage />} />
							<Route path='*' element={<NotFoundPage />} />
						</Routes>
					</AuthProvider>
				</BrowserRouter>
			</ThemeProvider>
		</QueryClientProvider>
	);
};

export default App;
