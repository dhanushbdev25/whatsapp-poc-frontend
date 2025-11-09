/**
 * Authentication-related Zod schemas
 * Matches backend response structure
 */

import { z } from 'zod/v4';
import { successResponseSchema } from './api.schemas';

/**
 * Login request schema
 */
export const loginRequestSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

/**
 * Login response schema
 * Backend returns: { success: true, data: {}, message: "Login Successful", timestamp: string }
 */
export const loginResponseSchema = successResponseSchema(z.object({}).optional());

/**
 * Logout response schema
 * Backend returns: { success: true, data: {}, message: "Logged out successfully", timestamp: string }
 */
export const logoutResponseSchema = successResponseSchema(z.object({}).optional());

/**
 * Type inference from schemas
 */
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
