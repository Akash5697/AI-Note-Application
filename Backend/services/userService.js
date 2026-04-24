const { getDb, ObjectId } = require('../config/db');

exports.getCurrentUser = async (userId) => {
    const db = getDb();
    const user = await db.collection('users').findOne({ 
        _id: new ObjectId(userId),
        deletedAt: null 
    }, { projection: { password: 0 } });

    if (!user) {
        throw new Error('User not found');
    }

    let roleName = null;
    if (user.roleId) {
        const role = await db.collection('roles').findOne({ _id: user.roleId });
        if (role) roleName = role.name;
    }

    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        roleId: user.roleId ? user.roleId.toString() : null,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: roleName
    };
};

exports.updateCurrentUser = async (userId, data) => {
    const db = getDb();
    const updateData = { updatedAt: new Date() };
    if (data.username) updateData.username = data.username;
    if (data.email) updateData.email = data.email;

    const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(userId), deletedAt: null },
        { $set: updateData },
        { returnDocument: 'after', projection: { password: 0 } }
    );

    if (!result) {
        throw new Error('User not found');
    }

    const user = result;
    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
    const bcrypt = require('bcryptjs');
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId), deletedAt: null });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    return { message: 'Password changed successfully' };
};

exports.getUsers = async (startDate, endDate, limit = 20, offset = 0) => {
    const db = getDb();
    let query = { deletedAt: null };

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        }
        if (endDate) {
            query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }
    }

    const cursor = db.collection('users')
        .find(query, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit));

    const users = await cursor.toArray();
    const count = await db.collection('users').countDocuments(query);

    return {
        totalItems: count,
        users: users.map(u => ({ ...u, id: u._id.toString(), _id: u._id.toString() })),
        totalPages: Math.ceil(count / limit),
        currentPage: Math.floor(offset / limit) + 1
    };
};

exports.getUserById = async (id) => {
    const db = getDb();
    const user = await db.collection('users').findOne(
        { _id: new ObjectId(id), deletedAt: null },
        { projection: { password: 0 } }
    );
    if (!user) {
        throw new Error('User not found');
    }
    return { ...user, id: user._id.toString() };
};

exports.updateUser = async (id, data) => {
    const db = getDb();
    const updateData = { updatedAt: new Date() };
    if (data.username) updateData.username = data.username;
    if (data.email) updateData.email = data.email;
    if (data.roleId) updateData.roleId = new ObjectId(data.roleId);

    const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(id), deletedAt: null },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    if (!result) {
        throw new Error('User not found');
    }

    return { ...result, id: result._id.toString() };
};

exports.deleteUser = async (id) => {
    const db = getDb();
    const result = await db.collection('users').updateOne(
        { _id: new ObjectId(id) },
        { $set: { deletedAt: new Date(), updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
        throw new Error('User not found');
    }

    return true;
};

exports.getUsersForSharing = async () => {
    const db = getDb();
    const users = await db.collection('users')
        .find({ deletedAt: null }, { projection: { id: 1, username: 1, email: 1 } })
        .sort({ username: 1 })
        .toArray();

    return users.map(u => ({ id: u._id.toString(), username: u.username, email: u.email }));
};

exports.updateUserRole = async (id, roleId) => {
    const db = getDb();
    const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(id), deletedAt: null },
        { $set: { roleId: new ObjectId(roleId), updatedAt: new Date() } },
        { returnDocument: 'after' }
    );

    if (!result) {
        throw new Error('User not found');
    }

    return { ...result, id: result._id.toString() };
};
