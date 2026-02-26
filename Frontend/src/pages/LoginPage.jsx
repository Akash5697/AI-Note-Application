import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ArrowRight } from "lucide-react";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate("/dashboard");
        }
    };

    return (
        <AuthLayout
            title="Log in"
            footerText="Don't have an account?"
            footerAction="Register"
            onFooterAction={() => navigate("/register")}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1c2444] ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="alex@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[#1c2444] text-white rounded-xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1c2444] ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[#1c2444] text-white rounded-xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500"
                        />
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-xs font-medium text-gray-500">Remember me</span>
                        </label>
                        <Link to="#" className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#2a3666] to-[#1c2444] text-white font-bold text-lg shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/40 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? "Validating..." : "Login"}
                </button>
            </form>
        </AuthLayout>
    );
}
