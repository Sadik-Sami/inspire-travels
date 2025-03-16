import { motion } from 'framer-motion';
import { Button } from '../ui/button';

const AnimatedButton = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }) => {
	return (
		<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
			<Button variant={variant} size={size} onClick={onClick} className={className} {...props}>
				{children}
			</Button>
		</motion.div>
	);
};

export default AnimatedButton;
