import { Injectable, ForbiddenException } from "@nestjs/common";

export type Permission =
  | "workspaces.create"
  | "workspaces.read"
  | "workspaces.update"
  | "workspaces.delete"
  | "connections.create"
  | "connections.read"
  | "connections.update"
  | "connections.delete"
  | "connections.test"
  | "models.create"
  | "models.read"
  | "models.update"
  | "models.delete"
  | "models.publish"
  | "dashboards.create"
  | "dashboards.read"
  | "dashboards.update"
  | "dashboards.delete"
  | "queries.execute"
  | "users.create"
  | "users.read"
  | "users.update"
  | "users.delete"
  | "roles.create"
  | "roles.read"
  | "roles.update"
  | "roles.delete"
  | "audit.read"
  | "settings.read"
  | "settings.update";

export type RoleName = "admin" | "editor" | "viewer" | "data_steward" | "security_admin";

interface RoleDefinition {
  name: RoleName;
  permissions: Permission[];
}

const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    name: "admin",
    permissions: [
      "workspaces.create", "workspaces.read", "workspaces.update", "workspaces.delete",
      "connections.create", "connections.read", "connections.update", "connections.delete", "connections.test",
      "models.create", "models.read", "models.update", "models.delete", "models.publish",
      "dashboards.create", "dashboards.read", "dashboards.update", "dashboards.delete",
      "queries.execute",
      "users.create", "users.read", "users.update", "users.delete",
      "roles.create", "roles.read", "roles.update", "roles.delete",
      "audit.read",
      "settings.read", "settings.update",
    ],
  },
  {
    name: "editor",
    permissions: [
      "workspaces.read",
      "connections.read", "connections.test",
      "models.create", "models.read", "models.update",
      "dashboards.create", "dashboards.read", "dashboards.update",
      "queries.execute",
      "users.read",
      "audit.read",
      "settings.read",
    ],
  },
  {
    name: "viewer",
    permissions: [
      "workspaces.read",
      "connections.read",
      "models.read",
      "dashboards.read",
      "users.read",
      "settings.read",
    ],
  },
  {
    name: "data_steward",
    permissions: [
      "workspaces.read",
      "connections.create", "connections.read", "connections.update", "connections.test",
      "models.create", "models.read", "models.update", "models.delete", "models.publish",
      "dashboards.read",
      "queries.execute",
      "users.read",
      "audit.read",
    ],
  },
  {
    name: "security_admin",
    permissions: [
      "workspaces.read",
      "connections.read",
      "models.read",
      "dashboards.read",
      "users.create", "users.read", "users.update", "users.delete",
      "roles.create", "roles.read", "roles.update", "roles.delete",
      "audit.read",
      "settings.read", "settings.update",
    ],
  },
];

interface UserContext {
  userId: string;
  orgId: string;
  roles: RoleName[];
}

@Injectable()
export class RBACService {
  private roleDefinitions: Map<RoleName, Permission[]> = new Map();

  constructor() {
    for (const role of ROLE_DEFINITIONS) {
      this.roleDefinitions.set(role.name, role.permissions);
    }
  }

  getRolePermissions(role: RoleName): Permission[] {
    return this.roleDefinitions.get(role) || [];
  }

  hasPermission(userRoles: RoleName[], permission: Permission): boolean {
    return userRoles.some((role) => {
      const permissions = this.roleDefinitions.get(role);
      return permissions?.includes(permission) || false;
    });
  }

  checkPermission(userRoles: RoleName[], permission: Permission): void {
    if (!this.hasPermission(userRoles, permission)) {
      throw new ForbiddenException(
        `Insufficient permissions: ${permission} required`
      );
    }
  }

  canAccessWorkspace(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "workspaces.read");
  }

  canManageWorkspace(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "workspaces.update");
  }

  canAccessConnection(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "connections.read");
  }

  canManageConnection(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "connections.update");
  }

  canTestConnection(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "connections.test");
  }

  canAccessModel(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "models.read");
  }

  canManageModel(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "models.update");
  }

  canPublishModel(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "models.publish");
  }

  canAccessDashboard(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "dashboards.read");
  }

  canManageDashboard(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "dashboards.update");
  }

  canExecuteQuery(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "queries.execute");
  }

  canManageUsers(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "users.update");
  }

  canManageRoles(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "roles.update");
  }

  canReadAudit(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "audit.read");
  }

  canManageSettings(userRoles: RoleName[]): boolean {
    return this.hasPermission(userRoles, "settings.update");
  }

  getAllRoles(): RoleName[] {
    return Array.from(this.roleDefinitions.keys());
  }
}
