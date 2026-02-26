const { Op } = require('sequelize');
const User = require('../models/User');
const Role = require('../models/Role');

exports.getCurrentUser = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
    });
    if (!user) {
        throw new Error('User not found');
    }

    let roleName = null;
    if (user.roleId) {
        const role = await Role.findByPk(user.roleId);
        if (role) roleName = role.name;
    }

    return {
        ...user.toJSON(),
        role: roleName
    };
};

exports.updateCurrentUser = async (userId, data) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (data.username) user.username = data.username;
    if (data.email) user.email = data.email;

    await user.save();
    const { password: _, ...userData } = user.toJSON();
    return userData;
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
    const bcrypt = require('bcryptjs');
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: 'Password changed successfully' };
};

exports.getUsers = async (startDate, endDate, limit = 20, offset = 0) => {
    let dateFilter = {};

    if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) {
            dateFilter.createdAt[Op.gte] = new Date(new Date(startDate).setHours(0, 0, 0, 0));
        }
        if (endDate) {
            dateFilter.createdAt[Op.lte] = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }
    }

    const { count, rows: users } = await User.findAndCountAll({
        where: dateFilter,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
    });

    return {
        totalItems: count,
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: Math.floor(offset / limit) + 1
    };
};

exports.getUserById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
    });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

exports.updateUser = async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }

    if (data.username) user.username = data.username;
    if (data.email) user.email = data.email;
    if (data.roleId) user.roleId = data.roleId;

    await user.save();
    return user;
};

exports.deleteUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }

    await user.destroy();
    return true;
};

exports.getUsersForSharing = async () => {
    return await User.findAll({
        attributes: ['id', 'username', 'email'],
        order: [['username', 'ASC']]
    });
};

exports.updateUserRole = async (id, roleId) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
    user.roleId = roleId;
    await user.save();
    return user;
};
