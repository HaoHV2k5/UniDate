import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Upload } from "lucide-react";
import { toast } from "sonner";

// Interface cho cánh hoa anh đào
interface CherryBlossom {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  speedX: number;
  speedY: number;
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    major: "",
    year: "",
    avatar: null as File | null,
  });

  // State cho các cánh hoa anh đào
  const [blossoms, setBlossoms] = useState<CherryBlossom[]>([]);

  // Tạo cánh hoa mới
  const createBlossom = (): CherryBlossom => {
    const rand = Math.random();

    let x: number;
    let y: number;

    // 70% hoa xuất hiện ở khu vực góc phải (3/4 phải màn hình, phần trên)
    if (rand < 0.7) {
      x = 60 + Math.random() * 80;
      y = Math.random() * -30;
    }
    // 30% còn lại rải rác nhẹ ở vùng trên giữa
    else {
      x = 25 + Math.random() * 25;   // giữa đến phải giữa
      y = Math.random() * -20;
    }

    return {
      id: Date.now() + Math.random(),
      x,
      y,
      size: Math.random() * 10 + 14,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.3 + 0.6,
      speedX: Math.random() * 0.12 + 0.03,
      speedY: Math.random() * 0.12 + 0.08,
    };
  };
  // Khởi tạo cánh hoa ban đầu
  useEffect(() => {
    const initialBlossoms = Array.from({ length: 6 }, createBlossom); // Giảm số lượng
    setBlossoms(initialBlossoms);
  }, []);

  // Animation với requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const updateBlossoms = () => {
      setBlossoms(prevBlossoms =>
        prevBlossoms.map(blossom => {
          let newX = blossom.x - blossom.speedX; // Di chuyển sang trái
          let newY = blossom.y + blossom.speedY; // Di chuyển xuống dưới
          let newRotation = blossom.rotation + 0.3; // Xoay rất chậm

          // Nếu hoa ra khỏi màn hình, tạo lại ở bên phải
          if (newY > 100 || newX < -10) {
            return createBlossom();
          }

          return {
            ...blossom,
            x: newX,
            y: newY,
            rotation: newRotation,
          };
        })
      );

      animationFrameId = requestAnimationFrame(updateBlossoms);
    };

    animationFrameId = requestAnimationFrame(updateBlossoms);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Thêm cánh hoa mới mỗi 3 giây (chậm hơn)
  useEffect(() => {
    const interval = setInterval(() => {
      if (blossoms.length < 40) { // Giới hạn tổng số hoa
        setBlossoms(prev => [...prev, createBlossom()]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [blossoms.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.major || !formData.year) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Sai định dạng email");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Navigate to OTP verification
    toast.success("Đang gửi mã xác thực...");
    setTimeout(() => {
      navigate("/otp-verify", { state: { email: formData.email } });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4 relative overflow-hidden">
      {/* Các cánh hoa anh đào */}
      {blossoms.map((blossom) => (
        <div
          key={blossom.id}
          className="absolute pointer-events-none"
          style={{
            left: `${blossom.x}%`,
            top: `${blossom.y}%`,
            fontSize: `${blossom.size}px`,
            opacity: blossom.opacity,
            transform: `rotate(${blossom.rotation}deg)`,
            zIndex: 10,
            transition: 'transform 0.2s linear, opacity 0.2s linear',
            color: `hsl(330, 70%, 75%)`,
            willChange: 'transform, opacity', // Tối ưu hiệu suất
          }}
        >
          {Math.random() > 0.5 ? '🌸' : '💮'}
        </div>
      ))}

      {/* Form đăng ký */}
      <Card className="w-full max-w-xl shadow-hover relative z-20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Tạo tài khoản</CardTitle>
          <CardDescription className="text-base">
            Tham gia UniDate để bắt đầu kết nối
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nguyenvana@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Bạn sẽ nhận mã OTP qua email này
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="major">Ngành học</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, major: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngành" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cntt">Công nghệ thông tin</SelectItem>
                    <SelectItem value="ktoan">Kinh tế</SelectItem>
                    <SelectItem value="dtvt">Điện tử viễn thông</SelectItem>
                    <SelectItem value="nna">Ngôn ngữ Anh</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="khac">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Năm học</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, year: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Năm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Năm 1</SelectItem>
                    <SelectItem value="2">Năm 2</SelectItem>
                    <SelectItem value="3">Năm 3</SelectItem>
                    <SelectItem value="4">Năm 4</SelectItem>
                    <SelectItem value="5">Năm 5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Ảnh đại diện</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.files?.[0] || null })
                  }
                  className="cursor-pointer"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full">
              Đăng ký
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Đã có tài khoản? </span>
              <Link to="/login" className="text-primary font-medium hover:underline">
                Đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;