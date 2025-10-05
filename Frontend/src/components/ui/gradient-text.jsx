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
	// Create the gradient style directly instead of using dynamic class names
	const gradientStyle = {
		backgroundImage: `linear-gradient(${
			direction === 'to-r'
				? 'to right'
				: direction === 'to-l'
				? 'to left'
				: direction === 'to-t'
				? 'to top'
				: direction === 'to-b'
				? 'to bottom'
				: direction === 'to-tr'
				? 'to top right'
				: direction === 'to-tl'
				? 'to top left'
				: direction === 'to-br'
				? 'to bottom right'
				: direction === 'to-bl'
				? 'to bottom left'
				: 'to right'
		}, 
                           var(--color-${from.replace('-', '-')}), 
                           var(--color-${to.replace('-', '-')}))`,
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		color: 'transparent', // Fallback
	};

	return (
		<Component className={cn(className)} style={gradientStyle} {...props}>
			{children}
		</Component>
	);
};

export default GradientText;
