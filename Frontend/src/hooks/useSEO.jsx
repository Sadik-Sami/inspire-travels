'use client';

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { generateSEOData } from '@/utils/seoHelpers';

/**
 * Custom hook for managing SEO data
 * Automatically generates SEO data based on current route and content
 */
export const useSEO = (pageType, data = {}) => {
	const location = useLocation();
	const baseUrl = window.location.origin;
	const currentUrl = `${baseUrl}${location.pathname}`;

	const seoData = useMemo(() => {
		let seo = {};

		// Generate SEO data based on page type
		switch (pageType) {
			case 'home':
				seo = generateSEOData.home();
				break;
			case 'about':
				seo = generateSEOData.about();
				break;
			case 'contact':
				seo = generateSEOData.contact();
				break;
			case 'blog-listing':
				seo = generateSEOData.blogListing();
				break;
			case 'blog-post':
				seo = generateSEOData.blogPost(data);
				break;
			case 'destinations-listing':
				seo = generateSEOData.destinationsListing();
				break;
			case 'destination':
				seo = generateSEOData.destination(data);
				break;
			case 'gallery':
				seo = generateSEOData.gallery();
				break;
			case 'visa-services':
				seo = generateSEOData.visaServices();
				break;
			case 'visa':
				seo = generateSEOData.visa(data);
				break;
			default:
				seo = generateSEOData.home();
		}

		// Add current URL
		seo.url = currentUrl;

		// Override with any custom data provided
		return { ...seo, ...data };
	}, [pageType, data, location.pathname]);

	return seoData;
};

/**
 * Hook for dynamic SEO based on content loading state
 */
export const useDynamicSEO = (pageType, data, isLoading = false) => {
	const staticSEO = useSEO(pageType, {});

	return useMemo(() => {
		if (isLoading || !data) {
			return staticSEO;
		}

		return useSEO(pageType, data);
	}, [pageType, data, isLoading, staticSEO]);
};
