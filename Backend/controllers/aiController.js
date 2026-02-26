const geminiService = require('../services/geminiService');

exports.generateNoteContent = async (req, res) => {
    try {
        const { prompt, options } = req.body;

        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({
                message: 'Prompt is required',
                success: false
            });
        }

        if (prompt.length > 5000) {
            return res.status(400).json({
                message: 'Prompt is too long. Please keep it under 5000 characters.',
                success: false
            });
        }

        console.log(`🤖 Generating content with Gemini for user: ${req.user.email}`);
        const result = await geminiService.generateNoteContent(prompt, options);

        console.log(`✅ Content generated successfully. Word count: ${result.wordCount}`);
        res.json(result);
    } catch (error) {
        console.error('Generate content error:', error.message);
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

exports.enhanceNoteContent = async (req, res) => {
    try {
        const { title, content, enhancementType } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Title and content are required',
                success: false
            });
        }

        if (content.length > 10000) {
            return res.status(400).json({
                message: 'Content is too long. Please keep it under 10000 characters.',
                success: false
            });
        }

        const validEnhancements = ['improve', 'summarize', 'expand', 'restructure', 'simplify'];
        if (enhancementType && !validEnhancements.includes(enhancementType)) {
            return res.status(400).json({
                message: `Invalid enhancement type. Valid options: ${validEnhancements.join(', ')}`,
                success: false
            });
        }

        console.log(`🔧 Enhancing content with Gemini (${enhancementType}) for user: ${req.user.email}`);
        const result = await geminiService.enhanceNoteContent(title, content, enhancementType);

        console.log(`✅ Content enhanced successfully. ${result.originalWordCount} → ${result.enhancedWordCount} words`);
        res.json(result);
    } catch (error) {
        console.error('Enhance content error:', error.message);
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

exports.generateTags = async (req, res) => {
    try {
        const { title, content, maxTags } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Title and content are required',
                success: false
            });
        }

        const tagLimit = Math.min(maxTags || 5, 10);

        console.log(`🏷️ Generating tags with Gemini for user: ${req.user.email}`);
        const result = await geminiService.generateTags(title, content, tagLimit);

        console.log(`✅ Generated ${result.tags.length} tags successfully`);
        res.json(result);
    } catch (error) {
        console.error('Generate tags error:', error.message);
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

exports.generateTemplate = async (req, res) => {
    try {
        const { templateType, customPrompt } = req.body;

        const validTemplates = ['meeting', 'project', 'research', 'daily', 'study', 'creative', 'custom'];
        if (!templateType || !validTemplates.includes(templateType)) {
            return res.status(400).json({
                message: `Invalid template type. Valid options: ${validTemplates.join(', ')}`,
                success: false
            });
        }

        if (templateType === 'custom' && (!customPrompt || customPrompt.trim() === '')) {
            return res.status(400).json({
                message: 'Custom prompt is required for custom template type',
                success: false
            });
        }

        console.log(`📝 Generating ${templateType} template with Gemini for user: ${req.user.email}`);
        const result = await geminiService.generateTemplate(templateType, customPrompt);

        console.log(`✅ Template generated successfully`);
        res.json(result);
    } catch (error) {
        console.error('Generate template error:', error.message);
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

exports.getWritingSuggestions = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Title and content are required',
                success: false
            });
        }

        console.log(`💡 Getting writing suggestions with Gemini for user: ${req.user.email}`);
        const result = await geminiService.getWritingSuggestions(title, content);

        console.log(`✅ Writing suggestions generated successfully`);
        res.json(result);
    } catch (error) {
        console.error('Get suggestions error:', error.message);
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

exports.getWorkspaceBriefing = async (req, res) => {
    try {
        const { notes } = req.body;

        console.log(`📊 Generating workspace briefing with Gemini for user: ${req.user.email}`);
        const result = await geminiService.generateWorkspaceBriefing(notes);

        console.log(`✅ Workspace briefing generated successfully`);
        res.json(result);
    } catch (error) {
        console.error('Workspace briefing error:', error.message);
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};

exports.getAiStatus = (req, res) => {
    try {
        const serviceInfo = geminiService.getServiceInfo();

        res.json({
            ...serviceInfo,
            timestamp: new Date().toISOString(),
            user: req.user.email
        });
    } catch (error) {
        console.error('Status check error:', error.message);
        res.status(500).json({
            available: false,
            message: 'Unable to check service status',
            error: error.message
        });
    }
};

exports.getAiStats = async (req, res) => {
    try {
        if (req.user.role?.name !== 'admin') {
            return res.status(403).json({
                message: 'Access denied. Admin privileges required.',
                success: false
            });
        }

        const serviceInfo = geminiService.getServiceInfo();

        res.json({
            ...serviceInfo,
            usage: {
                note: 'Usage tracking not implemented yet',
                suggestion: 'Implement usage tracking in database for production use'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stats error:', error.message);
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};
