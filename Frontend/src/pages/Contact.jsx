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
	Sparkles,
	CheckCircle,
	MessageSquare,
	Users,
	HeadphonesIcon,
} from 'lucide-react';
import AnimatedButton from '@/components/Animation/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useContactInfoQuery } from '@/hooks/useContactInfoQuery';
import { Card, CardContent } from '@/components/ui/card';
import HeroSection from '@/components/Sections/HeroSection';
import { toast } from 'sonner';
import useAxiosPublic from '@/hooks/use-AxiosPublic';

const Contact = () => {
	const { data: contactData, isLoading, isError, error: queryError } = useContactInfoQuery();
	const axiosPublic = useAxiosPublic();

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
		try {
			const { data } = await axiosPublic.post('/api/support/', formData);
			if (data.success) {
				setSubmitSuccess(true);
				setFormData({ name: '', email: '', subject: '', message: '' });
				return toast.success(data.message);
			}
			toast.error(data.message);
		} catch (error) {
			console.error('Error sending message:', error);
			toast.error('Failed to send message. Please try again later.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatAddress = (address) => {
		if (!address) return 'N/A';
		const parts = [address.street, address.city, address.state, address.zipCode, address.country];
		// return parts.filter(Boolean).join(', ');
		return (
			<p className='text-sm'>
				{address.street}, {address.city}-{address.zipCode}, {address.country}
			</p>
		);
	};

	// Loading State
	if (isLoading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='text-center'>
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
						className='w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4'
					/>
					<h2 className='text-xl font-heading font-semibold text-foreground mb-2'>Loading Contact Information</h2>
					<p className='text-muted-foreground'>Please wait while we fetch the latest details...</p>
				</div>
			</div>
		);
	}

	// Error State
	if (isError || !contactData) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center p-4'>
				<div className='text-center max-w-md'>
					<div className='w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4'>
						<MessageSquare className='w-8 h-8 text-destructive' />
					</div>
					<h2 className='text-2xl font-heading font-bold text-foreground mb-2'>Unable to Load Contact Information</h2>
					<p className='text-muted-foreground mb-4'>
						We're experiencing technical difficulties. Please try again later or contact us directly.
					</p>
					{queryError && <p className='text-sm text-muted-foreground mb-4'>Error: {queryError.message}</p>}
					<button
						onClick={() => window.location.reload()}
						className='bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors'>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	const {
		companyName,
		addresses,
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
		facebook: Facebook,
		twitter: Twitter,
		instagram: Instagram,
		linkedin: Linkedin,
		youtube: Youtube,
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1],
			},
		},
	};

	return (
		<div className='min-h-screen bg-background'>
			{/* Banner Section */}
			<HeroSection
				title={companyName || 'Contact Us'}
				subtitle={
					additionalInfo ||
					"Have questions or ready to plan your next adventure? We're here to help you every step of the way."
				}
				imageUrl='/assets/images/hero.jpg'
				showButton={false}
			/>
			{/* Hero Section */}
			<section className='py-12 lg:py-24 bg-background relative overflow-hidden'>
				<div className='container mx-auto px-4'>
					<div className='text-center max-w-4xl mx-auto'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className='mb-6'>
							<div className='flex items-center justify-center gap-2 mb-4'>
								<span className='font-display text-sm inline-block text-primary uppercase tracking-wider font-medium'>
									Get in Touch
								</span>
								<motion.div
									animate={{
										rotate: [0, 5, -5, 0],
										scale: [1, 1.1, 1],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										repeatType: 'reverse',
									}}>
									<Sparkles size={16} className='text-primary' />
								</motion.div>
							</div>

							<h1 className='text-4xl md:text-5xl font-heading font-bold text-foreground mb-6 leading-tight'>
								Contact{' '}
								<span className='text-primary relative'>
									{companyName || 'Inspire Travels'}
									<motion.div
										className='absolute -bottom-2 left-0 right-0 h-1 bg-primary/20 rounded-full'
										initial={{ scaleX: 0 }}
										animate={{ scaleX: 1 }}
										transition={{ duration: 0.8, delay: 0.5 }}
									/>
								</span>
							</h1>

							<p className='text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto'>
								{additionalInfo ||
									"Ready to plan your next adventure? We're here to help you every step of the way. Get in touch with our travel experts today."}
							</p>
						</motion.div>

						{/* Quick Stats */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className='flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground'>
							<div className='flex items-center gap-2'>
								<HeadphonesIcon size={16} className='text-primary' />
								<span>24/7 Support Available</span>
							</div>
							<div className='flex items-center gap-2'>
								<Users size={16} className='text-primary' />
								<span>Expert Travel Consultants</span>
							</div>
							<div className='flex items-center gap-2'>
								<CheckCircle size={16} className='text-emerald-500' />
								<span>Response within 24 hours</span>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Contact Information Section */}
			<section className='py-10 bg-background'>
				<div className='container mx-auto px-4'>
					<motion.div
						variants={containerVariants}
						initial='hidden'
						whileInView='visible'
						viewport={{ once: true }}
						className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
						{/* Contact Details */}
						<motion.div variants={itemVariants} className='lg:col-span-2'>
							<Card className='h-full bg-card shadow-lg border border-border hover:shadow-xl transition-all duration-300'>
								<CardContent className='p-8'>
									<div className='flex items-center mb-6'>
										<div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4'>
											<Building2 className='h-6 w-6 text-primary' />
										</div>
										<h3 className='font-heading text-2xl font-bold text-foreground'>Contact Information</h3>
									</div>

									<div className='grid md:grid-cols-2 gap-6'>
										{addresses && addresses.length > 0 && (
											<div className='space-y-3'>
												{/* Section Header */}
												<div className='flex items-center gap-3'>
													<div className='rounded-full bg-primary/10 p-3 w-fit'>
														<MapPin className='h-5 w-5 text-primary' />
													</div>
													<h4 className='font-semibold text-foreground'>Our Locations</h4>
												</div>

												{/* Address List */}
												<div className='space-y-4 pl-14'>
													{addresses.map((address, index) => (
														<div key={index} className='space-y-1'>
															<p className='font-semibold text-foreground'>{address.label}</p>
															{formatAddress(address)}
														</div>
													))}
												</div>
											</div>
										)}

										{/* Phone Numbers */}
										{phoneNumbers && phoneNumbers.length > 0 && (
											<div className='space-y-3'>
												<div className='flex items-start gap-3'>
													<div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
														<Phone className='h-5 w-5 text-primary' />
													</div>
													<div>
														<h4 className='font-semibold text-foreground mb-2'>Phone</h4>
														{phoneNumbers.map((phone, idx) => (
															<div key={idx} className='mb-1'>
																<span className='text-sm font-medium text-muted-foreground'>{phone.label}: </span>
																<a
																	href={`tel:${phone.number}`}
																	className='text-primary hover:text-primary/80 transition-colors font-medium'>
																	{phone.number}
																</a>
															</div>
														))}
													</div>
												</div>
											</div>
										)}

										{/* Email Addresses */}
										{emailAddresses && emailAddresses.length > 0 && (
											<div className='space-y-3'>
												<div className='flex items-start gap-3'>
													<div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
														<Mail className='h-5 w-5 text-primary' />
													</div>
													<div>
														<h4 className='font-semibold text-foreground mb-2'>Email</h4>
														{emailAddresses.map((email, idx) => (
															<div key={idx} className='mb-1'>
																<span className='text-sm font-medium text-muted-foreground'>{email.label}: </span>
																<a
																	href={`mailto:${email.email}`}
																	className='text-primary hover:text-primary/80 transition-colors font-medium'>
																	{email.email}
																</a>
															</div>
														))}
													</div>
												</div>
											</div>
										)}

										{/* Website */}
										{websiteUrl && (
											<div className='space-y-3'>
												<div className='flex items-center gap-3'>
													<div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
														<Globe className='h-5 w-5 text-primary' />
													</div>
													<div>
														<h4 className='font-semibold text-foreground'>Website</h4>
														<a
															href={websiteUrl}
															target='_blank'
															rel='noopener noreferrer'
															className='text-primary hover:text-primary/80 transition-colors font-medium'>
															{websiteUrl}
														</a>
													</div>
												</div>
											</div>
										)}
									</div>

									{/* Social Media Links */}
									{socialMediaLinks && Object.values(socialMediaLinks).some((link) => link) && (
										<div className='mt-8 pt-6 border-t border-border'>
											<h4 className='font-semibold text-foreground mb-4'>Follow Us</h4>
											<div className='flex gap-3'>
												{Object.entries(socialMediaLinks).map(([platform, url]) => {
													const IconComponent = socialIcons[platform];
													if (url && IconComponent) {
														return (
															<motion.a
																key={platform}
																href={url}
																target='_blank'
																rel='noopener noreferrer'
																className='w-12 h-12 bg-primary/10 hover:bg-primary rounded-xl flex items-center justify-center text-primary hover:text-primary-foreground transition-all duration-300'
																whileHover={{ scale: 1.1 }}
																whileTap={{ scale: 0.9 }}>
																<IconComponent size={20} />
															</motion.a>
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

						{/* Office Hours */}
						{officeHours && officeHours.length > 0 && (
							<motion.div variants={itemVariants}>
								<Card className='h-full bg-card shadow-lg border border-border hover:shadow-xl transition-all duration-300'>
									<CardContent className='p-8'>
										<div className='flex items-center mb-6'>
											<div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4'>
												<Clock className='h-6 w-6 text-primary' />
											</div>
											<h3 className='font-heading text-xl font-bold text-foreground'>Office Hours</h3>
										</div>
										<div className='space-y-4'>
											{officeHours.map((oh, index) => (
												<div
													key={index}
													className='flex justify-between items-center py-3 border-b border-border/50 last:border-b-0'>
													<span className='font-medium text-foreground'>{oh.days}</span>
													<span className='text-muted-foreground font-semibold'>{oh.hours}</span>
												</div>
											))}
										</div>
										<div className='mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10'>
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
			</section>

			{/* Contact Form and Map Section */}
			<section className='py-10 bg-muted/30'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mx-auto'>
						{/* Contact Form */}
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}>
							<Card className='bg-card shadow-xl border border-border h-full'>
								<CardContent className='p-8'>
									<div className='mb-8'>
										<h2 className='text-3xl font-heading font-bold text-foreground mb-4'>Send Us a Message</h2>
										<p className='text-muted-foreground leading-relaxed'>
											Have a specific question or ready to book your next adventure? Drop us a message and we'll get
											back to you within 24 hours.
										</p>
									</div>

									{submitSuccess && (
										<motion.div
											initial={{ opacity: 0, y: -20 }}
											animate={{ opacity: 1, y: 0 }}
											className='mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl'>
											<div className='flex items-center gap-3'>
												<CheckCircle className='w-5 h-5 text-emerald-600' />
												<p className='text-emerald-800 font-medium'>
													Thank you! Your message has been sent successfully.
												</p>
											</div>
										</motion.div>
									)}

									<form onSubmit={handleSubmit} className='space-y-6'>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<div>
												<Label htmlFor='name' className='text-foreground font-medium mb-2 block'>
													Your Name *
												</Label>
												<Input
													id='name'
													name='name'
													value={formData.name}
													onChange={handleChange}
													placeholder='John Doe'
													required
													className='h-12 border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
												/>
											</div>
											<div>
												<Label htmlFor='email' className='text-foreground font-medium mb-2 block'>
													Email Address *
												</Label>
												<Input
													id='email'
													name='email'
													type='email'
													value={formData.email}
													onChange={handleChange}
													placeholder='john@example.com'
													required
													className='h-12 border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
												/>
											</div>
										</div>

										<div>
											<Label htmlFor='subject' className='text-foreground font-medium mb-2 block'>
												Subject *
											</Label>
											<Input
												id='subject'
												name='subject'
												value={formData.subject}
												onChange={handleChange}
												placeholder='How can we help you?'
												required
												className='h-12 border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
											/>
										</div>

										<div>
											<Label htmlFor='message' className='text-foreground font-medium mb-2 block'>
												Your Message *
											</Label>
											<Textarea
												id='message'
												name='message'
												value={formData.message}
												onChange={handleChange}
												placeholder='Tell us about your travel plans, questions, or how we can assist you...'
												rows={6}
												required
												className='resize-none border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
											/>
										</div>

										<AnimatedButton
											type='submit'
											className='w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
											disabled={isSubmitting}>
											{isSubmitting ? (
												<>
													<motion.div
														animate={{ rotate: 360 }}
														transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
														className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2'
													/>
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
						</motion.div>

						{/* Map */}
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}>
							<Card className='bg-card shadow-xl border border-border h-full'>
								<CardContent className='p-8 h-full flex flex-col'>
									<div className='mb-6'>
										<h2 className='text-3xl font-heading font-bold text-foreground mb-4'>Find Us Here</h2>
										<p className='text-muted-foreground'>
											Visit our office for personalized travel consultation and planning services.
										</p>
									</div>
									<div className='flex-1 min-h-[400px]'>
										{mapEmbedUrl ? (
											<div className='h-full overflow-hidden rounded-xl border border-border shadow-inner'>
												<iframe
													src={mapEmbedUrl}
													width='100%'
													height='100%'
													style={{ border: 0 }}
													allowFullScreen=''
													loading='lazy'
													referrerPolicy='no-referrer-when-downgrade'
													title='Office Location Map'
													className='w-full h-full'
												/>
											</div>
										) : (
											<div className='flex h-full items-center justify-center rounded-xl border border-border bg-muted/50'>
												<div className='text-center'>
													<MapPin className='h-16 w-16 mx-auto mb-4 text-primary/50' />
													<h3 className='text-lg font-semibold text-foreground mb-2'>Map Unavailable</h3>
													<p className='text-muted-foreground'>Please use the contact information to reach us.</p>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			{termsAndConditions && termsAndConditions.length > 0 && (
				<section className='py-10 bg-background pb-12'>
					<div className='container mx-auto px-4'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className='text-center mb-16'>
							<h2 className='text-3xl md:text-4xl font-heading font-bold text-foreground mb-4'>
								Frequently Asked Questions
							</h2>
							<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
								Find answers to common questions about our services, booking process, and travel policies.
							</p>
						</motion.div>

						<div className='max-w-4xl mx-auto'>
							<Accordion type='single' collapsible className='w-full space-y-4'>
								{termsAndConditions.map((faq, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.5, delay: index * 0.1 }}>
										<AccordionItem
											value={`item-${index}`}
											className='rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300'>
											<AccordionTrigger className='px-6 py-5 text-left font-heading text-lg font-semibold hover:no-underline hover:text-primary transition-colors'>
												{faq.title}
											</AccordionTrigger>
											<AccordionContent className='px-6 pb-5 pt-0 text-muted-foreground leading-relaxed'>
												<div
													dangerouslySetInnerHTML={{
														__html: faq.content.replace(/\n/g, '<br />'),
													}}
												/>
											</AccordionContent>
										</AccordionItem>
									</motion.div>
								))}
							</Accordion>
						</div>
					</div>
				</section>
			)}
		</div>
	);
};

export default Contact;
