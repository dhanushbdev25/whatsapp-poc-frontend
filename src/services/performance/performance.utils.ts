/**
 * Performance monitoring utilities
 */

import type { WebVitals } from './performance.types';

/**
 * Check if Performance API is available
 */
export const isPerformanceSupported = (): boolean => {
	return typeof window !== 'undefined' && 'performance' in window && 'PerformanceObserver' in window;
};

/**
 * Get performance mark
 */
export const getPerformanceMark = (name: string): PerformanceEntry | undefined => {
	if (!isPerformanceSupported()) {
		return undefined;
	}

	const marks = performance.getEntriesByName(name, 'mark');
	return marks.length > 0 ? marks[0] : undefined;
};

/**
 * Get performance measure
 */
export const getPerformanceMeasure = (name: string): PerformanceEntry | undefined => {
	if (!isPerformanceSupported()) {
		return undefined;
	}

	const measures = performance.getEntriesByName(name, 'measure');
	return measures.length > 0 ? measures[0] : undefined;
};

/**
 * Get all navigation timing metrics
 */
export const getNavigationTiming = (): PerformanceNavigationTiming | null => {
	if (!isPerformanceSupported()) {
		return null;
	}

	const navigation = performance.getEntriesByType('navigation')[0];
	return navigation instanceof PerformanceNavigationTiming ? navigation : null;
};

/**
 * Calculate page load time
 */
export const calculatePageLoadTime = (): number | null => {
	const navigation = getNavigationTiming();
	if (!navigation) {
		return null;
	}

	return navigation.loadEventEnd - navigation.fetchStart;
};

/**
 * Setup Web Vitals observer
 */
export const setupWebVitalsObserver = (onUpdate: (vitals: WebVitals) => void): (() => void) => {
	if (!isPerformanceSupported()) {
		return () => {};
	}

	const observers: PerformanceObserver[] = [];

	// LCP (Largest Contentful Paint)
	try {
		const lcpObserver = new PerformanceObserver(list => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1] as PerformanceEntry;
			onUpdate({ lcp: lastEntry.startTime });
		});
		lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
		observers.push(lcpObserver);
	} catch {
		// LCP not supported
	}

	// FID (First Input Delay)
	try {
		const fidObserver = new PerformanceObserver(list => {
			const entries = list.getEntries();
			const firstEntry = entries[0] as PerformanceEntry;
			if ('processingStart' in firstEntry && 'startTime' in firstEntry) {
				onUpdate({
					fid: (firstEntry as { processingStart: number; startTime: number }).processingStart - firstEntry.startTime
				});
			}
		});
		fidObserver.observe({ entryTypes: ['first-input'] });
		observers.push(fidObserver);
	} catch {
		// FID not supported
	}

	// CLS (Cumulative Layout Shift)
	try {
		let clsValue = 0;
		const clsObserver = new PerformanceObserver(list => {
			for (const entry of list.getEntries()) {
				if (!(entry as { hadRecentInput?: boolean }).hadRecentInput) {
					clsValue += (entry as { value?: number }).value || 0;
				}
			}
			onUpdate({ cls: clsValue });
		});
		clsObserver.observe({ entryTypes: ['layout-shift'] });
		observers.push(clsObserver);
	} catch {
		// CLS not supported
	}

	// Cleanup function
	return () => {
		observers.forEach(observer => observer.disconnect());
	};
};
