import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Heart, MessageCircle, Users } from "lucide-react";
import { mockUsers } from "@/data/mockData";
import { Link } from "react-router-dom";

const Matches = () => {
  const topMatches = mockUsers
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);

  const MatchCard = ({ user, rank }: { user: typeof mockUsers[0]; rank: number }) => {
    const reasons = [
      { label: "Sở thích chung", score: user.match_score - 5 },
      { label: "Giờ rảnh trùng", score: user.match_score - 3 },
      { label: "Cùng ngành/năm", score: user.match_score + 2 },
    ];

    return (
      <Card className="hover-lift shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-button">
                #{rank}
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-lg">{user.name}, {user.age}</h3>
                <p className="text-sm text-muted-foreground">
                  {user.major} • Năm {user.year}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Progress value={user.match_score} className="flex-1 h-2" />
                <Badge variant="gradient" className="font-semibold">
                  {user.match_score}%
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Lý do gợi ý:
            </p>
            <div className="space-y-2 pl-6">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{reason.label}</span>
                  <span className="font-medium text-primary">{reason.score}%</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>

          <div className="flex flex-wrap gap-1">
            {user.interests.slice(0, 4).map((interest, idx) => (
              <Badge key={idx} variant="soft" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Heart className="h-4 w-4 mr-1" />
              Like
            </Button>
            <Button variant="default" size="sm" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-1" />
              Nhắn tin
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-20 md:pb-0">
      <Navbar />
      
      <main className="container px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Top 3 Gợi Ý Cho Bạn
            </h1>
            <p className="text-muted-foreground">
              Dựa trên sở thích, ngành học và lịch rảnh của bạn
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topMatches.map((user, idx) => (
              <MatchCard key={user.id} user={user} rank={idx + 1} />
            ))}
          </div>

          <Card className="shadow-card bg-gradient-card border-0">
            <CardContent className="py-8 text-center space-y-4">
              <Users className="h-12 w-12 mx-auto text-primary" />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Muốn xem thêm gợi ý?
                </h3>
                <p className="text-muted-foreground">
                  Khám phá thêm nhiều profile phù hợp với bạn
                </p>
              </div>
              <Button asChild variant="hero" size="lg">
                <Link to="/discover">Khám phá ngay</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Matches;
