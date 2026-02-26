import { useState, useEffect } from "react";
import { Plus, FileText } from "lucide-react";
import { useNoteStore } from "../store/noteStore";
import { NoteCard } from "../components/notes/NoteCard";
import { NoteModal } from "../components/notes/NoteModal";
import { Button } from "../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { ShareModal } from "../components/notes/ShareModal";

export function NotesPage({ defaultShowArchived = false }) {
    const {
        notes, isLoading, fetchNotes, createNote, updateNote,
        deleteNote, shareNote, removeSharing, archiveNote, unarchiveNote
    } = useNoteStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [showArchived, setShowArchived] = useState(defaultShowArchived);

    useEffect(() => {
        fetchNotes(1, showArchived);
    }, [fetchNotes, showArchived]);

    const toggleArchiveView = () => {
        setShowArchived(!showArchived);
    };

    const handleCreateNote = async (data) => {
        if (selectedNote) {
            await updateNote(selectedNote.id, data);
        } else {
            await createNote(data);
        }
    };

    const openCreateModal = () => {
        setSelectedNote(null);
        setIsModalOpen(true);
    };

    const openEditModal = (note) => {
        setSelectedNote(note);
        setIsModalOpen(true);
    };

    const openShareModal = (note) => {
        setSelectedNote(note);
        setIsShareModalOpen(true);
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-inter" style={{ color: 'var(--foreground)' }}>
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-20 lg:pt-4">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit tracking-tight">{showArchived ? "Archived Notes" : "My Notes"}</h1>
                    <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-lg leading-relaxed">
                        {showArchived ? "View and restore your archived thoughts." : "Manage and organize your personal thought repository."}
                    </p>
                </div>
                {!defaultShowArchived && (
                    <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                        <Button
                            onClick={toggleArchiveView}
                            variant="secondary"
                            className="flex-1 sm:flex-none gap-3 py-6 px-8 rounded-2xl font-bold text-lg"
                        >
                            {showArchived ? "Active" : "Archive"}
                        </Button>
                        <Button onClick={openCreateModal} className="flex-1 sm:flex-none gap-3 py-6 px-8 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/20">
                            <Plus className="w-6 h-6" />
                            New
                        </Button>
                    </div>
                )}
            </header>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-72 rounded-[2rem] bg-white/[0.03] animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-3 gap-8">
                    {notes.map((note) => (
                        <div key={note.id} className="break-inside-avoid mb-8">
                            <NoteCard
                                note={note}
                                onEdit={() => openEditModal(note)}
                                onDelete={() => deleteNote(note.id)}
                                onShare={() => openShareModal(note)}
                                onArchive={archiveNote}
                                onUnarchive={unarchiveNote}
                            />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && notes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-card/20 rounded-[3rem] border border-dashed" style={{ borderColor: 'var(--border)' }}>
                    <FileText className="w-20 h-20 text-muted-foreground/10 mb-6" />
                    <p className="text-muted-foreground text-xl font-medium">No notes available yet.</p>
                    <Button onClick={openCreateModal} variant="outline" className="mt-8 py-4 px-8 rounded-xl" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                        Start Writing
                    </Button>
                </div>
            )}

            <NoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateNote}
                onDelete={deleteNote}
                onShare={openShareModal}
                note={selectedNote}
            />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                noteId={selectedNote?.id}
                onShare={shareNote}
                onRemoveSharing={removeSharing}
            />
        </div>
    );
}
