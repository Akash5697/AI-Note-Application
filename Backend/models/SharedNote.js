const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SharedNote = sequelize.define('SharedNote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    noteId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    permission: {
        type: DataTypes.ENUM('read', 'write'),
        allowNull: false,
        defaultValue: 'read',
    }
}, {
    timestamps: true,
    tableName: 'shared_notes',
});

module.exports = SharedNote;
