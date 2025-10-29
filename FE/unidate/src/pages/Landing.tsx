import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, MessageCircle, Calendar, CheckCircle, Users, Star, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import heroImage from "@/assets/hero-students.jpg";
import appMockup from "@/assets/app-mockup.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";
import logo from "@/assets/logo.png";

<link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet"></link>
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
    {
      name: "Nguyễn Minh Anh",
      major: "CNTT K20",
      text: "Tìm được nhiều bạn cùng sở thích coding và đã match với người bạn tâm đầu ý hợp!",
      stars: 5,
      likes: 124,
      avatar: avatar1
    },
    {
      name: "Trần Thu Hà",
      major: "Marketing K21",
      text: "Giao diện đẹp, dễ dùng. Match rate cao hơn mong đợi!",
      stars: 5,
      likes: 98,
      avatar: avatar2
    },
    {
      name: "Lê Tuấn Kiệt",
      major: "Kinh tế K19",
      text: "Đã có một nửa nhờ UniDate. Cảm ơn app rất nhiều ❤️",
      stars: 5,
      likes: 156,
      avatar: avatar3
    },
    {
      name: "Phạm Hương Giang",
      major: "Thiết kế K20",
      text: "Thuật toán matching thông minh, gợi ý đúng gu!",
      stars: 5,
      likes: 87,
      avatar: avatar4
    },
    {
      name: "Hoàng Minh Đức",
      major: "CNTT K21",
      text: "Chat realtime mượt mà, dễ dàng hẹn hò trong campus.",
      stars: 5,
      likes: 92,
      avatar: avatar1
    },
    {
      name: "Võ Thanh Tâm",
      major: "Ngôn ngữ K22",
      text: "An toàn với xác thực email trường, tin cậy 100%!",
      stars: 5,
      likes: 143,
      avatar: avatar2
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Landing Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
          >
            <span className="text-3xl font-extrabold tracking-wide text-pink-500 drop-shadow-md">
              Uni<span className="text-indigo-500">Date</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="default" className="rounded-full hover:bg-primary/10 transition-all">
              <Link to="/login">Đăng nhập</Link>
            </Button>
            <Button asChild variant="default" size="default" className="rounded-full shadow-md hover:shadow-lg transition-all">
              <Link to="/register">Đăng ký</Link>
            </Button>
          </div>
        </div>
      </header>

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

      {/* Testimonials - Infinite Scroll */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-accent to-primary-light relative overflow-hidden">
        {/* Decorative rounded top */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-background rounded-b-[3rem]"></div>

        <div className="container px-4 relative z-10 mt-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - Title */}
            <div className="space-y-6 lg:sticky lg:top-32">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Được đánh giá cao bởi hàng trăm nghìn sinh viên
              </h2>
              <p className="text-lg text-white/90 max-w-md">
                UniDate đã giúp hàng ngàn sinh viên tìm được bạn bè, người yêu và những mối quan hệ ý nghĩa ngay trong khuôn viên đại học.
              </p>
              <div className="flex items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-white" />
                  <span className="text-2xl font-bold">4.9</span>
                  <span className="text-white/80">/5.0</span>
                </div>
                <div className="h-8 w-px bg-white/30"></div>
                <div>
                  <p className="text-2xl font-bold">10,000+</p>
                  <p className="text-sm text-white/80">Đánh giá</p>
                </div>
              </div>
            </div>

            {/* Right side - 2 columns with infinite scroll */}
            <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-hidden">
              {/* Column 1 */}
              <div className="space-y-4">
                <motion.div
                  animate={{ y: [0, -2000] }}
                  transition={{
                    y: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 30,
                      ease: "linear",
                    },
                  }}
                  className="space-y-4"
                >
                  {[...testimonials, ...testimonials, ...testimonials].filter((_, i) => i % 2 === 0).map((testimonial, index) => (
                    <Card key={index} className="bg-white border-0 shadow-hover">
                      <CardContent className="p-5 space-y-3 min-h-[280px] flex flex-col">
                        <div className="flex items-start gap-3">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground text-sm">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.major}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                          "{testimonial.text}"
                        </p>

                        <div className="flex items-center gap-4 pt-2 border-t">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(testimonial.stars)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-current" />
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">{testimonial.likes}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <motion.div
                  animate={{ y: [-1000, -3000] }}
                  transition={{
                    y: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 30,
                      ease: "linear",
                    },
                  }}
                  className="space-y-4"
                >
                  {[...testimonials, ...testimonials, ...testimonials].filter((_, i) => i % 2 === 1).map((testimonial, index) => (
                    <Card key={index} className="bg-white border-0 shadow-hover">
                      <CardContent className="p-5 space-y-3 min-h-[280px] flex flex-col">
                        <div className="flex items-start gap-3">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground text-sm">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.major}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                          "{testimonial.text}"
                        </p>

                        <div className="flex items-center gap-4 pt-2 border-t">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(testimonial.stars)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-current" />
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">{testimonial.likes}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* CTA Section */}
      <section className="relative py-28 overflow-hidden bg-pink-100">
        {/* Nền chuyển động hồng pastel - ĐÃ SỬA */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          style={{
            background: `
        radial-gradient(circle at 20% 30%, #ffd1dc 0%, #f9a8d4 30%, transparent 60%),
        radial-gradient(circle at 80% 70%, #fbcfe8 0%, #f472b6 40%, transparent 70%),
        radial-gradient(circle at 50% 100%, #f9a8d4 0%, #fbcfe8 40%, transparent 70%)
      `,
            backgroundSize: "150% 150%",
            filter: "blur(40px)",
            opacity: 0.7,
          }}
        />

        <div className="relative container px-4">
          <motion.div
            className="rounded-3xl bg-white/30 backdrop-blur-2xl text-pink-900 p-12 shadow-2xl text-center space-y-8 border border-pink-200/40"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl font-extrabold tracking-tight sm:text-5xl text-pink-700 drop-shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Sẵn sàng tìm người phù hợp?
            </motion.h2>

            <motion.p
              className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Tham gia cùng hàng ngàn sinh viên đang kết nối mỗi ngày trên{" "}
              <span className="font-semibold text-pink-600">UniDate</span>
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Button
                  size="xl"
                  className="bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-400/40"
                >
                  <Link to="/register">Đăng ký miễn phí</Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <Button
                  asChild
                  variant="outline"
                  size="xl"
                  className="border-2 border-pink-400 text-pink-600 hover:bg-pink-100 transition-all duration-300"
                >
                  <Link to="/login">Đã có tài khoản</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
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
