/**
 * UI-related constants
 */

/**
 * Material-UI breakpoints
 */
export const BREAKPOINTS = {
	xs: 0,
	sm: 600,
	md: 900,
	lg: 1200,
	xl: 1536
} as const;

/**
 * Common UI dimensions
 */
export const DIMENSIONS = {
	HEADER_HEIGHT: 64,
	DRAWER_WIDTH: 290,
	BORDER_RADIUS: {
		SMALL: 4,
		MEDIUM: 8,
		LARGE: 12
	},
	SPACING: {
		XS: 4,
		SM: 8,
		MD: 16,
		LG: 24,
		XL: 32
	}
} as const;

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATION = {
	SHORT: 150,
	MEDIUM: 300,
	LONG: 500
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
	MODAL: 1300,
	DRAWER: 1200,
	APP_BAR: 1100,
	TOOLTIP: 1500,
	SNACKBAR: 1400
} as const;
