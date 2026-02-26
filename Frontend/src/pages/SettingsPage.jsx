import { useState, useEffect } from "react";
import { User, Shield, Palette, Save, Eye, EyeOff, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/ui/Button";
import api from "../api/axiosConfig";

// ─── Reusable Input Style (inline, theme-aware) ────────────────────
const inputStyle = {
    background: 'var(--secondary)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    color: 'var(--foreground)',
    width: '100%',
    outline: 'none',
    fontWeight: 500,
    fontSize: '0.875rem',
    transition: 'border-color 0.2s',
};

// ─── Status Banner ─────────────────────────────────────────────────
function StatusBanner({ status }) {
    if (!status.type) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold mb-4 ${status.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                : 'bg-red-500/15 text-red-500 border border-red-500/30'
                }`}
        >
            {status.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            {status.message}
        </motion.div>
    );
}

// ─── Section Wrapper ───────────────────────────────────────────────
function SettingSection({ icon: Icon, title, description, children, iconBg = 'rgba(99,102,241,0.15)', iconColor = '#6366f1' }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-5 p-6 text-left group transition-colors"
                style={{ color: 'var(--foreground)' }}
            >
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: iconBg, color: iconColor }}
                >
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{title}</h3>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
                </div>
                <div style={{ color: 'var(--muted-foreground)' }}>
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div
                            className="px-6 pb-6 pt-4"
                            style={{ borderTop: '1px solid var(--border)' }}
                        >
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Label Component ───────────────────────────────────────────────
function Label({ children }) {
    return (
        <label
            className="block text-[11px] font-black uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--muted-foreground)' }}
        >
            {children}
        </label>
    );
}

// ─── Profile Section ───────────────────────────────────────────────
function ProfileSection({ user, onUpdate }) {
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [status, setStatus] = useState({ type: null, message: "" });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setUsername(user?.username || "");
        setEmail(user?.email || "");
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: null, message: "" });
        try {
            const response = await api.put('/users/profile', { username, email });
            onUpdate(response.data);
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus({ type: null, message: "" }), 4000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence><StatusBanner status={status} /></AnimatePresence>

            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-lg">
                    {username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{username || "—"}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.role}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Username</Label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={inputStyle}
                        placeholder="Your username"
                    />
                </div>
                <div>
                    <Label>Email</Label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={inputStyle}
                        placeholder="Your email"
                    />
                </div>
            </div>

            <Button type="submit" className="gap-2 rounded-xl px-6 py-3 text-sm font-bold">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
            </Button>
        </form>
    );
}

// ─── Security Section ──────────────────────────────────────────────
function SecuritySection() {
    const [current, setCurrent] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [status, setStatus] = useState({ type: null, message: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPass !== confirm) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }
        if (newPass.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }
        setIsLoading(true);
        setStatus({ type: null, message: "" });
        try {
            await api.put('/users/change-password', { currentPassword: current, newPassword: newPass });
            setStatus({ type: 'success', message: 'Password changed successfully!' });
            setCurrent(""); setNewPass(""); setConfirm("");
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus({ type: null, message: "" }), 4000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence><StatusBanner status={status} /></AnimatePresence>

            <div>
                <Label>Current Password</Label>
                <input
                    type={showPass ? "text" : "password"}
                    value={current}
                    onChange={e => setCurrent(e.target.value)}
                    style={inputStyle}
                    placeholder="Enter current password"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>New Password</Label>
                    <div className="relative">
                        <input
                            type={showPass ? "text" : "password"}
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            style={{ ...inputStyle, paddingRight: '3rem' }}
                            placeholder="New password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div>
                    <Label>Confirm Password</Label>
                    <input
                        type={showPass ? "text" : "password"}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        style={inputStyle}
                        placeholder="Confirm new password"
                        required
                    />
                </div>
            </div>

            {newPass && (
                <div className="flex gap-2 flex-wrap">
                    {[["6+ chars", newPass.length >= 6], ["Uppercase", /[A-Z]/.test(newPass)], ["Number", /\d/.test(newPass)]].map(([label, ok]) => (
                        <span
                            key={label}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${ok ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'border-border'}`}
                            style={ok ? {} : { color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}

            <Button type="submit" className="gap-2 rounded-xl px-6 py-3 text-sm font-bold">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Update Password
            </Button>
        </form>
    );
}


// ─── Appearance Section ────────────────────────────────────────────
function AppearanceSection() {
    const { theme: activeTheme, changeTheme, themes } = useTheme();
    const [applied, setApplied] = useState(false);

    const handleChange = (themeId) => {
        changeTheme(themeId);
        setApplied(true);
        setTimeout(() => setApplied(false), 2500);
    };

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {applied && <StatusBanner status={{ type: 'success', message: 'Theme applied successfully!' }} />}
            </AnimatePresence>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(themes).map(([id, t]) => (
                    <button
                        key={id}
                        onClick={() => handleChange(id)}
                        className="p-3 rounded-xl text-left transition-all"
                        style={{
                            border: activeTheme === id ? '2px solid var(--primary)' : '2px solid var(--border)',
                            background: activeTheme === id ? 'var(--primary)' : 'var(--secondary)',
                            opacity: 1,
                        }}
                    >
                        {/* Mini preview swatch */}
                        <div
                            className={`w-full h-10 rounded-lg mb-2 ${t.preview} flex items-end p-1.5 gap-1`}
                            style={{ border: '1px solid rgba(0,0,0,0.1)' }}
                        >
                            <span className={`h-2 w-5 rounded ${t.previewAccent} opacity-90`} />
                            <span className="h-1.5 w-3 rounded bg-black/20" />
                        </div>
                        <p
                            className="text-xs font-bold"
                            style={{ color: activeTheme === id ? 'white' : 'var(--foreground)' }}
                        >
                            {t.label}
                        </p>
                        <p
                            className="text-[10px]"
                            style={{ color: activeTheme === id ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)' }}
                        >
                            {activeTheme === id ? '✓ Active' : t.desc}
                        </p>
                    </button>
                ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Theme changes are applied instantly and saved for your next visit.
            </p>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────
export function SettingsPage() {
    const { user, fetchMe } = useAuthStore();

    const handleProfileUpdate = () => {
        fetchMe();
    };

    return (
        <div
            className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in font-inter"
            style={{ color: 'var(--foreground)' }}
        >
            <header className="pt-16 lg:pt-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit tracking-tight">Settings</h1>
                <p className="mt-2 text-sm sm:text-base font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Configure your workspace preferences.
                </p>
            </header>

            <div className="space-y-3">
                <SettingSection
                    icon={User}
                    title="Profile Information"
                    description="Update your name and email address"
                    iconBg="rgba(99,102,241,0.15)"
                    iconColor="#6366f1"
                >
                    <ProfileSection user={user} onUpdate={handleProfileUpdate} />
                </SettingSection>

                <SettingSection
                    icon={Shield}
                    title="Security & Privacy"
                    description="Change your password"
                    iconBg="rgba(245,158,11,0.15)"
                    iconColor="#f59e0b"
                >
                    <SecuritySection />
                </SettingSection>

                <SettingSection
                    icon={Palette}
                    title="Appearance"
                    description="Toggle between workspace themes"
                    iconBg="rgba(236,72,153,0.15)"
                    iconColor="#ec4899"
                >
                    <AppearanceSection />
                </SettingSection>
            </div>
        </div>
    );
}
