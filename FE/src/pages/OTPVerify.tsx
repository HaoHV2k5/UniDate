import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

const OTPVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your-email@university.edu.vn";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleResend = async () => {
    if (resendCount >= 3) {
      toast.error("Bạn đã gửi lại mã quá nhiều lần. Vui lòng thử lại sau.");
      return;
    }

    try {
      await api.post("/api/resend-otp", { email });

      setResendCount(resendCount + 1);
      setCountdown(60);
      setCanResend(false);
      toast.success("Mã OTP mới đã được gửi!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi lại OTP. Thử lại sau.");
    }
  };



  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ 6 chữ số");
      return;
    }

    try {
      await api.post("/api/verify-otp", { email, otp: otpCode });

      toast.success("Xác thực thành công!");
      setTimeout(() => navigate("/login"), 800);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP sai hoặc đã hết hạn!");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
      <Card className="w-full max-w-md shadow-hover">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="w-fit -ml-2 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-primary">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-center">
            Xác thực OTP
          </CardTitle>
          <CardDescription className="text-center">
            Mã OTP đã gửi tới email của bạn
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Nhập mã xác thực 6 chữ số
            </p>

            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-semibold"
                />
              ))}
            </div>
          </div>

          <Button
            onClick={handleVerify}
            variant="hero"
            size="lg"
            className="w-full"
          >
            Xác nhận
          </Button>

          <div className="text-center space-y-2">
            {!canResend ? (
              <p className="text-sm text-muted-foreground">
                Gửi lại mã sau{" "}
                <span className="font-semibold text-primary">
                  00:{countdown.toString().padStart(2, "0")}
                </span>
              </p>
            ) : (
              <Button
                variant="link"
                onClick={handleResend}
                disabled={resendCount >= 3}
                className="text-primary"
              >
                Gửi lại mã
              </Button>
            )}

            {resendCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Đã gửi lại: {resendCount}/3 lần
              </p>
            )}

            <p className="text-xs text-muted-foreground px-6">
              Nếu không nhận được, kiểm tra hộp spam hoặc bấm 'Gửi lại mã'
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerify;
