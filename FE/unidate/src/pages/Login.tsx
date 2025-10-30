import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

// Interface cho trái tim
interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  isExploding: boolean;
  rotation: number;
}

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State cho các trái tim
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  // Tạo trái tim mới
  const createHeart = (): FloatingHeart => ({
    id: Date.now() + Math.random(),
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 15,
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    isExploding: false,
    rotation: Math.random() * 360,
  });

  // Khởi tạo trái tim ban đầu
  useEffect(() => {
    const initialHearts = Array.from({ length: 20 }, createHeart);
    setHearts(initialHearts);
  }, []);

  // Xử lý khi click vào trái tim
  const handleHeartClick = (id: number) => {
    setHearts(prevHearts =>
      prevHearts.map(heart =>
        heart.id === id ? { ...heart, isExploding: true } : heart
      )
    );

    // Xóa trái tim sau khi hiệu ứng kết thúc
    setTimeout(() => {
      setHearts(prevHearts => prevHearts.filter(heart => heart.id !== id));

      // Tạo trái tim mới sau 1-3 giây
      setTimeout(() => {
        setHearts(prevHearts => [...prevHearts, createHeart()]);
      }, Math.random() * 2000 + 1000);
    }, 600);
  };


  ///////////////////////////////
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        username: formData.email,
        password: formData.password,
      });

      const data = res.data.data;
      toast.success("Đăng nhập thành công!");

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      setTimeout(() => {
        const role = data.user?.role;
        navigate(role === "admin" || "ADMIN" ? "/admin" : "/discover");
      }, 800);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sai email hoặc mật khẩu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4 relative overflow-hidden">
      {/* Các trái tim nổi */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className={`absolute cursor-pointer transition-all duration-600 ease-out ${heart.isExploding ? "scale-150 opacity-0" : "scale-100 opacity-70 hover:opacity-100 hover:scale-110"
            }`}
          style={{
            left: `${heart.x}vw`,
            top: `${heart.y}vh`,
            fontSize: `${heart.size}px`,
            color: heart.color,
            transform: `rotate(${heart.rotation}deg) ${heart.isExploding ? 'scale(1.5)' : 'scale(1)'}`,
            zIndex: 10,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          }}
          onClick={() => handleHeartClick(heart.id)}
        >
          ❤️
        </div>
      ))}

      {/* Form đăng nhập - giữ nguyên */}
      <Card className="w-full max-w-md shadow-hover relative z-20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Đăng nhập</CardTitle>
          <CardDescription className="text-base">
            Chào mừng trở lại UniDate!
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nguyenvana@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full">
              Đăng nhập
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Chưa có tài khoản? </span>
              <Link to="/register" className="text-primary font-medium hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;