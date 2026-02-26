const { Sequelize, Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { Note, User } = require('../models');

exports.getMostActiveUsers = async () => {
    const result = await Note.findAll({
        attributes: [
            'userId',
            [sequelize.fn('COUNT', sequelize.col('Note.id')), 'noteCount']
        ],
        include: [{
            model: User,
            as: 'owner',
            attributes: ['username', 'email']
        }],
        group: ['userId', 'owner.id', 'owner.username', 'owner.email'],
        order: [[sequelize.literal('\"noteCount\"'), 'DESC']],
        limit: 10
    });

    return result.map(row => {
        const data = row.toJSON();
        return {
            id: data.userId,
            username: data.owner ? data.owner.username : 'Unknown User',
            email: data.owner ? data.owner.email : 'N/A',
            noteCount: parseInt(data.noteCount)
        };
    });
};

exports.getMostUsedTags = async () => {
    const result = await sequelize.query(`
    SELECT tag, COUNT(*) as count
    FROM (SELECT unnest(tags) as tag FROM notes) as sub
    GROUP BY tag
    ORDER BY count DESC
    LIMIT 10
  `, { type: Sequelize.QueryTypes.SELECT });

    return result.map(row => ({
        tag: row.tag,
        count: parseInt(row.count)
    }));
};

exports.getNotesPerDay = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await sequelize.query(`
    SELECT DATE("createdAt") as date, COUNT(*) as count
    FROM notes
    WHERE "createdAt" >= :date
    GROUP BY DATE("createdAt")
    ORDER BY DATE("createdAt") ASC
  `, {
        replacements: { date: sevenDaysAgo },
        type: Sequelize.QueryTypes.SELECT
    });

    const countMap = {};
    result.forEach(row => {
        const dStr = typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0];
        countMap[dStr] = parseInt(row.count);
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
    const totalNotes = await Note.count();
    const totalUsers = await User.count();

    const tagsResult = await sequelize.query(`
    SELECT COUNT(DISTINCT tag) as unique_tags FROM (SELECT unnest(tags) as tag FROM notes) as sub
  `, { type: Sequelize.QueryTypes.SELECT });

    const uniqueTags = tagsResult[0] && tagsResult[0].unique_tags ? parseInt(tagsResult[0].unique_tags) : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notesToday = await Note.count({
        where: {
            createdAt: { [Op.gte]: today }
        }
    });

    return {
        totalNotes,
        totalUsers,
        uniqueTags,
        notesToday
    };
};
