import { useState } from 'react';
import { motion } from 'framer-motion';
import {
	Mail,
	Phone,
	MapPin,
	Send,
	Globe,
	Facebook,
	Twitter,
	Instagram,
	Linkedin,
	Youtube,
	Clock,
	Building2,
} from 'lucide-react';
import FadeIn from '@/components/Animation/FadeIn';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import HeroSection from '@/components/Sections/HeroSection';
import { useContactInfoQuery } from '@/hooks/useContactInfoQuery';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import NewsletterSection from '@/components/Sections/NewsletterSection';

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
		termsAndConditions,
		additionalInfo,
	} = contactData;

	const socialIcons = {
		facebook: <Facebook className='h-5 w-5' />,
		twitter: <Twitter className='h-5 w-5' />,
		instagram: <Instagram className='h-5 w-5' />,
		linkedin: <Linkedin className='h-5 w-5' />,
		youtube: <Youtube className='h-5 w-5' />,
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
			},
		},
	};

	return (
		<div className='min-h-screen bg-background text-foreground'>
			<HeroSection
				title={companyName || 'Contact Us'}
				subtitle={
					additionalInfo ||
					"Have questions or ready to plan your next adventure? We're here to help you every step of the way."
				}
				imageUrl='/assets/images/hero.jpg'
				showButton={false}
			/>

			{/* Contact Information Section */}
			<section className='py-16 lg:py-20'>
				<div className='max-w-7xl mx-auto px-4'>
					<FadeIn>
						<div className='text-center mb-12'>
							<h2 className='font-heading text-3xl font-bold md:text-4xl mb-4'>Get in Touch</h2>
							<p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
								Ready to start your journey? Contact us through any of the methods below and let's make your travel
								dreams come true.
							</p>
						</div>
					</FadeIn>

					<div className='max-w-7xl mx-auto'>
						<motion.div
							variants={containerVariants}
							initial='hidden'
							whileInView='visible'
							viewport={{ once: true }}
							className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
							{/* Contact Details Card */}
							<motion.div variants={itemVariants}>
								<Card className='h-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary dark:border-secondary hover:shadow-xl transition-all duration-300'>
									<CardContent className='p-8'>
										<div className='flex items-center mb-6'>
											<Building2 className='h-6 w-6 text-primary mr-3' />
											<h3 className='font-heading text-xl font-semibold'>Contact Information</h3>
										</div>

										<div className='space-y-6'>
											{/* Address */}
											{address && (
												<div className='flex items-center space-x-4'>
													<div className='flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
														<MapPin className='h-5 w-5 text-primary' />
													</div>
													<div>
														<h4 className='font-semibold text-foreground mb-1'>Our Location</h4>
														<p className='text-muted-foreground leading-relaxed'>{formatAddress(address)}</p>
													</div>
												</div>
											)}

											{/* Phone Numbers */}
											{phoneNumbers && phoneNumbers.length > 0 && (
												<div className='flex items-center space-x-4'>
													<div className='flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
														<Phone className='h-5 w-5 text-primary' />
													</div>
													<div>
														<h4 className='font-semibold text-foreground mb-1'>Phone</h4>
														{phoneNumbers.map((phone, idx) => (
															<div key={idx} className='text-muted-foreground'>
																<span className='font-medium'>{phone.label}: </span>
																<a href={`tel:${phone.number}`} className='hover:text-primary transition-colors'>
																	{phone.number}
																</a>
															</div>
														))}
													</div>
												</div>
											)}

											{/* Email Addresses */}
											{emailAddresses && emailAddresses.length > 0 && (
												<div className='flex items-center space-x-4'>
													<div className='flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
														<Mail className='h-5 w-5 text-primary' />
													</div>
													<div>
														<h4 className='font-semibold text-foreground mb-1'>Email</h4>
														{emailAddresses.map((email, idx) => (
															<div key={idx} className='text-muted-foreground'>
																<span className='font-medium'>{email.label}: </span>
																<a href={`mailto:${email.email}`} className='hover:text-primary transition-colors'>
																	{email.email}
																</a>
															</div>
														))}
													</div>
												</div>
											)}

											{/* Website */}
											{websiteUrl && (
												<div className='flex items-center space-x-4'>
													<div className='flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
														<Globe className='h-5 w-5 text-primary' />
													</div>
													<div>
														<h4 className='font-semibold text-foreground mb-1'>Website</h4>
														<a
															href={websiteUrl}
															target='_blank'
															rel='noopener noreferrer'
															className='text-muted-foreground hover:text-primary transition-colors'>
															{websiteUrl}
														</a>
													</div>
												</div>
											)}
										</div>

										{/* Social Media Links */}
										{socialMediaLinks && Object.values(socialMediaLinks).some((link) => link) && (
											<div className='mt-8 pt-6 border-t border-border'>
												<h4 className='font-semibold text-foreground mb-4'>Follow Us</h4>
												<div className='flex space-x-4'>
													{Object.entries(socialMediaLinks).map(([platform, url]) => {
														if (url && socialIcons[platform]) {
															return (
																<a
																	key={platform}
																	href={url}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110'>
																	{socialIcons[platform]}
																</a>
															);
														}
														return null;
													})}
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							</motion.div>

							{/* Office Hours Card */}
							{officeHours && officeHours.length > 0 && (
								<motion.div variants={itemVariants}>
									<Card className='border-none border-0 h-full bg-gradient-to-br from-secondary/5 to-secondary/10 hover:shadow-xl transition-all duration-300'>
										<CardContent className='p-8'>
											<div className='flex items-center mb-6'>
												<Clock className='h-6 w-6 text-primary mr-3' />
												<h3 className='font-heading text-xl font-semibold'>Office Hours</h3>
											</div>
											<div className='space-y-4'>
												{officeHours.map((oh, index) => (
													<div
														key={index}
														className='flex justify-between items-center py-2 border-b border-border/50 last:border-b-0'>
														<span className='font-medium text-foreground'>{oh.days}</span>
														<span className='text-muted-foreground font-semibold'>{oh.hours}</span>
													</div>
												))}
											</div>
											<div className='mt-6 p-4 bg-background/50 rounded-lg'>
												<p className='text-sm text-muted-foreground text-center'>
													We're here to help you plan your perfect trip during our business hours.
												</p>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							)}
						</motion.div>
					</div>
				</div>
			</section>

			{/* Contact Form and Map Section */}
			<section className='py-16 lg:py-20 bg-content1'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto'>
						<FadeIn direction='right'>
							<Card className='bg-card shadow-xl border-0'>
								<CardContent className='p-8'>
									<h2 className='mb-6 font-heading text-2xl font-bold text-primary sm:text-3xl'>Send Us a Message</h2>
									<p className='text-muted-foreground mb-8'>
										Have a specific question or ready to book your next adventure? Drop us a message and we'll get back
										to you within 24 hours.
									</p>

									{submitSuccess && (
										<motion.div
											initial={{ opacity: 0, y: -20 }}
											animate={{ opacity: 1, y: 0 }}
											className='mb-6 rounded-lg bg-success/10 border border-success/20 p-4 text-success'>
											<div className='flex items-center'>
												<div className='w-2 h-2 bg-success rounded-full mr-3'></div>
												Thank you! Your message has been sent successfully.
											</div>
										</motion.div>
									)}

									<form onSubmit={handleSubmit} className='space-y-6'>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<div>
												<Label htmlFor='name' className='font-semibold text-muted-foreground'>
													Your Name
												</Label>
												<Input
													id='name'
													name='name'
													value={formData.name}
													onChange={handleChange}
													placeholder='John Doe'
													required
													className='mt-1 h-12'
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
													placeholder='john@example.com'
													required
													className='mt-1 h-12'
												/>
											</div>
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
												placeholder='How can we help you?'
												required
												className='mt-1 h-12'
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
												placeholder='Tell us about your travel plans, questions, or how we can assist you...'
												rows={6}
												required
												className='mt-1 resize-none'
											/>
										</div>

										<AnimatedButton
											type='submit'
											className='w-full h-12 cta-primary text-lg font-semibold'
											disabled={isSubmitting}>
											{isSubmitting ? (
												<>
													<Loader2 className='mr-2 h-5 w-5 animate-spin' />
													Sending Message...
												</>
											) : (
												<>
													<Send className='mr-2 h-5 w-5' />
													Send Message
												</>
											)}
										</AnimatedButton>
									</form>
								</CardContent>
							</Card>
						</FadeIn>

						<FadeIn direction='left'>
							<Card className='bg-card shadow-xl border-0 h-full'>
								<CardContent className='p-8 h-full flex flex-col'>
									<h2 className='mb-6 font-heading text-2xl font-bold text-primary sm:text-3xl'>Find Us Here</h2>
									<div className='flex-1'>
										{mapEmbedUrl ? (
											<div className='h-full min-h-[400px] overflow-hidden rounded-lg border shadow-inner'>
												<iframe
													src={mapEmbedUrl}
													width='100%'
													height='100%'
													style={{ border: 0 }}
													allowFullScreen=''
													loading='lazy'
													referrerPolicy='no-referrer-when-downgrade'
													title='Office Location Map'
													className='w-full h-full'></iframe>
											</div>
										) : (
											<div className='flex h-[400px] items-center justify-center rounded-lg border bg-muted text-muted-foreground'>
												<div className='text-center'>
													<MapPin className='h-12 w-12 mx-auto mb-4 text-primary/50' />
													<p>Map not available</p>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</FadeIn>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			{termsAndConditions && termsAndConditions.length > 0 && (
				<section className='py-16 lg:py-20'>
					<div className='container mx-auto px-4'>
						<FadeIn>
							<div className='text-center mb-12'>
								<h2 className='font-heading text-3xl font-bold md:text-4xl mb-4'>Frequently Asked Questions</h2>
								<p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
									Find answers to common questions about our services, booking process, and travel policies.
								</p>
							</div>
						</FadeIn>

						<div className='mx-auto max-w-4xl'>
							<Accordion type='single' collapsible className='w-full space-y-4'>
								{termsAndConditions.map((faq, index) => (
									<FadeIn key={index} delay={index * 0.05}>
										<AccordionItem
											value={`item-${index}`}
											className='rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300'>
											<AccordionTrigger className='px-6 py-5 text-left font-heading text-lg font-semibold hover:no-underline hover:text-primary transition-colors'>
												{faq.title}
											</AccordionTrigger>
											<AccordionContent className='px-6 pb-5 pt-0 text-muted-foreground leading-relaxed'>
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

			{/* Newsletter Section */}
			<NewsletterSection />
		</div>
	);
};

export default Contact;
