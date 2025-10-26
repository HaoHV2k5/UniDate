import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Upload } from "lucide-react";
import { toast } from "sonner";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.major || !formData.year) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!formData.email.includes("@") || !formData.email.includes(".edu")) {
      toast.error("Vui lòng sử dụng email trường (@*.edu)");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
      <Card className="w-full max-w-xl shadow-hover">
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
              <Label htmlFor="email">Email trường (@*.edu)</Label>
              <Input
                id="email"
                type="email"
                placeholder="nguyenvana@university.edu.vn"
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
