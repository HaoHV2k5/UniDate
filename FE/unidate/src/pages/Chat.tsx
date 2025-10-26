import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Calendar, Check, CheckCheck, Circle } from "lucide-react";
import { mockUsers } from "@/data/mockData";
import { toast } from "sonner";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, senderId: mockUsers[0].id, content: "Chào bạn! Mình thấy profile bạn rất thú vị 😊", timestamp: "10:30", read: true },
    { id: 2, senderId: 1, content: "Hi! Cảm ơn bạn nhé. Mình thấy bạn cũng thích coding à?", timestamp: "10:32", read: true },
    { id: 3, senderId: mockUsers[0].id, content: "Đúng rồi! Bạn đang học CNTT năm mấy?", timestamp: "10:33", read: true },
    { id: 4, senderId: 1, content: "Mình năm 3. Còn bạn?", timestamp: "10:35", read: false },
  ]);

  const conversations = mockUsers.slice(0, 5).map((user) => ({
    user,
    lastMessage: "Được rồi, hẹn gặp bạn nhé!",
    timestamp: "2 giờ trước",
    unread: user.id === mockUsers[0].id ? 2 : 0,
    online: user.id === mockUsers[0].id || user.id === mockUsers[1].id,
  }));

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        senderId: 1,
        content: message,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      },
    ]);
    setMessage("");
  };

  const handleSendDateProposal = () => {
    toast.success("Đã gửi đề xuất lịch hẹn!");
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />
      
      <main className="container px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 shadow-card overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>Tin nhắn</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.user.id}
                    onClick={() => setSelectedUser(conv.user)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors ${
                      selectedUser.id === conv.user.id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                        <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                      </Avatar>
                      {conv.online && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold truncate">{conv.user.name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conv.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    
                    {conv.unread > 0 && (
                      <Badge variant="default" className="shrink-0">
                        {conv.unread}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 shadow-card overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                    <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedUser.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                      Đang hoạt động
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={handleSendDateProposal}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Đề xuất hẹn
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderId === 1;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] space-y-1`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 justify-end px-2">
                        <span className="text-xs text-muted-foreground">
                          {msg.timestamp}
                        </span>
                        {isOwn && (
                          msg.read ? (
                            <CheckCheck className="h-3 w-3 text-primary" />
                          ) : (
                            <Check className="h-3 w-3 text-muted-foreground" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  Đang gõ...
                </Badge>
              </div>
            </CardContent>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} variant="hero">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Chat;
