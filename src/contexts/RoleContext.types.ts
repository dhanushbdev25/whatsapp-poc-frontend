import type { ReactNode } from 'react';
import type { SessionData } from '../schemas/session.schemas';

/**
 * Role interface representing a user role with permissions
 * Adapted for backend structure with single role (roleId, roleName)
 */
export interface Role {
	/** Unique role identifier */
	id: number;
	/** Role name */
	name: string;
	/** List of permission strings */
	permissions: string[];
}

/**
 * User information interface
 * Adapted for backend structure with string id
 */
export interface UserInfo {
	/** Unique user identifier (string from backend) */
	id: string;
	/** User's full name */
	name: string;
	/** User's email address */
	email: string;
}

/**
 * Role context type providing role management functionality
 */
export interface RoleContextType {
	/** Currently active role */
	currentRole: Role;
	/** All available roles for the user */
	availableRoles: Role[];
	/** Current user information */
	userInfo: UserInfo;
	/**
	 * Switch to a different role
	 * @param roleId - The ID of the role to switch to
	 */
	switchRole: (roleId: number) => void;
	/**
	 * Get all permissions for the current role
	 * @returns Array of permission strings
	 */
	getCurrentPermissions: () => string[];
}

/**
 * Role provider props
 */
export interface RoleProviderProps {
	/** Child components */
	children: ReactNode;
	/** Session data from the API (matches backend structure) */
	sessionData: SessionData;
}
