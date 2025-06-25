const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
		},
		summary: {
			type: String,
			required: [true, 'Summary is required'],
			trim: true,
			maxlength: [500, 'Summary cannot be more than 500 characters'],
		},
		content: {
			type: String,
			required: [true, 'Content is required'],
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		coverImage: {
			url: String,
			public_id: String,
		},
		images: [
			{
				url: String,
				public_id: String,
			},
		],
		categories: {
			type: [String],
			default: [],
		},
		tags: {
			type: [String],
			default: [],
		},
		status: {
			type: String,
			enum: ['draft', 'published', 'archived'],
			default: 'draft',
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		viewCount: {
			type: Number,
			default: 0,
		},
		readTime: {
			type: Number,
			default: 0, // in minutes
		},
	},
	{ timestamps: true }
);

// Create slug from title before saving
BlogSchema.pre('save', function (next) {
	// Only update the slug if title is modified or it's a new document
	if (this.isModified('title') || this.isNew) {
		this.slug = this.title
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	// Calculate read time if content is modified or it's a new document
	if (this.isModified('content') || this.isNew) {
		// Average reading speed: 200 words per minute
		const wordCount = this.content.split(/\s+/).length;
		this.readTime = Math.max(1, Math.ceil(wordCount / 200));
	}

	next();
});

// Ensure slug uniqueness by appending a counter if needed
BlogSchema.pre('save', async function (next) {
	if (!this.isModified('slug')) {
		return next();
	}

	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const blogsWithSlug = await this.constructor.find({ slug: slugRegEx });

	if (blogsWithSlug.length > 0) {
		// If the document is being updated and the slug hasn't changed, don't modify it
		const existingBlog = blogsWithSlug.find((blog) => blog._id.toString() === this._id.toString());
		if (existingBlog) {
			return next();
		}

		// Find the highest suffix number and increment it
		let suffixNum = 0;
		blogsWithSlug.forEach((blog) => {
			const suffixMatch = blog.slug.match(/-([0-9]+)$/);
			if (suffixMatch && Number.parseInt(suffixMatch[1]) > suffixNum) {
				suffixNum = Number.parseInt(suffixMatch[1]);
			}
		});

		// Append the incremented suffix
		this.slug = `${this.slug}-${suffixNum + 1}`;
	}

	next();
});

// Index for search functionality
BlogSchema.index({
	title: 'text',
	summary: 'text',
	content: 'text',
	categories: 'text',
	tags: 'text',
});

module.exports = mongoose.model('Blog', BlogSchema);
