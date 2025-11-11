import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm import này
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Users, UserPlus, MapPin, Heart, Mail, Phone, Calendar, Navigation } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

interface User {
  id: number;
  name: string;
  age: number;
  avatar: string;
  match_score: number;
  bio: string;
  interests: string[];
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender?: string;
  yob?: string;
  reason?: string;
}

interface NearbyUser extends User {
  distanceKm?: number;
}

const normalizeApiToUser = (item: any): NearbyUser => {
  const source = item.user ?? item;
  const id = source.id ?? 0;
  const name = source.fullName ?? source.name ?? source.username ?? "Người dùng";
  const username = source.username ?? "";

  // Tính tuổi từ yob
  let age = 0;
  if (source.yob) {
    try {
      const birthYear = new Date(source.yob).getFullYear();
      const currentYear = new Date().getFullYear();
      age = currentYear - birthYear;
    } catch {
      age = 0;
    }
  }

  const avatar = source.avatar ?? "/default-avatar.png";
  const match_score = Math.round(source.score ?? source.match_score ?? 0);
  const bio = source.bio ?? "Chưa có tiểu sử";
  const interests = Array.isArray(source.interests) ? source.interests : [];
  const distanceKm = item.distanceKm ?? item.distance_km ?? undefined;
  const email = source.email;
  const phone = source.phone;
  const address = source.address;
  const gender = source.gender;
  const yob = source.yob;
  const reason = source.reason;

  return {
    id,
    name,
    username,
    age,
    avatar,
    match_score,
    bio,
    interests,
    distanceKm,
    email,
    phone,
    address,
    gender,
    yob,
    reason,
  };
};

// Format gender display
const formatGender = (gender?: string) => {
  switch (gender) {
    case 'MALE': return 'Nam';
    case 'FEMALE': return 'Nữ';
    case 'OTHER': return 'Khác';
    default: return 'Chưa cập nhật';
  }
};

// Skeleton component cho loading
const MatchCardSkeleton = () => (
  <Card className="shadow-card hover-lift transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </CardContent>
  </Card>
);

const MatchCard = ({
  user,
  onSendRequest,
  onViewProfile, // Thêm prop mới
}: {
  user: NearbyUser;
  onSendRequest: (username: string) => void;
  onViewProfile: (username: string) => void; // Thêm prop mới
}) => {
  return (
    <Card className="shadow-card hover-lift transition-all duration-300 hover:shadow-xl border-0">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/default-avatar.png";
              }}
            />
            <div className="absolute -top-2 -right-2">
              <Badge variant="gradient" className="font-semibold text-xs px-2 py-1">
                {user.match_score}%
              </Badge>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {user.name}, {user.age || "—"} tuổi
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatGender(user.gender)}</span>
                {user.address && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{user.address}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Progress value={user.match_score} className="flex-1 h-2" />
              </div>

              {"distanceKm" in user && user.distanceKm != null && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Navigation className="h-3 w-3" />
                  <span>Cách {user.distanceKm.toFixed(1)} km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mt-4 line-clamp-2 leading-relaxed">
          {user.bio}
        </p>

        {/* Lý do phù hợp */}
        {user.reason && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Lý do:</strong> {user.reason}
            </p>
          </div>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {user.interests.slice(0, 6).map((interest, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700">
                {interest}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewProfile(user.username ?? "")}
            size="sm"
          >
            Xem trang cá nhân
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
            onClick={() => onSendRequest(user.username ?? "")}
            size="sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Kết bạn
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Matches = () => {
  const navigate = useNavigate(); // Thêm hook navigate
  const [topMatches, setTopMatches] = useState<NearbyUser[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loadingTopMatches, setLoadingTopMatches] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(false);

  useEffect(() => {
    const fetchTopMatches = async () => {
      setLoadingTopMatches(true);
      try {
        console.log(Math.random())

        const res = await api.get("/api/users/suggest", { params: { size: 3 } });
        const raw = res.data?.data ?? res.data ?? [];
        setTopMatches(Array.isArray(raw) ? raw.map(normalizeApiToUser) : []);
      } catch (err) {
        console.error("Lỗi khi lấy gợi ý:", err);
        toast.error("Không thể tải danh sách gợi ý");
      } finally {
        setLoadingTopMatches(false);
      }
    };
    fetchTopMatches();
  }, []);

  const handleFindNearby = async () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị!");
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
          toast.success(`Tìm thấy ${raw.length} người gần bạn`);
        } catch (error) {
          console.error(error);
          toast.error("Có lỗi khi tìm người xung quanh!");
        } finally {
          setLoadingNearby(false);
        }
      },
      (err) => {
        console.error(err);
        setLoadingNearby(false);
        toast.error("Không thể lấy vị trí của bạn!");
      }
    );
  };

  const handleSendRequest = async (receiverUsername: string) => {
    if (!receiverUsername) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      await api.post(`/api/friend/request`, null, {
        params: { receiverUsername },
      });
      toast.success("✅ Đã gửi lời mời kết bạn!");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Gửi lời mời thất bại!";
      toast.error(`❌ ${errorMessage}`);
    }
  };

  // Thêm hàm xử lý xem trang cá nhân
  const goToProfile = (username: string) => {
    if (!username) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }
    navigate(`/profile/${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />

      <main className="container px-4 py-8 max-w-6xl space-y-12">
        {/* Header Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <Heart className="h-6 w-6 text-pink-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tìm Bạn Phù Hợp
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Kết nối với những người có cùng sở thích và ở gần bạn
          </p>
        </section>

        {/* Top Matches Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gợi ý hàng đầu</h2>
                <p className="text-muted-foreground">Những người phù hợp nhất với bạn</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {topMatches.length} người
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingTopMatches ? (
              <>
                <MatchCardSkeleton />
                <MatchCardSkeleton />
                <MatchCardSkeleton />
              </>
            ) : topMatches.length > 0 ? (
              topMatches.map((user) => (
                <MatchCard
                  key={user.id}
                  user={user}
                  onSendRequest={handleSendRequest}
                  onViewProfile={goToProfile} // Truyền prop mới
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="space-y-3">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-muted-foreground">Chưa có gợi ý phù hợp nào</p>
                  <p className="text-sm text-muted-foreground">
                    Hoàn thiện hồ sơ của bạn để nhận được gợi ý tốt hơn
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Nearby Users Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Người xung quanh</h2>
                <p className="text-muted-foreground">Kết nối với những người gần bạn</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {nearbyUsers.length} người
            </Badge>
          </div>

          <div className="text-center space-y-4">
            <Button
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-xl px-8 py-6 text-lg font-semibold"
              onClick={handleFindNearby}
              disabled={loadingNearby}
              size="lg"
            >
              <MapPin className="h-5 w-5 mr-2" />
              {loadingNearby ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Đang tìm kiếm...
                </>
              ) : (
                'Tìm người xung quanh'
              )}
            </Button>

            <p className="text-sm text-muted-foreground">
              Cho phép định vị để xem ai đang ở gần bạn (trong bán kính 5km)
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {nearbyUsers.map((user) => (
              <MatchCard
                key={user.id}
                user={user}
                onSendRequest={handleSendRequest}
                onViewProfile={goToProfile} // Truyền prop mới
              />
            ))}
          </div>

          {nearbyUsers.length === 0 && !loadingNearby && (
            <div className="text-center py-12">
              <div className="space-y-3">
                <Users className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground">Chưa tìm thấy ai gần bạn</p>
                <p className="text-sm text-muted-foreground">
                  Bấm nút trên để tìm kiếm người xung quanh
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
};

export default Matches;