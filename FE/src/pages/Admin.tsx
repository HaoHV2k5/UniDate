import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Pencil, Trash2, Heart, MessageSquare } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUser, deleteUser, getUsers, updateUser, getAdminCommentsCount, getAdminReactionsCount, getAdminComments, getAdminReactions } from "@/api/admin";
import type { UserCreatePayload, UserResponse, UserUpdatePayload, CommentResponse, LikeResponse } from "@/types/api";

const Admin = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<null | number>(null);
  const [reactionsPage, setReactionsPage] = useState(0);
  const [commentsPage, setCommentsPage] = useState(0);
  const pageSize = 10;

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getUsers,
  });

  const { data: reactionsCount = 0 } = useQuery({
    queryKey: ["admin-metrics", "reactions-count"],
    queryFn: getAdminReactionsCount,
  });
  const { data: commentsCount = 0 } = useQuery({
    queryKey: ["admin-metrics", "comments-count"],
    queryFn: getAdminCommentsCount,
  });

  const { data: reactionsPaged } = useQuery({
    queryKey: ["admin-reactions", { page: reactionsPage, size: pageSize }],
    queryFn: () => getAdminReactions(reactionsPage, pageSize),
  });
  const { data: commentsPaged } = useQuery({
    queryKey: ["admin-comments", { page: commentsPage, size: pageSize }],
    queryFn: () => getAdminComments(commentsPage, pageSize),
  });

  const filtered: UserResponse[] = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const createMut = useMutation({
    mutationFn: (payload: UserCreatePayload) => createUser(payload),
    onSuccess: () => {
      toast.success("Tạo user thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setOpenCreate(false);
    },
    onError: () => toast.error("Tạo user thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserUpdatePayload }) => updateUser(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setOpenEdit(null);
    },
    onError: () => toast.error("Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      toast.success("Đã xóa người dùng");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Xóa thất bại"),
  });

  // Local state for forms
  const [createForm, setCreateForm] = useState<UserCreatePayload>({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "USER",
  });

  const [editForm, setEditForm] = useState<UserUpdatePayload>({ fullName: "", role: "USER" });

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />

      <main className="container px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Quản trị hệ thống</h1>
              <p className="text-muted-foreground mt-2">Quản lý người dùng và thao tác nhanh</p>
            </div>

            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Thêm người dùng
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo người dùng</DialogTitle>
                  <DialogDescription>Nhập thông tin cơ bản cho tài khoản mới</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <div className="grid gap-2">
                    <label>Email (username)</label>
                    <Input
                      placeholder="user@example.com"
                      value={createForm.username}
                      onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label>Họ tên</label>
                    <Input
                      placeholder="Nguyễn Văn A"
                      value={createForm.fullName}
                      onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label>Mật khẩu</label>
                      <Input
                        type="password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label>Nhập lại mật khẩu</label>
                      <Input
                        type="password"
                        value={createForm.confirmPassword}
                        onChange={(e) => setCreateForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label>Vai trò</label>
                    <Select value={createForm.role} onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setOpenCreate(false)}>
                      Hủy
                    </Button>
                    <Button
                      onClick={() => createMut.mutate(createForm)}
                      disabled={createMut.isPending || !createForm.username || !createForm.password || createForm.password !== createForm.confirmPassword}
                    >
                      Tạo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng người dùng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{users.length}</p>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng reactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{reactionsCount}</p>
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{commentsCount}</p>
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Quản lý người dùng</CardTitle>
                  <CardDescription>Danh sách toàn bộ người dùng trong hệ thống</CardDescription>
                </div>
                <Input
                  className="w-full max-w-sm"
                  placeholder="Tìm theo username, họ tên, email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Đang tải dữ liệu...</p>
              ) : isError ? (
                <div className="flex items-center justify-between">
                  <p className="text-destructive">Không tải được dữ liệu</p>
                  <Button variant="outline" onClick={() => refetch()}>Thử lại</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>Năm sinh</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={u.avatar || "/avatar.png"} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <p className="font-medium">{u.fullName || u.username}</p>
                              <p className="text-sm text-muted-foreground">@{u.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          {u.gender ? <Badge variant="secondary">{u.gender}</Badge> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{u.yob || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="max-w-[240px] truncate">{u.address || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditForm({ fullName: u.fullName, role: "USER" });
                              setOpenEdit(u.id);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Sửa
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate(u.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Reactions (admin) */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle>Reactions (toàn hệ thống)</CardTitle>
              <CardDescription>Danh sách phân trang</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bài đăng</TableHead>
                    <TableHead>Chủ bài đăng</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(reactionsPaged?.content || []).map((r: LikeResponse) => (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-[320px] truncate">{r.title}</TableCell>
                      <TableCell>{r.ownerPost}</TableCell>
                      <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                  {(!reactionsPaged || reactionsPaged.content.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">Không có dữ liệu</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  disabled={(reactionsPage ?? 0) <= 0}
                  onClick={() => setReactionsPage((p) => Math.max(0, p - 1))}
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    reactionsPaged?.totalPages != null ? reactionsPage + 1 >= (reactionsPaged.totalPages || 0) :
                    (reactionsPaged?.content?.length || 0) < pageSize
                  }
                  onClick={() => setReactionsPage((p) => p + 1)}
                >
                  Trang sau
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments (admin) */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle>Comments (toàn hệ thống)</CardTitle>
              <CardDescription>Danh sách phân trang</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Người bình luận</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(commentsPaged?.content || []).map((c: CommentResponse) => (
                    <TableRow key={c.id}>
                      <TableCell className="max-w-[420px] truncate">{c.content}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <img src={c.avatar || "/avatar.png"} className="w-7 h-7 rounded-full" />
                        <span>{c.userName}</span>
                      </TableCell>
                      <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}</TableCell>
                    </TableRow>
                  ))}
                  {(!commentsPaged || commentsPaged.content.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">Không có dữ liệu</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  disabled={(commentsPage ?? 0) <= 0}
                  onClick={() => setCommentsPage((p) => Math.max(0, p - 1))}
                >
                  Trang trước
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    commentsPaged?.totalPages != null ? commentsPage + 1 >= (commentsPaged.totalPages || 0) :
                    (commentsPaged?.content?.length || 0) < pageSize
                  }
                  onClick={() => setCommentsPage((p) => p + 1)}
                >
                  Trang sau
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Edit dialog */}
          <Dialog open={openEdit !== null} onOpenChange={(open) => !open && setOpenEdit(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cập nhật người dùng</DialogTitle>
                <DialogDescription>Sửa thông tin cơ bản</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid gap-2">
                  <label>Họ tên</label>
                  <Input value={editForm.fullName || ""} onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <label>Vai trò</label>
                  <Select value={editForm.role} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">USER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpenEdit(null)}>
                    Hủy
                  </Button>
                  <Button
                    onClick={() => openEdit && updateMut.mutate({ id: openEdit, payload: editForm })}
                    disabled={updateMut.isPending}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default Admin;
