// Role-Based Access Control Configuration
export const ROLES = {
	ADMIN: 'admin',
	MODERATOR: 'moderator',
	EMPLOYEE: 'employee',
	CUSTOMER: 'customer',
};

export const PERMISSIONS = {
	// User Management
	VIEW_ALL_USERS: 'view_all_users',
	MANAGE_USERS: 'manage_users',
	MANAGE_STAFF: 'manage_staff',

	// Content Management
	MANAGE_DESTINATIONS: 'manage_destinations',
	MANAGE_VISAS: 'manage_visas',
	MANAGE_BLOGS: 'manage_blogs',

	// Financial Management
	VIEW_BOOKINGS: 'view_bookings',
	MANAGE_INVOICES: 'manage_invoices',
	VIEW_ANALYTICS: 'view_analytics',

	// System Settings
	MANAGE_CONTACT_INFO: 'manage_contact_info',
	SYSTEM_SETTINGS: 'system_settings',
};

export const ROLE_PERMISSIONS = {
	[ROLES.ADMIN]: [
		// Full access to everything
		PERMISSIONS.VIEW_ALL_USERS,
		PERMISSIONS.MANAGE_USERS,
		PERMISSIONS.MANAGE_STAFF,
		PERMISSIONS.MANAGE_DESTINATIONS,
		PERMISSIONS.MANAGE_VISAS,
		PERMISSIONS.MANAGE_BLOGS,
		PERMISSIONS.VIEW_BOOKINGS,
		PERMISSIONS.MANAGE_INVOICES,
		PERMISSIONS.VIEW_ANALYTICS,
		PERMISSIONS.MANAGE_CONTACT_INFO,
		PERMISSIONS.SYSTEM_SETTINGS,
	],

	[ROLES.MODERATOR]: [
		// Content management focused
		PERMISSIONS.MANAGE_DESTINATIONS,
		PERMISSIONS.MANAGE_VISAS,
		PERMISSIONS.MANAGE_BLOGS,
		PERMISSIONS.VIEW_BOOKINGS,
	],

	[ROLES.EMPLOYEE]: [
		// Financial operations focused
		PERMISSIONS.VIEW_BOOKINGS,
		PERMISSIONS.MANAGE_INVOICES,
		PERMISSIONS.VIEW_ANALYTICS,
	],

	[ROLES.CUSTOMER]: [
		// No admin permissions
	],
};

// Navigation items with required permissions
export const NAVIGATION_CONFIG = {
	navMain: [
		{
			title: 'Users & Management',
			icon: 'PiUsersThreeFill',
			requiredPermissions: [PERMISSIONS.VIEW_ALL_USERS],
			items: [
				{
					title: 'All Users',
					url: '/admin/users',
					requiredPermissions: [PERMISSIONS.VIEW_ALL_USERS],
				},
				{
					title: 'Staff Management',
					url: '/admin/staffs',
					requiredPermissions: [PERMISSIONS.MANAGE_STAFF],
				},
			],
		},
		{
			title: 'Content Management',
			icon: 'MdTravelExplore',
			requiredPermissions: [PERMISSIONS.MANAGE_DESTINATIONS, PERMISSIONS.MANAGE_VISAS, PERMISSIONS.MANAGE_BLOGS],
			items: [
				{
					title: 'Destination Packages',
					url: '/admin/destinations',
					requiredPermissions: [PERMISSIONS.MANAGE_DESTINATIONS],
				},
				{
					title: 'Visa Packages',
					url: '/admin/visas',
					requiredPermissions: [PERMISSIONS.MANAGE_VISAS],
				},
				{
					title: 'All Blogs',
					url: '/admin/blogs',
					requiredPermissions: [PERMISSIONS.MANAGE_BLOGS],
				},
				{
					title: 'Add Blog',
					url: '/admin/blogs/new',
					requiredPermissions: [PERMISSIONS.MANAGE_BLOGS],
				},
			],
		},
		{
			title: 'Financial Operations',
			icon: 'PiCurrencyDollarFill',
			requiredPermissions: [PERMISSIONS.VIEW_BOOKINGS, PERMISSIONS.MANAGE_INVOICES],
			items: [
				{
					title: 'Bookings',
					url: '/admin/bookings',
					requiredPermissions: [PERMISSIONS.VIEW_BOOKINGS],
				},
				{
					title: 'All Invoices',
					url: '/admin/invoices',
					requiredPermissions: [PERMISSIONS.MANAGE_INVOICES],
				},
				{
					title: 'Create Invoice',
					url: '/admin/invoices/new',
					requiredPermissions: [PERMISSIONS.MANAGE_INVOICES],
				},
				{
					title: 'Analytics',
					url: '/admin/invoices/analytics',
					requiredPermissions: [PERMISSIONS.VIEW_ANALYTICS],
				},
			],
		},
	],
	settings: [
		{
			name: 'Contact Info',
			url: '/admin/contact-info',
			icon: 'IoDocuments',
			requiredPermissions: [PERMISSIONS.MANAGE_CONTACT_INFO],
		},
	],
};

// Helper function to check if user has permission
export const hasPermission = (userRole, requiredPermissions) => {
	if (!userRole || !requiredPermissions) return false;

	const userPermissions = ROLE_PERMISSIONS[userRole] || [];

	// If requiredPermissions is an array, user needs at least one permission
	if (Array.isArray(requiredPermissions)) {
		return requiredPermissions.some((permission) => userPermissions.includes(permission));
	}

	// If single permission, check if user has it
	return userPermissions.includes(requiredPermissions);
};

// Get accessible navigation items for user role
export const getAccessibleNavigation = (userRole) => {
	const accessibleNav = {
		navMain: [],
		settings: [],
	};

	// Filter main navigation
	NAVIGATION_CONFIG.navMain.forEach((section) => {
		if (hasPermission(userRole, section.requiredPermissions)) {
			const accessibleItems = section.items.filter((item) => hasPermission(userRole, item.requiredPermissions));

			if (accessibleItems.length > 0) {
				accessibleNav.navMain.push({
					...section,
					items: accessibleItems,
				});
			}
		}
	});

	// Filter settings
	accessibleNav.settings = NAVIGATION_CONFIG.settings.filter((item) =>
		hasPermission(userRole, item.requiredPermissions)
	);

	return accessibleNav;
};

// Role display configuration
export const ROLE_CONFIG = {
	[ROLES.ADMIN]: {
		label: 'Administrator',
		color: 'bg-red-100 text-red-800 border-red-200',
		description: 'Full system access',
		badge: '👑',
	},
	[ROLES.MODERATOR]: {
		label: 'Content Moderator',
		color: 'bg-blue-100 text-blue-800 border-blue-200',
		description: 'Content management access',
		badge: '📝',
	},
	[ROLES.EMPLOYEE]: {
		label: 'Financial Staff',
		color: 'bg-green-100 text-green-800 border-green-200',
		description: 'Invoice and booking access',
		badge: '💰',
	},
	[ROLES.CUSTOMER]: {
		label: 'Customer',
		color: 'bg-gray-100 text-gray-800 border-gray-200',
		description: 'Basic user access',
		badge: '👤',
	},
};
