import { Share2, Trash2, Calendar, Tag, Edit3, Archive, ArchiveRestore } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export function NoteCard({ note, onEdit, onDelete, onShare, onArchive, onUnarchive }) {
    return (
        <motion.div
            layout
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => onEdit(note)}
            className="group relative p-6 rounded-[2rem] flex flex-col gap-6 cursor-pointer border hover:border-primary/30 transition-all duration-300 min-h-[210px]"
            style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}
        >
            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1 flex-1 min-w-0">
                    <h3
                        className="text-xl font-black font-outfit uppercase tracking-wider group-hover:text-primary transition-colors truncate"
                        style={{ color: 'var(--foreground)' }}
                    >
                        {note.title}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                        </div>
                        {note.sharedUsers?.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[9px] text-primary font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                <Share2 className="w-2.5 h-2.5" />
                                Shared
                            </div>
                        )}
                        {note.isArchived && (
                            <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Archive className="w-2.5 h-2.5" />
                                Archived
                            </div>
                        )}
                    </div>
                </div>

                {/* Hover Action Buttons */}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onShare(note); }}
                        className="p-2.5 hover:bg-primary/10 rounded-xl transition-colors border hover:text-primary"
                        style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
                        title="Share"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            note.isArchived ? onUnarchive(note.id) : onArchive(note.id);
                        }}
                        className="p-2.5 hover:bg-amber-500/10 rounded-xl transition-colors border hover:text-amber-500"
                        style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
                        title={note.isArchived ? "Unarchive" : "Archive"}
                    >
                        {note.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                        className="p-2.5 hover:bg-red-500/10 rounded-xl transition-colors border hover:text-red-400"
                        style={{ color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Preview */}
            <div
                className="text-sm line-clamp-4 leading-relaxed font-medium relative z-10"
                style={{ color: 'var(--muted-foreground)' }}
            >
                {note.content.replace(/<[^>]*>/g, '')}
            </div>

            {/* Tags */}
            <div className="mt-auto flex flex-wrap gap-2 relative z-10">
                {note.tags?.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.15em] rounded-lg border border-primary/20"
                    >
                        <Tag className="w-3 h-3" />
                        {tag}
                    </span>
                ))}
            </div>

            {/* Bottom Section */}
            <div
                className="pt-4 border-t flex items-center justify-between relative z-10"
                style={{ borderColor: 'var(--border)' }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-[10px] font-black text-white">
                        {note.owner?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        {note.owner?.username || "You"}
                    </span>
                </div>
                <div className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <Edit3 className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    );
}
