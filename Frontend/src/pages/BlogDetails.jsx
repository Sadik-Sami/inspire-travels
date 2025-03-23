import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Tag, ChevronLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogDetail, useBlogQuery } from '@/hooks/useBlogQuery';
import FadeIn from '@/components/Animation/FadeIn';
import NewsletterSection from '@/components/Sections/NewsletterSection';

const BlogDetails = () => {
	const { slug } = useParams();
	const { data: blog, isLoading, isError } = useBlogDetail(slug);

	// Fetch related blogs
	const { data: relatedData } = useBlogQuery({
		limit: 3,
		filters: blog ? { category: blog.categories[0] } : {},
		enabled: !!blog && blog.categories && blog.categories.length > 0,
	});

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

	// Filter out the current blog from related blogs
	const relatedBlogs = relatedData?.blogs?.filter((relatedBlog) => relatedBlog._id !== blog?._id).slice(0, 3) || [];

	return (
		<div className='min-h-screen bg-background text-foreground'>
			{isLoading ? (
				// Loading skeleton
				<div className='container mx-auto px-4 py-12'>
					<div className='max-w-4xl mx-auto'>
						<Skeleton className='h-8 w-3/4 mb-4' />
						<div className='flex items-center mb-6'>
							<Skeleton className='h-4 w-32 mr-4' />
							<Skeleton className='h-4 w-32' />
						</div>
						<Skeleton className='h-96 w-full mb-8' />
						<div className='space-y-4'>
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-3/4' />
						</div>
					</div>
				</div>
			) : isError ? (
				// Error state
				<div className='container mx-auto px-4 py-12 text-center'>
					<h2 className='text-2xl font-bold mb-4'>Blog not found</h2>
					<p className='text-muted-foreground mb-6'>The blog you're looking for doesn't exist or has been removed.</p>
					<Button asChild>
						<Link to='/blogs'>Back to Blogs</Link>
					</Button>
				</div>
			) : (
				// Blog content
				<>
					{/* Hero section with cover image */}
					<div className='relative h-[50vh] min-h-[400px]'>
						<div className='absolute inset-0'>
							<img
								src={blog.coverImage?.url || '/placeholder.svg?height=800&width=1600'}
								alt={blog.title}
								className='w-full h-full object-cover'
							/>
							<div className='absolute inset-0 bg-black/50'></div>
						</div>
						<div className='relative container mx-auto px-4 h-full flex flex-col justify-end pb-12'>
							<Button variant='outline' size='sm' className='mb-6 w-fit' asChild>
								<Link to='/blogs' className='flex items-center'>
									<ChevronLeft className='mr-1 h-4 w-4' />
									Back to Blogs
								</Link>
							</Button>
							<h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>{blog.title}</h1>
							<div className='flex flex-wrap items-center gap-4 text-white/80'>
								<div className='flex items-center'>
									<User size={16} className='mr-1' />
									<span>{blog.author?.name || 'Anonymous'}</span>
								</div>
								<div className='flex items-center'>
									<Calendar size={16} className='mr-1' />
									<span>{formatDate(blog.createdAt)}</span>
								</div>
								<div className='flex items-center'>
									<Clock size={16} className='mr-1' />
									<span>{blog.readTime} min read</span>
								</div>
								<div className='flex items-center'>
									<Eye size={16} className='mr-1' />
									<span>{blog.viewCount} views</span>
								</div>
							</div>
						</div>
					</div>

					{/* Main content */}
					<div className='container mx-auto px-4 py-12'>
						<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
							{/* Blog content - 2/3 width */}
							<div className='lg:col-span-2'>
								<FadeIn>
									<div className='prose prose-lg max-w-none'>
										{/* Categories */}
										<div className='flex flex-wrap gap-2 mb-6 not-prose'>
											{blog.categories.map((category, index) => (
												<Badge key={index} variant='secondary'>
													{category}
												</Badge>
											))}
										</div>

										{/* Blog content */}
										<div className='whitespace-pre-line'>{blog.content}</div>

										{/* Tags */}
										{blog.tags && blog.tags.length > 0 && (
											<div className='flex flex-wrap items-center gap-2 mt-8 not-prose'>
												<Tag size={16} className='text-muted-foreground' />
												{blog.tags.map((tag, index) => (
													<Badge key={index} variant='outline'>
														{tag}
													</Badge>
												))}
											</div>
										)}
									</div>
								</FadeIn>
							</div>

							{/* Sidebar - 1/3 width */}
							<div className='space-y-8'>
								{/* Author info */}
								<div className='bg-content1 p-6 rounded-lg'>
									<h3 className='text-xl font-bold mb-4'>About the Author</h3>
									<div className='flex items-center'>
										<div className='bg-muted rounded-full h-12 w-12 flex items-center justify-center mr-4'>
											<User size={24} />
										</div>
										<div>
											<h4 className='font-medium'>{blog.author?.name || 'Anonymous'}</h4>
											<p className='text-sm text-muted-foreground'>Travel Writer</p>
										</div>
									</div>
								</div>

								{/* Related blogs */}
								{relatedBlogs.length > 0 && (
									<div className='bg-content1 p-6 rounded-lg'>
										<h3 className='text-xl font-bold mb-4'>Related Articles</h3>
										<div className='space-y-4'>
											{relatedBlogs.map((relatedBlog) => (
												<Link key={relatedBlog._id} to={`/blogs/${relatedBlog.slug}`} className='block group'>
													<div className='flex gap-3'>
														<div className='flex-shrink-0 w-20 h-16 overflow-hidden rounded'>
															<img
																src={
																	relatedBlog.coverImage?.url ||
																	'/placeholder.svg?height=100&width=100' ||
																	'/placeholder.svg'
																}
																alt={relatedBlog.title}
																className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
															/>
														</div>
														<div>
															<h4 className='font-medium line-clamp-2 group-hover:text-primary transition-colors'>
																{relatedBlog.title}
															</h4>
															<p className='text-sm text-muted-foreground'>{formatDate(relatedBlog.createdAt)}</p>
														</div>
													</div>
												</Link>
											))}
										</div>
									</div>
								)}

								{/* Categories */}
								<div className='bg-content1 p-6 rounded-lg'>
									<h3 className='text-xl font-bold mb-4'>Categories</h3>
									<div className='flex flex-wrap gap-2'>
										{blog.categories.map((category, index) => (
											<Link key={index} to={`/blogs?category=${category}`}>
												<Badge variant='secondary' className='cursor-pointer hover:bg-secondary/80'>
													{category}
												</Badge>
											</Link>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			<NewsletterSection />
		</div>
	);
};

export default BlogDetails;
