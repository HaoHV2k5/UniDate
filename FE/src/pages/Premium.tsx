import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createVnpayPayment } from "@/api/payment";
import { toast } from "sonner";

const Premium = () => {
  const amount = 100000;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [note, setNote] = useState("Nạp tiền vào ví admin");
  const [loading, setLoading] = useState(false);

  const onPay = async () => {
    const userIdStr = localStorage.getItem("userId");
    const userId = userIdStr ? parseInt(userIdStr, 10) : 0;
    if (!userId) {
      toast.error("Bạn cần đăng nhập để thanh toán");
      return;
    }
    if (!amount || amount < 1000) {
      toast.error("Số tiền không hợp lệ (>= 1,000 VND)");
      return;
    }

    try {
      setLoading(true);
      const url = await createVnpayPayment({
        userId,
        amount: Math.floor(amount),
        orderInfo: note || "Nap tien vao vi admin",
        orderType: "billpayment",
        language: "vn",
        fullName: fullName || undefined,
        email: email || undefined,
        mobile: mobile || undefined,
      });
      window.location.href = url; // redirect to VNPAY
    } catch (e: any) {
      toast.error(e?.message || "Không tạo được thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main className="container px-4 py-8 max-w-2xl">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Nâng cấp/Premium - VNPAY</CardTitle>
            <CardDescription>
              Nhập thông tin để chuyển sang cổng thanh toán VNPAY.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">S? ti?n (VND)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={1000}
                  step={1000}
                  value={amount}
                  readOnly
                  disabled
                  placeholder="Nh?p s? ti?n"
                />
              </div>
              <div>
                <Label htmlFor="fullname">Họ tên (tuỳ chọn)</Label>
                <Input id="fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <Label htmlFor="email">Email (tuỳ chọn)</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="mobile">Số điện thoại (tuỳ chọn)</Label>
                <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="0901234567" />
              </div>
            </div>

            <div>
              <Label htmlFor="note">Ghi chú đơn hàng</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nội dung đơn hàng" />
            </div>

            <Button onClick={onPay} disabled={loading} className="w-full">
              {loading ? "Đang chuyển đến VNPAY..." : "Thanh toán qua VNPAY"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Premium;

