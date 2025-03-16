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

const App = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
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
								<Route path='login' element={<Login />} />
								<Route path='signup' element={<Signup />} />
							</Route>
							<Route path='/admin' element={<AdminLayout />}>
								<Route index element={<AdminHome />} />
								<Route path='users' element={<AdminUsers />} />
								<Route path='destinations' element={<AdminDestinations />} />
								<Route path='destinations/new' element={<AddDestination />} />
							</Route>
						</Routes>
					</AuthProvider>
				</BrowserRouter>
			</ThemeProvider>
		</QueryClientProvider>
	);
};

export default App;
