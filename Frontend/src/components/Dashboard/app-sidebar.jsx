import * as React from 'react';
import { ArrowLeftSquare, BookOpen, Bot, Frame, GalleryVerticalEnd, PieChart, Settings2 } from 'lucide-react';
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

const data = {
	user: {
		name: 'shadcn',
		email: 'm@example.com',
		avatar: '/avatars/shadcn.jpg',
	},
	navMain: [
		{
			title: 'Users Management',
			url: '#',
			icon: Settings2,
			isActive: true,
			items: [
				{
					title: 'All Users',
					url: '/admin/users',
				},
				{
					title: 'Add User',
					url: '/add-user',
				},
			],
		},
		{
			title: 'Destinations',
			url: '#',
			icon: Bot,
			items: [
				{
					title: 'All Destinations',
					url: '/admin/destinations',
				},
				{
					title: 'Add Destinations',
					url: '/admin/destinations/new',
				},
			],
		},
		{
			title: 'Blogs',
			url: '#',
			icon: BookOpen,
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
	],
	settings: [
		{
			name: 'Hero Banner',
			url: '/banner-edit',
			icon: Frame,
		},
		{
			name: 'Contact Information',
			url: '/contact-edit',
			icon: PieChart,
		},
		{
			name: 'Image Gallery',
			url: '/gallery-edit',
			icon: GalleryVerticalEnd,
		},
	],
};

export function AppSidebar({ ...props }) {
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
						<ArrowLeftSquare />
						Home
					</SidebarMenuButton>
				</NavLink>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
