import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, MessageCircle, Calendar, CheckCircle, Users } from "lucide-react";
import heroImage from "@/assets/hero-students.jpg";
import appMockup from "@/assets/app-mockup.jpg";

const Landing = () => {
  const features = [
    {
      icon: Heart,
      title: "Matching Thông Minh",
      description: "Thuật toán AI phân tích sở thích, ngành học và lịch rảnh để gợi ý người phù hợp nhất",
    },
    {
      icon: MessageCircle,
      title: "Chat & Lịch Hẹn",
      description: "Trò chuyện realtime và đặt lịch hẹn dễ dàng với những người bạn match",
    },
    {
      icon: Shield,
      title: "Xác Thực Sinh Viên",
      description: "Chỉ sinh viên có email trường mới được tham gia - an toàn và đáng tin cậy",
    },
  ];

  const testimonials = [
    { name: "Minh Anh", major: "CNTT K20", text: "Đã tìm được nhiều bạn cùng sở thích coding!" },
    { name: "Thu Hà", major: "Marketing K21", text: "Ứng dụng rất dễ dùng và match rate cao!" },
    { name: "Tuấn Kiệt", major: "Kinh tế K19", text: "Đã có một nửa nhờ UniDate ❤️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <div className="container relative z-10 px-4 py-20 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  UniDate
                </h1>
                <p className="text-2xl md:text-3xl text-primary font-semibold">
                  Kết nối bạn bè, tìm bạn học, tìm một nửa trong khuôn viên
                </p>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Nền tảng hẹn hò thông minh dành riêng cho sinh viên. 
                  Match dựa trên sở thích, ngành học và giờ rảnh!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="hero" size="xl">
                  <Link to="/register">Bắt đầu ngay</Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Miễn phí</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Xác thực email .edu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>10,000+ sinh viên</span>
                </div>
              </div>
            </div>

            <div className="relative lg:h-[600px] animate-fade-in">
              <img
                src={heroImage}
                alt="Students connecting on campus"
                className="rounded-2xl shadow-hover object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tính năng nổi bật
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              UniDate được thiết kế đặc biệt cho sinh viên với các tính năng thông minh
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift shadow-card bg-gradient-card border-0">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Giao diện đẹp, dễ sử dụng
              </h2>
              <p className="text-lg text-muted-foreground">
                Khám phá profile theo kiểu YouTube, swipe để match, 
                chat realtime và đặt lịch hẹn - tất cả trong một ứng dụng!
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Browse profiles với thuật toán gợi ý thông minh</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Match khi cả hai like profile của nhau</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Chat riêng tư và đặt lịch hẹn trực tiếp</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <img
                src={appMockup}
                alt="App demo"
                className="rounded-2xl shadow-hover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Sinh viên nói gì về UniDate
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.major}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4">
          <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-hover">
            <CardContent className="py-12 text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Sẵn sàng tìm người phù hợp?
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Tham gia cùng hàng ngàn sinh viên đang kết nối trên UniDate
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="secondary" size="xl">
                  <Link to="/register">Đăng ký miễn phí</Link>
                </Button>
                <Button asChild variant="outline" size="xl" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Link to="/login">Đã có tài khoản</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 fill-primary text-primary" />
                <span className="font-bold">UniDate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Kết nối sinh viên trong khuôn viên đại học
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Sản phẩm</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/discover" className="hover:text-primary">Khám phá</Link></li>
                <li><Link to="/matches" className="hover:text-primary">Gợi ý match</Link></li>
                <li><Link to="/chat" className="hover:text-primary">Chat</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Công ty</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Tuyển dụng</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Pháp lý</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Điều khoản</a></li>
                <li><a href="#" className="hover:text-primary">Chính sách</a></li>
                <li><Link to="/admin" className="hover:text-primary">Admin</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 UniDate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
