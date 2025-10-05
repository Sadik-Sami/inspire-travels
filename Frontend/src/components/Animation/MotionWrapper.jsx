'use client';

import { motion } from 'framer-motion';

const MotionWrapper = ({
	children,
	delay = 0,
	duration = 0.5,
	direction = 'up',
	className = '',
	once = true,
	...props
}) => {
	const getVariants = () => {
		const baseVariants = {
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					duration,
					delay,
					ease: [0.25, 0.1, 0.25, 1.0],
				},
			},
		};

		switch (direction) {
			case 'up':
				baseVariants.hidden.y = 40;
				baseVariants.visible.y = 0;
				break;
			case 'down':
				baseVariants.hidden.y = -40;
				baseVariants.visible.y = 0;
				break;
			case 'left':
				baseVariants.hidden.x = 40;
				baseVariants.visible.x = 0;
				break;
			case 'right':
				baseVariants.hidden.x = -40;
				baseVariants.visible.x = 0;
				break;
			case 'scale':
				baseVariants.hidden.scale = 0.9;
				baseVariants.visible.scale = 1;
				break;
			default:
				break;
		}

		return baseVariants;
	};

	return (
		<motion.div
			initial='hidden'
			whileInView='visible'
			viewport={{ once }}
			variants={getVariants()}
			className={className}
			{...props}>
			{children}
		</motion.div>
	);
};

export default MotionWrapper;
