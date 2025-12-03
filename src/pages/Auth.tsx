import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useLocation } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(() => !(location.state && (location.state as any).signup));
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // On successful auth, send user to the main chat (enrollment topic by default)
            navigate("/chat/enrollment");
        } catch (err: any) {
            const rawMessage = err?.message || "Authentication failed";
            // Simple user-friendly mapping
            if (rawMessage.includes("auth/invalid-credential") || rawMessage.includes("wrong-password")) {
                setError("The email or password you entered is incorrect.");
            } else if (rawMessage.includes("auth/user-not-found")) {
                setError("No account was found with that email address.");
            } else if (rawMessage.includes("auth/email-already-in-use")) {
                setError("An account with this email already exists. Try logging in instead.");
            } else if (rawMessage.includes("auth/weak-password")) {
                setError("Your password is too weak. Please choose a stronger password (at least 6 characters).");
            } else {
                setError("Authentication failed. Please double-check your details or try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <form onSubmit={handleAuth} className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
                <h2 className="text-2xl font-bold text-center mb-1">{isLogin ? "Log in to NEMSU Assistant" : "Create your NEMSU Assistant account"}</h2>
                <p className="text-center text-sm text-muted-foreground mb-4">
                    Use your active email so we can keep your chat history and campus info in sync.
                </p>
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        tabIndex={-1}
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                </Button>
                <div className="text-center">
                    <button
                        type="button"
                        className="text-primary underline text-sm"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AuthPage;
