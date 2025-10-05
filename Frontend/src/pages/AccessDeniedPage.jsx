import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import useRole from '@/hooks/use-Role';
import RoleIndicator from '@/components/rbac/RoleIndicator';
import { PERMISSIONS } from '@/config/rbac';

const AccessDeniedPage = ({ requiredPermissions = [], userRole = null }) => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { role } = useRole();
	const currentRole = userRole || role;

	const getPermissionDescription = (permission) => {
		const descriptions = {
			[PERMISSIONS.VIEW_ALL_USERS]: 'View all users',
			[PERMISSIONS.MANAGE_USERS]: 'Manage user accounts',
			[PERMISSIONS.MANAGE_STAFF]: 'Manage staff members',
			[PERMISSIONS.MANAGE_DESTINATIONS]: 'Manage destination packages',
			[PERMISSIONS.MANAGE_VISAS]: 'Manage visa packages',
			[PERMISSIONS.MANAGE_BLOGS]: 'Manage blog content',
			[PERMISSIONS.VIEW_BOOKINGS]: 'View booking information',
			[PERMISSIONS.MANAGE_INVOICES]: 'Manage invoices',
			[PERMISSIONS.VIEW_ANALYTICS]: 'View analytics and reports',
			[PERMISSIONS.MANAGE_CONTACT_INFO]: 'Manage contact information',
			[PERMISSIONS.SYSTEM_SETTINGS]: 'Access system settings',
		};
		return descriptions[permission] || permission;
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4'>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className='w-full max-w-md'>
				<Card className='border-red-200 dark:border-red-800'>
					<CardHeader className='text-center'>
						<motion.div
							initial={{ rotate: 0 }}
							animate={{ rotate: [0, -10, 10, -10, 0] }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className='mx-auto mb-4'>
							<div className='relative'>
								<Shield className='h-16 w-16 text-red-500 mx-auto' />
								<AlertTriangle className='h-6 w-6 text-orange-500 absolute -top-1 -right-1' />
							</div>
						</motion.div>

						<CardTitle className='text-2xl font-bold text-red-700 dark:text-red-400'>Access Denied</CardTitle>

						<CardDescription className='text-red-600 dark:text-red-300'>
							You don't have permission to access this resource
						</CardDescription>
					</CardHeader>

					<CardContent className='space-y-6'>
						{/* Current User Info */}
						<div className='bg-gray-50 dark:bg-gray-900 rounded-lg p-4'>
							<div className='flex items-center justify-between mb-2'>
								<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Current User:</span>
								<RoleIndicator role={currentRole} size='sm' />
							</div>
							<p className='text-sm text-gray-600 dark:text-gray-400'>
								{user?.name} ({user?.email})
							</p>
						</div>

						{/* Required Permissions */}
						{requiredPermissions.length > 0 && (
							<div className='bg-red-50 dark:bg-red-950/30 rounded-lg p-4'>
								<h4 className='text-sm font-medium text-red-800 dark:text-red-300 mb-2'>Required Permissions:</h4>
								<ul className='space-y-1'>
									{requiredPermissions.map((permission, index) => (
										<li key={index} className='text-xs text-red-700 dark:text-red-400 flex items-center'>
											<span className='w-1.5 h-1.5 bg-red-400 rounded-full mr-2'></span>
											{getPermissionDescription(permission)}
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Role Information */}
						<div className='bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4'>
							<h4 className='text-sm font-medium text-blue-800 dark:text-blue-300 mb-2'>Need Access?</h4>
							<p className='text-xs text-blue-700 dark:text-blue-400'>
								Contact your administrator to request the necessary permissions for your role.
							</p>
						</div>

						{/* Action Buttons */}
						<div className='flex flex-col gap-3'>
							<Button onClick={() => navigate(-1)} variant='outline' className='w-full'>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Go Back
							</Button>

							<Button onClick={() => navigate('/')} className='w-full'>
								<Home className='h-4 w-4 mr-2' />
								Return Home
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
};

export default AccessDeniedPage;
