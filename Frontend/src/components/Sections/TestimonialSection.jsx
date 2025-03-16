import FadeIn from '@/components/Animation/FadeIn';

const TestimonialSection = ({ testimonials }) => {
	return (
		<section className='py-16'>
			<div className='container mx-auto px-4'>
				<FadeIn>
					<h2 className='text-3xl font-bold text-center mb-12'>What Our Customers Say</h2>
				</FadeIn>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{testimonials.map((testimonial, index) => (
						<FadeIn key={index} delay={index * 0.1}>
							<div className='bg-background p-6 rounded-lg shadow border h-full'>
								<div className='flex items-center mb-4'>
									<div className='w-12 h-12 rounded-full bg-muted mr-4'></div>
									<div>
										<h4 className='font-bold'>{testimonial.name}</h4>
										<p className='text-sm text-muted-foreground'>{testimonial.location}</p>
									</div>
								</div>
								<p className='text-muted-foreground mb-4'>{testimonial.comment}</p>
								<div className='flex text-yellow-400'>
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											xmlns='http://www.w3.org/2000/svg'
											className='h-5 w-5'
											viewBox='0 0 20 20'
											fill='currentColor'>
											<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
										</svg>
									))}
								</div>
							</div>
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
};

export default TestimonialSection;
