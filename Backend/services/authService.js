const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const { getDb, ObjectId } = require('../config/db');
const emailService = require('./emailService');

const generateToken = (id) => {
    return jwt.sign({ id: id.toString() }, config.jwtSecret, {
        expiresIn: config.jwtExpiration
    });
};

exports.register = async (userData) => {
    const { username, email, password, roleName } = userData;
    const db = getDb();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const roleToAssign = roleName || 'user';
    let userRole = await db.collection('roles').findOne({ name: roleToAssign });
    if (!userRole) {
        // create the role if it doesn't exist for now
        const roleResult = await db.collection('roles').insertOne({ name: roleToAssign });
        userRole = { _id: roleResult.insertedId, name: roleToAssign };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userToInsert = {
        username,
        email,
        password: hashedPassword,
        roleId: userRole._id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
    };

    const result = await db.collection('users').insertOne(userToInsert);
    const userId = result.insertedId;

    const token = generateToken(userId);

    return {
        token,
        user: {
            id: userId.toString(),
            username: userToInsert.username,
            email: userToInsert.email,
            role: userRole.name
        }
    };
};

exports.login = async (credentials) => {
    const { email, password } = credentials;
    const db = getDb();

    const user = await db.collection('users').findOne({ email, deletedAt: null });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    let roleName = 'user';
    if (user.roleId) {
        const role = await db.collection('roles').findOne({ _id: user.roleId });
        if (role) roleName = role.name;
    }

    const token = generateToken(user._id);

    return {
        token,
        user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: roleName
        }
    };
};

exports.getMe = async (userId) => {
    const db = getDb();
    let user;
    
    try {
        user = await db.collection('users').findOne({ _id: new ObjectId(userId), deletedAt: null });
    } catch (e) {
        throw new Error('Invalid User ID');
    }

    if (!user) {
        throw new Error('User not found');
    }

    let roleName = 'user';
    if (user.roleId) {
        const role = await db.collection('roles').findOne({ _id: user.roleId });
        if (role) roleName = role.name;
    }

    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: roleName
    };
};

exports.forgotPassword = async (email) => {
    const db = getDb();
    const user = await db.collection('users').findOne({ email, deletedAt: null });

    if (!user) {
        throw new Error('User with this email does not exist');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await db.collection('users').updateOne(
        { _id: user._id },
        { 
            $set: { 
                resetPasswordToken, 
                resetPasswordExpire,
                updatedAt: new Date()
            } 
        }
    );

    try {
        await emailService.sendResetPasswordEmail(user.email, resetToken);
    } catch (error) {
        // Clear token fields if email fails
        await db.collection('users').updateOne(
            { _id: user._id },
            { 
                $set: { 
                    resetPasswordToken: null, 
                    resetPasswordExpire: null 
                } 
            }
        );
        throw error;
    }

    return { message: 'Password reset link sent to email' };
};

exports.resetPassword = async (token, newPassword) => {
    const db = getDb();
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await db.collection('users').findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
        deletedAt: null
    });

    if (!user) {
        throw new Error('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection('users').updateOne(
        { _id: user._id },
        {
            $set: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpire: null,
                updatedAt: new Date()
            }
        }
    );

    return { message: 'Password reset successful' };
};
