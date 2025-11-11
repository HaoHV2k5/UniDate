import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Upload } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

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
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    yob: "",
    phone: "",
    address: "",
    image: null as File | null,
  });

  // Ảnh preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State cho các cánh hoa anh đào
  const [blossoms, setBlossoms] = useState<CherryBlossom[]>([]);

  // Tạo cánh hoa mới
  // Tạo cánh hoa mới - SỬA CODE Ở ĐÂY
  const createBlossom = (): CherryBlossom => {
    const rand = Math.random();

    let x: number;
    let y: number;

    if (rand < 0.7) {
      x = 60 + Math.random() * 80;
      y = Math.random() * -30;
    } else {
      x = 25 + Math.random() * 25;
      y = Math.random() * -20;
    }


    const blossomType = Math.random() > 0.5 ? "🌸" : "🌸";

    return {
      id: Date.now() + Math.random(),
      x,
      y,
      size: Math.random() * 10 + 14,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.3 + 0.6,
      speedX: Math.random() * 0.12 + 0.03,
      speedY: Math.random() * 0.12 + 0.08,
      type: "🌸",
    };
  };

  // Interface cập nhật
  interface CherryBlossom {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    opacity: number;
    speedX: number;
    speedY: number;
    type: string; // THÊM DÒNG NÀY
  }


  {
    blossoms.map((blossom) => (
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
          color: `hsl(330, 70%, 75%)`,
        }}
      >
        {blossom.type} {/* SỬA THÀNH blossom.type */}
      </div>
    ))
  }

  useEffect(() => {
    const initialBlossoms = Array.from({ length: 6 }, createBlossom);
    setBlossoms(initialBlossoms);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const updateBlossoms = () => {
      setBlossoms((prevBlossoms) =>
        prevBlossoms.map((blossom) => {
          let newX = blossom.x - blossom.speedX;
          let newY = blossom.y + blossom.speedY;
          let newRotation = blossom.rotation + 0.3;

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
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (blossoms.length < 40) {
        setBlossoms((prev) => [...prev, createBlossom()]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [blossoms.length]);

  // helper: format yyyy-mm-dd -> dd/MM/yyyy (backend định dạng dd/MM/yyyy)
  const formatYobToDdMmYyyy = (isoDate: string) => {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    if (!y || !m || !d) return isoDate;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validate cơ bản
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.yob
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      toast.loading("Đang xử lý...");

      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("confirmPassword", formData.confirmPassword);
      data.append("gender", formData.gender || "");
      data.append("yob", formatYobToDdMmYyyy(formData.yob));
      data.append("phone", formData.phone || "");
      data.append("address", formData.address || "");
      if (formData.image) {
        data.append("image", formData.image);
      }

      await api.post("api/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss();
      toast.success("Vui lòng kiểm tra email để lấy OTP");
      navigate("/otp-verify", { state: { email: formData.email } });
    } catch (err: any) {
      toast.dismiss();
      console.error("Registration error:", err.response?.data);
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4 relative overflow-hidden">
      {/* 🌸 Animation hoa anh đào */}
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
            color: `hsl(330, 70%, 75%)`,
          }}
        >
          {Math.random() > 0.5 ? "🌸" : "💮"}
        </div>
      ))}

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
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
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
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Nam</SelectItem>
                    <SelectItem value="FEMALE">Nữ</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yob">Ngày sinh</Label>
                <Input
                  id="yob"
                  type="date"
                  value={formData.yob}
                  onChange={(e) => setFormData({ ...formData, yob: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                placeholder="(Ví dụ: 098xxxxxxx)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                placeholder="Hà Nội, Việt Nam"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Ảnh đại diện</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>

              {imagePreview && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover shadow-md border"
                  />
                </div>
              )}
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
