import { useState, useEffect } from "react";
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
import { Calendar, MapPin, Clock, Users, Plus, Coffee, User, Clock3 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

interface DateEventResponse {
  id: number;
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  status: string;
  creatorId: number;
  creatorUsername: string;
  creatorFullName: string;
  inviteeId: number;
  inviteeUsername: string;
  inviteeFullName: string;
}

interface UserResponse {
  id: number;
  fullName: string;
  username: string;
  avatar?: string;
}

interface CreateDateEventRequest {
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  inviteeUsername: string;
}

interface RespondDateEventRequest {
  accept: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<DateEventResponse[]>([]);
  const [friends, setFriends] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newEvent, setNewEvent] = useState<CreateDateEventRequest>({
    title: "",
    description: "",
    location: "",
    startAt: "",
    endAt: "",
    inviteeUsername: "",
  });

  const suggestedLocations = [
    "The Coffee House - 123 Đường Đại Học",
    "Highlands Coffee - 456 Trần Hưng Đạo",
    "Starbucks - 789 Lê Lợi",
    "Thư viện trường",
    "Khu vực tự học - Tòa A",
    "Canteen trường",
    "Công viên gần trường",
  ];

  // Lấy danh sách sự kiện
  const fetchEvents = async () => {
    try {
      const response = await api.get("/api/dates");
      if (response.data.data) {
        setEvents(response.data.data);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách lịch hẹn");
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách bạn bè để mời
  const fetchFriends = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      const response = await api.get(`/api/friend/of/${username}`);
      if (response.data.data) {
        setFriends(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching friends:", error);
      if (error.response?.status !== 404) {
        toast.error("Không thể tải danh sách bạn bè");
      }
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchFriends();
  }, []);

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.location || !newEvent.startAt || !newEvent.inviteeUsername || !newEvent.endAt) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Validate thời gian
    const startTime = new Date(newEvent.startAt);
    const endTime = new Date(newEvent.endAt);

    if (endTime <= startTime) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    setCreating(true);
    try {
      const response = await api.post("/api/dates", newEvent);

      if (response.data.data) {
        setEvents(prevEvents => [...prevEvents, response.data.data]);
        setNewEvent({
          title: "",
          description: "",
          location: "",
          startAt: "",
          endAt: "",
          inviteeUsername: "",
        });
        toast.success("Đã tạo lịch hẹn thành công!");
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi tạo lịch hẹn");
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.response?.data?.message || "Không thể kết nối đến server");
    } finally {
      setCreating(false);
    }
  };

  const handleRespondEvent = async (eventId: number, accept: boolean) => {
    try {
      const requestData: RespondDateEventRequest = { accept };
      const response = await api.post(`/api/dates/${eventId}/respond`, requestData);

      if (response.data.data) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId ? response.data.data : event
          )
        );
        toast.success(accept ? "Đã chấp nhận lịch hẹn" : "Đã từ chối lịch hẹn");
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Error responding to event:", error);
      toast.error(error.response?.data?.message || "Không thể kết nối đến server");
    }
  };

  const handleCancelEvent = async (eventId: number) => {
    try {
      const response = await api.post(`/api/dates/${eventId}/cancel`);

      if (response.data.data) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId ? response.data.data : event
          )
        );
        toast.success("Đã hủy lịch hẹn");
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Error canceling event:", error);
      toast.error(error.response?.data?.message || "Không thể kết nối đến server");
    }
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "Chờ phản hồi", variant: "secondary" as const },
      ACCEPTED: { label: "Đã chấp nhận", variant: "default" as const },
      REJECTED: { label: "Đã từ chối", variant: "destructive" as const },
      CANCELLED: { label: "Đã hủy", variant: "destructive" as const },
      COMPLETED: { label: "Đã hoàn thành", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] ||
      { label: status, variant: "secondary" as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getOtherPerson = (event: DateEventResponse) => {
    // Xác định người còn lại trong cuộc hẹn
    const currentUser = localStorage.getItem('userId');
    if (currentUser && parseInt(currentUser) === event.creatorId) {
      return `${event.inviteeFullName} (@${event.inviteeUsername})`;
    } else {
      return `${event.creatorFullName} (@${event.creatorUsername})`;
    }
  };

  const canRespond = (event: DateEventResponse) => {
    // Chỉ có thể phản hồi nếu user là invitee và sự kiện đang pending
    const currentUser = localStorage.getItem('userId');
    return currentUser && parseInt(currentUser) === event.inviteeId && event.status === "PENDING";
  };

  const canCancel = (event: DateEventResponse) => {
    // Có thể hủy nếu là creator và sự kiện chưa hoàn thành hoặc đã hủy
    const currentUser = localStorage.getItem('userId');
    const isCreator = currentUser && parseInt(currentUser) === event.creatorId;
    return isCreator && (event.status === "PENDING" || event.status === "ACCEPTED");
  };

  if (loading) {
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
                <p className="text-muted-foreground mt-2">Đang tải...</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((item) => (
                <Card key={item} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

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
                Quản lý lịch hẹn với bạn bè và người match
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
                    Mời một người bạn đi chơi hoặc học tập cùng
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề *</Label>
                    <Input
                      id="title"
                      placeholder="Cafe cùng nhau, Học nhóm, ..."
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả chi tiết về buổi hẹn..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invitee">Mời ai (username) *</Label>
                    <Select
                      onValueChange={(value) => setNewEvent({ ...newEvent, inviteeUsername: value })}
                      value={newEvent.inviteeUsername}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn người bạn muốn mời" />
                      </SelectTrigger>
                      <SelectContent>
                        {friends.length > 0 ? (
                          friends.map((friend) => (
                            <SelectItem key={friend.id} value={friend.username}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {friend.fullName} (@{friend.username})
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-friends" disabled>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Chưa có bạn bè để mời
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Địa điểm *</Label>
                    <Select
                      onValueChange={(value) => setNewEvent({ ...newEvent, location: value })}
                      value={newEvent.location}
                    >
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startAt">Thời gian bắt đầu *</Label>
                      <Input
                        id="startAt"
                        type="datetime-local"
                        value={newEvent.startAt}
                        onChange={(e) => setNewEvent({ ...newEvent, startAt: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endAt">Thời gian kết thúc *</Label>
                      <Input
                        id="endAt"
                        type="datetime-local"
                        value={newEvent.endAt}
                        onChange={(e) => setNewEvent({ ...newEvent, endAt: e.target.value })}
                        min={newEvent.startAt || new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateEvent}
                    variant="hero"
                    className="w-full"
                    disabled={creating || friends.length === 0}
                  >
                    {creating ? "Đang tạo..." : friends.length === 0 ? "Không có bạn bè để mời" : "Tạo lịch hẹn"}
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
                    {getStatusBadge(event.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <User className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">
                        Với: {getOtherPerson(event)}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{event.location}</span>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <Clock className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">
                        Bắt đầu: {formatDateTime(event.startAt)}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <Clock3 className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">
                        Kết thúc: {formatDateTime(event.endAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {canRespond(event) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRespondEvent(event.id, true)}
                        >
                          Chấp nhận
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRespondEvent(event.id, false)}
                        >
                          Từ chối
                        </Button>
                      </>
                    )}
                    {canCancel(event) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCancelEvent(event.id)}
                      >
                        Hủy hẹn
                      </Button>
                    )}
                    {event.status === "COMPLETED" && (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        Đã hoàn thành
                      </Button>
                    )}
                    {event.status === "REJECTED" && (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        Đã từ chối
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {events.length === 0 && (
              <Card className="md:col-span-2 shadow-card">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Chưa có lịch hẹn nào</h3>
                  <p className="text-muted-foreground mb-4">
                    {friends.length === 0
                      ? "Kết bạn với ai đó để có thể tạo lịch hẹn!"
                      : "Tạo lịch hẹn đầu tiên để gặp gỡ bạn bè và người match!"
                    }
                  </p>
                  {friends.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="hero">
                          <Plus className="h-4 w-4 mr-2" />
                          Tạo lịch hẹn ngay
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        {/* Same dialog content as above */}
                      </DialogContent>
                    </Dialog>
                  )}
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