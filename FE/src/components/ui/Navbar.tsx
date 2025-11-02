import { Link, useLocation } from "react-router-dom";
import { Heart, MessageCircle, Calendar, User, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import avatar1 from "@/assets/avatar-1.jpg";

export const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 fill-primary text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              UniDate
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/discover">
              <Button
                variant={isActive("/discover") ? "default" : "ghost"}
                size="sm"
              >
                <Home className="mr-2 h-4 w-4" />
                Khám phá
              </Button>
            </Link>
            <Link to="/matches">
              <Button
                variant={isActive("/matches") ? "default" : "ghost"}
                size="sm"
              >
                <Heart className="mr-2 h-4 w-4" />
                Gợi ý
              </Button>
            </Link>
            <Link to="/chat">
              <Button
                variant={isActive("/chat") ? "default" : "ghost"}
                size="sm"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Tin nhắn
              </Button>
            </Link>
            <Link to="/events">
              <Button
                variant={isActive("/events") ? "default" : "ghost"}
                size="sm"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Lịch hẹn
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm người..."
                className="pl-8"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar>
                  <AvatarImage src={avatar1} alt="User" />
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin">Quản trị (Admin)</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/">Đăng xuất</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
