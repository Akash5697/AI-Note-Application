import { create } from 'zustand';
import api from '../api/axiosConfig';

export const useNoteStore = create((set, get) => ({
    notes: [],
    currentNote: null,
    isLoading: false,
    totalPages: 1,
    currentPage: 1,

    fetchNotes: async (page = 1, isArchived = false) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/notes?page=${page}&archived=${isArchived}`);
            set({
                notes: response.data.notes,
                totalPages: response.data.totalPages,
                currentPage: response.data.currentPage,
                isLoading: false
            });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    archiveNote: async (id) => {
        try {
            const response = await api.put(`/notes/${id}`, { isArchived: true });
            set((state) => ({
                notes: state.notes.filter((n) => String(n.id) !== String(id)),
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    unarchiveNote: async (id) => {
        try {
            const response = await api.put(`/notes/${id}`, { isArchived: false });
            set((state) => ({
                notes: state.notes.filter((n) => String(n.id) !== String(id)),
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    searchNotes: async (query, isArchived = false) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/notes/search?query=${query}&archived=${isArchived}`);
            set({
                notes: response.data.notes,
                totalPages: response.data.totalPages,
                isLoading: false
            });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    createNote: async (noteData) => {
        try {
            const response = await api.post('/notes', noteData);
            set((state) => ({ notes: [response.data, ...state.notes] }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateNote: async (id, noteData) => {
        try {
            const response = await api.put(`/notes/${id}`, noteData);
            set((state) => {
                // If the archived status changed, we might need to remove it from the current view
                const isCurrentlyOnArchivedView = window.location.pathname === '/archive' ||
                    (window.location.pathname === '/notes' && document.body.innerText.includes('Archived Notes'));

                const showArchived = isCurrentlyOnArchivedView;
                const shouldBeVisible = response.data.isArchived === showArchived;

                if (!shouldBeVisible) {
                    return {
                        notes: state.notes.filter((n) => String(n.id) !== String(id)),
                        currentNote: response.data
                    };
                }

                return {
                    notes: state.notes.map((n) => (String(n.id) === String(id) ? response.data : n)),
                    currentNote: response.data
                };
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteNote: async (id) => {
        try {
            await api.delete(`/notes/${id}`);
            set((state) => ({
                notes: state.notes.filter((n) => n.id !== id)
            }));
        } catch (error) {
            throw error;
        }
    },

    shareNote: async (noteId, userId, permission) => {
        try {
            const response = await api.post(`/notes/${noteId}/share`, { userId, permission });
            // Update the note in the local state with new sharedUsers
            set((state) => ({
                notes: state.notes.map((n) => n.id === noteId ? response.data : n)
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    removeSharing: async (noteId, userId) => {
        try {
            const response = await api.delete(`/notes/${noteId}/share/${userId}`);
            set((state) => ({
                notes: state.notes.map((n) => n.id === noteId ? response.data : n)
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}));
