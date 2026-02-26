import { createContext, useContext, useState, useEffect } from "react";

export const themes = {
    dark: {
        label: "Dark",
        desc: "Classic dark workspace",
        preview: "bg-[#050505]",
        previewAccent: "bg-indigo-500",
        vars: {
            "--background": "#050505",
            "--foreground": "#ffffff",
            "--primary": "#6366f1",
            "--secondary": "#1e1e20",
            "--accent": "#f43f5e",
            "--muted": "#27272a",
            "--muted-foreground": "#a1a1aa",
            "--card": "#161618",
            "--border": "#27272a",
            "color-scheme": "dark",
        },
        glass: "rgba(255,255,255,0.03)",
        glassCard: "rgba(22,22,24,0.7)",
    },
    midnight: {
        label: "Midnight Blue",
        desc: "Deep navy workspace",
        preview: "bg-[#0a0f1e]",
        previewAccent: "bg-blue-500",
        vars: {
            "--background": "#070b18",
            "--foreground": "#e2e8f0",
            "--primary": "#3b82f6",
            "--secondary": "#0f1629",
            "--accent": "#8b5cf6",
            "--muted": "#1e293b",
            "--muted-foreground": "#94a3b8",
            "--card": "#0d1424",
            "--border": "#1e293b",
            "color-scheme": "dark",
        },
        glass: "rgba(255,255,255,0.03)",
        glassCard: "rgba(13,20,36,0.8)",
    },
    forest: {
        label: "Forest",
        desc: "Calm green tones",
        preview: "bg-[#0a1a0f]",
        previewAccent: "bg-emerald-500",
        vars: {
            "--background": "#071209",
            "--foreground": "#dcfce7",
            "--primary": "#22c55e",
            "--secondary": "#14241a",
            "--accent": "#f59e0b",
            "--muted": "#1a2e1f",
            "--muted-foreground": "#86efac",
            "--card": "#0d1f11",
            "--border": "#1a2e1f",
            "color-scheme": "dark",
        },
        glass: "rgba(255,255,255,0.02)",
        glassCard: "rgba(13,31,17,0.8)",
    },
    light: {
        label: "Light",
        desc: "Clean bright workspace",
        preview: "bg-[#f8fafc]",
        previewAccent: "bg-indigo-500",
        vars: {
            "--background": "#f8fafc",
            "--foreground": "#0f172a",
            "--primary": "#6366f1",
            "--secondary": "#f1f5f9",
            "--accent": "#f43f5e",
            "--muted": "#e2e8f0",
            "--muted-foreground": "#64748b",
            "--card": "#ffffff",
            "--border": "#e2e8f0",
            "color-scheme": "light",
        },
        glass: "rgba(0,0,0,0.03)",
        glassCard: "rgba(255,255,255,0.9)",
    },
};

const ThemeContext = createContext(null);

function applyTheme(themeId) {
    const theme = themes[themeId] || themes.dark;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
        if (key === "color-scheme") {
            root.style.colorScheme = value;
        } else {
            root.style.setProperty(key, value);
        }
    });
    // Switch body background directly too for instant feedback
    document.body.style.backgroundColor = theme.vars["--background"];
    document.body.style.color = theme.vars["--foreground"];
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const changeTheme = (themeId) => {
        localStorage.setItem("theme", themeId);
        setTheme(themeId);
        applyTheme(themeId);
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
