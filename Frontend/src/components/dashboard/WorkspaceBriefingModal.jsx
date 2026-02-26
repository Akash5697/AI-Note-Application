import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Sparkles, Brain, ListChecks, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";

export function WorkspaceBriefingModal({ isOpen, onClose, briefing, isLoading, onRefresh }) {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl border rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                        {/* Header with Background Accent */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                        <header className="relative p-8 pb-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black font-outfit uppercase tracking-wider leading-tight">Workspace Briefing</h2>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Powered by Gemini AI</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onRefresh}
                                    disabled={isLoading}
                                    className="p-3 hover:bg-white/5 rounded-2xl text-muted-foreground hover:text-primary transition-all disabled:opacity-30"
                                    title="Refresh Analytics"
                                >
                                    <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-3 hover:bg-white/5 rounded-2xl text-muted-foreground hover:text-white transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold">Analyzing your workspace...</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Gleaning insights from your notes</p>
                                    </div>
                                </div>
                            ) : briefing ? (
                                <>
                                    {/* Executive Summary */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                                            <Sparkles className="w-4 h-4" />
                                            Executive Overview
                                        </div>
                                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 leading-relaxed font-medium">
                                            {briefing.summary}
                                        </div>
                                    </section>

                                    {/* Action Items */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-widest text-xs">
                                            <ListChecks className="w-4 h-4" />
                                            Identified Action Items
                                        </div>
                                        <div className="grid gap-3">
                                            {briefing.actionItems?.map((item, i) => (
                                                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                                                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                    </div>
                                                    <span className="font-bold text-sm">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                    {/* Themes & Insights */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-xs">
                                            <TrendingUp className="w-4 h-4" />
                                            Primary Themes & Insights
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {briefing.themes?.map((theme, i) => {
                                                const [name, detail] = theme.includes(':') ? theme.split(':') : [theme, ""];
                                                return (
                                                    <div key={i} className="p-5 rounded-3xl bg-secondary/50 border border-border/50">
                                                        <h4 className="font-black text-sm uppercase tracking-tight text-indigo-400">{name}</h4>
                                                        {detail && <p className="text-xs text-muted-foreground mt-2 font-medium leading-relaxed">{detail.trim()}</p>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">Failed to load briefing. Please try again.</p>
                                </div>
                            )}
                        </div>

                        <footer className="p-8 border-t shrink-0 flex justify-end" style={{ borderColor: 'var(--border)' }}>
                            <Button onClick={onClose} className="px-8 rounded-2xl font-bold">
                                I've Got It
                            </Button>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.getElementById('modal-root')
    );
}

// Helper for class names
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
