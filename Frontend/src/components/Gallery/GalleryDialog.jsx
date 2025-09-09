import { useState } from 'react';
import { Calendar, MapPin, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const GalleryDialog = ({ isOpen, onClose, galleryItem }) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	if (!galleryItem) return null;

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(date);
	};

	// Get all images (main image + additional images)
	const allImages = [galleryItem.image, ...(galleryItem.images || [])].filter(Boolean);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto p-0'>
				<div className='relative'>
					{/* Image Section */}
					<div className='relative h-64 md:h-80 overflow-hidden rounded-t-lg'>
						<img
							src={galleryItem.image?.url || '/placeholder.svg?height=400&width=800'}
							alt={galleryItem.title}
							className='w-full h-full object-cover'
						/>
					</div>

					{/* Content Section */}
					<div className='p-6'>
						<DialogHeader className='mb-4'>
							<DialogTitle className='text-2xl font-bold text-left'>{galleryItem.title}</DialogTitle>
							<DialogDescription className='sr-only'>{galleryItem.title}'s description</DialogDescription>
						</DialogHeader>

						{/* Metadata */}
						<div className='flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground'>
							<div className='flex items-center'>
								<Calendar size={16} className='mr-1' />
								<span>{formatDate(galleryItem.createdAt)}</span>
							</div>
						</div>

						{/* Category */}
						{galleryItem.category && (
							<div className='mb-4'>
								<Badge variant='secondary' className='mb-2'>
									{galleryItem.category}
								</Badge>
							</div>
						)}

						{/* Description */}
						{galleryItem.content && (
							<div className='mb-6'>
								<h3 className='text-lg font-semibold mb-2'>Story</h3>
								<p className='text-muted-foreground leading-relaxed whitespace-pre-line'>{galleryItem.content}</p>
							</div>
						)}

						{/* Tags */}
						{galleryItem.tags && galleryItem.tags.length > 0 && (
							<div className='mb-6'>
								<h3 className='text-lg font-semibold mb-2'>Tags</h3>
								<div className='flex flex-wrap gap-2'>
									{galleryItem.tags.map((tag, index) => (
										<Badge key={index} variant='outline'>
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default GalleryDialog;
