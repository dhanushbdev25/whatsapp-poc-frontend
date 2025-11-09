import { useCallback, useMemo } from 'react';
import { RoleContextType } from './RoleContext.types';
import { Role, RoleProviderProps } from './RoleContext.types';
import { RoleContext } from './RoleContext.context';

/**
 * RoleProvider component
 * Adapts backend session structure (flat permissions, single role) to RoleContext format
 * Backend structure: { id: string, name: string, email: string, roleId: number, roleName: string, permissions: string[] }
 */
export const RoleProvider = ({ children, sessionData }: RoleProviderProps) => {
	// Create a single role object from backend data
	// Backend only provides one role (roleId, roleName), so we create a Role object for compatibility
	const currentRole: Role = useMemo(
		() => ({
			id: sessionData.roleId,
			name: sessionData.roleName,
			permissions: sessionData.permissions
		}),
		[sessionData.roleId, sessionData.roleName, sessionData.permissions]
	);

	// Available roles - backend only provides one role, so availableRoles is just the current role
	// This maintains backward compatibility with components that expect an array
	const availableRoles: Role[] = useMemo(() => [currentRole], [currentRole]);

	// User info - adapt id from string to match UserInfo interface
	const userInfo = useMemo(
		() => ({
			id: sessionData.id, // string from backend
			name: sessionData.name,
			email: sessionData.email
		}),
		[sessionData.id, sessionData.name, sessionData.email]
	);

	// Switch role function - no-op since backend only provides one role
	// Maintained for backward compatibility
	const switchRole = useCallback(
		(roleId: number) => {
			// Backend only provides one role, so switching is not supported
			// This function is kept for API compatibility but does nothing
			if (roleId === sessionData.roleId) {
				// Already on this role, no action needed
				return;
			}
			// Role switching not supported with new backend structure
		},
		[sessionData.roleId]
	);

	// Get current permissions - directly from session data
	const getCurrentPermissions = useCallback(() => {
		return sessionData.permissions;
	}, [sessionData.permissions]);

	const value: RoleContextType = {
		currentRole,
		availableRoles,
		userInfo,
		switchRole,
		getCurrentPermissions
	};

	return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};
