/**
 * Common Zod schemas
 */

import { z } from 'zod/v4';

/**
 * Pagination parameters schema
 */
export const paginationParamsSchema = z.object({
	page: z.number().int().positive().optional(),
	pageSize: z.number().int().positive().optional(),
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
});

/**
 * Paginated response schema
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		data: z.array(itemSchema),
		total: z.number().int().nonnegative(),
		page: z.number().int().positive(),
		pageSize: z.number().int().positive(),
		totalPages: z.number().int().nonnegative()
	});

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
	start: z.union([z.string(), z.date()]),
	end: z.union([z.string(), z.date()])
});
