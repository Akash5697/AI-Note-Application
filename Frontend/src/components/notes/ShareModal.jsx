import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, UserPlus, Shield, UserMinus, Loader2, Share2, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import api from "../../api/axiosConfig";
import { useAuthStore } from "../../store/authStore";
import { useNoteStore } from "../../store/noteStore";

export function ShareModal({ isOpen, onClose, noteId, onShare, onRemoveSharing }) {
    const { user: currentUser } = useAuthStore();
    const { notes } = useNoteStore();
    const note = notes.find(n => n.id === noteId);

    const [searchQuery, setSearchQuery] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, setPermission] = useState("read");

    const [status, setStatus] = useState({ type: null, message: "" });

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setSearchQuery(""); // Reset search when opening
            setStatus({ type: null, message: "" });
        }
    }, [isOpen]);

    const handleShare = async (userId, perm) => {
        setStatus({ type: 'loading', message: 'Sharing...' });
        try {
            await onShare(noteId, userId, perm);
            setStatus({ type: 'success', message: 'Note shared successfully!' });
            // Close after 1.5s so they can see the message
            setTimeout(() => {
                setStatus({ type: null, message: "" });
                onClose();
            }, 1000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to share note";
            setStatus({ type: 'error', message: errorMsg });
            setTimeout(() => setStatus({ type: null, message: "" }), 3000);
        }
    };

    const handleRemove = async (userId) => {
        try {
            await onRemoveSharing(noteId, userId);
            setStatus({ type: 'success', message: 'Access revoked' });
            setTimeout(() => setStatus({ type: null, message: "" }), 2000);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to revoke access' });
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/users/sharing');
            // Filter out the current user
            setAllUsers(response.data.filter(u => u.id !== currentUser?.id));
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = allUsers.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isAlreadyShared = (userId) => {
        return note?.sharedUsers?.some(s => s.userId === userId);
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Status Message Overlay */}
                        <AnimatePresence>
                            {status.message && (
                                <motion.div
                                    initial={{ y: -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    className={`absolute top-0 left-0 right-0 z-50 p-4 text-center text-xs font-bold uppercase tracking-widest ${status.type === 'success' ? 'bg-primary text-white' :
                                        status.type === 'error' ? 'bg-accent text-white' :
                                            'bg-white/10 text-white'
                                        }`}
                                >
                                    {status.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-8 space-y-6">
                            <header className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                        <Share2 className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black font-outfit uppercase tracking-wider">Share Note</h2>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted-foreground transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </header>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/50 transition-colors text-sm font-medium"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPermission("read")}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${permission === "read"
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                            }`}
                                    >
                                        <Shield className="w-3.5 h-3.5" />
                                        Read Only
                                    </button>
                                    <button
                                        onClick={() => setPermission("write")}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${permission === "write"
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                            }`}
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Can Edit
                                    </button>
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Finding collaborators...</p>
                                        </div>
                                    ) : filteredUsers.length > 0 ? (
                                        filteredUsers.map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => !isAlreadyShared(user.id) && handleShare(user.id, permission)}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${isAlreadyShared(user.id)
                                                    ? "bg-primary/5 border-primary/20 opacity-70 cursor-default"
                                                    : "bg-white/5 border-white/5 hover:border-primary/40 hover:bg-white/10"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-xs font-black text-white">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{user.username}</span>
                                                        <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </div>
                                                {isAlreadyShared(user.id) ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black uppercase text-primary tracking-widest bg-primary/20 px-2 py-0.5 rounded-full">Shared</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemove(user.id);
                                                            }}
                                                            className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                                            title="Remove access"
                                                        >
                                                            <UserMinus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="p-2 text-primary group-hover:bg-primary/10 rounded-lg transition-colors">
                                                        {status.type === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-muted-foreground">No users found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {note?.sharedUsers?.length > 0 && (
                                <div className="pt-4 border-t border-white/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
                                        Shared with ({note.sharedUsers.length})
                                    </h3>
                                    <div className="flex -space-x-2 mt-2">
                                        {note.sharedUsers.map(share => (
                                            <div
                                                key={share.id}
                                                className="w-8 h-8 rounded-full border-2 border-[#0f172a] bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-black text-white overflow-hidden shadow-lg"
                                                title={`${share.user?.username} (${share.permission})`}
                                            >
                                                {share.user?.username?.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.getElementById('modal-root')
    );
}

// Helper for custom scrollbar (if needed) or other utilities can be added here
