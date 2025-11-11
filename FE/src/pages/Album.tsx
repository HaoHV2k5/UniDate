import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadAlbumImages, viewAlbum, requestAlbumAccess } from "@/services/album";

const Album = () => {
  const [myImages, setMyImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const [ownerIdInput, setOwnerIdInput] = useState<string>("");
  const [ownerImages, setOwnerImages] = useState<string[] | null>(null);
  const currentUserId = useMemo(() => parseInt(localStorage.getItem("userId") || "0", 10), []);

  const loadMyAlbum = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const imgs = await viewAlbum(currentUserId, currentUserId);
      setMyImages(imgs);
    } catch (e: any) {
      toast.error(e?.message || "Không tải được album của bạn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyAlbum();
  }, []);

  const onUpload = async () => {
    if (!currentUserId) {
      toast.error("Bạn cần đăng nhập");
      return;
    }
    if (!files || files.length === 0) {
      toast.error("Hãy chọn ít nhất một ảnh");
      return;
    }
    try {
      setLoading(true);
      await uploadAlbumImages(currentUserId, Array.from(files));
      toast.success("Tải ảnh lên thành công");
      setFiles(null);
      await loadMyAlbum();
    } catch (e: any) {
      toast.error(e?.message || "Không tải lên được ảnh");
    } finally {
      setLoading(false);
    }
  };

  const onViewOwner = async () => {
    const ownerId = parseInt(ownerIdInput || "0", 10);
    if (!ownerId) {
      toast.error("Nhập ownerId hợp lệ");
      return;
    }
    try {
      setLoading(true);
      const imgs = await viewAlbum(ownerId, currentUserId);
      setOwnerImages(imgs);
      if (!imgs || imgs.length === 0) {
        toast.info("Không thấy ảnh hoặc bạn chưa có quyền truy cập");
      }
    } catch (e: any) {
      setOwnerImages([]);
      toast.error(e?.message || "Không xem được album người dùng này");
    } finally {
      setLoading(false);
    }
  };

  const onRequestAccess = async () => {
    const ownerId = parseInt(ownerIdInput || "0", 10);
    if (!ownerId || !currentUserId) return;
    try {
      setLoading(true);
      await requestAlbumAccess(ownerId, currentUserId);
      toast.success("Đã gửi yêu cầu truy cập album");
    } catch (e: any) {
      toast.error(e?.message || "Gửi yêu cầu thất bại");
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
            <CardTitle>Album của tôi</CardTitle>
            <CardDescription>Quản lý ảnh cá nhân của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="files">Chọn ảnh (có thể chọn nhiều)</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                />
              </div>
              <div>
                <Button onClick={onUpload} disabled={loading} className="w-full">
                  {loading ? "Đang xử lý..." : "Tải ảnh lên"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {myImages && myImages.length > 0 ? (
                myImages.map((src, i) => (
                  <div key={i} className="overflow-hidden rounded-lg border bg-muted/20">
                    <img
                      src={src}
                      alt={`my-${i}`}
                      className="w-full h-40 object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có ảnh nào</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Xem album người khác</CardTitle>
            <CardDescription>Nhập ID người sở hữu để xem hoặc gửi yêu cầu quyền xem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div className="md:col-span-3">
                <Label htmlFor="owner">Owner ID</Label>
                <Input id="owner" placeholder="VD: 123" value={ownerIdInput} onChange={(e) => setOwnerIdInput(e.target.value)} />
              </div>
              <Button onClick={onViewOwner} disabled={loading}>Xem album</Button>
              <Button onClick={onRequestAccess} variant="outline" disabled={loading}>Yêu cầu truy cập</Button>
            </div>

            {ownerImages && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {ownerImages.length > 0 ? (
                  ownerImages.map((src, i) => (
                    <div key={i} className="overflow-hidden rounded-lg border bg-muted/20">
                      <img
                        src={src}
                        alt={`owner-${i}`}
                        className="w-full h-40 object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Không có ảnh hiển thị</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Album;
