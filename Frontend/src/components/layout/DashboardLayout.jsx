import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    LogOut,
    LayoutDashboard,
    FileText,
    Settings,
    BarChart3,
    Plus,
    Search,
    StickyNote,
    Sparkles,
    Archive,
    Menu,
    X
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardLayout({ children }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initial state based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on navigation (mobile only)
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    const navItems = [
        { label: "Overview", icon: LayoutDashboard, path: "/dashboard" },
        { label: "My Notes", icon: FileText, path: "/notes" },
        { label: "Archive", icon: Archive, path: "/archive" },
        { label: "Analytics", icon: BarChart3, path: "/analytics", adminOnly: true },
        { label: "Settings", icon: Settings, path: "/settings" },
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen overflow-hidden font-inter" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>


            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && window.innerWidth < 1024 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:relative top-0 left-0 h-full w-72 border-r transition-all duration-300 flex flex-col z-40 lg:z-20",
                !isSidebarOpen && "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:p-0 overflow-hidden",
                isSidebarOpen && "translate-x-0"
            )} style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                {/* Logo Section - MATCHING LOGIN PAGE */}
                <div className="p-8 flex items-center gap-4">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 rounded-2xl flex items-center justify-center shadow-lg relative group"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex">
                            <StickyNote className="w-7 h-7 text-[#1c2444] fill-[#1c2444]/10" />
                            <Sparkles className="w-3.5 h-3.5 text-primary absolute -top-0.5 -right-0.5 animate-pulse" />
                        </div>
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black font-outfit leading-none tracking-[0.3em] uppercase">Note App</span>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold mt-2">Workspace</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        if (item.adminOnly && user?.role !== 'admin') return null;

                        const isActive = window.location.pathname === item.path;

                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "hover:bg-white/5 text-muted-foreground hover:text-white"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                                    isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                                )} />
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-4 px-4 py-4 rounded-2xl mb-6 border shadow-xl" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-inner">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-black text-sm truncate tracking-tight" style={{ color: 'var(--foreground)' }}>{user?.username}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] uppercase tracking-widest font-bold font-outfit" style={{ color: 'var(--muted-foreground)' }}>{user?.role}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-2xl hover:bg-accent/10 hover:text-accent transition-all group font-bold text-sm border border-transparent hover:border-accent/20"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Terminate Session</span>
                    </button>

                    <div className="mt-6 text-center text-[9px] uppercase tracking-[0.3em] font-black" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }}>
                        By Surya NoteApp
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative" style={{ background: 'var(--background)' }}>
                {/* Mobile Header Toggle - Moved inside main to scroll away */}
                <div className={cn(
                    "lg:hidden absolute top-6 z-50 transition-all duration-300",
                    isSidebarOpen ? "left-64" : "left-6"
                )}>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Global Ambient Glow */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
