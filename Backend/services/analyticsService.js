const { getDb } = require('../config/db');

exports.getMostActiveUsers = async () => {
    const db = getDb();
    const pipeline = [
        {
            $group: {
                _id: '$userId',
                noteCount: { $sum: 1 }
            }
        },
        { $sort: { noteCount: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'owner'
            }
        },
        { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } }
    ];

    const result = await db.collection('notes').aggregate(pipeline).toArray();

    return result.map(row => ({
        id: row._id.toString(),
        username: row.owner ? row.owner.username : 'Unknown User',
        email: row.owner ? row.owner.email : 'N/A',
        noteCount: row.noteCount
    }));
};

exports.getMostUsedTags = async () => {
    const db = getDb();
    const pipeline = [
        { $unwind: '$tags' },
        {
            $group: {
                _id: '$tags',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
            $project: {
                _id: 0,
                tag: '$_id',
                count: 1
            }
        }
    ];

    const result = await db.collection('notes').aggregate(pipeline).toArray();
    return result;
};

exports.getNotesPerDay = async () => {
    const db = getDb();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pipeline = [
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ];

    const result = await db.collection('notes').aggregate(pipeline).toArray();

    const countMap = {};
    result.forEach(row => {
        countMap[row._id] = row.count;
    });

    const finalResult = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dStr = d.toISOString().split('T')[0];
        finalResult.push({
            date: dStr,
            count: countMap[dStr] || 0
        });
    }

    return finalResult;
};

exports.getAnalyticsSummary = async () => {
    const db = getDb();
    const totalNotes = await db.collection('notes').countDocuments();
    const totalUsers = await db.collection('users').countDocuments({ deletedAt: null });

    const tagsPipeline = [
        { $unwind: '$tags' },
        { $group: { _id: '$tags' } },
        { $count: 'unique_tags' }
    ];
    const tagsResult = await db.collection('notes').aggregate(tagsPipeline).toArray();
    const uniqueTags = tagsResult[0] ? tagsResult[0].unique_tags : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notesToday = await db.collection('notes').countDocuments({
        createdAt: { $gte: today }
    });

    return {
        totalNotes,
        totalUsers,
        uniqueTags,
        notesToday
    };
};
