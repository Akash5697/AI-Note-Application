import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { AuthLayout } from "../components/layout/AuthLayout";

export function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const { register, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData.username, formData.email, formData.password);
        if (success) {
            navigate("/login");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AuthLayout
            title="Welcome !"
            subtitle="Join our community and start your journey with NoteApp today."
            footerText="Already a member?"
            footerAction="Login"
            onFooterAction={() => navigate("/login")}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1c2444] ml-1">Name</label>
                        <input
                            name="username"
                            placeholder="Full Name"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#1c2444] text-white rounded-xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1c2444] ml-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="alex@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#1c2444] text-white rounded-xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#1c2444] ml-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-[#1c2444] text-white rounded-xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500"
                        />
                    </div>

                    <div className="px-1">
                        <p className="text-[10px] text-gray-400 font-medium">
                            By registering, you agree to our <span className="text-indigo-600 cursor-pointer">Terms of Service</span> and <span className="text-indigo-600 cursor-pointer">Privacy Policy</span>.
                        </p>
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
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#2a3666] to-[#1c2444] text-white font-bold text-lg shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/40 transform hover:-translate-y-1 transition-all flex items-center justify-center"
                >
                    {isLoading ? "Creating Account..." : "Register"}
                </button>
            </form>
        </AuthLayout>
    );
}
