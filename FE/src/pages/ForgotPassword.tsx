import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Bước 1: Gửi OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email) {
            toast.error("Vui lòng nhập email");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/users/forgot-password", {
                email: formData.email
            });

            toast.success("Mã OTP đã được gửi đến email của bạn");
            setStep(2);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Không thể gửi OTP");
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Xác thực OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.otp) {
            toast.error("Vui lòng nhập mã OTP");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/users/verify-otp", {
                email: formData.email,
                otp: formData.otp
            });

            toast.success("Xác thực OTP thành công");
            setStep(3);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Mã OTP không hợp lệ");
        } finally {
            setLoading(false);
        }
    };

    // Bước 3: Đặt lại mật khẩu
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.newPassword || !formData.confirmPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/users/reset-password", {
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });

            toast.success("Đặt lại mật khẩu thành công");
            navigate("/login");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Không thể đặt lại mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nguyenvana@gmail.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </Button>
                    </form>
                );

            case 2:
                return (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Mã OTP</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Nhập mã OTP 6 chữ số"
                                value={formData.otp}
                                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                maxLength={6}
                                required
                                disabled={loading}
                            />
                            <p className="text-sm text-muted-foreground">
                                Mã OTP đã được gửi đến: {formData.email}
                            </p>
                        </div>
                        <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Đang xác thực..." : "Xác thực OTP"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setStep(1)}
                            disabled={loading}
                        >
                            Quay lại
                        </Button>
                    </form>
                );

            case 3:
                return (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Mật khẩu mới</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                required
                                minLength={6}
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setStep(2)}
                            disabled={loading}
                        >
                            Quay lại
                        </Button>
                    </form>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
            <Card className="w-full max-w-md shadow-hover">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-gradient-primary">
                            <Mail className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {step === 1 && "Quên mật khẩu"}
                        {step === 2 && "Xác thực OTP"}
                        {step === 3 && "Đặt lại mật khẩu"}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {step === 1 && "Nhập email để nhận mã OTP"}
                        {step === 2 && "Nhập mã OTP đã gửi đến email của bạn"}
                        {step === 3 && "Tạo mật khẩu mới cho tài khoản"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {renderStep()}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;