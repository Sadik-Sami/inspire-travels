import { Badge } from '@/components/ui/badge';
import { ROLE_CONFIG } from '@/config/rbac';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const RoleIndicator = ({ role, showDescription = false, size = 'default' }) => {
	const config = ROLE_CONFIG[role];

	if (!config) return null;

	const badge = (
		<Badge variant='outline' className={`${config.color} font-display ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}>
			{config.label}
		</Badge>
	);

	if (showDescription) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>{badge}</TooltipTrigger>
					<TooltipContent>
						<p>{config.description}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return badge;
};

export default RoleIndicator;
