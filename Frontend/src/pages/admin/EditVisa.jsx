import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useVisaQuery from '@/hooks/useVisaQuery';
import useVisaMutation from '@/hooks/useVisaMutation';
import { toast } from 'sonner';
import { Upload, X, ImageIcon, ArrowLeft } from 'lucide-react';

const EditVisa = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { useGetVisaById } = useVisaQuery();
	const { data: visa, isLoading } = useGetVisaById(id);
	console.log(visa)
	const { updateVisa } = useVisaMutation();

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

	const [newPhotos, setNewPhotos] = useState([]);
	const [newPhotoUrls, setNewPhotoUrls] = useState([]);
	const [existingPhotos, setExistingPhotos] = useState([]);
	const [photosToRemove, setPhotosToRemove] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (visa) {
			setFormData({
				title: visa.title || '',
				shortDescription: visa.shortDescription || '',
				longDescription: visa.description || '', // Map description to longDescription
				price: visa.pricing?.basePrice.toString() || '',
				currency: visa.pricing?.currency || 'USD',
				from: visa.from || '',
				to: visa.to || '',
				requirements: visa.requirements || '',
				processingTime: visa.processingTime || '',
				specialRequests: visa.specialRequests || '',
				featured: visa.featured || false,
			});

			if (visa.images && visa.images.length > 0) {
				setExistingPhotos(visa.images);
			}
		}
	}, [visa]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handleNewPhotoChange = (e) => {
		const selectedFiles = Array.from(e.target.files);

		if (selectedFiles.length > 0) {
			// Create preview URLs for the selected images
			const newUrls = selectedFiles.map((file) => URL.createObjectURL(file));

			setNewPhotos([...newPhotos, ...selectedFiles]);
			setNewPhotoUrls([...newPhotoUrls, ...newUrls]);
		}
	};

	const removeNewPhoto = (index) => {
		const updatedPhotos = [...newPhotos];
		const updatedUrls = [...newPhotoUrls];

		// Revoke the object URL to avoid memory leaks
		URL.revokeObjectURL(newPhotoUrls[index]);

		updatedPhotos.splice(index, 1);
		updatedUrls.splice(index, 1);

		setNewPhotos(updatedPhotos);
		setNewPhotoUrls(updatedUrls);
	};

	const removeExistingPhoto = (photo) => {
		setExistingPhotos(existingPhotos.filter((p) => p.publicId !== photo.publicId));
		setPhotosToRemove([...photosToRemove, photo.publicId]);
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

		if (existingPhotos.length === 0 && newPhotos.length === 0) {
			toast.error('Please include at least one photo');
			return;
		}

		setIsSubmitting(true);

		try {
			await updateVisa.mutateAsync({
				id,
				visaData: {
					...formData,
					newPhotos,
					removedPhotos: photosToRemove,
				},
			});

			// Cleanup preview URLs
			newPhotoUrls.forEach((url) => URL.revokeObjectURL(url));

			navigate('/admin/visas');
		} catch (error) {
			console.error('Error updating visa:', error);
			toast.error('Failed to update visa');
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<div className='flex justify-center items-center h-64'>
					<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
				</div>
			</div>
		);
	}

	if (!visa) {
		return (
			<div className='container mx-auto px-4 py-8'>
				<div className='bg-white shadow rounded-lg p-8 text-center'>
					<p className='text-gray-500 mb-4'>Visa not found</p>
					<button
						onClick={() => navigate('/admin/visas')}
						className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center gap-2'>
						<ArrowLeft size={18} /> Back to Visas
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Edit Visa</h1>
				<p className='text-gray-600'>Update visa details and information</p>
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
						<label className='block text-gray-700 font-medium mb-2'>Current Photos</label>

						<div className='flex flex-wrap gap-4 mb-6'>
							{existingPhotos.length > 0 ? (
								existingPhotos.map((photo, index) => (
									<div key={index} className='relative group'>
										<img
											src={photo.url || '/placeholder.svg'}
											alt={`Visa photo ${index}`}
											className='h-24 w-24 object-cover rounded-lg'
										/>
										<button
											type='button'
											onClick={() => removeExistingPhoto(photo)}
											className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'>
											<X size={16} />
										</button>
									</div>
								))
							) : (
								<div className='text-gray-400'>No current photos</div>
							)}
						</div>

						<label className='block text-gray-700 font-medium mb-2'>Add New Photos</label>

						<div className='border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4'>
							<div className='flex flex-wrap gap-4 mb-3'>
								{newPhotoUrls.map((url, index) => (
									<div key={index} className='relative group'>
										<img
											src={url || '/placeholder.svg'}
											alt={`New photo ${index}`}
											className='h-24 w-24 object-cover rounded-lg'
										/>
										<button
											type='button'
											onClick={() => removeNewPhoto(index)}
											className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'>
											<X size={16} />
										</button>
									</div>
								))}

								{newPhotoUrls.length === 0 && (
									<div className='flex flex-col items-center justify-center text-gray-400 h-24 w-full'>
										<ImageIcon size={32} />
										<span className='text-sm mt-2'>No new photos selected</span>
									</div>
								)}
							</div>

							<label className='flex items-center justify-center gap-2 cursor-pointer py-3 px-4 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors'>
								<Upload size={20} />
								<span>Select New Photos</span>
								<input type='file' multiple accept='image/*' onChange={handleNewPhotoChange} className='hidden' />
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
								<span>Updating...</span>
							</>
						) : (
							'Update Visa'
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditVisa;
