const noteService = require('../services/noteService');

exports.getNotes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const isArchived = req.query.archived === 'true';
    const offset = (page - 1) * limit;

    const result = await noteService.getNotes(req.user.id, isArchived, limit, offset);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await noteService.getNoteById(req.params.id, req.user.id);
    res.json(note);
  } catch (error) {
    if (error.message.includes('not found')) return res.status(404).json({ message: error.message });
    if (error.message.includes('authorized')) return res.status(401).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const note = await noteService.createNote(req.body, req.user.id);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.body, req.user.id);
    res.json(note);
  } catch (error) {
    if (error.message.includes('not found')) return res.status(404).json({ message: error.message });
    if (error.message.includes('authorized')) return res.status(401).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    await noteService.deleteNote(req.params.id, req.user.id);
    res.json({ message: 'Note removed' });
  } catch (error) {
    if (error.message.includes('not found')) return res.status(404).json({ message: error.message });
    if (error.message.includes('owner')) return res.status(401).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.shareNote = async (req, res) => {
  try {
    const { userId, permission } = req.body;
    if (!userId || !permission || !['read', 'write'].includes(permission)) {
      return res.status(400).json({ message: 'Valid userId and permission (read/write) are required' });
    }

    const note = await noteService.shareNote(req.params.id, userId, permission, req.user.id);
    res.json(note);
  } catch (error) {
    if (error.message.includes('not found')) return res.status(404).json({ message: error.message });
    if (error.message.includes('owner')) return res.status(401).json({ message: error.message });
    if (error.message.includes('already')) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.updateSharing = async (req, res) => {
  try {
    const { permission } = req.body;
    if (!permission || !['read', 'write'].includes(permission)) {
      return res.status(400).json({ message: 'Valid permission (read/write) is required' });
    }

    const note = await noteService.updateSharing(req.params.id, req.params.userId, permission, req.user.id);
    res.json(note);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('not shared')) return res.status(404).json({ message: error.message });
    if (error.message.includes('owner')) return res.status(401).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.removeSharing = async (req, res) => {
  try {
    const note = await noteService.removeSharing(req.params.id, req.params.userId, req.user.id);
    res.json(note);
  } catch (error) {
    if (error.message.includes('not found')) return res.status(404).json({ message: error.message });
    if (error.message.includes('owner')) return res.status(401).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const isArchived = req.query.archived === 'true';
    const offset = (page - 1) * limit;

    const result = await noteService.searchNotes(query, req.user.id, isArchived, limit, offset);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};