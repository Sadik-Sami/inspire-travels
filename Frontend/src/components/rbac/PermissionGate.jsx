import { hasPermission } from '@/config/rbac';
import useRole from '@/hooks/use-Role';

const PermissionGate = ({ requiredPermissions, children, fallback = null, userRole = null }) => {
	const { role } = useRole();
	const currentRole = userRole || role;

	if (!hasPermission(currentRole, requiredPermissions)) {
		return fallback;
	}

	return children;
};

export default PermissionGate;
