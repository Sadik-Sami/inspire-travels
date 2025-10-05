import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, ChevronLeft, Eye, Share2, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useBlogDetail, useRelatedBlogs } from '@/hooks/useBlogQuery';
import FadeIn from '@/components/Animation/FadeIn';
import NewsletterSection from '@/components/Sections/NewsletterSection';
import { useDynamicSEO } from '@/hooks/useSEO';
import SEOHead from '@/components/SEO/SEOHead';

const BlogDetails = () => {
	const { slug } = useParams();
	const { data: blog, isLoading, isError } = useBlogDetail(slug);

	const seoData = useDynamicSEO('blog-post', blog, isLoading);

	// Fetch related blogs based on categories
	const { data: relatedData } = useRelatedBlogs(blog?.categories || [], blog?._id, 3);

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

	// Get author initials for avatar fallback
	const getAuthorInitials = (name) => {
		if (!name) return 'A';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	};

	// Handle share functionality
	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: blog.title,
					text: blog.summary,
					url: window.location.href,
				});
			} catch (error) {
				console.log('Error sharing:', error);
			}
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(window.location.href);
		}
	};

	const relatedBlogs = relatedData?.blogs || [];

	if (isLoading) {
		return (
			<div className='min-h-screen bg-background'>
				{/* Loading Hero */}
				<div className='relative h-[60vh] bg-muted animate-pulse'>
					<div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
					<div className='relative container mx-auto px-4 h-full flex flex-col justify-end pb-12'>
						<Skeleton className='h-8 w-32 mb-6 bg-white/20' />
						<Skeleton className='h-12 w-3/4 mb-4 bg-white/20' />
						<div className='flex gap-4'>
							<Skeleton className='h-4 w-24 bg-white/20' />
							<Skeleton className='h-4 w-24 bg-white/20' />
							<Skeleton className='h-4 w-24 bg-white/20' />
						</div>
					</div>
				</div>

				{/* Loading Content */}
				<div className='container mx-auto px-4 py-12'>
					<div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
						<div className='lg:col-span-3 space-y-6'>
							<div className='flex gap-2'>
								<Skeleton className='h-6 w-20' />
								<Skeleton className='h-6 w-24' />
							</div>
							<div className='space-y-4'>
								{[...Array(8)].map((_, i) => (
									<Skeleton key={i} className='h-4 w-full' />
								))}
							</div>
						</div>
						<div className='space-y-6'>
							<Skeleton className='h-32 w-full' />
							<Skeleton className='h-48 w-full' />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (isError || !blog) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='text-center'>
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mb-8'>
						<BookOpen size={64} className='mx-auto text-muted-foreground mb-4' />
						<h2 className='text-3xl font-bold mb-4'>Blog Not Found</h2>
						<p className='text-muted-foreground mb-6 max-w-md'>
							The blog post you're looking for doesn't exist or has been removed.
						</p>
						<Button asChild size='lg'>
							<Link to='/blogs' className='flex items-center gap-2'>
								<ChevronLeft size={16} />
								Back to Blogs
							</Link>
						</Button>
					</motion.div>
				</div>
			</div>
		);
	}

	return (
		<>
			<SEOHead {...seoData} />
			<div className='min-h-screen bg-background'>
				{/* Hero Section */}
				<div className='relative h-[60vh] min-h-[500px] overflow-hidden'>
					<div className='absolute inset-0'>
						<img
							src={blog.coverImage?.url || '/placeholder.svg?height=800&width=1600'}
							alt={blog.title}
							className='w-full h-full object-cover'
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20' />
					</div>
					<div className='relative container mx-auto px-4 h-full flex flex-col justify-end pb-12'>
						<motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
							<Button
								variant='secondary'
								size='sm'
								className='mb-6 w-fit bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
								asChild>
								<Link to='/blogs' className='flex items-center gap-2'>
									<ChevronLeft size={16} />
									Back to Blogs
								</Link>
							</Button>
							<div className='flex flex-wrap gap-2 mb-4'>
								{blog.categories.map((category, index) => (
									<Badge key={index} variant='secondary' className='bg-primary/90 text-primary-foreground'>
										{category}
									</Badge>
								))}
							</div>
							<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight'>{blog.title}</h1>
							<div className='flex flex-wrap items-center gap-6 text-white/90'>
								<div className='flex items-center gap-2'>
									<Avatar className='h-8 w-8'>
										<AvatarImage src={blog.author?.avatar || '/placeholder.svg'} />
										<AvatarFallback className='bg-white/20 text-white text-sm'>
											{getAuthorInitials(blog.author?.name)}
										</AvatarFallback>
									</Avatar>
									<span className='font-medium'>{blog.author?.name || 'Anonymous'}</span>
								</div>
								<div className='flex items-center gap-2'>
									<Calendar size={16} />
									<span>{formatDate(blog.createdAt)}</span>
								</div>
								<div className='flex items-center gap-2'>
									<Clock size={16} />
									<span>{blog.readTime} min read</span>
								</div>
								<div className='flex items-center gap-2'>
									<Eye size={16} />
									<span>{blog.viewCount} views</span>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
				{/* Main Content */}
				<div className='container mx-auto px-4 py-12'>
					<div className='grid grid-cols-1 lg:grid-cols-4 gap-12'>
						{/* Blog Content - 3/4 width */}
						<div className='lg:col-span-3'>
							<FadeIn>
								<article className='prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground'>
									{/* Blog Summary */}
									{blog.summary && (
										<div className='bg-muted/50 border-l-4 border-primary p-6 rounded-r-lg mb-8 not-prose'>
											<p className='text-lg font-medium text-foreground leading-relaxed m-0'>{blog.summary}</p>
										</div>
									)}
									{/* Image Carousel */}
									{blog.images && blog.images.length > 0 && (
										<div className='my-8 not-prose'>
											<Carousel className='w-full'>
												<CarouselContent>
													{blog.images.map((image, index) => (
														<CarouselItem key={index}>
															<div className='relative aspect-video overflow-hidden rounded-lg'>
																<img
																	src={image.url || '/placeholder.svg'}
																	alt={`Blog image ${index + 1}`}
																	className='w-full h-full object-cover'
																/>
															</div>
														</CarouselItem>
													))}
												</CarouselContent>
												{blog.images.length > 1 && (
													<>
														<CarouselPrevious className='left-4' />
														<CarouselNext className='right-4' />
													</>
												)}
											</Carousel>
										</div>
									)}
									{/* Blog Content */}
									<div className='whitespace-pre-line leading-relaxed'>{blog.content}</div>
									{/* Tags */}
									{blog.tags && blog.tags.length > 0 && (
										<div className='flex flex-wrap items-center gap-3 mt-12 pt-8 border-t not-prose'>
											<Tag size={18} className='text-muted-foreground' />
											<span className='font-medium text-foreground'>Tags:</span>
											{blog.tags.map((tag, index) => (
												<Badge
													key={index}
													variant='outline'
													className='hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer'>
													{tag}
												</Badge>
											))}
										</div>
									)}
								</article>
								{/* Share Section */}
								<div className='flex items-center justify-between py-8 border-t border-b mt-12'>
									<div>
										<h3 className='font-semibold text-lg mb-1'>Enjoyed this article?</h3>
										<p className='text-muted-foreground'>Share it with your friends!</p>
									</div>
									<Button onClick={handleShare} variant='outline' className='flex items-center gap-2'>
										<Share2 size={16} />
										Share
									</Button>
								</div>
							</FadeIn>
						</div>
						{/* Sidebar - 1/4 width */}
						<div className='space-y-8'>
							{/* Author Card */}
							<Card className='overflow-hidden'>
								<CardContent className='p-6'>
									<h3 className='font-bold text-xl mb-4'>About the Author</h3>
									<div className='flex items-start gap-4'>
										<Avatar className='h-16 w-16'>
											<AvatarImage src={blog.author?.avatar || '/placeholder.svg'} />
											<AvatarFallback className='text-lg'>{getAuthorInitials(blog.author?.name)}</AvatarFallback>
										</Avatar>
										<div className='flex-1'>
											<h4 className='font-semibold text-lg mb-1'>{blog.author?.name || 'Anonymous'}</h4>
											<p className='text-muted-foreground text-sm mb-3'>Travel Writer & Explorer</p>
											<p className='text-sm leading-relaxed'>
												Passionate about discovering hidden gems and sharing authentic travel experiences with fellow
												adventurers.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
							{/* Related Articles */}
							{relatedBlogs.length > 0 && (
								<Card>
									<CardContent className='p-6'>
										<h3 className='font-bold text-xl mb-6'>Related Articles</h3>
										<div className='space-y-6'>
											{relatedBlogs.map((relatedBlog, index) => (
												<motion.div
													key={relatedBlog._id}
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: index * 0.1 }}>
													<Link to={`/blogs/${relatedBlog.slug}`} className='group block'>
														<div className='flex gap-4'>
															<div className='flex-shrink-0 w-20 h-16 overflow-hidden rounded-lg'>
																<img
																	src={relatedBlog.coverImage?.url || '/placeholder.svg?height=100&width=100'}
																	alt={relatedBlog.title}
																	className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
																/>
															</div>
															<div className='flex-1 min-w-0'>
																<h4 className='font-medium line-clamp-2 group-hover:text-primary transition-colors mb-2'>
																	{relatedBlog.title}
																</h4>
																<div className='flex items-center gap-3 text-xs text-muted-foreground'>
																	<span>{formatDate(relatedBlog.createdAt)}</span>
																	<span>•</span>
																	<span>{relatedBlog.readTime} min read</span>
																</div>
															</div>
														</div>
													</Link>
													{index < relatedBlogs.length - 1 && <Separator className='mt-6' />}
												</motion.div>
											))}
										</div>
										<Button asChild variant='outline' className='w-full mt-6'>
											<Link to='/blogs' className='flex items-center justify-center gap-2'>
												View All Articles
												<ArrowRight size={16} />
											</Link>
										</Button>
									</CardContent>
								</Card>
							)}
							{/* Categories */}
							<Card>
								<CardContent className='p-6'>
									<h3 className='font-bold text-xl mb-4'>Categories</h3>
									<div className='flex flex-wrap gap-2'>
										{blog.categories.map((category, index) => (
											<Link key={index} to={`/blogs?category=${encodeURIComponent(category)}`}>
												<Badge
													variant='secondary'
													className='cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'>
													{category}
												</Badge>
											</Link>
										))}
									</div>
								</CardContent>
							</Card>
							{/* Quick Stats */}
							<Card>
								<CardContent className='p-6'>
									<h3 className='font-bold text-xl mb-4'>Article Stats</h3>
									<div className='space-y-3'>
										<div className='flex justify-between items-center'>
											<span className='text-muted-foreground'>Published</span>
											<span className='font-medium'>{formatDate(blog.createdAt)}</span>
										</div>
										<Separator />
										<div className='flex justify-between items-center'>
											<span className='text-muted-foreground'>Reading Time</span>
											<span className='font-medium'>{blog.readTime} minutes</span>
										</div>
										<Separator />
										<div className='flex justify-between items-center'>
											<span className='text-muted-foreground'>Views</span>
											<span className='font-medium'>{blog.viewCount}</span>
										</div>
										{blog.tags && blog.tags.length > 0 && (
											<>
												<Separator />
												<div className='flex justify-between items-center'>
													<span className='text-muted-foreground'>Tags</span>
													<span className='font-medium'>{blog.tags.length}</span>
												</div>
											</>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
				<NewsletterSection />
			</div>
		</>
	);
};

export default BlogDetails;
