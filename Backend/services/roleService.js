const { getDb, ObjectId } = require('../config/db');

exports.getRoles = async (includeUserCount) => {
    const db = getDb();
    const roles = await db.collection('roles').find().toArray();

    if (includeUserCount === 'true') {
        return await Promise.all(roles.map(async (role) => {
            const userCount = await db.collection('users').countDocuments({ roleId: role._id, deletedAt: null });
            return {
                ...role,
                id: role._id.toString(),
                userCount
            };
        }));
    }

    return roles.map(r => ({ ...r, id: r._id.toString() }));
};

exports.createRole = async (data) => {
    const db = getDb();
    const { name, permissions, description } = data;
    const newRole = {
        name,
        permissions: permissions || [],
        description: description || '',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const result = await db.collection('roles').insertOne(newRole);
    return { ...newRole, id: result.insertedId.toString(), _id: result.insertedId };
};

exports.updateRole = async (id, data) => {
    const db = getDb();
    const updateData = { updatedAt: new Date() };
    if (data.name) updateData.name = data.name;
    if (data.permissions) updateData.permissions = data.permissions;
    if (data.description) updateData.description = data.description;

    const result = await db.collection('roles').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    if (!result) {
        throw new Error('Role not found');
    }

    return { ...result, id: result._id.toString() };
};

exports.deleteRole = async (id) => {
    const db = getDb();
    const result = await db.collection('roles').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
        throw new Error('Role not found');
    }
    return true;
};

exports.getRoleById = async (id, includeUsers) => {
    const db = getDb();
    const role = await db.collection('roles').findOne({ _id: new ObjectId(id) });
    if (!role) {
        throw new Error('Role not found');
    }

    const roleData = { ...role, id: role._id.toString() };

    if (includeUsers === 'true') {
        const users = await db.collection('users')
            .find({ roleId: new ObjectId(id), deletedAt: null }, { projection: { password: 0 } })
            .sort({ createdAt: -1 })
            .toArray();
        roleData.users = users.map(u => ({ ...u, id: u._id.toString() }));
    }

    return roleData;
};

exports.getUsersByRoleType = async (roleType) => {
    const db = getDb();
    const role = await db.collection('roles').findOne({ name: roleType });
    if (!role) {
        throw new Error(`Role '${roleType}' not found`);
    }

    const users = await db.collection('users')
        .find({ roleId: role._id, deletedAt: null }, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

    return users.map(u => ({
        ...u,
        id: u._id.toString(),
        role: { name: role.name, description: role.description }
    }));
};

exports.getRoleStatistics = async () => {
    const db = getDb();
    const roles = await db.collection('roles').find().toArray();
    
    const rolesWithCounts = await Promise.all(roles.map(async (role) => {
        const userCount = await db.collection('users').countDocuments({ roleId: role._id, deletedAt: null });
        return {
            ...role,
            id: role._id.toString(),
            userCount
        };
    }));

    const totalUsers = await db.collection('users').countDocuments({ deletedAt: null });
    
    const adminRole = await db.collection('roles').findOne({ name: 'admin' });
    const userRole = await db.collection('roles').findOne({ name: 'user' });

    const adminCount = adminRole ? await db.collection('users').countDocuments({ roleId: adminRole._id, deletedAt: null }) : 0;
    const userCount = userRole ? await db.collection('users').countDocuments({ roleId: userRole._id, deletedAt: null }) : 0;

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

    const db = getDb();
    const results = [];

    for (const update of updates) {
        const { userId, roleId } = update;

        if (!userId || !roleId) {
            results.push({ userId, error: 'Missing userId or roleId' });
            continue;
        }

        try {
            const result = await db.collection('users').findOneAndUpdate(
                { _id: new ObjectId(userId), deletedAt: null },
                { $set: { roleId: new ObjectId(roleId), updatedAt: new Date() } },
                { returnDocument: 'after' }
            );

            if (!result) {
                results.push({ userId, error: 'User not found' });
            } else {
                const role = await db.collection('roles').findOne({ _id: result.roleId });
                results.push({ 
                    userId, 
                    user: { ...result, id: result._id.toString(), role }, 
                    success: true 
                });
            }
        } catch (error) {
            results.push({ userId, error: error.message });
        }
    }

    return results;
};
