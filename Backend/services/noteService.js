const { Op } = require('sequelize');
const { Note, User, SharedNote } = require('../models');

exports.getNotes = async (userId, isArchived = false, limit = 20, offset = 0) => {
    // Find notes owned by user OR shared with user
    const { count, rows: notes } = await Note.findAndCountAll({
        where: {
            [Op.and]: [
                {
                    [Op.or]: [
                        { userId },
                        { '$sharedUsers.userId$': userId }
                    ]
                },
                { isArchived }
            ]
        },
        include: [
            {
                model: User,
                as: 'owner',
                attributes: ['id', 'username', 'email']
            },
            {
                model: SharedNote,
                as: 'sharedUsers',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email']
                }],
                required: false // LEFT JOIN so we still get notes that aren't shared with ANYONE
            }
        ],
        order: [['updatedAt', 'DESC']],
        limit,
        offset,
        distinct: true,
        subQuery: false
    });
    return {
        totalItems: count,
        notes,
        totalPages: Math.ceil(count / limit),
        currentPage: Math.floor(offset / limit) + 1
    };
};

exports.getNoteById = async (id, userId) => {
    const note = await Note.findByPk(id, {
        include: [
            { model: User, as: 'owner', attributes: ['id', 'username', 'email'] },
            {
                model: SharedNote,
                as: 'sharedUsers',
                include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
            }
        ]
    });

    if (!note) throw new Error('Note not found');

    const isOwner = note.userId === userId;
    const sharedAcess = note.sharedUsers && note.sharedUsers.find(s => s.userId === userId);

    if (!isOwner && !sharedAcess) {
        throw new Error('Not authorized to access this note');
    }

    return note;
};

exports.createNote = async (data, userId) => {
    const { title, content, tags } = data;
    const note = await Note.create({
        title,
        content,
        tags: tags || [],
        userId
    });
    return note;
};

exports.updateNote = async (id, data, userId) => {
    const note = await Note.findByPk(id, {
        include: [{ model: SharedNote, as: 'sharedUsers' }]
    });

    if (!note) throw new Error('Note not found');

    const isOwner = note.userId === userId;
    const sharedAccess = note.sharedUsers && note.sharedUsers.find(s => s.userId === userId && s.permission === 'write');

    if (!isOwner && !sharedAccess) {
        throw new Error('Not authorized to edit this note');
    }

    if (data.title !== undefined) note.title = data.title;
    if (data.content !== undefined) note.content = data.content;
    if (data.tags !== undefined) note.tags = data.tags;
    if (data.isArchived !== undefined) note.isArchived = data.isArchived;

    await note.save();

    return this.getNoteById(id, userId); // Return populated
};

exports.deleteNote = async (id, userId) => {
    const note = await Note.findByPk(id);
    if (!note) throw new Error('Note not found');

    if (note.userId !== userId) {
        throw new Error('Only the owner can delete this note');
    }

    await note.destroy();
    return true;
};

exports.shareNote = async (id, userIdToShare, permission, ownerId) => {
    const note = await Note.findByPk(id);
    if (!note) throw new Error('Note not found');

    if (note.userId !== ownerId) {
        throw new Error('Only the owner can share this note');
    }

    // Check if exists
    const existingShare = await SharedNote.findOne({
        where: { noteId: id, userId: userIdToShare }
    });

    if (existingShare) {
        throw new Error('Note is already shared with this user');
    }

    await SharedNote.create({
        noteId: id,
        userId: userIdToShare,
        permission
    });

    return this.getNoteById(id, ownerId);
};

exports.updateSharing = async (id, userIdToUpdate, permission, ownerId) => {
    const note = await Note.findByPk(id);
    if (!note) throw new Error('Note not found');

    if (note.userId !== ownerId) {
        throw new Error('Only the owner can update sharing for this note');
    }

    const share = await SharedNote.findOne({
        where: { noteId: id, userId: userIdToUpdate }
    });

    if (!share) throw new Error('User is not shared with this note');

    share.permission = permission;
    await share.save();

    return this.getNoteById(id, ownerId);
};

exports.removeSharing = async (id, userIdToRemove, ownerId) => {
    const note = await Note.findByPk(id);
    if (!note) throw new Error('Note not found');

    if (note.userId !== ownerId) {
        throw new Error('Only the owner can remove sharing for this note');
    }

    await SharedNote.destroy({
        where: { noteId: id, userId: userIdToRemove }
    });

    return this.getNoteById(id, ownerId);
};

exports.searchNotes = async (query, userId, isArchived = false, limit = 20, offset = 0) => {
    const searchTerms = query ? query.split(/[\s,]+/).filter(Boolean) : [];
    const searchPattern = query ? `%${query}%` : '';

    const { count, rows: notes } = await Note.findAndCountAll({
        where: {
            [Op.and]: [
                {
                    [Op.or]: [
                        { userId },
                        { '$sharedUsers.userId$': userId }
                    ]
                },
                { isArchived },
                query ? {
                    [Op.or]: [
                        { title: { [Op.iLike]: searchPattern } },
                        { content: { [Op.iLike]: searchPattern } },
                        { tags: { [Op.overlap]: searchTerms } }
                    ]
                } : {}
            ]
        },
        include: [
            { model: User, as: 'owner', attributes: ['id', 'username', 'email'] },
            {
                model: SharedNote,
                as: 'sharedUsers',
                include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
                required: false
            }
        ],
        order: [['updatedAt', 'DESC']],
        limit,
        offset,
        distinct: true,
        subQuery: false
    });

    return {
        totalItems: count,
        notes,
        totalPages: Math.ceil(count / limit),
        currentPage: Math.floor(offset / limit) + 1
    };
};
