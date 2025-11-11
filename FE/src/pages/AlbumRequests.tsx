import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPendingAlbumRequests, getApprovedAlbumRequests, approveAlbumRequest, rejectAlbumRequest } from "@/services/album";
import type { Page, RequestAccessResponse } from "@/types/album";
import { toast } from "sonner";

const AlbumRequests = () => {
  const [pending, setPending] = useState<Page<RequestAccessResponse> | null>(null);
  const [approved, setApproved] = useState<Page<RequestAccessResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const currentUserId = parseInt(localStorage.getItem("userId") || "0", 10);

  const load = async () => {
    try {
      setLoading(true);
      const [p, a] = await Promise.all([
        getPendingAlbumRequests(0, 20),
        getApprovedAlbumRequests(0, 20),
      ]);
      setPending(p);
      setApproved(a);
    } catch (e: any) {
      toast.error(e?.message || "Không tải được danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onApprove = async (req: RequestAccessResponse) => {
    try {
      setLoading(true);
      await approveAlbumRequest(req.id, currentUserId);
      toast.success("Đã chấp thuận");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Chấp thuận thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onReject = async (req: RequestAccessResponse) => {
    try {
      setLoading(true);
      await rejectAlbumRequest(req.id, currentUserId);
      toast.success("Đã từ chối");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Từ chối thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <main className="container px-4 py-8 max-w-5xl space-y-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Yêu cầu đang chờ</CardTitle>
            <CardDescription>Yêu cầu xem album cần bạn xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending?.content?.length ? pending.content.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.requester?.fullName || r.requester?.username || r.requester?.email || r.requester?.id}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" onClick={() => onApprove(r)} disabled={loading}>Chấp thuận</Button>
                      <Button size="sm" variant="outline" onClick={() => onReject(r)} disabled={loading}>Từ chối</Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="text-muted-foreground">Không có yêu cầu</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Đã chấp thuận</CardTitle>
            <CardDescription>Danh sách yêu cầu đã được duyệt</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approved?.content?.length ? approved.content.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.requester?.fullName || r.requester?.username || r.requester?.email || r.requester?.id}</TableCell>
                    <TableCell>{r.status}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={2} className="text-muted-foreground">Chưa có dữ liệu</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AlbumRequests;
