import { useState, useEffect } from "react";
import {
    BarChart,
    Users,
    FileText,
    Tag as TagIcon,
    Calendar,
    TrendingUp,
    Activity
} from "lucide-react";
import api from "../api/axiosConfig";
import { cn } from "../utils/cn";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

export function AdminAnalyticsPage() {
    const [summary, setSummary] = useState(null);
    const [popularTags, setPopularTags] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [notesTrend, setNotesTrend] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [sumRes, tagsRes, usersRes, trendRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/popular-tags'),
                    api.get('/analytics/active-users'),
                    api.get('/analytics/notes-per-day')
                ]);

                setSummary(sumRes.data);
                setPopularTags(tagsRes.data);
                setActiveUsers(usersRes.data);
                setNotesTrend(trendRes.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading Analytics...</div>;

    const tagData = {
        labels: popularTags?.map(t => t.tag) || [],
        datasets: [{
            label: 'Notes',
            data: popularTags?.map(t => t.count) || [],
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: 8,
        }]
    };

    const trendData = {
        labels: notesTrend?.map(t => t.date) || [],
        datasets: [{
            label: 'Notes Created',
            data: notesTrend?.map(t => t.count) || [],
            borderColor: 'rgba(244, 63, 94, 1)',
            backgroundColor: 'rgba(244, 63, 94, 0.2)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
        }]
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <header className="pt-16 lg:pt-4">
                <h1 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight">System Analytics</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base font-medium">Real-time usage metrics and system performance.</p>
            </header>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Notes" value={summary?.totalNotes} icon={FileText} color="text-primary" />
                <StatCard title="Total Users" value={summary?.totalUsers} icon={Users} color="text-emerald-400" />
                <StatCard title="Unique Tags" value={summary?.uniqueTags} icon={TagIcon} color="text-amber-400" />
                <StatCard title="Created Today" value={summary?.notesToday} icon={TrendingUp} color="text-accent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent" />
                        Note Creation Trend
                    </h3>
                    <div className="h-64">
                        <Line data={trendData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl mb-6 flex items-center gap-2">
                        <TagIcon className="w-5 h-5 text-primary" />
                        Popular Topics
                    </h3>
                    <div className="h-64">
                        <Bar data={tagData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    Active Contributor Leaderboard
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-muted-foreground border-b border-border">
                                <th className="py-4 font-medium uppercase text-xs tracking-widest">User</th>
                                <th className="py-4 font-medium uppercase text-xs tracking-widest">Email</th>
                                <th className="py-4 font-medium uppercase text-xs tracking-widest text-right">Notes Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeUsers?.map((u) => (
                                <tr key={u.id || Math.random()} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                                    <td className="py-4 flex items-center gap-3 font-semibold">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                                            {u.username?.charAt(0) || '?'}
                                        </div>
                                        {u.username || 'Unknown User'}
                                    </td>
                                    <td className="py-4 text-muted-foreground text-sm">{u.email || 'N/A'}</td>
                                    <td className="py-4 text-right font-mono text-primary">{u.noteCount || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl bg-white/5", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-md">
                    +12%
                </span>
            </div>
            <div>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">{title}</p>
                <h2 className="text-3xl mt-1">{value || 0}</h2>
            </div>
        </div>
    );
}
