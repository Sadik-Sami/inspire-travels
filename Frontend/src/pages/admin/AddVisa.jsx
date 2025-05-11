'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useVisaMutation from '@/hooks/useVisaMutation';
import { toast } from 'sonner';
import { Upload, X, ImageIcon, Star } from 'lucide-react';

const AddVisa = () => {
	const navigate = useNavigate();
	const { createVisa } = useVisaMutation();

	const [formData, setFormData] = useState({
		title: '',
		shortDescription: '',
		longDescription: '',
		price: '',
		currency: 'USD',
		from: '',
		to: '',
		requirements: '',
		processingTime: '',
		specialRequests: '',
		featured: false,
	});

	const [photos, setPhotos] = useState([]);
	const [previewUrls, setPreviewUrls] = useState([]);
	const [coverImageIndex, setCoverImageIndex] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handlePhotoChange = (e) => {
		const selectedFiles = Array.from(e.target.files);

		if (selectedFiles.length > 0) {
			// Create preview URLs for the selected images
			const newPreviewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

			setPhotos([...photos, ...selectedFiles]);
			setPreviewUrls([...previewUrls, ...newPreviewUrls]);

			// Set the first uploaded image as cover if no cover is selected yet
			if (coverImageIndex === null) {
				setCoverImageIndex(0);
			}
		}
	};

	const removePhoto = (index) => {
		const updatedPhotos = [...photos];
		const updatedPreviews = [...previewUrls];

		// Revoke the object URL to avoid memory leaks
		URL.revokeObjectURL(previewUrls[index]);

		updatedPhotos.splice(index, 1);
		updatedPreviews.splice(index, 1);

		setPhotos(updatedPhotos);
		setPreviewUrls(updatedPreviews);

		// Update cover image index if needed
		if (coverImageIndex === index) {
			setCoverImageIndex(updatedPhotos.length > 0 ? 0 : null);
		} else if (coverImageIndex > index) {
			setCoverImageIndex(coverImageIndex - 1);
		}
	};

	const setCoverImage = (index) => {
		setCoverImageIndex(index);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!formData.title ||
			!formData.shortDescription ||
			!formData.longDescription ||
			!formData.price ||
			!formData.from ||
			!formData.to
		) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (photos.length === 0) {
			toast.error('Please upload at least one photo');
			return;
		}

		setIsSubmitting(true);

		try {
			await createVisa.mutateAsync({
				...formData,
				photos,
				coverImageIndex,
			});

			// Cleanup preview URLs
			previewUrls.forEach((url) => URL.revokeObjectURL(url));

			navigate('/admin/visas');
		} catch (error) {
			console.error('Error creating visa:', error);
			toast.error('Failed to create visa');
			setIsSubmitting(false);
		}
	};

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Add New Visa Package</h1>
				<p className='text-gray-600'>Create a new visa package for your customers</p>
			</div>

			<form onSubmit={handleSubmit} className='bg-white shadow-md rounded-lg p-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div className='col-span-2'>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='title'>
							Title <span className='text-red-500'>*</span>
						</label>
						<input
							type='text'
							id='title'
							name='title'
							value={formData.title}
							onChange={handleChange}
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div className='col-span-2'>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='shortDescription'>
							Short Description <span className='text-red-500'>*</span>
						</label>
						<input
							type='text'
							id='shortDescription'
							name='shortDescription'
							value={formData.shortDescription}
							onChange={handleChange}
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div className='col-span-2'>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='longDescription'>
							Long Description <span className='text-red-500'>*</span>
						</label>
						<textarea
							id='longDescription'
							name='longDescription'
							value={formData.longDescription}
							onChange={handleChange}
							rows={6}
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='price'>
							Price <span className='text-red-500'>*</span>
						</label>
						<input
							type='number'
							id='price'
							name='price'
							value={formData.price}
							onChange={handleChange}
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
							min='0'
							step='0.01'
							required
						/>
					</div>

					<div>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='currency'>
							Currency
						</label>
						<select
							id='currency'
							name='currency'
							value={formData.currency}
							onChange={handleChange}
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
							<option value='USD'>USD</option>
							<option value='EUR'>EUR</option>
							<option value='BDT'>BDT</option>
						</select>
					</div>

					<div>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='from'>
							From <span className='text-red-500'>*</span>
						</label>
						<input
							type='text'
							id='from'
							name='from'
							value={formData.from}
							onChange={handleChange}
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='to'>
							To <span className='text-red-500'>*</span>
						</label>
						<input
							type='text'
							id='to'
							name='to'
							value={formData.to}
							onChange={handleChange}
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>

					<div>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='processingTime'>
							Processing Time
						</label>
						<input
							type='text'
							id='processingTime'
							name='processingTime'
							value={formData.processingTime}
							onChange={handleChange}
							placeholder='e.g. 7-14 business days'
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
					</div>

					<div>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='specialRequests'>
							Special Requests
						</label>
						<input
							type='text'
							id='specialRequests'
							name='specialRequests'
							value={formData.specialRequests}
							onChange={handleChange}
							placeholder='e.g. Medical certificate, Travel insurance'
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
					</div>

					<div className='col-span-2'>
						<label className='block text-gray-700 font-medium mb-2' htmlFor='requirements'>
							Requirements (comma separated)
						</label>
						<textarea
							id='requirements'
							name='requirements'
							value={formData.requirements}
							onChange={handleChange}
							rows={3}
							placeholder='e.g. Valid passport, 2 passport-sized photos, Completed application form'
							className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
					</div>

					<div className='col-span-2'>
						<div className='flex items-center'>
							<input
								type='checkbox'
								id='featured'
								name='featured'
								checked={formData.featured}
								onChange={handleChange}
								className='w-4 h-4 text-blue-600 border rounded focus:ring-blue-500'
							/>
							<label className='ml-2 text-gray-700' htmlFor='featured'>
								Featured Visa
							</label>
						</div>
					</div>

					<div className='col-span-2'>
						<label className='block text-gray-700 font-medium mb-2'>
							Photos <span className='text-red-500'>*</span>
						</label>
						<p className='text-sm text-gray-500 mb-2'>
							Click the star icon to set an image as the cover photo. The first uploaded image will be automatically set
							as the cover.
						</p>

						<div className='border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4'>
							<div className='flex flex-wrap gap-4 mb-3'>
								{previewUrls.map((url, index) => (
									<div key={index} className='relative group'>
										<img
											src={url || '/placeholder.svg'}
											alt={`Preview ${index}`}
											className={`h-24 w-24 object-cover rounded-lg ${
												coverImageIndex === index ? 'ring-2 ring-yellow-400' : ''
											}`}
										/>
										<div className='absolute top-1 right-1 flex gap-1'>
											<button
												type='button'
												onClick={() => setCoverImage(index)}
												className={`bg-yellow-400 text-white rounded-full p-1 ${
													coverImageIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
												} transition-opacity`}
												title='Set as cover image'>
												<Star size={16} />
											</button>
											<button
												type='button'
												onClick={() => removePhoto(index)}
												className='bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
												title='Remove image'>
												<X size={16} />
											</button>
										</div>
										{coverImageIndex === index && (
											<div className='absolute bottom-1 left-1 bg-yellow-400 text-xs text-white px-1.5 py-0.5 rounded'>
												Cover
											</div>
										)}
									</div>
								))}

								{previewUrls.length === 0 && (
									<div className='flex flex-col items-center justify-center text-gray-400 h-24 w-full'>
										<ImageIcon size={32} />
										<span className='text-sm mt-2'>No photos selected</span>
									</div>
								)}
							</div>

							<label className='flex items-center justify-center gap-2 cursor-pointer py-3 px-4 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors'>
								<Upload size={20} />
								<span>Select Photos</span>
								<input type='file' multiple accept='image/*' onChange={handlePhotoChange} className='hidden' />
							</label>
							<p className='text-xs text-gray-500 mt-2'>
								Upload up to 5 high-quality images. Maximum size: 5MB per image.
							</p>
						</div>
					</div>
				</div>

				<div className='flex justify-end gap-3 mt-6'>
					<button
						type='button'
						onClick={() => navigate('/admin/visas')}
						className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'>
						Cancel
					</button>
					<button
						type='submit'
						disabled={isSubmitting}
						className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 ${
							isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
						}`}>
						{isSubmitting ? (
							<>
								<div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
								<span>Creating...</span>
							</>
						) : (
							'Create Visa'
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default AddVisa;
