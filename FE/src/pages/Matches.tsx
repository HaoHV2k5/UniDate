import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Users, UserPlus } from "lucide-react";
import api from "@/api/api";

interface User {
  id: number;
  name: string;
  age: number;
  major: string;
  year: number;
  avatar: string;
  match_score: number;
  bio: string;
  interests: string[];
  username?: string;
}

interface NearbyUser extends User {
  distanceKm?: number;
}

const normalizeApiToUser = (item: any): NearbyUser => {
  const source = item.user ?? item;
  const id = source.id ?? 0;
  const name =
    source.fullName ?? source.name ?? source.username ?? "Người dùng";
  const username = source.username ?? "";
  let age = source.age ?? 0;
  if (!age && source.yob) {
    try {
      const y = new Date(source.yob).getFullYear();
      if (!Number.isNaN(y)) age = new Date().getFullYear() - y;
    } catch {
      age = 0;
    }
  }
  const major = source.major ?? "Không rõ ngành";
  const year = source.year ?? 0;
  const avatar = source.avatar ?? "/default-avatar.png";
  const match_score = Math.round(source.match_score ?? 0);
  const bio = source.bio ?? "";
  const interests = Array.isArray(source.interests) ? source.interests : [];
  const distanceKm = item.distanceKm ?? item.distance_km ?? undefined;

  return {
    id,
    name,
    username,
    age,
    major,
    year,
    avatar,
    match_score,
    bio,
    interests,
    distanceKm,
  };
};

const MatchCard = ({
  user,
  onSendRequest,
}: {
  user: NearbyUser;
  onSendRequest: (username: string) => void;
}) => (
  <Card className="hover-lift shadow-card">
    <CardHeader className="pb-4">
      <div className="flex items-start gap-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/default-avatar.png";
          }}
        />
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-lg">
            {user.name}, {user.age || "—"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {user.major} • Năm {user.year || "—"}
          </p>
          <div className="flex items-center gap-2">
            <Progress value={user.match_score} className="flex-1 h-2" />
            <Badge variant="gradient" className="font-semibold">
              {user.match_score}%
            </Badge>
          </div>
          {"distanceKm" in user && user.distanceKm != null && (
            <p className="text-xs text-muted-foreground">
              Cách bạn {user.distanceKm.toFixed(2)} km
            </p>
          )}
        </div>
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground line-clamp-2">
        {user.bio || "Chưa có mô tả."}
      </p>

      <div className="flex flex-wrap gap-1">
        {(user.interests || []).slice(0, 4).map((interest, idx) => (
          <Badge key={idx} variant="soft" className="text-xs">
            {interest}
          </Badge>
        ))}
      </div>

      <div className="flex pt-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() => onSendRequest(user.username ?? "")}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Gửi kết bạn
        </Button>
      </div>
    </CardContent>
  </Card>
);

const Matches = () => {
  const [topMatches, setTopMatches] = useState<NearbyUser[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  useEffect(() => {
    const fetchTopMatches = async () => {
      try {
        const res = await api.get("/api/users/suggest", { params: { size: 3 } });
        const raw = res.data?.data ?? res.data ?? [];
        setTopMatches(Array.isArray(raw) ? raw.map(normalizeApiToUser) : []);
      } catch (err) {
        console.error("Lỗi khi lấy gợi ý:", err);
      }
    };
    fetchTopMatches();
  }, []);

  const handleFindNearby = async () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị!");
      return;
    }

    setLoadingNearby(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const meRes = await api.get("/api/users/me");
          const myId = meRes.data?.data?.id;
          await api.put(`/api/users/${myId}/location`, {
            latitude: lat,
            longitude: lon,
          });
          const nearbyRes = await api.get(`/api/users/${myId}/nearby`, {
            params: { radiusKm: 5 },
          });
          const raw = nearbyRes.data?.data ?? nearbyRes.data ?? [];
          setNearbyUsers(Array.isArray(raw) ? raw.map(normalizeApiToUser) : []);
        } catch (error) {
          console.error(error);
          alert("Có lỗi khi tìm người xung quanh!");
        } finally {
          setLoadingNearby(false);
        }
      },
      (err) => {
        console.error(err);
        setLoadingNearby(false);
        alert("Không thể lấy vị trí của bạn!");
      }
    );
  };

  const handleSendRequest = async (receiverUsername: string) => {
    if (!receiverUsername) return;
    try {
      await api.post(`/api/friend/request`, null, {
        params: { receiverUsername },
      });
      alert("✅ Đã gửi lời mời kết bạn!");
    } catch (err) {
      console.error(err);
      alert("❌ Gửi lời mời thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />

      <main className="container px-4 py-8 max-w-6xl space-y-12">
        {/* GỢI Ý MATCH */}
        <section>
          <div className="space-y-2 mb-6 text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Top gợi Ý Cho Bạn
            </h1>
            <p className="text-muted-foreground">Dựa trên sở thích của bạn</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topMatches.map((user) => (
              <MatchCard
                key={user.id}
                user={user}
                onSendRequest={handleSendRequest}
              />
            ))}
          </div>

          {topMatches.length === 0 && (
            <p className="text-muted-foreground text-center mt-6">
              Không có gợi ý nào phù hợp 😢
            </p>
          )}
        </section>

        {/* TÌM NGƯỜI XUNG QUANH */}
        <section className="text-center">
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Tìm những người xung quanh bạn
            </h1>
            <p className="text-muted-foreground">
              Cho phép định vị để xem ai đang ở gần bạn (trong bán kính 5km)
            </p>
          </div>

          <Button
            variant="hero"
            size="lg"
            onClick={handleFindNearby}
            disabled={loadingNearby}
          >
            {loadingNearby ? "Đang tìm..." : "Hãy tìm những người xung quanh bạn"}
          </Button>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-10">
            {nearbyUsers.map((user) => (
              <MatchCard
                key={user.id}
                user={user}
                onSendRequest={handleSendRequest}
              />
            ))}
          </div>

          {nearbyUsers.length === 0 && !loadingNearby && (
            <p className="text-muted-foreground mt-8">
              Không tìm thấy người nào gần bạn 😢
            </p>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
};

export default Matches;
