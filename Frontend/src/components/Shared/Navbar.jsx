import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '../Theme/theme-toggle';
import { Button } from '../ui/button';
import useAxiosSecure from '@/hooks/use-AxiosSecure';
import useRole from '@/hooks/use-Role';

const Navbar = () => {
	const { user, isAuthenticated, logout } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { isAdmin, isModerator, isEmployee, refetch } = useRole();

	useEffect(() => {
		if (isAuthenticated) {
			refetch();
		}
	}, [isAuthenticated, refetch]);
	// Close mobile menu when route changes
	useEffect(() => {
		setIsOpen(false);
	}, [location]);

	// Add shadow when scrolled
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const navVariants = {
		hidden: { y: -100, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				type: 'spring',
				stiffness: 100,
				damping: 20,
			},
		},
	};

	const linkVariants = {
		hidden: { opacity: 0, y: -10 },
		visible: (i) => ({
			opacity: 1,
			y: 0,
			transition: {
				delay: i * 0.1,
				duration: 0.5,
			},
		}),
	};

	const mobileMenuVariants = {
		hidden: { opacity: 0, height: 0 },
		visible: {
			opacity: 1,
			height: 'auto',
			transition: {
				duration: 0.3,
				when: 'beforeChildren',
				staggerChildren: 0.1,
			},
		},
		exit: {
			opacity: 0,
			height: 0,
			transition: {
				duration: 0.3,
				when: 'afterChildren',
				staggerChildren: 0.05,
				staggerDirection: -1,
			},
		},
	};

	const mobileItemVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: {
			opacity: 1,
			x: 0,
			transition: { duration: 0.3 },
		},
		exit: {
			opacity: 0,
			x: -20,
			transition: { duration: 0.2 },
		},
	};

	const navLinks = [
		{ name: 'Home', path: '/' },
		{ name: 'Destinations', path: '/destinations' },
		{ name: 'Visas', path: '/visas' },
		{ name: 'Blogs', path: '/blogs' },
		{ name: 'About', path: '/about' },
		{ name: 'Contact', path: '/contact' },
		isAuthenticated && { name: 'My Bookings', path: '/my-bookings' },
		(isAdmin || isEmployee || isModerator) && { name: 'Dashboard', path: '/admin' },
	].filter(Boolean);
	const isActive = (path) => location.pathname === path;

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<>
			<motion.header
				variants={navVariants}
				initial='hidden'
				animate='visible'
				className={`fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md ${
					scrolled ? 'shadow-md' : ''
				} transition-shadow duration-300`}>
				<div className='container mx-auto px-4'>
					<div className='flex items-center justify-between h-16'>
						{/* Logo */}
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}>
							<Link to='/' className='text-2xl font-bold text-primary'>
								Inspire Travels
							</Link>
						</motion.div>

						{/* Desktop Navigation */}
						<div className='hidden md:flex items-center space-x-1'>
							<nav className='flex items-center space-x-1 mr-4'>
								{navLinks.map((link, i) => (
									<motion.div
										key={link.path}
										custom={i}
										variants={linkVariants}
										initial='hidden'
										animate='visible'
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}>
										<Link
											to={link.path}
											className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
												isActive(link.path) ? 'bg-primary text-white' : 'hover:bg-content1'
											}`}>
											{link.name}
										</Link>
									</motion.div>
								))}
							</nav>
							<ThemeToggle />

							{isAuthenticated ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='ghost' className='relative h-8 w-8 rounded-full'>
											<Avatar className='h-8 w-8'>
												<AvatarImage src='/placeholder.svg?height=32&width=32' alt={user?.name || 'User'} />
												<AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className='w-56' align='end'>
										<div className='flex flex-col space-y-1 p-2'>
											<p className='text-sm font-medium leading-none'>{user?.name}</p>
											<p className='text-xs leading-none text-muted-foreground'>{user?.email}</p>
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link to='/profile' className='cursor-pointer'>
												<User className='mr-2 h-4 w-4' />
												<span>Profile</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
											<LogOut className='mr-2 h-4 w-4' />
											<span>Log out</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<div className='flex items-center space-x-2'>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Button variant='ghost' size='sm' asChild>
											<Link to='/login'>Log in</Link>
										</Button>
									</motion.div>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Button size='sm' className='bg-secondary hover:bg-secondary/90 text-secondary-foreground' asChild>
											<Link to='/signup'>Sign up</Link>
										</Button>
									</motion.div>
								</div>
							)}
						</div>

						{/* Mobile Menu Button */}
						<div className='flex items-center md:hidden space-x-4'>
							<ThemeToggle />
							<motion.button
								whileTap={{ scale: 0.9 }}
								onClick={() => setIsOpen(!isOpen)}
								className='p-2 rounded-md text-foreground hover:bg-content1'>
								{isOpen ? <X size={24} /> : <Menu size={24} />}
							</motion.button>
						</div>
					</div>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							variants={mobileMenuVariants}
							initial='hidden'
							animate='visible'
							exit='exit'
							className='md:hidden overflow-hidden bg-background border-t'>
							<div className='container mx-auto px-4 py-2'>
								<nav className='flex flex-col space-y-2 pb-4'>
									{navLinks.map((link) => (
										<motion.div key={link.path} variants={mobileItemVariants} whileTap={{ scale: 0.95 }}>
											<Link
												to={link.path}
												className={`block px-3 py-2 rounded-md text-base font-medium ${
													isActive(link.path) ? 'bg-primary text-primary-foreground' : 'hover:bg-content1'
												}`}>
												{link.name}
											</Link>
										</motion.div>
									))}

									{isAuthenticated ? (
										<>
											<motion.div variants={mobileItemVariants} whileTap={{ scale: 0.95 }}>
												<Link
													to='/profile'
													className='block px-3 py-2 rounded-md text-base font-medium hover:bg-content1'>
													<User className='inline-block mr-2 h-4 w-4' />
													Profile
												</Link>
											</motion.div>
											<motion.div variants={mobileItemVariants} whileTap={{ scale: 0.95 }}>
												<button
													onClick={handleLogout}
													className='w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-content1'>
													<LogOut className='inline-block mr-2 h-4 w-4' />
													Log out
												</button>
											</motion.div>
										</>
									) : (
										<>
											<motion.div variants={mobileItemVariants} className='pt-2'>
												<Button className='w-full' asChild>
													<Link to='/login'>Log in</Link>
												</Button>
											</motion.div>
											<motion.div variants={mobileItemVariants} className='pt-2'>
												<Button className='w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground' asChild>
													<Link to='/signup'>Sign up</Link>
												</Button>
											</motion.div>
										</>
									)}
								</nav>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.header>
			{/* Spacer to prevent content from hiding behind fixed navbar */}
			<div className='h-16'></div>
		</>
	);
};

export default Navbar;
