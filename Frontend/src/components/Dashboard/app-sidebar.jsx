import * as React from 'react';
import { FaUserGroup } from 'react-icons/fa6';
import { PiUsersThreeFill, PiBookOpenFill, PiCurrencyDollarFill } from 'react-icons/pi';
import { IoDocuments } from 'react-icons/io5';
import { FaHome } from 'react-icons/fa';
import { MdTravelExplore } from 'react-icons/md';
import { GraduationCapIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenuButton,
	SidebarRail,
	SidebarMenu,
	SidebarMenuItem,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ThemeToggle } from '../Theme/theme-toggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

const data = {
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
	console.log(user);
	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<NavLink to='/admin'>
							<SidebarMenuButton
								size='lg'
								className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
								<div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
									<GraduationCapIcon className='size-4' />
								</div>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>Inspire Travels</span>
									<span className='truncate text-xs'>Dashboard</span>
								</div>
							</SidebarMenuButton>
						</NavLink>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Platform</SidebarGroupLabel>
					<SidebarMenu>
						{data.navMain.map((item) => (
							<Collapsible key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton tooltip={item.title}>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
											<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild>
														<NavLink to={subItem.url}>
															<span>{subItem.title}</span>
														</NavLink>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						))}
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup className='group-data-[collapsible=icon]:hidden'>
					<SidebarGroupLabel>Settings</SidebarGroupLabel>
					<SidebarMenu>
						{data.settings.map((item) => (
							<SidebarMenuItem key={item.name}>
								<SidebarMenuButton asChild>
									<NavLink to={item.url}>
										<item.icon />
										<span>{item.name}</span>
									</NavLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
				<NavLink to='/'>
					<SidebarMenuButton className='pl-4 mx-auto'>
						<FaHome />
						Home
					</SidebarMenuButton>
				</NavLink>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem className='flex items-center'>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<Avatar className='h-8 w-8 rounded-lg'>
								<AvatarImage src={user?.profileImage?.url} alt={user.name} />
								<AvatarFallback className='rounded-lg'>{user?.name?.charAt(0) || U}</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>{user.name}</span>
								<span className='truncate text-xs'>{user.email}</span>
							</div>
						</SidebarMenuButton>
						<ThemeToggle />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
