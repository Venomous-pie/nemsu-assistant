import { Moon, Sun, User, Settings, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowProfileMenu((v) => !v)}
              aria-label="Profile menu"
            >
              <User className="h-5 w-5" />
            </Button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 p-4 text-left">
                {user ? (
                  <>
                    <div className="mb-2">
                      <div className="font-semibold text-foreground">{user.displayName || user.email}</div>
                      <div className="text-xs text-muted-foreground">UID: {user.uid}</div>
                      {user.email && <div className="text-xs text-muted-foreground">Email: {user.email}</div>}
                    </div>
                    <Button className="w-full mt-2" variant="outline" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full mb-2" variant="outline" onClick={() => { setShowProfileMenu(false); navigate('/auth'); }}>
                      <LogIn className="mr-2 h-4 w-4" /> Login
                    </Button>
                    <Button className="w-full" variant="default" onClick={() => { setShowProfileMenu(false); navigate('/auth', { state: { signup: true } }); }}>
                      Register
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
