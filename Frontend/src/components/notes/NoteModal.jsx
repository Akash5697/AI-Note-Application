import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Sparkles, Tag, Type, AlignLeft, StickyNote, Trash2, Loader2, Share2, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import api from "../../api/axiosConfig";

export function NoteModal({ isOpen, onClose, onSave, onDelete, onShare, note = null }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (note) {
            setTitle(note.title || "");
            setContent(note.content || "");
            setTags(note.tags?.join(", ") || "");
        } else {
            setTitle("");
            setContent("");
            setTags("");
        }
    }, [note, isOpen]);

    const handleAiAssist = async () => {
        if (!content.trim()) {
            alert("Please write some content first so the AI can help you improve it!");
            return;
        }

        setIsAiLoading(true);
        try {
            const response = await api.post('/ai/enhance', {
                title: title || "Untitled Note",
                content: content,
                enhancementType: 'improve'
            });

            if (response.data.success) {
                setTitle(response.data.title);
                setContent(response.data.content);
                if (response.data.suggestedTags) {
                    setTags(response.data.suggestedTags.join(", "));
                }
            }
        } catch (error) {
            console.error("AI Assist failed:", error);
            alert("AI Assist is currently unavailable. Please check your connection.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            title: title.trim() || "Untitled Note",
            content: content.trim(),
            tags: tags.split(",").map(t => t.trim()).filter(t => t !== "")
        });
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl border rounded-[2rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
                        style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                        <div className="p-8 space-y-8">
                            <header className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                        <StickyNote className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-black font-outfit uppercase tracking-wider">
                                        {note ? "Edit Note" : "Create New Note"}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {note && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => onShare(note)}
                                                className="p-2 hover:bg-primary/20 rounded-full text-primary transition-colors"
                                                title="Share Note"
                                            >
                                                <Share2 className="w-6 h-6" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await onSave({ isArchived: !note.isArchived });
                                                    onClose();
                                                }}
                                                className="p-2 hover:bg-amber-500/20 rounded-full text-amber-500 transition-colors"
                                                title={note.isArchived ? "Unarchive Note" : "Archive Note"}
                                            >
                                                <Archive className="w-6 h-6" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm("Are you sure you want to delete this note?")) {
                                                        onDelete(note.id);
                                                        onClose();
                                                    }
                                                }}
                                                className="p-2 hover:bg-accent/20 rounded-full text-accent transition-colors"
                                                title="Delete Note"
                                            >
                                                <Trash2 className="w-6 h-6" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/5 rounded-full text-muted-foreground transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </header>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground ml-1">Title</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Enter note title..."
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-primary/50 transition-colors font-bold text-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground ml-1">Content</label>
                                    <div className="relative">
                                        <AlignLeft className="absolute left-4 top-6 w-5 h-5 text-muted-foreground" />
                                        <textarea
                                            placeholder="Write your thoughts..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={6}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-primary/50 transition-colors font-medium resize-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground ml-1">Tags (comma separated)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="work, ideas, meeting..."
                                            value={tags}
                                            onChange={(e) => setTags(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-primary/50 transition-colors font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <Button
                                        type="submit"
                                        className="flex-1 py-6 rounded-2xl text-lg gap-3"
                                    >
                                        <Save className="w-5 h-5" />
                                        {note ? "Update Note" : "Save Note"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleAiAssist}
                                        isLoading={isAiLoading}
                                        className="py-6 px-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-primary font-bold gap-3 disabled:opacity-50"
                                    >
                                        {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                        {isAiLoading ? "Improving..." : "AI Assist"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.getElementById('modal-root')
    );
}
