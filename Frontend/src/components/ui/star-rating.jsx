import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

const StarRating = ({
	rating = 5,
	size = 'default',
	color = 'warning',
	className = '',
	showEmpty = true,
	...props
}) => {
	const fullStars = Math.floor(rating);
	const hasHalfStar = rating % 1 >= 0.5;
	const emptyStars = showEmpty ? 5 - fullStars - (hasHalfStar ? 1 : 0) : 0;

	const sizeClasses = {
		sm: 'h-3.5 w-3.5',
		default: 'h-5 w-5',
		lg: 'h-6 w-6',
	};

	const colorClasses = {
		warning: 'text-yellow-400',
		primary: 'text-primary',
		secondary: 'text-secondary-600',
	};

	const starSize = sizeClasses[size] || sizeClasses.default;
	const starColor = colorClasses[color] || colorClasses.warning;

	return (
		<div className={cn('flex items-center', className)} {...props}>
			{[...Array(fullStars)].map((_, i) => (
				<Star key={`full-${i}`} className={cn(starSize, starColor)} fill='currentColor' />
			))}

			{hasHalfStar && <StarHalf className={cn(starSize, starColor)} fill='currentColor' />}

			{[...Array(emptyStars)].map((_, i) => (
				<Star key={`empty-${i}`} className={cn(starSize, 'text-gray-300')} />
			))}
		</div>
	);
};

export default StarRating;
