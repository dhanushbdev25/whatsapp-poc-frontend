/**
 * Session context parser
 * Re-exported from schemas for backward compatibility
 */

import { sessionDataSchema, getAllPermissions, type SessionData } from '../../schemas/session.schemas';

/**
 * User session context parser schema
 * @deprecated Use sessionDataSchema from schemas/session.schemas.ts instead
 */
export const userSessionContextparser = sessionDataSchema;

/**
 * Session data type
 * @deprecated Use SessionData from schemas/session.schemas.ts instead
 */
export type sessionData = SessionData;

/**
 * Re-export getAllPermissions from schemas
 */
export { getAllPermissions };
