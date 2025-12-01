import { 
  GraduationCap, 
  Calendar, 
  FileText, 
  Bell, 
  TrendingUp,
  Clock,
  BookOpen,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const quickAccessItems = [
    { icon: GraduationCap, label: "Enrollment", color: "from-blue-500 to-blue-600" },
    { icon: Calendar, label: "Schedule", color: "from-purple-500 to-purple-600" },
    { icon: FileText, label: "Grades", color: "from-green-500 to-green-600" },
    { icon: BookOpen, label: "Courses", color: "from-orange-500 to-orange-600" },
  ];

  const notifications = [
    { title: "Enrollment Deadline", time: "2 days left", icon: Clock },
    { title: "New Grade Posted", time: "1 hour ago", icon: TrendingUp },
    { title: "Event: Career Fair", time: "Tomorrow 9AM", icon: Award },
  ];

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, Student!
          </h1>
          <p className="text-muted-foreground">Here's what's happening today</p>
        </div>

        {/* Quick Access Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {quickAccessItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate("/chat")}
              className="group"
            >
              <Card className="p-6 hover:shadow-[var(--shadow-elevated)] transition-all border-border hover:border-primary/50">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </h3>
              </Card>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Notifications */}
          <Card className="md:col-span-2 p-6 border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Updates
              </h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <notif.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{notif.title}</h4>
                    <p className="text-sm text-muted-foreground">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
                <p className="text-sm text-muted-foreground mb-1">Current GPA</p>
                <p className="text-2xl font-bold text-foreground">3.75</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Enrolled Units</p>
                <p className="text-2xl font-bold text-foreground">21</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Next Class</p>
                <p className="text-lg font-semibold text-foreground">In 2 hours</p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Assistant CTA */}
        <Card className="mt-6 p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Need help with something?
              </h3>
              <p className="text-muted-foreground">
                Ask our AI assistant about enrollment, grades, schedules, and more.
              </p>
            </div>
            <Button 
              size="lg"
              onClick={() => navigate("/chat")}
              className="bg-primary hover:bg-primary/90"
            >
              Chat Now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
