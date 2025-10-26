import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, X, MapPin, Sparkles, Users, TrendingUp, Filter } from "lucide-react";
import { mockUsers, User } from "@/data/mockData";
import { toast } from "sonner";

const Discover = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [likedUsers, setLikedUsers] = useState<number[]>([]);

  const handleLike = (userId: number) => {
    setLikedUsers([...likedUsers, userId]);
    toast.success("Đã like! Chờ người đó like lại bạn để match 💕");
  };

  const handleDislike = (userId: number) => {
    toast("Đã bỏ qua");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.interests.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMajor = selectedMajor === "all" || user.major.includes(selectedMajor);
    return matchesSearch && matchesMajor;
  });

  const topMatches = filteredUsers.filter((u) => u.match_score >= 85);
  const newUsers = filteredUsers.slice(0, 4);
  const nearbyUsers = filteredUsers.filter((u) => u.distance_km < 2);

  const UserCard = ({ user }: { user: User }) => (
    <Card className="group overflow-hidden hover-lift shadow-card transition-all duration-300">
      <div className="relative aspect-video overflow-hidden bg-gradient-card">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {user.match_score >= 85 && (
            <Badge variant="gradient" className="shadow-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Top Match
            </Badge>
          )}
          {user.distance_km < 1 && (
            <Badge variant="accent" className="shadow-sm">
              Gần bạn
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{user.name}, {user.age}</h3>
          <p className="text-sm text-muted-foreground">
            {user.major} • Năm {user.year}
          </p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {user.bio}
        </p>

        <div className="flex flex-wrap gap-1">
          {user.interests.slice(0, 3).map((interest, idx) => (
            <Badge key={idx} variant="soft" className="text-xs">
              {interest}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{user.distance_km} km</span>
          <span className="mx-1">•</span>
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-primary font-medium">{user.match_score}% match</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleDislike(user.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Bỏ qua
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => handleLike(user.id)}
          >
            <Heart className="h-4 w-4 mr-1" />
            Like
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const Section = ({ icon: Icon, title, users }: { icon: any; title: string; users: User[] }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="secondary" className="ml-auto">
          {users.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />
      
      <main className="container px-4 py-8 space-y-8">
        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Tìm theo tên, sở thích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ngành học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngành</SelectItem>
                  <SelectItem value="Công nghệ">Công nghệ thông tin</SelectItem>
                  <SelectItem value="Kinh tế">Kinh tế</SelectItem>
                  <SelectItem value="Điện tử">Điện tử</SelectItem>
                  <SelectItem value="Ngôn ngữ">Ngôn ngữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        {topMatches.length > 0 && (
          <Section icon={Sparkles} title="Gợi ý cho bạn" users={topMatches} />
        )}
        
        {newUsers.length > 0 && (
          <Section icon={Users} title="Mới tham gia" users={newUsers} />
        )}
        
        {nearbyUsers.length > 0 && (
          <Section icon={MapPin} title="Gần bạn" users={nearbyUsers} />
        )}

        {filteredUsers.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Không tìm thấy kết quả phù hợp. Thử điều chỉnh bộ lọc!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      <MobileNav />
    </div>
  );
};

export default Discover;
