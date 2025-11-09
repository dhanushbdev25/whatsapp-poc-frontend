/**
 * API response schemas
 * Matches backend response structure with success flag and timestamp
 */

import { z } from 'zod/v4';

/**
 * Success response schema matching backend format
 */
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T) =>
	z.object({
		success: z.literal(true),
		data: dataSchema ? dataSchema.optional() : z.unknown().optional(),
		message: z.string().optional(),
		timestamp: z.string()
	});

/**
 * Error response schema matching backend format
 */
export const errorResponseSchema = z.object({
	success: z.literal(false),
	message: z.string(),
	errors: z.record(z.string(), z.array(z.string())).optional(),
	timestamp: z.string()
});

/**
 * Generic API response wrapper schema (can be success or error)
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.union([successResponseSchema(dataSchema), errorResponseSchema]);

/**
 * Type inference from schemas
 */
export type SuccessResponse<T = unknown> = z.infer<ReturnType<typeof successResponseSchema>> & { data?: T };
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
