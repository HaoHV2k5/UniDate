import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Calendar, Image as ImageIcon, Star, MapPin, GraduationCap } from "lucide-react";
import avatar1 from "@/assets/avatar-1.jpg";
import { toast } from "sonner";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const user = {
    name: "Nguyễn Thanh An",
    age: 21,
    major: "Công nghệ thông tin",
    year: 3,
    bio: "Thích coding, cà phê, và âm nhạc indie. Đang tìm người cùng passion về tech!",
    interests: ["coding", "âm nhạc", "cafe", "đọc sách", "du lịch", "nhiếp ảnh"],
    avatar: avatar1,
    distance: "Trong khuôn viên",
    schedule: [
      { day: "Thứ 2", time: "14:00 - 17:00", free: true },
      { day: "Thứ 3", time: "10:00 - 12:00", free: true },
      { day: "Thứ 4", time: "Cả ngày", free: false },
      { day: "Thứ 5", time: "15:00 - 18:00", free: true },
      { day: "Thứ 6", time: "13:00 - 16:00", free: true },
    ],
  };

  const handleUpgrade = () => {
    toast.success("Tính năng Premium đang được phát triển!");
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />
      
      <main className="container px-4 py-8 max-w-5xl">
        <Card className="shadow-hover">
          <CardHeader className="relative pb-20 bg-gradient-primary rounded-t-lg">
            <div className="absolute -bottom-16 left-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-hover">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>NA</AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>

          <CardContent className="pt-20 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.name}, {user.age}</h1>
                  <Badge variant="gradient">
                    <Star className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-3 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>{user.major}</span>
                  </div>
                  <span>•</span>
                  <span>Năm {user.year}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.distance}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
                <Button variant="hero" onClick={handleUpgrade}>
                  Nâng cấp Premium
                </Button>
              </div>
            </div>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="schedule">Lịch rảnh</TabsTrigger>
                <TabsTrigger value="photos">Album ảnh</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6 mt-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Giới thiệu</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {user.bio}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Sở thích</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, idx) => (
                      <Badge key={idx} variant="soft" className="px-4 py-2">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Lịch rảnh trong tuần
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {user.schedule.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex justify-between items-center p-3 rounded-lg border ${
                            item.free
                              ? "bg-primary-soft border-primary/20"
                              : "bg-muted border-border"
                          }`}
                        >
                          <span className="font-medium">{item.day}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.time}
                          </span>
                          <Badge variant={item.free ? "default" : "secondary"}>
                            {item.free ? "Rảnh" : "Bận"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-6">
                <Card className="shadow-card">
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Album ảnh của bạn</h3>
                        <p className="text-muted-foreground">
                          Thêm ảnh để profile của bạn nổi bật hơn!
                        </p>
                      </div>
                      <Button variant="default">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Thêm ảnh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <MobileNav />
    </div>
  );
};

export default Profile;
