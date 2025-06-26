'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import HeroSection from '@/components/Sections/HeroSection';
import { useContactInfoQuery } from '@/hooks/useContactInfoQuery'; // Assuming this hook exists
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Contact = () => {
	const { data: contactData, isLoading, isError, error: queryError } = useContactInfoQuery();

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
		// TODO: Implement actual API call to submit form data
		console.log('Form data:', formData);
		setTimeout(() => {
			setIsSubmitting(false);
			setSubmitSuccess(true);
			setFormData({ name: '', email: '', subject: '', message: '' });
			setTimeout(() => setSubmitSuccess(false), 5000);
		}, 1500);
	};

	const formatAddress = (address) => {
		if (!address) return 'N/A';
		const parts = [address.street, address.city, address.state, address.zipCode, address.country];
		return parts.filter(Boolean).join(', ');
	};

	if (isLoading) {
		return (
			<div className='flex min-h-[calc(100vh-200px)] items-center justify-center bg-background text-foreground'>
				<Loader2 className='h-12 w-12 animate-spin text-primary' />
				<p className='ml-4 font-body text-xl'>Loading Contact Information...</p>
			</div>
		);
	}

	if (isError || !contactData) {
		return (
			<div className='flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-background p-6 text-center text-danger'>
				<h2 className='font-heading text-3xl font-semibold'>Oops! Something went wrong.</h2>
				<p className='mt-3 font-body text-lg'>We couldn't load the contact information at the moment.</p>
				{queryError && <p className='mt-2 font-body text-sm'>Error: {queryError.message}</p>}
				<p className='mt-4 font-body'>Please try again later or contact support if the issue persists.</p>
			</div>
		);
	}

	const {
		companyName,
		address,
		phoneNumbers,
		emailAddresses,
		websiteUrl,
		socialMediaLinks,
		mapEmbedUrl,
		officeHours,
		termsAndConditions, // Using these as FAQs
		additionalInfo,
	} = contactData;

	const contactDetails = [
		{
			icon: <MapPin className='h-8 w-8 text-primary' />,
			title: 'Our Address',
			lines: [formatAddress(address)],
		},
		...(phoneNumbers?.map((phone, idx) => ({
			icon: <Phone className='h-8 w-8 text-primary' />,
			title: phone.label || `Phone ${idx + 1}`,
			lines: [phone.number],
		})) || []),
		...(emailAddresses?.map((email, idx) => ({
			icon: <Mail className='h-8 w-8 text-primary' />,
			title: email.label || `Email ${idx + 1}`,
			lines: [email.email],
		})) || []),
		{
			icon: <Globe className='h-8 w-8 text-primary' />,
			title: 'Website',
			lines: [
				websiteUrl ? (
					<a key='website' href={websiteUrl} target='_blank' rel='noopener noreferrer' className='hover:underline'>
						{websiteUrl}
					</a>
				) : (
					'N/A'
				),
			],
		},
	];

	const socialIcons = {
		facebook: <Facebook className='h-6 w-6' />,
		twitter: <Twitter className='h-6 w-6' />,
		instagram: <Instagram className='h-6 w-6' />,
		linkedin: <Linkedin className='h-6 w-6' />,
		youtube: <Youtube className='h-6 w-6' />,
	};

	return (
		<div className='min-h-screen bg-background text-foreground'>
			<HeroSection
				title='Our Travel Blog'
				subtitle='Discover travel tips, destination guides, and inspiring stories from around the world'
				imageUrl='/assets/images/hero.jpg'
				showButton={false}
			/>

			<section className='py-16 lg:py-24'>
				<div className='container mx-auto px-4'>
					<FadeIn>
						<h2 className='mb-12 text-center font-heading text-3xl font-bold md:text-4xl'>Get in Touch</h2>
					</FadeIn>
					<div className='grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4'>
						{contactDetails.map((item, index) => (
							<FadeIn key={index} delay={index * 0.1}>
								<Card className='h-full transform-gpu transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card'>
									<CardContent className='flex flex-col items-center p-6 text-center'>
										<div className='mb-4 rounded-full bg-primary/10 p-4'>{item.icon}</div>
										<h3 className='mb-2 font-heading text-xl font-semibold'>{item.title}</h3>
										{item.lines.map((line, lineIdx) => (
											<p key={lineIdx} className='text-muted-foreground'>
												{line}
											</p>
										))}
									</CardContent>
								</Card>
							</FadeIn>
						))}
					</div>
				</div>
			</section>

			<section className='bg-content1 py-16 lg:py-24'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
						<FadeIn direction='right'>
							<Card className='bg-card p-6 shadow-lg sm:p-8'>
								<h2 className='mb-6 font-heading text-2xl font-bold text-primary sm:text-3xl'>Send Us a Message</h2>
								{submitSuccess && (
									<motion.div
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										className='mb-6 rounded-md bg-success/10 p-4 text-success'>
										Thank you! Your message has been sent successfully.
									</motion.div>
								)}
								<form onSubmit={handleSubmit} className='space-y-6'>
									<div>
										<Label htmlFor='name' className='font-semibold text-muted-foreground'>
											Your Name
										</Label>
										<Input
											id='name'
											name='name'
											value={formData.name}
											onChange={handleChange}
											placeholder='e.g., John Doe'
											required
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='email' className='font-semibold text-muted-foreground'>
											Email Address
										</Label>
										<Input
											id='email'
											name='email'
											type='email'
											value={formData.email}
											onChange={handleChange}
											placeholder='e.g., john.doe@example.com'
											required
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='subject' className='font-semibold text-muted-foreground'>
											Subject
										</Label>
										<Input
											id='subject'
											name='subject'
											value={formData.subject}
											onChange={handleChange}
											placeholder='Inquiry about...'
											required
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='message' className='font-semibold text-muted-foreground'>
											Your Message
										</Label>
										<Textarea
											id='message'
											name='message'
											value={formData.message}
											onChange={handleChange}
											placeholder='Tell us more...'
											rows={5}
											required
											className='mt-1'
										/>
									</div>
									<AnimatedButton type='submit' className='w-full cta-primary' disabled={isSubmitting}>
										{isSubmitting ? (
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										) : (
											<Send className='mr-2 h-4 w-4' />
										)}
										{isSubmitting ? 'Sending...' : 'Send Message'}
									</AnimatedButton>
								</form>
							</Card>
						</FadeIn>

						<FadeIn direction='left' className='flex flex-col space-y-8'>
							<Card className='bg-card p-6 shadow-lg sm:p-8'>
								<h2 className='mb-6 font-heading text-2xl font-bold text-primary sm:text-3xl'>Find Us Here</h2>
								{mapEmbedUrl ? (
									<div className='aspect-video overflow-hidden rounded-lg border'>
										<iframe
											src={mapEmbedUrl}
											width='100%'
											height='100%'
											style={{ border: 0 }}
											allowFullScreen=''
											loading='lazy'
											referrerPolicy='no-referrer-when-downgrade'
											title='Office Location Map'></iframe>
									</div>
								) : (
									<div className='flex h-[300px] items-center justify-center rounded-lg border bg-muted text-muted-foreground'>
										Map not available.
									</div>
								)}
							</Card>
							{officeHours && officeHours.length > 0 && (
								<Card className='bg-card p-6 shadow-lg sm:p-8'>
									<h3 className='mb-4 font-heading text-xl font-bold text-primary sm:text-2xl'>Office Hours</h3>
									<div className='space-y-3'>
										{officeHours.map((oh, index) => (
											<div
												key={index}
												className='flex justify-between border-b border-border pb-2 last:border-b-0 last:pb-0'>
												<span className='font-medium text-muted-foreground'>{oh.days}</span>
												<span className='font-semibold text-foreground'>{oh.hours}</span>
											</div>
										))}
									</div>
								</Card>
							)}
						</FadeIn>
					</div>
				</div>
			</section>

			{termsAndConditions && termsAndConditions.length > 0 && (
				<section className='py-16 lg:py-24'>
					<div className='container mx-auto px-4'>
						<FadeIn>
							<h2 className='mb-12 text-center font-heading text-3xl font-bold md:text-4xl'>
								Frequently Asked Questions
							</h2>
						</FadeIn>
						<div className='mx-auto max-w-3xl'>
							<Accordion type='single' collapsible className='w-full space-y-4'>
								{termsAndConditions.map((faq, index) => (
									<FadeIn key={index} delay={index * 0.05}>
										<AccordionItem value={`item-${index}`} className='rounded-lg border bg-card shadow-sm'>
											<AccordionTrigger className='px-6 py-4 text-left font-heading text-lg font-medium hover:no-underline'>
												{faq.title}
											</AccordionTrigger>
											<AccordionContent className='px-6 pb-4 pt-0 text-muted-foreground'>
												<div dangerouslySetInnerHTML={{ __html: faq.content.replace(/\n/g, '<br />') }} />
											</AccordionContent>
										</AccordionItem>
									</FadeIn>
								))}
							</Accordion>
						</div>
					</div>
				</section>
			)}

			{socialMediaLinks && Object.values(socialMediaLinks).some((link) => link) && (
				<section className='border-t border-border py-12 bg-content1'>
					<div className='container mx-auto px-4 text-center'>
						<FadeIn>
							<h3 className='mb-6 font-heading text-2xl font-semibold'>Connect With Us</h3>
							<div className='flex justify-center space-x-6'>
								{Object.entries(socialMediaLinks).map(([platform, url]) => {
									if (url && socialIcons[platform]) {
										return (
											<a
												key={platform}
												href={url}
												target='_blank'
												rel='noopener noreferrer'
												aria-label={`Visit us on ${platform}`}
												className='text-muted-foreground transition-colors hover:text-primary'>
												{socialIcons[platform]}
											</a>
										);
									}
									return null;
								})}
							</div>
						</FadeIn>
					</div>
				</section>
			)}

			{/* Newsletter Section - Assuming it's static or handled elsewhere */}
			<section className='py-16 text-primary-foreground bg-primary lg:py-24'>
				<div className='container mx-auto px-4'>
					<div className='mx-auto max-w-2xl text-center'>
						<FadeIn>
							<h2 className='mb-4 font-heading text-3xl font-bold'>Stay Updated</h2>
							<p className='mb-8'>
								Subscribe to our newsletter for travel tips, exclusive deals, and inspiration for your next adventure.
							</p>
							<form className='flex flex-col gap-4 sm:flex-row'>
								<Input
									type='email'
									placeholder='Enter your email address'
									className='flex-1 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground'
									aria-label='Email for newsletter'
								/>
								<AnimatedButton
									type='submit'
									variant='secondary'
									size='lg'
									className='bg-secondary text-secondary-foreground hover:bg-secondary/90'>
									Subscribe
								</AnimatedButton>
							</form>
						</FadeIn>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Contact;
