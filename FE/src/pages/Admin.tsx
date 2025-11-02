import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Heart, TrendingUp, Ban, CheckCircle } from "lucide-react";
import { mockUsers } from "@/data/mockData";
import { toast } from "sonner";

const Admin = () => {
  const [users, setUsers] = useState(
    mockUsers.map((user) => ({ ...user, status: "active" as "active" | "banned" }))
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    matches: 247,
    growthRate: "+12%",
  };

  const handleBanUser = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: "banned" as const } : user
      )
    );
    toast.success("Đã khóa tài khoản");
  };

  const handleUnbanUser = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: "active" as const } : user
      )
    );
    toast.success("Đã mở khóa tài khoản");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />

      <main className="container px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý người dùng và theo dõi thống kê
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng người dùng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.activeUsers} đang hoạt động
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Matches thành công
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{stats.matches}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Trong tháng này
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tăng trưởng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{stats.growthRate}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      So với tháng trước
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-gradient-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Gói Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-3xl font-bold">48</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Người dùng Premium
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quản lý người dùng</CardTitle>
              <CardDescription>
                Danh sách toàn bộ người dùng trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Ngành học</TableHead>
                    <TableHead>Năm</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.age} tuổi
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.major}</TableCell>
                      <TableCell>Năm {user.year}</TableCell>
                      <TableCell>
                        <Badge variant="soft">{user.match_score}%</Badge>
                      </TableCell>
                      <TableCell>
                        {user.status === "active" ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Đã khóa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.status === "active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBanUser(user.id)}
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Khóa
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mở khóa
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
