import { motion } from "framer-motion";
import { StickyNote, Sparkles, X } from "lucide-react";

export function AuthLayout({ children, title, subtitle, footerText, footerAction, onFooterAction }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#11bc9c] p-4 md:p-8 font-inter">
            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl h-auto md:h-[650px] bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col md:flex-row relative"
            >
                <button className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black z-20">
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Geometric Brand Panel */}
                <div className="w-full md:w-1/2 relative bg-[#1c2444] overflow-hidden p-12 flex flex-col justify-between text-white">
                    {/* Geometric Background Shapes */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 right-0 w-[80%] h-full bg-[#2a3666] -skew-x-[20deg] transform translate-x-[20%]" />
                        <div className="absolute top-0 right-0 w-[40%] h-full bg-[#3b4b8a] -skew-x-[20deg] transform translate-x-[40%] opacity-50" />
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-transparent" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center space-y-8">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="w-24 h-24 bg-gradient-to-br from-white to-gray-200 rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative"
                        >
                            <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full animate-pulse" />
                            <div className="relative flex">
                                <StickyNote className="w-12 h-12 text-[#1c2444] fill-[#1c2444]/10" />
                                <Sparkles className="w-6 h-6 text-indigo-600 absolute -top-1 -right-1 animate-bounce" />
                            </div>
                        </motion.div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-black uppercase tracking-[0.3em] font-outfit">Note App</h2>
                            <p className="text-gray-300 max-w-xs mx-auto leading-relaxed font-medium">
                                Master your thoughts with AI-powered insights, seamless collaboration, and organized workspaces.
                            </p>
                        </div>

                        <button className="px-10 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 mx-auto">
                            Explore Features
                        </button>
                    </div>

                    <div className="relative z-10 text-center text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
                        © 2026 NoteApp by Surya
                    </div>
                </div>

                {/* Right Side: Form Panel */}
                <div className="w-full md:w-1/2 bg-white p-8 md:p-20 flex flex-col justify-center">
                    <div className="w-full max-w-md mx-auto space-y-10">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-extrabold text-[#1c2444] tracking-tight">{title}</h1>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                                {subtitle || "Please login to your account to access the dashboard and tools."}
                            </p>
                        </div>

                        <div className="relative">
                            {children}
                        </div>

                        <div className="text-center pt-8">
                            <p className="text-sm text-gray-500 font-medium">
                                {footerText}{" "}
                                <button
                                    onClick={onFooterAction}
                                    className="text-indigo-600 font-bold hover:underline decoration-2 underline-offset-4"
                                >
                                    {footerAction}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
