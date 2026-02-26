const User = require('./User');
const Role = require('./Role');
const Note = require('./Note');
const SharedNote = require('./SharedNote');

// User and Role
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// Note and User
Note.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });

// SharedNote relations
Note.hasMany(SharedNote, { foreignKey: 'noteId', as: 'sharedUsers' });
SharedNote.belongsTo(Note, { foreignKey: 'noteId' });

User.hasMany(SharedNote, { foreignKey: 'userId', as: 'sharedNotes' });
SharedNote.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    User,
    Role,
    Note,
    SharedNote
};
