import { useState, useEffect } from 'react';
import { useContactInfoQuery } from '@/hooks/useContactInfoQuery';
import { useContactInfoMutation } from '@/hooks/useContactInfoMutation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Loader2,
	PlusCircle,
	Trash2,
	Save,
	Building,
	LinkIcon,
	FileText,
	Phone,
	Mail,
	Clock,
	MapPin,
} from 'lucide-react';

const initialFormData = {
	companyName: '',
	address: { street: '', city: '', state: '', zipCode: '', country: '' },
	phoneNumbers: [],
	emailAddresses: [],
	websiteUrl: '',
	socialMediaLinks: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' },
	mapEmbedUrl: '',
	officeHours: [],
	termsAndConditions: [],
	additionalInfo: '',
};

const AdminContactInfo = () => {
	const { data: contactInfo, isLoading, isError, error: queryError } = useContactInfoQuery();
	const { updateContactInfo, isPending: isUpdating } = useContactInfoMutation();

	const [formData, setFormData] = useState(initialFormData);

	useEffect(() => {
		if (contactInfo) {
			setFormData((prev) => ({
				...initialFormData,
				...contactInfo,
				address: { ...initialFormData.address, ...(contactInfo.address || {}) },
				socialMediaLinks: { ...initialFormData.socialMediaLinks, ...(contactInfo.socialMediaLinks || {}) },
				phoneNumbers: contactInfo.phoneNumbers || [],
				emailAddresses: contactInfo.emailAddresses || [],
				officeHours: contactInfo.officeHours || [],
				termsAndConditions: contactInfo.termsAndConditions || [],
			}));
		}
	}, [contactInfo]);

	const handleInputChange = (e, section = null, index = null, field = null) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			if (section) {
				const newSectionData = [...(prev[section] || [])];
				if (index !== null && newSectionData[index] !== undefined) {
					newSectionData[index] = { ...newSectionData[index], [field || name]: value };
				}
				return { ...prev, [section]: newSectionData };
			}
			return { ...prev, [name]: value };
		});
	};

	const handleDirectNestedChange = (e, parentKey) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[parentKey]: { ...(prev[parentKey] || {}), [name]: value },
		}));
	};

	const addArrayItem = (section) => {
		setFormData((prev) => {
			const currentArray = prev[section] || [];
			let newItem = {};
			if (section === 'phoneNumbers') newItem = { label: '', number: '' };
			else if (section === 'emailAddresses') newItem = { label: '', email: '' };
			else if (section === 'officeHours') newItem = { days: '', hours: '' };
			else if (section === 'termsAndConditions') newItem = { title: '', content: '' };
			return { ...prev, [section]: [...currentArray, newItem] };
		});
	};

	const removeArrayItem = (section, index) => {
		setFormData((prev) => ({
			...prev,
			[section]: (prev[section] || []).filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// eslint-disable-next-line no-unused-vars
		const { __v, _id, createdAt, updatedAt, ...submissionData } = formData;
		updateContactInfo.mutate(submissionData);
	};

	if (isLoading) {
		return (
			<div className='flex min-h-[calc(100vh-100px)] items-center justify-center bg-background text-foreground'>
				<Loader2 className='h-16 w-16 animate-spin text-primary' />
				<p className='ml-4 font-body text-lg'>Loading Website Information...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='flex min-h-[calc(100vh-100px)] flex-col items-center justify-center bg-background p-4 text-center text-danger'>
				<h2 className='font-heading text-2xl font-semibold'>Error Loading Data</h2>
				<p className='mt-2 font-body'>Could not fetch website information. Please try again later.</p>
				{queryError && <p className='mt-1 font-body text-sm'>Details: {queryError.message}</p>}
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background p-4 font-body text-foreground sm:p-6 lg:p-8'>
			<form onSubmit={handleSubmit}>
				<header className='mb-8 flex flex-col items-start justify-between gap-4 rounded-lg bg-card p-6 shadow-md sm:flex-row sm:items-center'>
					<div>
						<h1 className='font-heading text-3xl font-bold tracking-tight text-primary'>Website Information CMS</h1>
						<p className='mt-1 text-muted-foreground'>Manage your website's contact details, policies, and more.</p>
					</div>
					<Button type='submit' disabled={isUpdating} className='cta-primary'>
						{isUpdating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
						Save All Changes
					</Button>
				</header>

				<Tabs defaultValue='general' className='w-full'>
					<TabsList className='mb-6 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:w-auto'>
						<TabsTrigger value='general'>
							<Building className='mr-2 h-4 w-4' /> General
						</TabsTrigger>
						<TabsTrigger value='contact'>
							<Phone className='mr-2 h-4 w-4' /> Contact Details
						</TabsTrigger>
						<TabsTrigger value='social'>
							<LinkIcon className='mr-2 h-4 w-4' /> Social & Links
						</TabsTrigger>
						<TabsTrigger value='terms'>
							<FileText className='mr-2 h-4 w-4' /> Terms & Policies
						</TabsTrigger>
					</TabsList>

					<TabsContent value='general'>
						<Card>
							<CardHeader>
								<CardTitle className='font-heading text-xl text-primary-600'>General Company Information</CardTitle>
								<CardDescription>Basic details about your company.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6 p-6'>
								<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
									<div>
										<Label htmlFor='companyName' className='font-semibold text-muted-foreground'>
											Company Name
										</Label>
										<Input
											id='companyName'
											name='companyName'
											value={formData.companyName || ''}
											onChange={handleInputChange}
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='websiteUrl' className='font-semibold text-muted-foreground'>
											Website URL
										</Label>
										<Input
											id='websiteUrl'
											name='websiteUrl'
											type='url'
											value={formData.websiteUrl || ''}
											onChange={handleInputChange}
											placeholder='https://www.example.com'
											className='mt-1'
										/>
									</div>
								</div>
								<div>
									<Label htmlFor='additionalInfo' className='font-semibold text-muted-foreground'>
										Additional Information
									</Label>
									<Textarea
										id='additionalInfo'
										name='additionalInfo'
										value={formData.additionalInfo || ''}
										onChange={handleInputChange}
										placeholder='Any extra details for your contact page (e.g., mission statement, special announcements).'
										rows={4}
										className='mt-1'
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='contact' className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
						<Card>
							<CardHeader>
								<CardTitle className='font-heading text-xl text-primary-600'>Physical Address</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4 p-6'>
								<div>
									<Label htmlFor='street' className='font-semibold text-muted-foreground'>
										Street
									</Label>
									<Input
										id='street'
										name='street'
										value={formData.address?.street || ''}
										onChange={(e) => handleDirectNestedChange(e, 'address')}
										className='mt-1'
									/>
								</div>
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
									<div>
										<Label htmlFor='city' className='font-semibold text-muted-foreground'>
											City
										</Label>
										<Input
											id='city'
											name='city'
											value={formData.address?.city || ''}
											onChange={(e) => handleDirectNestedChange(e, 'address')}
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='state' className='font-semibold text-muted-foreground'>
											State/Province
										</Label>
										<Input
											id='state'
											name='state'
											value={formData.address?.state || ''}
											onChange={(e) => handleDirectNestedChange(e, 'address')}
											className='mt-1'
										/>
									</div>
								</div>
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
									<div>
										<Label htmlFor='zipCode' className='font-semibold text-muted-foreground'>
											Zip/Postal Code
										</Label>
										<Input
											id='zipCode'
											name='zipCode'
											value={formData.address?.zipCode || ''}
											onChange={(e) => handleDirectNestedChange(e, 'address')}
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='country' className='font-semibold text-muted-foreground'>
											Country
										</Label>
										<Input
											id='country'
											name='country'
											value={formData.address?.country || ''}
											onChange={(e) => handleDirectNestedChange(e, 'address')}
											className='mt-1'
										/>
									</div>
								</div>
							</CardContent>
						</Card>
						<div className='space-y-6'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center font-heading text-xl text-primary-600'>
										<Phone className='mr-2 h-5 w-5' /> Phone Numbers
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4 p-6'>
									{(formData.phoneNumbers || []).map((phone, index) => (
										<div key={index} className='rounded-md border bg-content1 p-4'>
											<div className='mb-2 flex items-center justify-between'>
												<h4 className='font-semibold text-muted-foreground'>Phone {index + 1}</h4>
												<Button
													type='button'
													variant='ghost'
													size='icon'
													onClick={() => removeArrayItem('phoneNumbers', index)}
													className='text-danger-500 hover:bg-danger-50'>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
											<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
												<Input
													name='label'
													value={phone.label || ''}
													onChange={(e) => handleInputChange(e, 'phoneNumbers', index)}
													placeholder='Label (e.g., Main)'
												/>
												<Input
													name='number'
													type='tel'
													value={phone.number || ''}
													onChange={(e) => handleInputChange(e, 'phoneNumbers', index)}
													placeholder='Number'
												/>
											</div>
										</div>
									))}
									<Button type='button' variant='outline' onClick={() => addArrayItem('phoneNumbers')}>
										<PlusCircle className='mr-2 h-4 w-4' /> Add Phone
									</Button>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center font-heading text-xl text-primary-600'>
										<Mail className='mr-2 h-5 w-5' /> Email Addresses
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4 p-6'>
									{(formData.emailAddresses || []).map((email, index) => (
										<div key={index} className='rounded-md border bg-content1 p-4'>
											<div className='mb-2 flex items-center justify-between'>
												<h4 className='font-semibold text-muted-foreground'>Email {index + 1}</h4>
												<Button
													type='button'
													variant='ghost'
													size='icon'
													onClick={() => removeArrayItem('emailAddresses', index)}
													className='text-danger-500 hover:bg-danger-50'>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
											<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
												<Input
													name='label'
													value={email.label || ''}
													onChange={(e) => handleInputChange(e, 'emailAddresses', index)}
													placeholder='Label (e.g., Support)'
												/>
												<Input
													name='email'
													type='email'
													value={email.email || ''}
													onChange={(e) => handleInputChange(e, 'emailAddresses', index)}
													placeholder='Email Address'
												/>
											</div>
										</div>
									))}
									<Button type='button' variant='outline' onClick={() => addArrayItem('emailAddresses')}>
										<PlusCircle className='mr-2 h-4 w-4' /> Add Email
									</Button>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center font-heading text-xl text-primary-600'>
										<Clock className='mr-2 h-5 w-5' /> Office Hours
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4 p-6'>
									{(formData.officeHours || []).map((item, index) => (
										<div key={index} className='rounded-md border bg-content1 p-4'>
											<div className='mb-2 flex items-center justify-between'>
												<h4 className='font-semibold text-muted-foreground'>Schedule {index + 1}</h4>
												<Button
													type='button'
													variant='ghost'
													size='icon'
													onClick={() => removeArrayItem('officeHours', index)}
													className='text-danger-500 hover:bg-danger-50'>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
											<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
												<Input
													name='days'
													value={item.days || ''}
													onChange={(e) => handleInputChange(e, 'officeHours', index)}
													placeholder='Days (e.g., Mon - Fri)'
												/>
												<Input
													name='hours'
													value={item.hours || ''}
													onChange={(e) => handleInputChange(e, 'officeHours', index)}
													placeholder='Hours (e.g., 9am - 5pm)'
												/>
											</div>
										</div>
									))}
									<Button type='button' variant='outline' onClick={() => addArrayItem('officeHours')}>
										<PlusCircle className='mr-2 h-4 w-4' /> Add Hours
									</Button>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value='social'>
						<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center font-heading text-xl text-primary-600'>
										<LinkIcon className='mr-2 h-5 w-5' /> Social Media Links
									</CardTitle>
									<CardDescription>Connect your social media profiles.</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4 p-6'>
									<div>
										<Label htmlFor='facebook' className='font-semibold text-muted-foreground'>
											Facebook URL
										</Label>
										<Input
											id='facebook'
											name='facebook'
											value={formData.socialMediaLinks?.facebook || ''}
											onChange={(e) => handleDirectNestedChange(e, 'socialMediaLinks')}
											placeholder='https://facebook.com/yourpage'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='twitter' className='font-semibold text-muted-foreground'>
											Twitter (X) URL
										</Label>
										<Input
											id='twitter'
											name='twitter'
											value={formData.socialMediaLinks?.twitter || ''}
											onChange={(e) => handleDirectNestedChange(e, 'socialMediaLinks')}
											placeholder='https://twitter.com/yourprofile'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='instagram' className='font-semibold text-muted-foreground'>
											Instagram URL
										</Label>
										<Input
											id='instagram'
											name='instagram'
											value={formData.socialMediaLinks?.instagram || ''}
											onChange={(e) => handleDirectNestedChange(e, 'socialMediaLinks')}
											placeholder='https://instagram.com/yourprofile'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='linkedin' className='font-semibold text-muted-foreground'>
											LinkedIn URL
										</Label>
										<Input
											id='linkedin'
											name='linkedin'
											value={formData.socialMediaLinks?.linkedin || ''}
											onChange={(e) => handleDirectNestedChange(e, 'socialMediaLinks')}
											placeholder='https://linkedin.com/in/yourprofile'
											className='mt-1'
										/>
									</div>
									<div>
										<Label htmlFor='youtube' className='font-semibold text-muted-foreground'>
											YouTube URL
										</Label>
										<Input
											id='youtube'
											name='youtube'
											value={formData.socialMediaLinks?.youtube || ''}
											onChange={(e) => handleDirectNestedChange(e, 'socialMediaLinks')}
											placeholder='https://youtube.com/yourchannel'
											className='mt-1'
										/>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center font-heading text-xl text-primary-600'>
										<MapPin className='mr-2 h-5 w-5' /> Map Integration
									</CardTitle>
									<CardDescription>Embed a map to your location.</CardDescription>
								</CardHeader>
								<CardContent className='p-6'>
									<div>
										<Label htmlFor='mapEmbedUrl' className='font-semibold text-muted-foreground'>
											Google Maps Embed URL
										</Label>
										<Textarea
											id='mapEmbedUrl'
											name='mapEmbedUrl'
											value={formData.mapEmbedUrl || ''}
											onChange={handleInputChange}
											placeholder='e.g., <iframe src="https://www.google.com/maps/embed?pb=..."></iframe>'
											rows={5}
											className='mt-1'
										/>
										<p className='mt-2 text-sm text-muted-foreground'>
											Go to Google Maps, find your location, click "Share", then "Embed a map", and copy the HTML.
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value='terms'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center font-heading text-xl text-primary-600'>
									<FileText className='mr-2 h-5 w-5' /> Terms, Conditions & Policies
								</CardTitle>
								<CardDescription>Manage your website's legal documents and policies.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6 p-6'>
								{(formData.termsAndConditions || []).map((term, index) => (
									<div key={index} className='rounded-lg border bg-content1 p-6 shadow-sm'>
										<div className='mb-4 flex items-center justify-between'>
											<h3 className='text-lg font-semibold text-muted-foreground'>Policy Section {index + 1}</h3>
											<Button
												type='button'
												variant='ghost'
												size='icon'
												onClick={() => removeArrayItem('termsAndConditions', index)}
												className='text-danger-500 hover:bg-danger-50'>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
										<div className='space-y-4'>
											<div>
												<Label htmlFor={`term-title-${index}`} className='font-semibold text-muted-foreground'>
													Title / Heading
												</Label>
												<Input
													id={`term-title-${index}`}
													name='title'
													value={term.title || ''}
													onChange={(e) => handleInputChange(e, 'termsAndConditions', index)}
													placeholder='e.g., Privacy Policy, Refund Policy'
													className='mt-1'
												/>
											</div>
											<div>
												<Label htmlFor={`term-content-${index}`} className='font-semibold text-muted-foreground'>
													Content
												</Label>
												<Textarea
													id={`term-content-${index}`}
													name='content'
													value={term.content || ''}
													onChange={(e) => handleInputChange(e, 'termsAndConditions', index)}
													rows={8}
													placeholder='Enter the full text for this section...'
													className='mt-1'
												/>
											</div>
										</div>
									</div>
								))}
								<Button
									type='button'
									variant='outline'
									onClick={() => addArrayItem('termsAndConditions')}
									className='border-primary text-primary hover:bg-primary/10'>
									<PlusCircle className='mr-2 h-4 w-4' /> Add New Policy Section
								</Button>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</form>
		</div>
	);
};

export default AdminContactInfo;
