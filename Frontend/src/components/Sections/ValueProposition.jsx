import FadeIn from '@/components/Animation/FadeIn';

const ValueProposition = ({ features }) => {
	return (
		<section className='py-16 bg-content1'>
			<div className='container mx-auto px-4'>
				<FadeIn>
					<h2 className='text-3xl font-bold text-center mb-12'>Why Choose Us</h2>
				</FadeIn>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					{features.map((feature, index) => (
						<FadeIn key={index} delay={index * 0.1}>
							<div className='bg-background p-6 rounded-lg shadow-sm text-center h-full'>
								<div className='w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
									{feature.icon}
								</div>
								<h3 className='text-xl font-bold mb-2'>{feature.title}</h3>
								<p className='text-muted-foreground'>{feature.description}</p>
							</div>
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
};

export default ValueProposition;
