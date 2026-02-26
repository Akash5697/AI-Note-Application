const { Role, User } = require('../models');

exports.getRoles = async (includeUserCount) => {
    let roles = await Role.findAll();

    if (includeUserCount === 'true') {
        roles = await Promise.all(roles.map(async (role) => {
            const userCount = await User.count({ where: { roleId: role.id } });
            return {
                ...role.toJSON(),
                userCount
            };
        }));
    }

    return roles;
};

exports.createRole = async (data) => {
    const { name, permissions, description } = data;
    const role = await Role.create({ name, permissions, description });
    return role;
};

exports.updateRole = async (id, data) => {
    const role = await Role.findByPk(id);
    if (!role) {
        throw new Error('Role not found');
    }

    if (data.name) role.name = data.name;
    if (data.permissions) role.permissions = data.permissions;
    if (data.description) role.description = data.description;

    await role.save();
    return role;
};

exports.deleteRole = async (id) => {
    const role = await Role.findByPk(id);
    if (!role) {
        throw new Error('Role not found');
    }

    await role.destroy();
    return true;
};

exports.getRoleById = async (id, includeUsers) => {
    const role = await Role.findByPk(id);
    if (!role) {
        throw new Error('Role not found');
    }

    const roleData = role.toJSON();

    if (includeUsers === 'true') {
        const users = await User.findAll({
            where: { roleId: id },
            attributes: ['id', 'username', 'email', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        roleData.users = users;
    }

    return roleData;
};

exports.getUsersByRoleType = async (roleType) => {
    const role = await Role.findOne({ where: { name: roleType } });
    if (!role) {
        throw new Error(`Role '${roleType}' not found`);
    }

    const users = await User.findAll({
        where: { roleId: role.id },
        attributes: { exclude: ['password'] },
        include: [{ model: Role, as: 'role', attributes: ['name', 'description'] }],
        order: [['createdAt', 'DESC']]
    });

    return users;
};

exports.getRoleStatistics = async () => {
    const roles = await Role.findAll();
    const rolesWithCounts = await Promise.all(roles.map(async (role) => {
        const userCount = await User.count({ where: { roleId: role.id } });
        return {
            ...role.toJSON(),
            userCount
        };
    }));

    const totalUsers = await User.count();
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const userRole = await Role.findOne({ where: { name: 'user' } });

    const adminCount = adminRole ? await User.count({ where: { roleId: adminRole.id } }) : 0;
    const userCount = userRole ? await User.count({ where: { roleId: userRole.id } }) : 0;

    return {
        totalRoles: roles.length,
        totalUsers,
        adminCount,
        userCount,
        rolesWithCounts
    };
};

exports.bulkUpdateUserRoles = async (updates) => {
    if (!Array.isArray(updates)) {
        throw new Error('Updates must be an array');
    }

    const results = [];

    for (const update of updates) {
        const { userId, roleId } = update;

        if (!userId || !roleId) {
            results.push({ userId, error: 'Missing userId or roleId' });
            continue;
        }

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                results.push({ userId, error: 'User not found' });
            } else {
                user.roleId = roleId;
                await user.save();

                await user.reload({ include: [{ model: Role, as: 'role' }] });
                results.push({ userId, user, success: true });
            }
        } catch (error) {
            results.push({ userId, error: error.message });
        }
    }

    return results;
};
