import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/api/api";
import { getPendingAlbumRequests, getApprovedAlbumRequests, approveAlbumRequest, rejectAlbumRequest } from "@/services/album";
import type { RequestAccessResponse } from "@/types/album";

const AlbumRequests = () => {
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [pending, setPending] = useState<RequestAccessResponse[]>([]);
  const [approved, setApproved] = useState<RequestAccessResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) throw new Error("Chưa đăng nhập");
        const meRes = await api.get(`/api/users/profile/${encodeURIComponent(username)}`);
        const me = meRes.data?.data?.user ?? meRes.data?.data;
        if (!me?.id) throw new Error("Không lấy được người dùng");
        setOwnerId(Number(me.id));
        const p = await getPendingAlbumRequests(0, 20);
        const a = await getApprovedAlbumRequests(0, 20);
        setPending(p.content || []);
        setApproved(a.content || []);
      } catch (e: any) {
        toast.error(e?.message || "Không thể tải yêu cầu album");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const onApprove = async (id: number) => {
    if (!ownerId) return;
    try {
      await approveAlbumRequest(id, ownerId);
      toast.success("Đã chấp nhận yêu cầu");
      setPending((list) => list.filter((r) => r.id !== id));
    } catch {
      toast.error("Không thể chấp nhận");
    }
  };

  const onReject = async (id: number) => {
    if (!ownerId) return;
    try {
      await rejectAlbumRequest(id, ownerId);
      toast.success("Đã từ chối yêu cầu");
      setPending((list) => list.filter((r) => r.id !== id));
    } catch {
      toast.error("Không thể từ chối");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">Yêu cầu truy cập Album</h1>

        <Card className="shadow-card">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Pending</h2>
            {loading ? (
              <div className="text-sm text-muted-foreground">Đang tải...</div>
            ) : pending.length === 0 ? (
              <div className="text-sm text-muted-foreground">Không có yêu cầu đang chờ</div>
            ) : (
              <div className="space-y-3">
                {pending.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div>
                      <div className="font-medium">{r.requester?.fullName || r.requester?.username}</div>
                      <div className="text-xs text-muted-foreground">{r.requester?.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onReject(r.id)}>Từ chối</Button>
                      <Button size="sm" onClick={() => onApprove(r.id)}>Chấp nhận</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Đã chấp nhận</h2>
            {approved.length === 0 ? (
              <div className="text-sm text-muted-foreground">Chưa có</div>
            ) : (
              <div className="space-y-3">
                {approved.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div>
                      <div className="font-medium">{r.requester?.fullName || r.requester?.username}</div>
                      <div className="text-xs text-muted-foreground">{r.requester?.email}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.status}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <MobileNav />
    </div>
  );
};

export default AlbumRequests;

