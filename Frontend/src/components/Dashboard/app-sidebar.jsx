import * as React from 'react';
import { FaUserGroup } from 'react-icons/fa6';
import { PiUsersThreeFill, PiBookOpenFill, PiCurrencyDollarFill } from 'react-icons/pi';
import { IoDocuments } from 'react-icons/io5';
import { FaHome } from 'react-icons/fa';
import { MdTravelExplore } from 'react-icons/md';
import { NavMain } from '@/components/Dashboard/nav-main';
import { NavSettings } from '@/components/Dashboard/nav-settings';
import { NavUser } from '@/components/Dashboard/nav-user';
import { NavHeader } from '@/components/Dashboard/nav-header';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenuButton,
	SidebarRail,
} from '@/components/ui/sidebar';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const data = {
	user: {
		name: 'shadcn',
		email: 'm@example.com',
		avatar: '/avatars/shadcn.jpg',
	},
	navMain: [
		{
			title: 'Users & Invoices',
			url: '#',
			icon: PiUsersThreeFill,
			isActive: true,
			items: [
				{
					title: 'All Users',
					url: '/admin/users',
				},
				{
					title: 'Create Invoice',
					url: '/admin/invoices/new',
				},
			],
		},
		{
			title: 'Packages',
			url: '#',
			icon: MdTravelExplore,
			items: [
				{
					title: 'Destination Packages',
					url: '/admin/destinations',
				},
				{
					title: 'Visa Packages',
					url: '/admin/visas',
				},
			],
		},
		{
			title: 'Blogs',
			url: '#',
			icon: PiBookOpenFill,
			items: [
				{
					title: 'All Blogs',
					url: '/admin/blogs',
				},
				{
					title: 'Add Blogs',
					url: '/admin/blogs/new',
				},
			],
		},
		{
			title: 'Financials',
			url: '#',
			icon: PiCurrencyDollarFill,
			items: [
				{
					title: 'Bookings',
					url: '/admin/bookings',
				},
				{
					title: 'Invoices',
					url: '/admin/invoices',
				},
				{
					title: 'Insights',
					url: '/admin/invoices/analytics',
				},
			],
		},
	],
	settings: [
		{
			name: 'Contacts & Info',
			url: '/admin/contact-info',
			icon: IoDocuments,
		},
		{
			name: 'Staff Management',
			url: '/admin/staffs',
			icon: FaUserGroup,
		},
	],
};

export function AppSidebar({ ...props }) {
	const { user } = useAuth();
	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<NavHeader teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSettings settings={data.settings} />
				<NavLink to='/'>
					<SidebarMenuButton className='pl-4 mx-auto'>
						<FaHome />
						Home
					</SidebarMenuButton>
				</NavLink>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
