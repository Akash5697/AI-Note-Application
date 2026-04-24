import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { AuthLayout } from "../components/layout/AuthLayout";

import { Eye, EyeOff } from "lucide-react";

export function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { token } = useParams();
    const { resetPassword, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const success = await resetPassword(token, password);
        if (success) {
            setIsSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        }
    };

    if (isSuccess) {
        return (
            <AuthLayout
                title="Password Reset!"
                footerText=""
                footerAction="Go to Login"
                onFooterAction={() => navigate("/login")}
            >
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-gray-600 font-medium">
                        Your password has been successfully reset.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting you to the login page in a few seconds...
                    </p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Set New Password"
            footerText="Remembered it?"
            footerAction="Login"
            onFooterAction={() => navigate("/login")}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1c2444] ml-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-[#1c2444] text-white rounded-xl px-5 py-3.5 pr-12 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1c2444] ml-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-[#1c2444] text-white rounded-xl px-5 py-3.5 pr-12 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
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
                    {isLoading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </AuthLayout>
    );
}
