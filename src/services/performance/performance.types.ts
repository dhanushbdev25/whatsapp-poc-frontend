/**
 * Performance monitoring types
 */

/**
 * Performance metric type
 */
export type PerformanceMetricType = 'page_load' | 'api_call' | 'component_render' | 'custom';

/**
 * Performance metric
 */
export interface PerformanceMetric {
	id: string;
	type: PerformanceMetricType;
	name: string;
	duration: number; // in milliseconds
	timestamp: Date;
	metadata?: Record<string, unknown>;
}

/**
 * Web Vitals metrics
 */
export interface WebVitals {
	lcp?: number; // Largest Contentful Paint
	fid?: number; // First Input Delay
	cls?: number; // Cumulative Layout Shift
	ttfb?: number; // Time to First Byte
	fcp?: number; // First Contentful Paint
}

/**
 * Performance monitor configuration
 */
export interface PerformanceMonitorConfig {
	enabled: boolean;
	trackPageLoad: boolean;
	trackApiCalls: boolean;
	trackComponentRenders: boolean;
	trackWebVitals: boolean;
	sampleRate?: number; // 0-1, percentage of metrics to track
}

/**
 * Performance monitor interface
 */
export interface IPerformanceMonitor {
	startMeasure: (name: string, type?: PerformanceMetricType) => string;
	endMeasure: (id: string) => number | null;
	mark: (name: string) => void;
	measure: (name: string, startMark: string, endMark?: string) => number | null;
	getMetrics: () => PerformanceMetric[];
	getWebVitals: () => WebVitals | null;
	clearMetrics: () => void;
}
