import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PaymentFail = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main className="container px-4 py-12 max-w-xl">
        <Card className="shadow-card text-center">
          <CardHeader>
            <CardTitle>Thanh toán thất bại</CardTitle>
            <CardDescription>Rất tiếc, giao dịch không thành công hoặc đã bị hủy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/premium">
              <Button className="w-full">Thử lại</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">Về trang chủ</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PaymentFail;

