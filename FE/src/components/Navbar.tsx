import { Link, useLocation } from "react-router-dom";
import { Heart, MessageCircle, Calendar, User, Search, Home, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/NotificationBell";
import api from "@/api/api"; // Đảm bảo đã có

export const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const navigate = useNavigate();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [autoResults, setAutoResults] = useState<any[]>([]);

  useEffect(() => {
    const avatar = localStorage.getItem('avatar');
    const fullname = localStorage.getItem('fullName');

    if (avatar) {
      setAvatarSrc(avatar);
    }
    if (fullname) {
      setFullName(fullname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleAutocomplete = async (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      setAutoResults([]);
      return;
    }
    try {
      const res = await api.get("/api/users/autocomplete", { params: { keyword: value } });
      setAutoResults(res.data.data || []);
    } catch {
      setAutoResults([]);
    }
  };

  // Kiểm tra nếu userName là admin (có thể điều chỉnh logic này)
  const isAdmin = fullName?.toLowerCase().includes('ADMIN') || fullName === 'ADMIN';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
          >
            <span className="text-3xl font-extrabold tracking-wide text-pink-500 drop-shadow-md">
              Uni<span className="text-indigo-500">Date</span>
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
            <Link to="/premium">
              <Button
                variant={isActive("/premium") ? "default" : "ghost"}
                size="sm"
              >
                Premium
              </Button>
            </Link>
            <Link to="/album">
              <Button
                variant={isActive("/album") ? "default" : "ghost"}
                size="sm"
              >
                Album
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 max-w-sm relative">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm người..."
                className="pl-8"
                value={searchText}
                onChange={e => handleAutocomplete(e.target.value)}
              />
              {autoResults.length > 0 && (
                <div
                  className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-xl shadow-xl border border-gray-200 bg-white z-50 animate-fadeIn"
                >
                  {autoResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors duration-100 hover:bg-gray-200"
                      onClick={() => navigate(`/profile/${encodeURIComponent(user.username)}`)}
                    >
                      {user.avatar ? (
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.fullName} />
                          <AvatarFallback>{user.fullName ? user.fullName[0] : "U"}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-300">
                          <SearchIcon size={20} className="text-gray-600" />
                        </div>
                      )}
                      <span className="font-semibold text-base truncate max-w-[140px]">{user.fullName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar>
                  <AvatarImage src={avatarSrc} alt="User" />
                  <AvatarFallback>
                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {fullName || 'Tài khoản của tôi'}
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/album/requests">Yêu cầu album</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Trang cá nhân
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/premium">Nâng cấp/Premium</Link>
              </DropdownMenuItem>

              {/* Chỉ hiển thị mục Quản trị nếu là admin */}
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin">Quản trị (Admin)</Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};