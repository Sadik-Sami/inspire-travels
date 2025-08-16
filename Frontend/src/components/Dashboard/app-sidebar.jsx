import * as React from 'react';
import { FaUserGroup } from 'react-icons/fa6';
import { PiUsersThreeFill, PiBookOpenFill, PiCurrencyDollarFill } from 'react-icons/pi';
import { IoDocuments } from 'react-icons/io5';
import { FaHome } from 'react-icons/fa';
import { MdTravelExplore } from 'react-icons/md';
import { GraduationCapIcon, ChevronRight, Lock } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ThemeToggle } from '../Theme/theme-toggle';
import useRole from '@/hooks/use-Role';
import { getAccessibleNavigation } from '@/config/rbac';
import RoleIndicator from '../rbac/RoleIndicator';

// Icon mapping
const iconMap = {
	PiUsersThreeFill,
	MdTravelExplore,
	PiBookOpenFill,
	PiCurrencyDollarFill,
	IoDocuments,
	FaUserGroup,
};

export function AppSidebar({ ...props }) {
	const { user } = useAuth();
	const { role } = useRole();

	// Get navigation items accessible to current user role
	const accessibleNavigation = React.useMemo(() => {
		return getAccessibleNavigation(role);
	}, [role]);

	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader className='py-'>
				<SidebarMenu>
					<SidebarMenuItem>
						<NavLink to='/admin'>
							<SidebarMenuButton
								size='lg'
								className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
								<div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
									<GraduationCapIcon className='size-6' />
								</div>
								<div className='flex flex-col leading-tight'>
									<span className='truncate font-medium'>Inspire Travels</span>
									<RoleIndicator role={role} showDescription size='sm' />
								</div>
							</SidebarMenuButton>
						</NavLink>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel>Platform</SidebarGroupLabel>
					<SidebarMenu>
						{accessibleNavigation.navMain.map((item) => {
							const IconComponent = iconMap[item.icon];

							return (
								<Collapsible key={item.title} asChild defaultOpen className='group/collapsible'>
									<SidebarMenuItem>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton>
												{IconComponent && <IconComponent />}
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
							);
						})}
					</SidebarMenu>
				</SidebarGroup>

				{/* Settings */}
				{accessibleNavigation.settings.length > 0 && (
					<SidebarGroup className='group-data-[collapsible=icon]:hidden'>
						<SidebarGroupLabel>Settings</SidebarGroupLabel>
						<SidebarMenu>
							{accessibleNavigation.settings.map((item) => {
								const IconComponent = iconMap[item.icon];

								return (
									<SidebarMenuItem key={item.name}>
										<SidebarMenuButton asChild>
											<NavLink to={item.url}>
												{IconComponent && <IconComponent />}
												<span>{item.name}</span>
											</NavLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroup>
				)}

				{/* Home Link */}
				<NavLink to='/'>
					<SidebarMenuButton className='pl-4 mx-auto'>
						<FaHome />
						Home
					</SidebarMenuButton>
				</NavLink>

				{/* Restricted Access Indicator */}
				{role === 'admin' ? (
					<div></div>
				) : (
					<SidebarGroup className='px-2 py-2 group-data-[collapsible=icon]:hidden'>
						<div className='text-xs text-muted-foreground text-center p-2 bg-muted rounded-md'>
							<Lock className='h-3 w-3 mx-auto mb-1' />
							<p>Access limited by role</p>
						</div>
					</SidebarGroup>
				)}
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem className='flex items-center'>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<Avatar className='h-8 w-8 rounded-lg'>
								<AvatarImage src={user?.profileImage?.url || '/placeholder.svg'} alt={user?.name} />
								<AvatarFallback className='rounded-lg'>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>{user?.name}</span>
								<span className='truncate text-xs'>{user?.email}</span>
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
