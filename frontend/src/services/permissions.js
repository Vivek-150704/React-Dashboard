export const rolePermissions = {
    Admin: ["fine:read", "fine:export", "fine:review", "users:read", "users:approve"],
    "Super User": ["fine:read", "fine:export", "fine:review"],
    Viewer: ["fine:read", "fine:export"],
};
export const can = (role, permission) => Boolean(rolePermissions[role]?.includes(permission));
