/**
 * Performance Monitor component wrapper
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { usePerformance } from '../../../hooks/usePerformance';

/**
 * Performance Monitor props
 */
interface PerformanceMonitorProps {
	children: ReactNode;
	componentName?: string;
	trackRender?: boolean;
}

/**
 * Performance Monitor component
 * Wraps children and tracks performance metrics
 */
export const PerformanceMonitor = ({ children, componentName, trackRender = false }: PerformanceMonitorProps) => {
	const { startMeasure, endMeasure } = usePerformance();
	const measureIdRef = useRef<string>('');

	useEffect(() => {
		if (trackRender && componentName) {
			measureIdRef.current = startMeasure(`${componentName}-render`, 'component_render');
		}

		return () => {
			if (measureIdRef.current) {
				endMeasure(measureIdRef.current);
			}
		};
	}, [componentName, trackRender, startMeasure, endMeasure]);

	return <>{children}</>;
};
