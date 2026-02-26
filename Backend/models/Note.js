const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  }
}, {
  timestamps: true,
  tableName: 'notes',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['tags'],
      using: 'gin' // Great for PostgreSQL full-text/array searches
    }
  ]
});

module.exports = Note;