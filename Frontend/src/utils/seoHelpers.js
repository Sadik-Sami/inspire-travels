/**
 * SEO Helper Functions
 * Utility functions to generate SEO data for different page types
 */

// Generate structured data for different content types
export const generateStructuredData = {
	// Website/Organization structured data
	website: (data = {}) => ({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: data.name || 'TravelCo',
		url: data.url || 'https://your-domain.com',
		description: data.description || 'Your ultimate travel companion for discovering amazing destinations worldwide',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${data.url || 'https://your-domain.com'}/search?q={search_term_string}`,
			},
			'query-input': 'required name=search_term_string',
		},
	}),

	// Article/Blog post structured data
	article: (article) => ({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: article.title,
		description: article.summary || article.description,
		image: article.coverImage?.url || article.image,
		author: {
			'@type': 'Person',
			name: article.author?.name || 'TravelCo Team',
		},
		publisher: {
			'@type': 'Organization',
			name: 'TravelCo',
			logo: {
				'@type': 'ImageObject',
				url: 'https://your-domain.com/logo.png',
			},
		},
		datePublished: article.createdAt || article.publishedTime,
		dateModified: article.updatedAt || article.modifiedTime,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': article.url,
		},
	}),

	// Travel destination structured data
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
		geo: destination.coordinates
			? {
					'@type': 'GeoCoordinates',
					latitude: destination.coordinates.lat,
					longitude: destination.coordinates.lng,
			  }
			: undefined,
		offers: destination.pricing
			? {
					'@type': 'Offer',
					price: destination.pricing.basePrice,
					priceCurrency: 'USD',
					availability: 'https://schema.org/InStock',
			  }
			: undefined,
	}),

	// Travel package/tour structured data
	tourPackage: (tour) => ({
		'@context': 'https://schema.org',
		'@type': 'TouristTrip',
		name: tour.title,
		description: tour.summary || tour.description,
		image: tour.images?.[0]?.url || tour.image,
		duration: tour.duration ? `P${tour.duration.days}D` : undefined,
		offers: {
			'@type': 'Offer',
			price: tour.pricing?.basePrice,
			priceCurrency: 'USD',
			availability: 'https://schema.org/InStock',
		},
		provider: {
			'@type': 'Organization',
			name: 'TravelCo',
		},
	}),

	// Organization structured data
	organization: (org = {}) => ({
		'@context': 'https://schema.org',
		'@type': 'TravelAgency',
		name: org.name || 'TravelCo',
		url: org.url || 'https://your-domain.com',
		logo: org.logo || 'https://your-domain.com/logo.png',
		description: org.description || 'Your ultimate travel companion',
		contactPoint: {
			'@type': 'ContactPoint',
			telephone: org.phone || '+1-234-567-8900',
			contactType: 'customer service',
			email: org.email || 'info@travelco.com',
		},
		sameAs: org.socialMedia || [
			'https://facebook.com/travelco',
			'https://twitter.com/travelco',
			'https://instagram.com/travelco',
		],
	}),
};

// Generate SEO data for different page types
export const generateSEOData = {
	// Home page SEO
	home: () => ({
		title: 'Discover Amazing Destinations Worldwide',
		description:
			'Explore the world with TravelCo. Book unforgettable travel experiences, discover hidden gems, and create memories that last a lifetime. Start your adventure today!',
		keywords: [
			'travel',
			'destinations',
			'vacation',
			'tourism',
			'adventure',
			'booking',
			'experiences',
			'worldwide travel',
		],
		type: 'website',
		structuredData: generateStructuredData.website(),
	}),

	// About page SEO
	about: () => ({
		title: 'About TravelCo - Your Trusted Travel Partner',
		description:
			"Learn about TravelCo's mission to make travel accessible and memorable for everyone. Discover our story, values, and commitment to exceptional travel experiences.",
		keywords: ['about travelco', 'travel company', 'travel agency', 'our story', 'travel experts'],
		type: 'website',
	}),

	// Contact page SEO
	contact: () => ({
		title: 'Contact TravelCo - Get in Touch',
		description:
			'Contact TravelCo for travel inquiries, bookings, or support. Our travel experts are here to help you plan your perfect adventure.',
		keywords: ['contact', 'travel support', 'booking help', 'travel consultation'],
		type: 'website',
	}),

	// Blog listing page SEO
	blogListing: () => ({
		title: 'Travel Blog - Tips, Guides & Stories',
		description:
			'Discover travel tips, destination guides, and inspiring stories from around the world. Get expert advice to make your next trip unforgettable.',
		keywords: ['travel blog', 'travel tips', 'destination guides', 'travel stories', 'travel advice'],
		type: 'website',
	}),

	// Individual blog post SEO
	blogPost: (blog) => ({
		title: blog.title,
		description: blog.summary || blog.content?.substring(0, 160),
		keywords: [...(blog.categories || []), ...(blog.tags || [])],
		image: blog.coverImage?.url,
		type: 'article',
		publishedTime: blog.createdAt,
		modifiedTime: blog.updatedAt,
		author: blog.author?.name,
		category: blog.categories?.[0],
		tags: blog.tags,
		structuredData: generateStructuredData.article(blog),
	}),

	// Destinations listing page SEO
	destinationsListing: () => ({
		title: 'Travel Destinations - Explore the World',
		description:
			'Browse our curated collection of travel destinations worldwide. Find your next adventure with detailed guides, photos, and booking options.',
		keywords: ['travel destinations', 'vacation spots', 'tourist attractions', 'travel packages', 'world destinations'],
		type: 'website',
	}),

	// Individual destination SEO
	destination: (destination) => ({
		title: `${destination.title} - Travel Guide & Packages`,
		description:
			destination.summary ||
			`Discover ${destination.title}. ${destination.location?.to} travel guide with packages, attractions, and booking options.`,
		keywords: [
			destination.title,
			destination.location?.to,
			'travel guide',
			'vacation',
			'tourism',
			...(destination.categories || []),
		],
		image: destination.images?.[0]?.url,
		type: 'website',
		structuredData: generateStructuredData.destination(destination),
	}),

	// Gallery page SEO
	gallery: () => ({
		title: 'Success Stories & Travel Gallery',
		description:
			'Browse our collection of success stories and travel memories from satisfied customers. Get inspired for your next adventure with real travel experiences.',
		keywords: ['travel gallery', 'success stories', 'travel photos', 'customer experiences', 'travel memories'],
		type: 'website',
	}),

	// Visa services SEO
	visaServices: () => ({
		title: 'Visa Services - Easy Visa Processing',
		description:
			'Simplify your visa application process with TravelCo. Expert visa assistance for all destinations with fast processing and guaranteed approval.',
		keywords: ['visa services', 'visa application', 'visa processing', 'travel visa', 'visa assistance'],
		type: 'website',
	}),

	// Individual visa SEO
	visa: (visa) => ({
		title: `${visa.title} - Visa Requirements & Application`,
		description:
			visa.summary ||
			`Get your ${visa.title} with ease. Complete visa requirements, processing time, and application assistance.`,
		keywords: [visa.title, 'visa requirements', 'visa application', 'travel visa', ...(visa.categories || [])],
		image: visa.images?.[0]?.url,
		type: 'website',
	}),
};

// Utility function to truncate text for meta descriptions
export const truncateText = (text, maxLength = 160) => {
	if (!text) return '';
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength - 3) + '...';
};

// Generate dynamic keywords based on content
export const generateDynamicKeywords = (content, baseKeywords = []) => {
	const commonWords = [
		'the',
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
		'is',
		'are',
		'was',
		'were',
		'be',
		'been',
		'have',
		'has',
		'had',
		'do',
		'does',
		'did',
		'will',
		'would',
		'could',
		'should',
		'may',
		'might',
		'must',
		'can',
		'shall',
	];

	if (!content) return baseKeywords;

	const words = content
		.toLowerCase()
		.replace(/[^\w\s]/g, '')
		.split(/\s+/)
		.filter((word) => word.length > 3 && !commonWords.includes(word));

	const wordCount = {};
	words.forEach((word) => {
		wordCount[word] = (wordCount[word] || 0) + 1;
	});

	const topWords = Object.entries(wordCount)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 10)
		.map(([word]) => word);

	return [...baseKeywords, ...topWords];
};
