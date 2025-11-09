/**
 * Performance monitoring service
 */

import type {
	IPerformanceMonitor,
	PerformanceMetric,
	PerformanceMetricType,
	PerformanceMonitorConfig,
	WebVitals
} from './performance.types';
import { isPerformanceSupported, setupWebVitalsObserver } from './performance.utils';
import { env } from '../../config/env';

/**
 * Performance monitor service class
 */
class PerformanceMonitorService implements IPerformanceMonitor {
	private metrics: PerformanceMetric[] = [];
	private activeMeasures: Map<string, { name: string; type: PerformanceMetricType; startTime: number }> = new Map();
	private config: PerformanceMonitorConfig;
	private webVitals: WebVitals | null = null;
	private webVitalsCleanup: (() => void) | null = null;

	constructor(config?: Partial<PerformanceMonitorConfig>) {
		this.config = {
			enabled: env.VITE_ENABLE_PERFORMANCE_MONITORING,
			trackPageLoad: true,
			trackApiCalls: true,
			trackComponentRenders: false, // Disabled by default for performance
			trackWebVitals: true,
			sampleRate: 1.0,
			...config
		};

		if (this.config.enabled && this.config.trackWebVitals && isPerformanceSupported()) {
			this.webVitalsCleanup = setupWebVitalsObserver(vitals => {
				this.webVitals = { ...this.webVitals, ...vitals };
			});
		}

		if (this.config.enabled && this.config.trackPageLoad && isPerformanceSupported()) {
			this.trackPageLoad();
		}
	}

	/**
	 * Start a performance measure
	 */
	startMeasure(name: string, type: PerformanceMetricType = 'custom'): string {
		if (!this.config.enabled) {
			return '';
		}

		const id = `measure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const startTime = performance.now();

		if (isPerformanceSupported()) {
			performance.mark(`${name}-start`);
		}

		this.activeMeasures.set(id, { name, type, startTime });

		return id;
	}

	/**
	 * End a performance measure
	 */
	endMeasure(id: string): number | null {
		if (!this.config.enabled || !id) {
			return null;
		}

		const measure = this.activeMeasures.get(id);
		if (!measure) {
			return null;
		}

		const duration = performance.now() - measure.startTime;
		this.activeMeasures.delete(id);

		if (isPerformanceSupported()) {
			performance.mark(`${measure.name}-end`);
			performance.measure(measure.name, `${measure.name}-start`, `${measure.name}-end`);
		}

		// Store metric
		const metric: PerformanceMetric = {
			id,
			type: measure.type,
			name: measure.name,
			duration,
			timestamp: new Date()
		};

		this.metrics.push(metric);

		return duration;
	}

	/**
	 * Create a performance mark
	 */
	mark(name: string): void {
		if (!this.config.enabled || !isPerformanceSupported()) {
			return;
		}

		performance.mark(name);
	}

	/**
	 * Create a performance measure between two marks
	 */
	measure(name: string, startMark: string, endMark?: string): number | null {
		if (!this.config.enabled || !isPerformanceSupported()) {
			return null;
		}

		try {
			if (endMark) {
				performance.measure(name, startMark, endMark);
			} else {
				performance.measure(name, startMark);
			}

			const measures = performance.getEntriesByName(name, 'measure');
			if (measures.length > 0) {
				return measures[0].duration;
			}
		} catch (error) {
			console.warn('Performance measure failed:', error);
		}

		return null;
	}

	/**
	 * Get all metrics
	 */
	getMetrics(): PerformanceMetric[] {
		return [...this.metrics];
	}

	/**
	 * Get Web Vitals
	 */
	getWebVitals(): WebVitals | null {
		return this.webVitals ? { ...this.webVitals } : null;
	}

	/**
	 * Clear all metrics
	 */
	clearMetrics(): void {
		this.metrics = [];
	}

	/**
	 * Track page load time
	 */
	private trackPageLoad(): void {
		if (typeof window === 'undefined') {
			return;
		}

		window.addEventListener('load', () => {
			setTimeout(() => {
				const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
				const metric: PerformanceMetric = {
					id: `page-load-${Date.now()}`,
					type: 'page_load',
					name: 'Page Load',
					duration: loadTime,
					timestamp: new Date()
				};
				this.metrics.push(metric);
			}, 0);
		});
	}

	/**
	 * Cleanup
	 */
	destroy(): void {
		if (this.webVitalsCleanup) {
			this.webVitalsCleanup();
			this.webVitalsCleanup = null;
		}
		this.clearMetrics();
	}
}

/**
 * Create performance monitor instance
 */
export const createPerformanceMonitor = (config?: Partial<PerformanceMonitorConfig>): IPerformanceMonitor => {
	return new PerformanceMonitorService(config);
};

/**
 * Default performance monitor instance
 */
export const performanceMonitor = createPerformanceMonitor();
