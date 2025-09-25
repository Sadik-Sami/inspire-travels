import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEOHead = ({
	title,
	description,
	keywords,
	image,
	url,
	type = 'website',
	siteName = 'TravelCo - Your Ultimate Travel Companion',
	twitterHandle = '@travelco',
	locale = 'en_US',
	publishedTime,
	modifiedTime,
	author,
	category,
	tags,
	noIndex = false,
	noFollow = false,
	canonical,
	alternateLanguages = [],
	structuredData,
	customMeta = [],
}) => {
	// Default values
	const defaultTitle = 'TravelCo - Discover Amazing Destinations Worldwide';
	const defaultDescription =
		'Explore the world with TravelCo. Discover amazing destinations, book unforgettable experiences, and create memories that last a lifetime.';
	const defaultImage = 'https://your-domain.com/images/og-default.jpg';
	const defaultUrl = typeof window !== 'undefined' ? window.location.href : 'https://your-domain.com';

	// Process title
	const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
	const metaDescription = description || defaultDescription;
	const metaImage = image || defaultImage;
	const metaUrl = url || defaultUrl;
	const canonicalUrl = canonical || metaUrl;

	// Generate keywords string
	const keywordsString = keywords
		? Array.isArray(keywords)
			? keywords.join(', ')
			: keywords
		: 'travel, destinations, vacation, tourism, adventure, booking, experiences';

	// Generate robots content
	const robotsContent = [noIndex ? 'noindex' : 'index', noFollow ? 'nofollow' : 'follow'].join(', ');

	return (
		<Helmet>
			{/* Basic Meta Tags */}
			<title>{pageTitle}</title>
			<meta name='description' content={metaDescription} />
			<meta name='keywords' content={keywordsString} />
			<meta name='robots' content={robotsContent} />
			<link rel='canonical' href={canonicalUrl} />

			{/* Open Graph Meta Tags */}
			<meta property='og:type' content={type} />
			<meta property='og:title' content={title || defaultTitle} />
			<meta property='og:description' content={metaDescription} />
			<meta property='og:image' content={metaImage} />
			<meta property='og:url' content={metaUrl} />
			<meta property='og:site_name' content={siteName} />
			<meta property='og:locale' content={locale} />

			{/* Article specific Open Graph tags */}
			{type === 'article' && (
				<>
					{publishedTime && <meta property='article:published_time' content={publishedTime} />}
					{modifiedTime && <meta property='article:modified_time' content={modifiedTime} />}
					{author && <meta property='article:author' content={author} />}
					{category && <meta property='article:section' content={category} />}
					{tags && tags.map((tag, index) => <meta key={index} property='article:tag' content={tag} />)}
				</>
			)}

			{/* Twitter Card Meta Tags */}
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:site' content={twitterHandle} />
			<meta name='twitter:creator' content={twitterHandle} />
			<meta name='twitter:title' content={title || defaultTitle} />
			<meta name='twitter:description' content={metaDescription} />
			<meta name='twitter:image' content={metaImage} />

			{/* Additional Meta Tags */}
			<meta name='viewport' content='width=device-width, initial-scale=1.0' />
			<meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
			<meta name='language' content='English' />
			<meta name='revisit-after' content='7 days' />
			<meta name='author' content={author || siteName} />

			{/* Alternate Language Links */}
			{alternateLanguages.map((lang, index) => (
				<link key={index} rel='alternate' hrefLang={lang.code} href={lang.url} />
			))}

			{/* Structured Data */}
			{structuredData && <script type='application/ld+json'>{JSON.stringify(structuredData)}</script>}

			{/* Custom Meta Tags */}
			{customMeta.map((meta, index) => (
				<meta key={index} {...meta} />
			))}
		</Helmet>
	);
};

SEOHead.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	keywords: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
	image: PropTypes.string,
	url: PropTypes.string,
	type: PropTypes.oneOf(['website', 'article', 'product', 'profile']),
	siteName: PropTypes.string,
	twitterHandle: PropTypes.string,
	locale: PropTypes.string,
	publishedTime: PropTypes.string,
	modifiedTime: PropTypes.string,
	author: PropTypes.string,
	category: PropTypes.string,
	tags: PropTypes.array,
	noIndex: PropTypes.bool,
	noFollow: PropTypes.bool,
	canonical: PropTypes.string,
	alternateLanguages: PropTypes.array,
	structuredData: PropTypes.object,
	customMeta: PropTypes.array,
};

export default SEOHead;
