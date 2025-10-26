import { Link, useLocation } from "react-router-dom";
import { Home, Heart, MessageCircle, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/discover", icon: Home, label: "Khám phá" },
    { path: "/matches", icon: Heart, label: "Gợi ý" },
    { path: "/chat", icon: MessageCircle, label: "Tin nhắn" },
    { path: "/events", icon: Calendar, label: "Lịch" },
    { path: "/profile", icon: User, label: "Hồ sơ" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
