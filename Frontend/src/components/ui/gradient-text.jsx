import { cn } from '@/lib/utils';

const GradientText = ({
	children,
	from = 'primary-400',
	to = 'primary-600',
	direction = 'to-r',
	className = '',
	as: Component = 'span',
	...props
}) => {
	return (
		<Component
			className={cn(`bg-gradient-${direction}`, `from-${from}`, `to-${to}`, 'bg-clip-text text-transparent', className)}
			{...props}>
			{children}
		</Component>
	);
};

export default GradientText;
