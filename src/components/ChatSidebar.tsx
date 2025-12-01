import { 
  GraduationCap, 
  Calendar, 
  FileText, 
  DollarSign, 
  Map, 
  Building2,
  MessageSquare 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";

const shortcuts = [
  { icon: GraduationCap, label: "Enrollment", path: "/chat/enrollment" },
  { icon: Calendar, label: "Schedules", path: "/chat/schedules" },
  { icon: FileText, label: "Grades", path: "/chat/grades" },
  { icon: DollarSign, label: "Tuition", path: "/chat/tuition" },
  { icon: Map, label: "Campus Map", path: "/chat/campus-map" },
  { icon: Building2, label: "Registrar", path: "/chat/registrar" },
];

const ChatSidebar = () => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-[calc(100vh-4rem)] fixed left-0 top-16">
      <div className="p-4 space-y-2">
        <h3 className="text-sidebar-foreground text-sm font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Quick Topics
        </h3>
        {shortcuts.map((shortcut) => (
          <NavLink
            key={shortcut.path}
            to={shortcut.path}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <shortcut.icon className="h-4 w-4" />
            <span className="text-sm">{shortcut.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default ChatSidebar;
