const express = require('express');
const router = express.Router();
const NoteController = require('../controllers/noteController');
const auth = require('../middlewares/auth');

// Note routes
router.get(
  '/',
  auth,
  NoteController.getNotes
);

router.post(
  '/',
  auth,
  NoteController.createNote
);

// Search notes
router.get(
  '/search',
  auth,
  NoteController.searchNotes
);

// Note by ID
router.get(
  '/:id',
  auth,
  NoteController.getNoteById
);

router.put(
  '/:id',
  auth,
  NoteController.updateNote
);

router.delete(
  '/:id',
  auth,
  NoteController.deleteNote
);

// Sharing routes
router.post(
  '/:id/share',
  auth,
  NoteController.shareNote
);

router.put(
  '/:id/share/:userId',
  auth,
  NoteController.updateSharing
);

router.delete(
  '/:id/share/:userId',
  auth,
  NoteController.removeSharing
);

module.exports = router;