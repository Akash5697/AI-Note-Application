import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { AuthLayout } from "../components/layout/AuthLayout";

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { forgotPassword, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await forgotPassword(email);
        if (success) {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout
                title="Check your email"
                footerText="Wait, I remember it!"
                footerAction="Go to Login"
                onFooterAction={() => navigate("/login")}
            >
                <div className="space-y-6 text-center">
                    <p className="text-gray-600">
                        We've sent a password reset link to <span className="font-bold">{email}</span>.
                    </p>
                    <p className="text-sm text-gray-500">
                        Please check your inbox (and spam folder) for further instructions.
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Didn't receive the email? Try again
                    </button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Reset Password"
            footerText="Back to"
            footerAction="Login"
            onFooterAction={() => navigate("/login")}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 px-1">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
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
                    {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
        </AuthLayout>
    );
}
