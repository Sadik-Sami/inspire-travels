import FadeIn from '@/components/Animation/FadeIn';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Input } from '@/components/ui/input';

const NewsletterSection = () => {
	return (
		<section className='py-16 bg-primary text-primary-foreground'>
			<div className='container mx-auto px-4'>
				<div className='max-w-2xl mx-auto text-center'>
					<FadeIn>
						<h2 className='text-3xl font-bold mb-4'>Subscribe to Our Newsletter</h2>
						<p className='mb-6'>Get the latest travel deals, tips, and inspiration delivered to your inbox.</p>
						<div className='flex flex-col sm:flex-row sm:items-center gap-2'>
							<Input
								type='email'
								placeholder='Enter your email'
								className='flex-1 px-4 py-5 rounded-md text-foreground placeholder:text-white/60 border border-white'
							/>
							<AnimatedButton
								variant='secondary'
								size='lg'
								className='bg-secondary hover:bg-secondary/90 text-secondary-foreground'>
								Subscribe
							</AnimatedButton>
						</div>
					</FadeIn>
				</div>
			</div>
		</section>
	);
};

export default NewsletterSection;
