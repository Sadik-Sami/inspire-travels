import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import HeroSection from '@/components/Sections/HeroSection';

const Contact = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Simulate API call
		setTimeout(() => {
			setIsSubmitting(false);
			setSubmitSuccess(true);
			setFormData({
				name: '',
				email: '',
				subject: '',
				message: '',
			});

			// Reset success message after 5 seconds
			setTimeout(() => {
				setSubmitSuccess(false);
			}, 5000);
		}, 1500);
	};

	const contactInfo = [
		{
			icon: <MapPin className='h-6 w-6' />,
			title: 'Our Location',
			details: '123 Travel Street, City, Country',
			description: 'Our headquarters is located in the heart of the city.',
		},
		{
			icon: <Phone className='h-6 w-6' />,
			title: 'Phone Number',
			details: '+1 (123) 456-7890',
			description: "We're available Monday through Friday, 9am-6pm.",
		},
		{
			icon: <Mail className='h-6 w-6' />,
			title: 'Email Address',
			details: 'info@travelease.com',
			description: 'We usually respond within 24 hours.',
		},
		{
			icon: <Clock className='h-6 w-6' />,
			title: 'Working Hours',
			details: 'Mon - Fri: 9AM - 6PM',
			description: "We're closed on weekends and public holidays.",
		},
	];

	const faqs = [
		{
			question: 'How do I book a trip with TravelEase?',
			answer:
				'You can book a trip through our website by browsing our destinations, selecting your preferred package, and following the booking process. Alternatively, you can contact our travel consultants directly by phone or email for personalized assistance.',
		},
		{
			question: 'What payment methods do you accept?',
			answer:
				'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. For certain destinations, we also offer payment plans to help you spread the cost of your trip.',
		},
		{
			question: 'Can I customize my travel package?',
			answer:
				"We specialize in creating customized travel experiences. Contact our team with your preferences, and we'll work with you to design a personalized itinerary that meets your specific interests, budget, and schedule.",
		},
		{
			question: 'What is your cancellation policy?',
			answer:
				'Our standard cancellation policy allows for a full refund if canceled 60 days before departure, a 50% refund if canceled 30-59 days before departure, and no refund for cancellations less than 30 days before departure. However, we recommend purchasing travel insurance for additional protection.',
		},
		{
			question: 'Do you offer travel insurance?',
			answer:
				'Yes, we offer comprehensive travel insurance options through our trusted partners. Our insurance packages can cover trip cancellation, medical emergencies, lost luggage, and other unexpected events during your journey.',
		},
	];

	return (
		<div className='min-h-screen bg-background text-foreground'>
			{/* Hero Section */}
			<HeroSection
				title='Contact Us'
				subtitle="Have questions or ready to plan your next adventure? We're here to help you every step of the way."
				imageUrl='/assets/images/hero.jpg'
				showButton={false}
			/>
			{/* Contact Information */}
			<section className='py-16'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						{contactInfo.map((item, index) => (
							<FadeIn key={index} delay={index * 0.1}>
								<div className='bg-content1 p-6 rounded-lg h-full'>
									<div className='text-secondary mb-4'>{item.icon}</div>
									<h3 className='text-xl font-bold mb-2'>{item.title}</h3>
									<p className='font-medium mb-2'>{item.details}</p>
									<p className='text-muted-foreground'>{item.description}</p>
								</div>
							</FadeIn>
						))}
					</div>
				</div>
			</section>

			{/* Contact Form and Map */}
			<section className='py-16 bg-content1'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
						<FadeIn direction='right'>
							<div className='bg-background p-8 rounded-lg shadow-md'>
								<h2 className='text-2xl font-bold mb-6'>Send Us a Message</h2>

								{submitSuccess && (
									<motion.div
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										className='mb-6 p-4 bg-success/10 text-success rounded-md'>
										Thank you for your message! We'll get back to you soon.
									</motion.div>
								)}

								<form onSubmit={handleSubmit} className='space-y-6'>
									<div className='space-y-2'>
										<Label htmlFor='name'>Your Name</Label>
										<Input
											id='name'
											name='name'
											value={formData.name}
											onChange={handleChange}
											placeholder='John Doe'
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='email'>Email Address</Label>
										<Input
											id='email'
											name='email'
											type='email'
											value={formData.email}
											onChange={handleChange}
											placeholder='john@example.com'
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='subject'>Subject</Label>
										<Input
											id='subject'
											name='subject'
											value={formData.subject}
											onChange={handleChange}
											placeholder='How can we help you?'
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='message'>Message</Label>
										<Textarea
											id='message'
											name='message'
											value={formData.message}
											onChange={handleChange}
											placeholder='Tell us more about your inquiry...'
											rows={5}
											required
										/>
									</div>

									<AnimatedButton
										type='submit'
										className='w-full bg-primary hover:bg-primary/90'
										disabled={isSubmitting}>
										{isSubmitting ? (
											'Sending...'
										) : (
											<>
												<Send className='mr-2 h-4 w-4' />
												Send Message
											</>
										)}
									</AnimatedButton>
								</form>
							</div>
						</FadeIn>

						<FadeIn direction='left'>
							<div className='h-full'>
								<h2 className='text-2xl font-bold mb-6'>Find Us</h2>
								<div className='bg-background rounded-lg overflow-hidden shadow-md h-[400px] mb-6'>
									{/* Placeholder for map - in a real app, you would integrate Google Maps or similar */}
									<div className='w-full h-full bg-muted flex items-center justify-center'>
										<div className='text-center p-6'>
											<MapPin className='h-12 w-12 mx-auto mb-4 text-primary' />
											<p className='text-lg font-medium'>Interactive Map</p>
											<p className='text-muted-foreground'>123 Travel Street, City, Country</p>
										</div>
									</div>
								</div>

								<div className='bg-background p-6 rounded-lg shadow-md'>
									<h3 className='text-xl font-bold mb-4'>Office Hours</h3>
									<div className='space-y-2'>
										<div className='flex justify-between'>
											<span>Monday - Friday:</span>
											<span className='font-medium'>9:00 AM - 6:00 PM</span>
										</div>
										<div className='flex justify-between'>
											<span>Saturday:</span>
											<span className='font-medium'>10:00 AM - 4:00 PM</span>
										</div>
										<div className='flex justify-between'>
											<span>Sunday:</span>
											<span className='font-medium'>Closed</span>
										</div>
									</div>
								</div>
							</div>
						</FadeIn>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className='py-16'>
				<div className='container mx-auto px-4'>
					<FadeIn>
						<h2 className='text-3xl font-bold mb-8 text-center'>Frequently Asked Questions</h2>
					</FadeIn>

					<div className='max-w-3xl mx-auto'>
						<Accordion type='single' collapsible className='w-full'>
							{faqs.map((faq, index) => (
								<FadeIn key={index} delay={index * 0.1}>
									<AccordionItem value={`item-${index}`}>
										<AccordionTrigger className='text-left font-medium'>{faq.question}</AccordionTrigger>
										<AccordionContent className='text-muted-foreground'>{faq.answer}</AccordionContent>
									</AccordionItem>
								</FadeIn>
							))}
						</Accordion>
					</div>

					<FadeIn>
						<div className='text-center mt-12'>
							<p className='text-muted-foreground mb-6'>
								Can't find the answer you're looking for? Feel free to reach out to our customer support team.
							</p>
							<AnimatedButton className='bg-primary hover:bg-primary/90'>
								<Mail className='mr-2 h-4 w-4' />
								Email Support
							</AnimatedButton>
						</div>
					</FadeIn>
				</div>
			</section>

			{/* Newsletter Section */}
			<section className='py-16 bg-primary text-primary-foreground'>
				<div className='container mx-auto px-4'>
					<div className='max-w-2xl mx-auto text-center'>
						<FadeIn>
							<h2 className='text-3xl font-bold mb-4'>Stay Updated</h2>
							<p className='mb-6'>
								Subscribe to our newsletter for travel tips, exclusive deals, and inspiration for your next adventure.
							</p>
							<div className='flex flex-col sm:flex-row sm:items-center gap-2'>
								<Input
									type='email'
									placeholder='Enter your email'
									className='flex-1 px-4 py-3 rounded-md text-foreground'
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
		</div>
	);
};

export default Contact;
