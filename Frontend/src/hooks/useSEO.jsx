'use client';

import { useMemo } from 'react';
import { getPageSEO } from '@/utils/seoHelpers';

/**
 * Hook for managing SEO metadata
 * @param {string} pageType - Type of page (home, blog-post, destination, etc.)
 * @param {object} customData - Custom SEO data to override defaults
 * @returns {object} SEO data object
 */
export const useSEO = (pageType, customData = {}) => {
	return useMemo(() => {
		return getPageSEO(pageType, customData);
	}, [pageType, customData]);
};

/**
 * Hook for dynamic SEO that updates based on content loading
 * @param {string} pageType - Type of page
 * @param {object} data - Dynamic data (blog post, destination, etc.)
 * @param {boolean} isLoading - Loading state
 * @returns {object} SEO data object
 */
export const useDynamicSEO = (pageType, data, isLoading = false) => {
	return useMemo(() => {
		// Return default SEO while loading
		if (isLoading || !data) {
			return getPageSEO(pageType);
		}

		// Return dynamic SEO with data
		return getPageSEO(pageType, data);
	}, [pageType, data, isLoading]);
};
