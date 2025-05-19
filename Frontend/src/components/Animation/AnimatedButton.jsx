'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { forwardRef } from 'react';

const AnimatedButton = forwardRef(
	({ children, className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
		return (
			<Button ref={ref} variant={variant} size={size} asChild={asChild} className={className} {...props}>
				{asChild ? (
					children
				) : (
					<motion.span className='flex items-center gap-2' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						{children}
					</motion.span>
				)}
			</Button>
		);
	}
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
