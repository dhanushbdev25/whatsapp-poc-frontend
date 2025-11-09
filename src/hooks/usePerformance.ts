/**
 * Hook for performance monitoring
 */

import { useEffect, useRef } from 'react';
import { performanceMonitor } from '../services/performance/performance.service';
import type { PerformanceMetricType } from '../services/performance/performance.types';

/**
 * Hook to track component render time
 */
export const useRenderTime = (componentName: string, enabled = true) => {
	const measureIdRef = useRef<string>('');

	useEffect(() => {
		if (!enabled) {
			return;
		}

		measureIdRef.current = performanceMonitor.startMeasure(`${componentName}-render`, 'component_render');

		return () => {
			if (measureIdRef.current) {
				const duration = performanceMonitor.endMeasure(measureIdRef.current);
				if (duration && duration > 100) {
					// Log slow renders (>100ms)
					console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
				}
			}
		};
	}, [componentName, enabled]);
};

/**
 * Hook to use performance monitoring
 */
export const usePerformance = () => {
	return {
		startMeasure: (name: string, type?: PerformanceMetricType) => performanceMonitor.startMeasure(name, type),
		endMeasure: (id: string) => performanceMonitor.endMeasure(id),
		mark: (name: string) => performanceMonitor.mark(name),
		measure: (name: string, startMark: string, endMark?: string) =>
			performanceMonitor.measure(name, startMark, endMark),
		getMetrics: () => performanceMonitor.getMetrics(),
		getWebVitals: () => performanceMonitor.getWebVitals(),
		clearMetrics: () => performanceMonitor.clearMetrics()
	};
};
