const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User, Role } = require('../models');

const generateToken = (id) => {
    return jwt.sign({ id }, config.jwtSecret, {
        expiresIn: config.jwtExpiration
    });
};

exports.register = async (userData) => {
    const { username, email, password, roleName } = userData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const roleToAssign = roleName || 'user';
    let userRole = await Role.findOne({ where: { name: roleToAssign } });
    if (!userRole) {
        // create the role if it doesn't exist for now
        userRole = await Role.create({ name: roleToAssign });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        roleId: userRole.id
    });

    const token = generateToken(user.id);

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: userRole.name
        }
    };
};

exports.login = async (credentials) => {
    const { email, password } = credentials;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    let roleName = 'user';
    if (user.roleId) {
        const role = await Role.findByPk(user.roleId);
        if (role) roleName = role.name;
    }

    const token = generateToken(user.id);

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: roleName
        }
    };
};

exports.getMe = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    let roleName = 'user';
    if (user.roleId) {
        const role = await Role.findByPk(user.roleId);
        if (role) roleName = role.name;
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: roleName
    };
};
