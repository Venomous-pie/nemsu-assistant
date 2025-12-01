import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      navigate("/chat");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI-Powered Campus Assistant
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NEMSU AI Assistant
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant answers to your questions about enrollment, schedules, grades, 
              tuition, campus facilities, and more. Your 24/7 campus companion.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-card rounded-2xl shadow-[var(--shadow-elevated)] border border-border p-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Ask me anything... (e.g., 'How do I enroll?')"
                      className="pl-12 h-14 text-base border-0 focus-visible:ring-0 bg-transparent"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90"
                    onClick={handleSearch}
                  >
                    Ask AI
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
            {[
              { title: "Enrollment", desc: "Admission & registration info" },
              { title: "Academics", desc: "Grades, schedules & requirements" },
              { title: "Campus Life", desc: "Facilities, events & services" }
            ].map((item) => (
              <button
                key={item.title}
                onClick={() => navigate("/chat")}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-[var(--shadow-card)] transition-all text-left group"
              >
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </div>

          {/* Dashboard Link */}
          <div className="pt-8">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="rounded-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
