const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const noteRoutes = require('./noteRoutes');
const roleRoutes = require('./roleRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const aiRoutes = require('./aiRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notes', noteRoutes);
router.use('/roles', roleRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
