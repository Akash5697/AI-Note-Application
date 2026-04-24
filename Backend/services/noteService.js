const { getDb, ObjectId } = require('../config/db');

exports.getNotes = async (userId, isArchived = false, limit = 20, offset = 0) => {
    const db = getDb();
    const uId = new ObjectId(userId);
    
    const pipeline = [
        {
            $lookup: {
                from: 'shared_notes',
                localField: '_id',
                foreignField: 'noteId',
                as: 'sharedUsers'
            }
        },
        {
            $match: {
                $and: [
                    {
                        $or: [
                            { userId: uId },
                            { 'sharedUsers.userId': uId }
                        ]
                    },
                    { isArchived: isArchived === 'true' || isArchived === true }
                ]
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'owner'
            }
        },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
        { $sort: { updatedAt: -1 } },
        { $skip: parseInt(offset) },
        { $limit: parseInt(limit) }
    ];

    const notes = await db.collection('notes').aggregate(pipeline).toArray();
    
    // Total count for pagination (needs a separate count aggregation or query)
    const countPipeline = [
        {
            $lookup: {
                from: 'shared_notes',
                localField: '_id',
                foreignField: 'noteId',
                as: 'sharedUsers'
            }
        },
        {
            $match: {
                $and: [
                    {
                        $or: [
                            { userId: uId },
                            { 'sharedUsers.userId': uId }
                        ]
                    },
                    { isArchived: isArchived === 'true' || isArchived === true }
                ]
            }
        },
        { $count: 'total' }
    ];
    const countResult = await db.collection('notes').aggregate(countPipeline).toArray();
    const count = countResult[0] ? countResult[0].total : 0;

    return {
        totalItems: count,
        notes: notes.map(n => ({
            ...n,
            id: n._id.toString(),
            userId: n.userId.toString(),
            owner: n.owner ? { id: n.owner._id.toString(), username: n.owner.username, email: n.owner.email } : null
        })),
        totalPages: Math.ceil(count / limit),
        currentPage: Math.floor(offset / limit) + 1
    };
};

exports.getNoteById = async (id, userId) => {
    const db = getDb();
    const nId = new ObjectId(id);
    const uId = new ObjectId(userId);

    const pipeline = [
        { $match: { _id: nId } },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'owner'
            }
        },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shared_notes',
                localField: '_id',
                foreignField: 'noteId',
                as: 'sharedUsers'
            }
        }
    ];

    const results = await db.collection('notes').aggregate(pipeline).toArray();
    const note = results[0];

    if (!note) throw new Error('Note not found');

    const isOwner = note.userId.toString() === uId.toString();
    const sharedAccess = note.sharedUsers && note.sharedUsers.find(s => s.userId.toString() === uId.toString());

    if (!isOwner && !sharedAccess) {
        throw new Error('Not authorized to access this note');
    }

    return {
        ...note,
        id: note._id.toString(),
        userId: note.userId.toString(),
        owner: note.owner ? { id: note.owner._id.toString(), username: note.owner.username, email: note.owner.email } : null,
        sharedUsers: note.sharedUsers.map(s => ({ ...s, userId: s.userId.toString() }))
    };
};

exports.createNote = async (data, userId) => {
    const db = getDb();
    const { title, content, tags } = data;
    const newNote = {
        title,
        content,
        tags: tags || [],
        userId: new ObjectId(userId),
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const result = await db.collection('notes').insertOne(newNote);
    return { ...newNote, id: result.insertedId.toString(), userId: userId.toString() };
};

exports.updateNote = async (id, data, userId) => {
    const db = getDb();
    const nId = new ObjectId(id);
    const uId = new ObjectId(userId);

    const note = await db.collection('notes').findOne({ _id: nId });
    if (!note) throw new Error('Note not found');

    const sharedAccess = await db.collection('shared_notes').findOne({ 
        noteId: nId, 
        userId: uId, 
        permission: 'write' 
    });

    if (note.userId.toString() !== uId.toString() && !sharedAccess) {
        throw new Error('Not authorized to edit this note');
    }

    const updateData = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isArchived !== undefined) updateData.isArchived = data.isArchived === 'true' || data.isArchived === true;

    await db.collection('notes').updateOne({ _id: nId }, { $set: updateData });

    return this.getNoteById(id, userId);
};

exports.deleteNote = async (id, userId) => {
    const db = getDb();
    const nId = new ObjectId(id);
    const uId = new ObjectId(userId);

    const note = await db.collection('notes').findOne({ _id: nId });
    if (!note) throw new Error('Note not found');

    if (note.userId.toString() !== uId.toString()) {
        throw new Error('Only the owner can delete this note');
    }

    await db.collection('notes').deleteOne({ _id: nId });
    await db.collection('shared_notes').deleteMany({ noteId: nId });
    
    return true;
};

exports.shareNote = async (id, userIdToShare, permission, ownerId) => {
    const db = getDb();
    const nId = new ObjectId(id);
    const uIdToShare = new ObjectId(userIdToShare);
    const oId = new ObjectId(ownerId);

    const note = await db.collection('notes').findOne({ _id: nId });
    if (!note) throw new Error('Note not found');

    if (note.userId.toString() !== oId.toString()) {
        throw new Error('Only the owner can share this note');
    }

    const existingShare = await db.collection('shared_notes').findOne({ noteId: nId, userId: uIdToShare });
    if (existingShare) {
        throw new Error('Note is already shared with this user');
    }

    await db.collection('shared_notes').insertOne({
        noteId: nId,
        userId: uIdToShare,
        permission,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    return this.getNoteById(id, ownerId);
};

exports.updateSharing = async (id, userIdToUpdate, permission, ownerId) => {
    const db = getDb();
    const nId = new ObjectId(id);
    const uIdToUpdate = new ObjectId(userIdToUpdate);
    const oId = new ObjectId(ownerId);

    const note = await db.collection('notes').findOne({ _id: nId });
    if (!note) throw new Error('Note not found');

    if (note.userId.toString() !== oId.toString()) {
        throw new Error('Only the owner can update sharing for this note');
    }

    const result = await db.collection('shared_notes').updateOne(
        { noteId: nId, userId: uIdToUpdate },
        { $set: { permission, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) throw new Error('User is not shared with this note');

    return this.getNoteById(id, ownerId);
};

exports.removeSharing = async (id, userIdToRemove, ownerId) => {
    const db = getDb();
    const nId = new ObjectId(id);
    const uIdToRemove = new ObjectId(userIdToRemove);
    const oId = new ObjectId(ownerId);

    const note = await db.collection('notes').findOne({ _id: nId });
    if (!note) throw new Error('Note not found');

    if (note.userId.toString() !== oId.toString()) {
        throw new Error('Only the owner can remove sharing for this note');
    }

    await db.collection('shared_notes').deleteOne({ noteId: nId, userId: uIdToRemove });

    return this.getNoteById(id, ownerId);
};

exports.searchNotes = async (query, userId, isArchived = false, limit = 20, offset = 0) => {
    const db = getDb();
    const uId = new ObjectId(userId);
    
    const matchStage = {
        $and: [
            {
                $or: [
                    { userId: uId },
                    { 'sharedUsers.userId': uId }
                ]
            },
            { isArchived: isArchived === 'true' || isArchived === true }
        ]
    };

    if (query) {
        const searchTerms = query.split(/[\s,]+/).filter(Boolean);
        matchStage.$and.push({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { tags: { $in: searchTerms } }
            ]
        });
    }

    const pipeline = [
        {
            $lookup: {
                from: 'shared_notes',
                localField: '_id',
                foreignField: 'noteId',
                as: 'sharedUsers'
            }
        },
        { $match: matchStage },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'owner'
            }
        },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
        { $sort: { updatedAt: -1 } },
        { $skip: parseInt(offset) },
        { $limit: parseInt(limit) }
    ];

    const notes = await db.collection('notes').aggregate(pipeline).toArray();
    
    // Count for pagination
    const countPipeline = [
        {
            $lookup: {
                from: 'shared_notes',
                localField: '_id',
                foreignField: 'noteId',
                as: 'sharedUsers'
            }
        },
        { $match: matchStage },
        { $count: 'total' }
    ];
    const countResult = await db.collection('notes').aggregate(countPipeline).toArray();
    const count = countResult[0] ? countResult[0].total : 0;

    return {
        totalItems: count,
        notes: notes.map(n => ({
            ...n,
            id: n._id.toString(),
            userId: n.userId.toString(),
            owner: n.owner ? { id: n.owner._id.toString(), username: n.owner.username, email: n.owner.email } : null
        })),
        totalPages: Math.ceil(count / limit),
        currentPage: Math.floor(offset / limit) + 1
    };
};
