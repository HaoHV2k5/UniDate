import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Plus, Coffee } from "lucide-react";
import { toast } from "sonner";

const Events = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Cafe cùng nhau",
      description: "Hẹn gặp tại quán The Coffee House gần trường",
      location: "The Coffee House - 123 Đường Đại Học",
      datetime: "2025-11-01T14:00",
      participants: 2,
      isPrivate: true,
    },
    {
      id: 2,
      title: "Study group - Lập trình Web",
      description: "Cùng học và chia sẻ kiến thức về React",
      location: "Thư viện trường",
      datetime: "2025-11-03T15:00",
      participants: 4,
      isPrivate: false,
    },
  ]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    datetime: "",
    isPrivate: true,
  });

  const suggestedLocations = [
    "The Coffee House - 123 Đường Đại Học",
    "Highlands Coffee - 456 Trần Hưng Đạo",
    "Starbucks - 789 Lê Lợi",
    "Thư viện trường",
    "Khu vực tự học - Tòa A",
  ];

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.location || !newEvent.datetime) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setEvents([
      ...events,
      {
        id: events.length + 1,
        ...newEvent,
        participants: 1,
      },
    ]);

    setNewEvent({
      title: "",
      description: "",
      location: "",
      datetime: "",
      isPrivate: true,
    });

    toast.success("Đã tạo lịch hẹn!");
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />
      
      <main className="container px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                Lịch hẹn của bạn
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý và tạo lịch hẹn với những người bạn match
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo lịch hẹn
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tạo lịch hẹn mới</DialogTitle>
                  <DialogDescription>
                    Đề xuất thời gian và địa điểm để gặp gỡ
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề</Label>
                    <Input
                      id="title"
                      placeholder="Cafe cùng nhau"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      placeholder="Hẹn gặp để trò chuyện và làm quen..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Địa điểm</Label>
                    <Select onValueChange={(value) => setNewEvent({ ...newEvent, location: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn địa điểm" />
                      </SelectTrigger>
                      <SelectContent>
                        {suggestedLocations.map((loc, idx) => (
                          <SelectItem key={idx} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="datetime">Thời gian</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={newEvent.datetime}
                      onChange={(e) => setNewEvent({ ...newEvent, datetime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quyền riêng tư</Label>
                    <Select
                      value={newEvent.isPrivate ? "private" : "public"}
                      onValueChange={(value) =>
                        setNewEvent({ ...newEvent, isPrivate: value === "private" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Riêng tư (chỉ mình bạn)</SelectItem>
                        <SelectItem value="public">Công khai (ai cũng xem được)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreateEvent} variant="hero" className="w-full">
                    Tạo lịch hẹn
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <Card key={event.id} className="hover-lift shadow-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Coffee className="h-5 w-5 text-primary" />
                        {event.title}
                      </CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </div>
                    <Badge variant={event.isPrivate ? "default" : "secondary"}>
                      {event.isPrivate ? "Riêng tư" : "Công khai"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{event.location}</span>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <Clock className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">
                        {formatDateTime(event.datetime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {event.participants} người tham gia
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Chỉnh sửa
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1">
                      Hủy hẹn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {events.length === 0 && (
              <Card className="md:col-span-2 shadow-card">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Bạn chưa có lịch hẹn nào. Tạo lịch hẹn để gặp gỡ những người bạn match!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Events;
