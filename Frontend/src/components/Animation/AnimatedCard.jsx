'use client';

import { motion } from 'framer-motion';

const AnimatedCard = ({ children, delay = 0, className = '', ...props }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{
				duration: 0.5,
				delay,
				ease: [0.25, 0.1, 0.25, 1.0],
			}}
			whileHover={{
				y: -5,
				transition: { duration: 0.2 },
			}}
			className={className}
			{...props}>
			{children}
		</motion.div>
	);
};

export default AnimatedCard;
