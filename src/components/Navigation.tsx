import { Moon, Sun, User, Settings, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Theme from localStorage
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (storedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    }
    // Auth state
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        localStorage.setItem("session", JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email }));
      } else {
        localStorage.removeItem("session");
      }
    });
    return () => unsub();
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleLogin = () => {
    navigate("/auth");
  };


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <img src="/Logo.png" alt="Logo" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              NEMSU Assistant
            </h1>
            <p className="text-xs text-muted-foreground">
              Campus AI Helper
            </p>
          </div>
        </a>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
