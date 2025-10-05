/**
 * SEO Helper Functions
 * Utility functions for generating SEO metadata and structured data
 */

/**
 * Truncate text to a specific length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 160) => {
	if (!text || text.length <= maxLength) return text;
	return text.substring(0, maxLength - 3) + '...';
};

/**
 * Generate keywords from content
 * @param {string} content - Content to extract keywords from
 * @param {number} limit - Maximum number of keywords
 * @returns {string[]} Array of keywords
 */
export const generateKeywords = (content, limit = 10) => {
	if (!content) return [];

	// Remove common words and extract meaningful keywords
	const commonWords = new Set([
		'the',
		'a',
		'an',
		'and',
		'or',
		'but',
		'in',
		'on',
		'at',
		'to',
		'for',
		'of',
		'with',
		'by',
		'from',
		'is',
		'are',
		'was',
		'were',
		'be',
		'been',
		'being',
	]);

	const words = content
		.toLowerCase()
		.replace(/[^\w\s]/g, ' ')
		.split(/\s+/)
		.filter((word) => word.length > 3 && !commonWords.has(word));

	// Count word frequency
	const wordCount = {};
	words.forEach((word) => {
		wordCount[word] = (wordCount[word] || 0) + 1;
	});

	// Sort by frequency and return top keywords
	return Object.entries(wordCount)
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([word]) => word);
};

/**
 * Generate structured data for different content types
 */
export const generateStructuredData = {
	/**
	 * Generate Website structured data
	 */
	website: (siteData) => ({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteData.name || 'InspireTravels',
		url: siteData.url || window.location.origin,
		description: siteData.description || 'Discover amazing destinations worldwide',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${siteData.url || window.location.origin}/search?q={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	}),

	/**
	 * Generate Article structured data
	 */
	article: (article) => ({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: article.title,
		description: article.summary || article.description,
		image: article.coverImage?.url || article.image,
		datePublished: article.createdAt,
		dateModified: article.updatedAt || article.createdAt,
		author: {
			'@type': 'Person',
			name: article.author?.name || 'Anonymous',
		},
		publisher: {
			'@type': 'Organization',
			name: 'InspireTravels',
			logo: {
				'@type': 'ImageObject',
				url: `${window.location.origin}/logo.png`,
			},
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': window.location.href,
		},
	}),

	/**
	 * Generate TouristDestination structured data
	 */
	destination: (destination) => ({
		'@context': 'https://schema.org',
		'@type': 'TouristDestination',
		name: destination.title,
		description: destination.summary || destination.description,
		image: destination.images?.[0]?.url || destination.image,
		address: {
			'@type': 'PostalAddress',
			addressLocality: destination.location?.to,
			addressCountry: destination.location?.country,
		},
		geo: destination.location?.coordinates && {
			'@type': 'GeoCoordinates',
			latitude: destination.location.coordinates.lat,
			longitude: destination.location.coordinates.lng,
		},
	}),

	/**
	 * Generate TouristTrip structured data
	 */
	tour: (tour) => ({
		'@context': 'https://schema.org',
		'@type': 'TouristTrip',
		name: tour.title,
		description: tour.summary || tour.description,
		image: tour.images?.[0]?.url || tour.image,
		itinerary: tour.itinerary?.map((day, index) => ({
			'@type': 'Event',
			name: `Day ${index + 1}: ${day.title}`,
			description: day.description,
		})),
		offers: {
			'@type': 'Offer',
			price: tour.pricing?.basePrice,
			priceCurrency: 'USD',
			availability: 'https://schema.org/InStock',
		},
	}),

	/**
	 * Generate Organization structured data
	 */
	organization: (org) => ({
		'@context': 'https://schema.org',
		'@type': 'TravelAgency',
		name: org.name || 'InspireTravels',
		url: org.url || window.location.origin,
		logo: org.logo || `${window.location.origin}/logo.png`,
		description: org.description || 'Your travel companion',
		address: org.address && {
			'@type': 'PostalAddress',
			streetAddress: org.address.street,
			addressLocality: org.address.city,
			addressRegion: org.address.state,
			postalCode: org.address.zip,
			addressCountry: org.address.country,
		},
		contactPoint: org.contact && {
			'@type': 'ContactPoint',
			telephone: org.contact.phone,
			email: org.contact.email,
			contactType: 'customer service',
		},
		sameAs: org.socialMedia || [],
	}),
};

/**
 * Get default SEO data for different page types
 */
export const getPageSEO = (pageType, customData = {}) => {
	const baseUrl = window.location.origin;
	const defaultSEO = {
		home: {
			title: 'InspireTravels - Discover Amazing Destinations Worldwide',
			description:
				'Explore the world with InspireTravels. Discover amazing destinations, book unforgettable experiences, and create memories that last a lifetime.',
			keywords: ['travel', 'destinations', 'vacation', 'tourism', 'adventure', 'booking', 'experiences'],
			image: `${baseUrl}/images/og-home.jpg`,
			type: 'website',
		},
		'blog-listing': {
			title: 'Travel Blog - Tips, Guides & Stories',
			description:
				'Read our latest travel blog posts, destination guides, travel tips, and inspiring stories from around the world.',
			keywords: ['travel blog', 'travel tips', 'destination guides', 'travel stories', 'travel advice'],
			image: `${baseUrl}/images/og-blog.jpg`,
			type: 'website',
		},
		'blog-post': {
			title: customData.title || 'Blog Post',
			description: customData.summary || customData.description || 'Read our latest travel blog post',
			keywords: [...(customData.tags || []), ...(customData.categories || []), 'travel', 'blog', 'destination'],
			image: customData.coverImage?.url || customData.image || `${baseUrl}/images/og-blog.jpg`,
			type: 'article',
			publishedTime: customData.createdAt,
			modifiedTime: customData.updatedAt,
			author: customData.author?.name,
			category: customData.categories?.[0],
			tags: customData.tags || [],
		},
		'destination-listing': {
			title: 'Explore Destinations - Find Your Next Adventure',
			description:
				'Browse our collection of amazing travel destinations. Find detailed information, pricing, and book your next adventure.',
			keywords: ['destinations', 'travel packages', 'tours', 'vacation packages', 'group travel'],
			image: `${baseUrl}/images/og-destinations.jpg`,
			type: 'website',
		},
		destination: {
			title: customData.title || 'Destination',
			description: customData.summary || customData.description || 'Explore this amazing destination',
			keywords: [...(customData.categories || []), customData.location?.to, 'destination', 'travel', 'tour'].filter(
				Boolean
			),
			image: customData.images?.[0]?.url || customData.image || `${baseUrl}/images/og-destination.jpg`,
			type: 'website',
		},
		gallery: {
			title: 'Success Stories & Gallery - Inspire Travels',
			description:
				'View our collection of success stories, customer experiences, and travel moments captured around the world.',
			keywords: ['travel gallery', 'success stories', 'customer reviews', 'travel photos', 'testimonials'],
			image: `${baseUrl}/images/og-gallery.jpg`,
			type: 'website',
		},
		about: {
			title: 'About Us - Inspire Travels',
			description:
				'Learn about Inspire Travels, our mission, values, and the team behind your unforgettable travel experiences.',
			keywords: ['about us', 'travel company', 'our story', 'mission', 'team'],
			image: `${baseUrl}/images/og-about.jpg`,
			type: 'website',
		},
		contact: {
			title: 'Contact Us - Get in Touch',
			description: "Have questions? Get in touch with our travel experts. We're here to help plan your perfect trip.",
			keywords: ['contact', 'customer service', 'support', 'inquiries', 'travel help'],
			image: `${baseUrl}/images/og-contact.jpg`,
			type: 'website',
		},
	};

	return { ...defaultSEO[pageType], ...customData };
};
