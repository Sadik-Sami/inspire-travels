import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from '../Theme/theme-toggle';

export function NavUser({ user }) {
	return (
		<SidebarMenu>
			<SidebarMenuItem className='flex items-center'>
				<SidebarMenuButton
					size='lg'
					className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
					<Avatar className='h-8 w-8 rounded-lg'>
						<AvatarImage src={user.avatar} alt={user.name} />
						<AvatarFallback className='rounded-lg'>CN</AvatarFallback>
					</Avatar>
					<div className='grid flex-1 text-left text-sm leading-tight'>
						<span className='truncate font-medium'>{user.name}</span>
						<span className='truncate text-xs'>{user.email}</span>
					</div>
				</SidebarMenuButton>
				<ThemeToggle />
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
