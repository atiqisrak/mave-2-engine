import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default permissions grouped by module
const defaultPermissions = [
  // Organization permissions
  {
    name: 'View Organizations',
    slug: 'organizations.view',
    description: 'View organization details',
    module: 'organizations',
    category: 'read',
    permissionType: 'action',
    riskLevel: 'low',
    isSystem: true,
  },
  {
    name: 'Create Organizations',
    slug: 'organizations.create',
    description: 'Create new organizations',
    module: 'organizations',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'high',
    isSystem: true,
  },
  {
    name: 'Update Organizations',
    slug: 'organizations.update',
    description: 'Update organization settings',
    module: 'organizations',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'medium',
    isSystem: true,
  },
  {
    name: 'Delete Organizations',
    slug: 'organizations.delete',
    description: 'Delete organizations',
    module: 'organizations',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'critical',
    requiresMfa: true,
    isSystem: true,
  },

  // User permissions
  {
    name: 'View Users',
    slug: 'users.view',
    description: 'View user information',
    module: 'users',
    category: 'read',
    permissionType: 'action',
    riskLevel: 'low',
    isSystem: true,
  },
  {
    name: 'Create Users',
    slug: 'users.create',
    description: 'Create new users',
    module: 'users',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'medium',
    isSystem: true,
  },
  {
    name: 'Update Users',
    slug: 'users.update',
    description: 'Update user information',
    module: 'users',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'medium',
    isSystem: true,
  },
  {
    name: 'Delete Users',
    slug: 'users.delete',
    description: 'Delete users',
    module: 'users',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'high',
    requiresMfa: true,
    isSystem: true,
  },

  // Role permissions
  {
    name: 'View Roles',
    slug: 'roles.view',
    description: 'View roles and permissions',
    module: 'roles',
    category: 'read',
    permissionType: 'action',
    riskLevel: 'low',
    isSystem: true,
  },
  {
    name: 'Create Roles',
    slug: 'roles.create',
    description: 'Create new roles',
    module: 'roles',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'high',
    isSystem: true,
  },
  {
    name: 'Update Roles',
    slug: 'roles.update',
    description: 'Update role permissions',
    module: 'roles',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'high',
    isSystem: true,
  },
  {
    name: 'Delete Roles',
    slug: 'roles.delete',
    description: 'Delete roles',
    module: 'roles',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'high',
    isSystem: true,
  },
  {
    name: 'Assign Roles',
    slug: 'roles.assign',
    description: 'Assign roles to users',
    module: 'roles',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'high',
    isSystem: true,
  },
  {
    name: 'Revoke Roles',
    slug: 'roles.revoke',
    description: 'Revoke roles from users',
    module: 'roles',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'high',
    isSystem: true,
  },

  // Permission permissions
  {
    name: 'View Permissions',
    slug: 'permissions.view',
    description: 'View available permissions',
    module: 'permissions',
    category: 'read',
    permissionType: 'action',
    riskLevel: 'low',
    isSystem: true,
  },
  {
    name: 'Manage Permissions',
    slug: 'permissions.manage',
    description: 'Create and manage permissions',
    module: 'permissions',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'critical',
    requiresMfa: true,
    isSystem: true,
  },

  // Content permissions (placeholder for CMS functionality)
  {
    name: 'View Content',
    slug: 'content.view',
    description: 'View content items',
    module: 'content',
    category: 'read',
    permissionType: 'action',
    riskLevel: 'low',
    isSystem: true,
  },
  {
    name: 'Create Content',
    slug: 'content.create',
    description: 'Create new content',
    module: 'content',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'low',
    isSystem: true,
  },
  {
    name: 'Update Content',
    slug: 'content.update',
    description: 'Update existing content',
    module: 'content',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'low',
    isSystem: true,
  },
  {
    name: 'Delete Content',
    slug: 'content.delete',
    description: 'Delete content',
    module: 'content',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'medium',
    isSystem: true,
  },
  {
    name: 'Publish Content',
    slug: 'content.publish',
    description: 'Publish content',
    module: 'content',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'medium',
    isSystem: true,
  },

  // System permissions
  {
    name: 'View System Settings',
    slug: 'system.view',
    description: 'View system settings',
    module: 'system',
    category: 'read',
    permissionType: 'action',
    riskLevel: 'medium',
    isSystem: true,
  },
  {
    name: 'Manage System Settings',
    slug: 'system.manage',
    description: 'Manage system configuration',
    module: 'system',
    category: 'write',
    permissionType: 'action',
    riskLevel: 'critical',
    requiresMfa: true,
    isSystem: true,
  },
];

// Default roles with their permissions
const defaultRoles = [
  {
    name: 'Super Admin',
    slug: 'super-admin',
    description:
      'Full system access with all permissions. Can manage organizations, users, roles, and system settings.',
    permissions: defaultPermissions.map((p) => p.slug),
    color: '#EF4444',
    icon: 'shield-check',
    priority: 100,
    isSystem: true,
    isAssignable: true,
    isDefault: false,
    roleType: 'system',
    level: 0,
  },
  {
    name: 'Admin',
    slug: 'admin',
    description:
      'Organization administrator with full organization management capabilities.',
    permissions: [
      'organizations.view',
      'organizations.update',
      'users.view',
      'users.create',
      'users.update',
      'users.delete',
      'roles.view',
      'roles.create',
      'roles.update',
      'roles.assign',
      'roles.revoke',
      'permissions.view',
      'content.view',
      'content.create',
      'content.update',
      'content.delete',
      'content.publish',
    ],
    color: '#F59E0B',
    icon: 'user-cog',
    priority: 90,
    isSystem: true,
    isAssignable: true,
    isDefault: false,
    roleType: 'organization',
    level: 1,
  },
  {
    name: 'Editor',
    slug: 'editor',
    description:
      'Content editor with full content management capabilities but limited user management.',
    permissions: [
      'users.view',
      'roles.view',
      'content.view',
      'content.create',
      'content.update',
      'content.delete',
      'content.publish',
    ],
    color: '#10B981',
    icon: 'pencil',
    priority: 50,
    isSystem: true,
    isAssignable: true,
    isDefault: false,
    roleType: 'organization',
    level: 2,
  },
  {
    name: 'Contributor',
    slug: 'contributor',
    description:
      'Content contributor who can create and edit their own content but cannot publish.',
    permissions: [
      'content.view',
      'content.create',
      'content.update',
    ],
    color: '#3B82F6',
    icon: 'user-edit',
    priority: 30,
    isSystem: true,
    isAssignable: true,
    isDefault: false,
    roleType: 'organization',
    level: 3,
  },
  {
    name: 'Viewer',
    slug: 'viewer',
    description: 'Read-only access to view content and basic information.',
    permissions: ['users.view', 'content.view'],
    color: '#6B7280',
    icon: 'eye',
    priority: 10,
    isSystem: true,
    isAssignable: true,
    isDefault: true,
    roleType: 'organization',
    level: 4,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed permissions
  console.log('📝 Seeding permissions...');
  for (const permission of defaultPermissions) {
    await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: permission,
      create: permission,
    });
  }
  console.log(`✅ Seeded ${defaultPermissions.length} permissions`);

  // Seed system roles (organizationId = null)
  console.log('👥 Seeding system roles...');
  for (const role of defaultRoles) {
    // Check if role exists
    const existingRole = await prisma.role.findFirst({
      where: {
        slug: role.slug,
        organizationId: null,
      },
    });

    if (existingRole) {
      // Update existing role
      await prisma.role.update({
        where: { id: existingRole.id },
        data: {
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          color: role.color,
          icon: role.icon,
          priority: role.priority,
          isSystem: role.isSystem,
          isAssignable: role.isAssignable,
          isDefault: role.isDefault,
          roleType: role.roleType,
          level: role.level,
        },
      });
    } else {
      // Create new role
      await prisma.role.create({
        data: {
          organizationId: null,
          name: role.name,
          slug: role.slug,
          description: role.description,
          permissions: role.permissions,
          color: role.color,
          icon: role.icon,
          priority: role.priority,
          isSystem: role.isSystem,
          isAssignable: role.isAssignable,
          isDefault: role.isDefault,
          roleType: role.roleType,
          level: role.level,
          metadata: {},
        },
      });
    }
  }
  console.log(`✅ Seeded ${defaultRoles.length} system roles`);

  // Create system organization
  console.log('🏢 Creating system organization...');
  const systemOrg = await prisma.organization.upsert({
    where: { slug: 'system' },
    update: {},
    create: {
      name: 'System',
      slug: 'system',
      domain: 'admin',
      plan: 'enterprise',
      settings: {
        isSystem: true,
        description: 'System organization for platform administration',
      },
      branding: {},
      isActive: true,
    },
  });
  console.log('✅ System organization created');

  // Create super admin user
  console.log('👑 Creating super admin user...');
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'changeme123';

  // Hash password
  const argon2 = require('argon2');
  const passwordHash = await argon2.hash(superAdminPassword);

  const superAdmin = await prisma.user.upsert({
    where: { 
      organizationId_email: {
        organizationId: systemOrg.id,
        email: superAdminEmail,
      }
    },
    update: {
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      emailVerifiedAt: new Date(),
      isSystem: true,
    },
    create: {
      organizationId: systemOrg.id,
      email: superAdminEmail,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      emailVerifiedAt: new Date(),
      isSystem: true,
      preferences: {},
      metadata: {},
    },
  });
  console.log('✅ Super admin user created');

  // Assign super admin role
  console.log('🔐 Assigning super admin role...');
  const superAdminRole = await prisma.role.findFirst({
    where: {
      slug: 'super-admin',
      organizationId: null,
    },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId_scope_resourceType_resourceId: {
          userId: superAdmin.id,
          roleId: superAdminRole.id,
          scope: 'global',
          resourceType: 'system',
          resourceId: systemOrg.id,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
        scope: 'global',
        resourceType: 'system',
        resourceId: systemOrg.id,
        isActive: true,
        assignedReason: 'System initialization',
      },
    });
    console.log('✅ Super admin role assigned');
  }

  console.log('🎉 Database seed completed!');
  console.log(`📧 Super Admin Email: ${superAdminEmail}`);
  console.log(`🔑 Super Admin Password: ${superAdminPassword}`);
  console.log('⚠️  Please change the super admin password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

