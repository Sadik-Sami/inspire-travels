import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { GraduationCapIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function NavHeader() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<div>
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
				</div>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
