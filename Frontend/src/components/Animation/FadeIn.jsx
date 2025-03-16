import { motion } from 'framer-motion';

const FadeIn = ({
	children,
	direction = 'up',
	delay = 0,
	duration = 0.5,
	className = '',
	viewport = { once: true, amount: 0.3 },
}) => {
	const directions = {
		up: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
		down: { initial: { opacity: 0, y: -40 }, animate: { opacity: 1, y: 0 } },
		left: { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 } },
		right: { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 } },
		none: { initial: { opacity: 0 }, animate: { opacity: 1 } },
	};

	const selectedDirection = directions[direction] || directions.up;

	return (
		<motion.div
			initial={selectedDirection.initial}
			whileInView={selectedDirection.animate}
			viewport={viewport}
			transition={{
				duration: duration,
				delay: delay,
				ease: 'easeOut',
			}}
			className={className}>
			{children}
		</motion.div>
	);
};

export default FadeIn;
