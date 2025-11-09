/**
 * Common shared types
 */

/**
 * Generic result type
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * Async result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Optional type helper
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Maybe type helper
 */
export type Maybe<T> = T | null | undefined;

/**
 * Date range type
 */
export interface DateRange {
	start: Date | string;
	end: Date | string;
}

/**
 * Sort order type
 */
export type SortOrder = 'asc' | 'desc';

/**
 * ID type (can be number or string)
 */
export type Id = number | string;

/**
 * Generic key-value pair
 */
export interface KeyValuePair<K = string, V = unknown> {
	key: K;
	value: V;
}

/**
 * Generic list response
 */
export interface ListResponse<T> {
	items: T[];
	total: number;
}
