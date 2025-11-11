import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main className="container px-4 py-12 max-w-xl">
        <Card className="shadow-card text-center">
          <CardHeader>
            <CardTitle>Thanh toán thành công</CardTitle>
            <CardDescription>Cảm ơn bạn! Giao dịch đã được xác nhận.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/">
              <Button className="w-full">Về trang chủ</Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="w-full">Xem hồ sơ</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PaymentSuccess;

