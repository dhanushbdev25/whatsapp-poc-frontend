/**
 * Session-related Zod schemas
 * Matches backend session structure with flat permissions and roleId/roleName
 */

import { z } from 'zod/v4';

/**
 * Session data schema matching backend structure
 * Backend returns: { id: string, name: string, email: string, roleId: number, roleName: string, permissions: string[] }
 */
export const sessionDataSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	email: z.string().email(),
	roleId: z.number().int().positive(),
	roleName: z.string().min(1),
	permissions: z.array(z.string())
});

/**
 * Type inference from schemas
 */
export type SessionData = z.infer<typeof sessionDataSchema>;

/**
 * Helper function to extract all permissions from session data
 * Note: Backend returns flat permissions array, so just return it directly
 */
export const getAllPermissions = (sessionData: SessionData): string[] => {
	return sessionData.permissions;
};

/**
 * Role type for backward compatibility (if needed elsewhere)
 * Note: Backend doesn't return role objects, only roleId and roleName
 */
export interface Role {
	id: number;
	name: string;
	permissions: string[];
}
